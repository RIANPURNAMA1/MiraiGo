<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuizAttemptResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'package_id' => $this->package_id,
            'package_name' => $this->whenLoaded('package', fn () => $this->package->name),
            'status' => $this->status,
            'started_at' => $this->started_at,
            'expires_at' => $this->expires_at,
            'submitted_at' => $this->submitted_at,
            'total_questions' => $this->total_questions,
            'answered_count' => $this->whenLoaded('answers', fn () => $this->answers->count()),
            'score' => $this->score,
            'correct_answers' => $this->correct_answers,
            'wrong_answers' => $this->wrong_answers,
            'unanswered' => $this->unanswered,
        ];
    }
}
