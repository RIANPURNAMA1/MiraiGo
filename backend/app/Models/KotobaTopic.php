<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KotobaTopic extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id', 'name', 'description', 'word_count', 'order', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'word_count' => 'integer',
            'order' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function category()
    {
        return $this->belongsTo(KotobaCategory::class, 'category_id');
    }

    public function kotoba()
    {
        return $this->belongsToMany(Kotoba::class, 'kotoba_topic_word', 'topic_id', 'kotoba_id');
    }
}
