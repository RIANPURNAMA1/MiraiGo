<?php

namespace App\Services;

use App\Models\PackageSection;
use App\Models\QuizAttempt;
use App\Models\User;
use App\Models\UserProgress;

class ProgressService
{
    /**
     * Recalculate the user's progress record for every section touched by this attempt.
     * Runs inside the same DB transaction as submit() so progress and results never diverge.
     */
    public function recordAttempt(QuizAttempt $attempt): void
    {
        $sectionIds = $attempt->answers()
            ->with('question.section')
            ->get()
            ->pluck('question.section.id')
            ->filter()
            ->unique();

        foreach ($sectionIds as $sectionId) {
            $this->recalculateSection($attempt->user, $sectionId);
        }
    }

    protected function recalculateSection(User $user, int $sectionId): void
    {
        $section = PackageSection::find($sectionId);
        if (! $section) {
            return;
        }

        // Approximate section-level score from this user's attempts on the parent package.
        $attempts = QuizAttempt::where('user_id', $user->id)
            ->where('package_id', $section->package_id)
            ->where('status', 'completed')
            ->orderByDesc('submitted_at')
            ->get();

        if ($attempts->isEmpty()) {
            return;
        }

        $scores = $attempts->pluck('score')->map(fn ($s) => (float) $s);

        UserProgress::updateOrCreate(
            ['user_id' => $user->id, 'section_id' => $sectionId],
            [
                'attempts_count' => $attempts->count(),
                'best_score' => $scores->max(),
                'last_score' => $scores->first(),
                'average_score' => round($scores->avg(), 2),
                'last_attempted_at' => $attempts->first()->submitted_at,
            ]
        );
    }

    public function overview(User $user): array
    {
        return UserProgress::where('user_id', $user->id)
            ->with('section.package')
            ->get()
            ->groupBy(fn ($p) => $p->section->name)
            ->map(fn ($group) => round($group->avg('average_score'), 2))
            ->toArray();
    }
}
