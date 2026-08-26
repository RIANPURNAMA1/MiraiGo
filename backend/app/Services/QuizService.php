<?php

namespace App\Services;

use App\Models\Package;
use App\Models\Question;
use App\Models\QuestionOption;
use App\Models\QuizAnswer;
use App\Models\QuizAttempt;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class QuizService
{
    public function __construct(
        protected AccessService $accessService,
        protected ScoringService $scoringService,
        protected ProgressService $progressService,
    ) {}

    /**
     * Start (or resume) an attempt for the given package.
     *
     * Timer is server-authoritative: started_at / expires_at are computed here,
     * from the server clock and package.duration_minutes, never from the client.
     */
    public function startAttempt(User $user, Package $package): QuizAttempt
    {
        if (! $this->accessService->canAccessPackage($user, $package)) {
            throw ValidationException::withMessages([
                'package' => 'You do not have access to this package.',
            ]);
        }

        // Resume an existing in-progress, non-expired attempt instead of creating a duplicate.
        $existing = QuizAttempt::where('user_id', $user->id)
            ->where('package_id', $package->id)
            ->where('status', 'in_progress')
            ->latest('id')
            ->first();

        if ($existing) {
            if ($existing->isExpired()) {
                $this->expireAttempt($existing);
            } else {
                return $existing;
            }
        }

        $totalQuestions = Question::whereIn(
            'section_id',
            $package->sections()->pluck('id')
        )->count();

        $startedAt = now();

        return QuizAttempt::create([
            'user_id' => $user->id,
            'package_id' => $package->id,
            'started_at' => $startedAt,
            'expires_at' => $startedAt->copy()->addMinutes($package->duration_minutes),
            'status' => 'in_progress',
            'total_questions' => $totalQuestions,
        ]);
    }

    /**
     * Save/update a single answer. Every relationship is re-validated against the
     * database — nothing about correctness, ownership, or expiration is trusted
     * from the request payload beyond raw IDs.
     */
    public function saveAnswer(User $user, QuizAttempt $attempt, Question $question, ?QuestionOption $option): QuizAnswer
    {
        $this->assertOwnership($user, $attempt);
        $this->assertModifiable($attempt);
        $this->assertQuestionBelongsToPackage($question, $attempt->package_id);

        if ($option && $option->question_id !== $question->id) {
            throw ValidationException::withMessages([
                'question_option_id' => 'The selected option does not belong to this question.',
            ]);
        }

        return QuizAnswer::updateOrCreate(
            ['quiz_attempt_id' => $attempt->id, 'question_id' => $question->id],
            ['question_option_id' => $option?->id]
        );
    }

    /**
     * Submit and score the attempt. Wrapped in a transaction: answers were already
     * persisted incrementally, but result calculation + attempt status update must
     * commit atomically — a scoring failure must not leave a "submitted but unscored" state.
     */
    public function submit(User $user, QuizAttempt $attempt): QuizAttempt
    {
        $this->assertOwnership($user, $attempt);

        if ($attempt->status === 'completed') {
            return $attempt;
        }

        if ($attempt->isExpired() && $attempt->status === 'in_progress') {
            return $this->expireAttempt($attempt);
        }

        return DB::transaction(function () use ($attempt) {
            // Determine correctness for every answered question now that the
            // attempt is closed — correct_option is never exposed before this point.
            $attempt->answers()->with('question.correctOption')->get()->each(function (QuizAnswer $answer) {
                $correctOptionId = $answer->question->correctOption?->id;
                $answer->update([
                    'is_correct' => $answer->question_option_id !== null
                        && $answer->question_option_id === $correctOptionId,
                ]);
            });

            $result = $this->scoringService->score($attempt->fresh());

            $attempt->update([
                'submitted_at' => now(),
                'status' => 'completed',
                ...$result,
            ]);

            $this->progressService->recordAttempt($attempt->fresh());

            return $attempt->fresh();
        });
    }

    public function expireAttempt(QuizAttempt $attempt): QuizAttempt
    {
        if ($attempt->status !== 'in_progress') {
            return $attempt;
        }

        return DB::transaction(function () use ($attempt) {
            $attempt->answers()->with('question.correctOption')->get()->each(function (QuizAnswer $answer) {
                $correctOptionId = $answer->question->correctOption?->id;
                $answer->update([
                    'is_correct' => $answer->question_option_id !== null
                        && $answer->question_option_id === $correctOptionId,
                ]);
            });

            $result = $this->scoringService->score($attempt->fresh());

            $attempt->update([
                'submitted_at' => now(),
                'status' => 'expired',
                ...$result,
            ]);

            $this->progressService->recordAttempt($attempt->fresh());

            return $attempt->fresh();
        });
    }

    public function assertOwnership(User $user, QuizAttempt $attempt): void
    {
        if ($attempt->user_id !== $user->id) {
            throw ValidationException::withMessages([
                'attempt' => 'This attempt does not belong to you.',
            ]);
        }
    }

    public function assertModifiable(QuizAttempt $attempt): void
    {
        if ($attempt->status !== 'in_progress') {
            throw ValidationException::withMessages([
                'attempt' => 'This attempt is no longer in progress.',
            ]);
        }

        if ($attempt->isExpired()) {
            $this->expireAttempt($attempt);

            throw ValidationException::withMessages([
                'attempt' => 'Time is up for this attempt. It has been submitted automatically.',
            ]);
        }
    }

    protected function assertQuestionBelongsToPackage(Question $question, int $packageId): void
    {
        $belongs = $question->section?->package_id === $packageId;

        if (! $belongs) {
            throw ValidationException::withMessages([
                'question_id' => 'This question does not belong to the current package.',
            ]);
        }
    }
}
