<?php

namespace App\Services;

use App\Models\QuizAttempt;

class ScoringService
{
    /**
     * Compute final score for a submitted attempt. Kept isolated from the controller
     * so the scoring formula can evolve independently (e.g. weighted by question score).
     */
    public function score(QuizAttempt $attempt): array
    {
        $answers = $attempt->answers()->with('question')->get();

        $totalQuestions = $attempt->total_questions;
        $correct = $answers->where('is_correct', true)->count();
        $wrong = $answers->where('is_correct', false)->count();
        $unanswered = max(0, $totalQuestions - $answers->count());

        $percentage = $totalQuestions > 0
            ? round(($correct / $totalQuestions) * 100, 2)
            : 0.0;

        return [
            'score' => $percentage,
            'correct_answers' => $correct,
            'wrong_answers' => $wrong,
            'unanswered' => $unanswered,
        ];
    }
}
