<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PackageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'category' => $this->category,
            'description' => $this->description,
            'level' => $this->level,
            'duration_minutes' => $this->duration_minutes,
            'price' => $this->price,
            'is_premium' => $this->is_premium,
            'status' => $this->status,
            'thumbnail' => $this->thumbnail,
            'total_questions' => $this->when(
                $this->relationLoaded('sections'),
                fn () => $this->sections->sum(fn ($s) => $s->questions->count())
            ),
            // access_state / progress are injected by the controller since they
            // depend on the authenticated user, not the package itself.
            'access_state' => $this->when(isset($this->access_state), fn () => $this->access_state),
            'progress' => $this->when(isset($this->progress_percent), fn () => $this->progress_percent),
            'sections' => PackageSectionResource::collection($this->whenLoaded('sections')),
        ];
    }
}
