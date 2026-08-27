<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PackageSectionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'order' => $this->order,
            'duration_minutes' => $this->duration_minutes,
            'question_count' => $this->questions->count(),
            'progress' => $this->when(isset($this->progress_percent), fn () => $this->progress_percent),
        ];
    }
}
