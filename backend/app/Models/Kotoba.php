<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Kotoba extends Model
{
    use HasFactory;

    protected $table = 'kotoba';

    protected $fillable = [
        'category_id', 'japanese', 'reading', 'meaning',
        'example_sentence', 'example_translation', 'order', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'order' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function category()
    {
        return $this->belongsTo(KotobaCategory::class, 'category_id');
    }

    public function topics()
    {
        return $this->belongsToMany(KotobaTopic::class, 'kotoba_topic_word', 'kotoba_id', 'topic_id');
    }
}
