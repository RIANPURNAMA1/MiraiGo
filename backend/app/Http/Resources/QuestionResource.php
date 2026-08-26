<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuestionResource extends JsonResource
{
    /**
     * SECURITY: is_correct is intentionally never included here. This resource is used
     * for in-progress quiz taking, where the correct answer must never reach the client.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'question_text' => $this->question_text,
            'image' => $this->image,
            'audio' => $this->audio,
            'order' => $this->order,
            'score' => $this->score,
            'options' => $this->options->map(fn ($opt) => [
                'id' => $opt->id,
                'option' => $opt->option,
                'option_text' => $opt->option_text,
            ]),
        ];
    }
}
