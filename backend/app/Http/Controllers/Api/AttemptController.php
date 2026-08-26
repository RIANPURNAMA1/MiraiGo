<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SaveAnswerRequest;
use App\Http\Resources\QuestionResource;
use App\Http\Resources\QuizAttemptResource;
use App\Http\Resources\QuizReviewResource;
use App\Models\Package;
use App\Models\Question;
use App\Models\QuestionOption;
use App\Models\QuizAttempt;
use App\Services\QuizService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AttemptController extends Controller
{
    public function __construct(protected QuizService $quizService) {}

    /**
     * POST /api/attempts  { package_id }
     * Starts (or resumes) an attempt. started_at/expires_at are decided here on the server.
     */
    public function store()
    {
        $data = request()->validate([
            'package_id' => ['required', 'integer', 'exists:packages,id'],
        ]);

        $package = Package::findOrFail($data['package_id']);

        try {
            $attempt = $this->quizService->startAttempt(Auth::user(), $package);
        } catch (ValidationException $e) {
            return $this->error($e->getMessage(), $e->errors(), 403);
        }

        return $this->show($attempt);
    }

    /**
     * GET /api/attempts/{attempt}
     * Returns attempt state + questions (WITHOUT correct answers) + the user's
     * currently-saved selections, so the quiz UI can restore state after a refresh.
     */
    public function show(QuizAttempt $attempt)
    {
        $this->authorizeAttempt($attempt);

        $attempt->load('package.sections.questions.options', 'answers');

        if ($attempt->status === 'in_progress' && $attempt->isExpired()) {
            $attempt = $this->quizService->expireAttempt($attempt);
        }

        $questions = $attempt->package->sections->flatMap(function ($section) {
            return $section->questions->map(function ($q) use ($section) {
                $q->section_name = $section->name;

                return $q;
            });
        });

        $savedAnswers = $attempt->answers->keyBy('question_id')
            ->map(fn ($a) => $a->question_option_id);

        return $this->success([
            'attempt' => new QuizAttemptResource($attempt),
            'questions' => $questions->map(function (Question $q) use ($savedAnswers) {
                $resource = (new QuestionResource($q))->resolve();
                $resource['section_name'] = $q->section_name;
                $resource['selected_option_id'] = $savedAnswers->get($q->id);

                return $resource;
            })->values(),
        ]);
    }

    /**
     * POST /api/attempts/{attempt}/answers  { question_id, question_option_id }
     * Auto-save endpoint — re-validates ownership, status, expiration, and the
     * question/option relationship on every call.
     */
    public function saveAnswer(SaveAnswerRequest $request, QuizAttempt $attempt)
    {
        $this->authorizeAttempt($attempt);

        $question = Question::findOrFail($request->validated('question_id'));
        $option = $request->validated('question_option_id')
            ? QuestionOption::find($request->validated('question_option_id'))
            : null;

        try {
            $answer = $this->quizService->saveAnswer(Auth::user(), $attempt, $question, $option);
        } catch (ValidationException $e) {
            return $this->error($e->getMessage(), $e->errors(), 422);
        }

        return $this->success([
            'question_id' => $answer->question_id,
            'question_option_id' => $answer->question_option_id,
        ], 'Answer saved.');
    }

    /**
     * POST /api/attempts/{attempt}/submit
     */
    public function submit(QuizAttempt $attempt)
    {
        $this->authorizeAttempt($attempt);

        $attempt = $this->quizService->submit(Auth::user(), $attempt);

        return $this->success(new QuizAttemptResource($attempt), 'Quiz submitted.');
    }

    /**
     * GET /api/attempts/{attempt}/result
     */
    public function result(QuizAttempt $attempt)
    {
        $this->authorizeAttempt($attempt);

        if ($attempt->status === 'in_progress') {
            return $this->error('This attempt has not been submitted yet.', [], 409);
        }

        $attempt->load('package');

        return $this->success(new QuizAttemptResource($attempt));
    }

    /**
     * GET /api/attempts/{attempt}/review
     * Correct answers are only exposed once the attempt is no longer in_progress.
     */
    public function review(QuizAttempt $attempt)
    {
        $this->authorizeAttempt($attempt);

        if ($attempt->status === 'in_progress') {
            return $this->error('Review is available after the attempt is submitted.', [], 409);
        }

        $answers = $attempt->answers()
            ->with(['question.correctOption', 'selectedOption'])
            ->get();

        return $this->success(QuizReviewResource::collection($answers));
    }

    protected function authorizeAttempt(QuizAttempt $attempt): void
    {
        if ($attempt->user_id !== Auth::id()) {
            abort(403, 'This attempt does not belong to you.');
        }
    }
}
