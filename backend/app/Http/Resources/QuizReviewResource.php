<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuizReviewResource extends JsonResource
{
    /**
     * Only used AFTER an attempt is completed/expired — safe to expose correct answers here.
     */
    public function toArray(Request $request): array
    {
        $question = $this->question;
        $selected = $this->selectedOption;
        $correct = $question->correctOption;

        return [
            'question_id' => $question->id,
            'question_text' => $question->question_text,
            'image' => $question->image,
            'audio' => $question->audio,
            'explanation' => $question->explanation,
            'your_answer' => $selected ? [
                'id' => $selected->id,
                'option' => $selected->option,
                'option_text' => $selected->option_text,
            ] : null,
            'correct_answer' => $correct ? [
                'id' => $correct->id,
                'option' => $correct->option,
                'option_text' => $correct->option_text,
            ] : null,
            'is_correct' => $this->is_correct,
        ];
    }
}
