<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LearningModule extends Model
{
    use HasFactory;

    protected $table = 'modules';

    protected $fillable = [
        'category_id', 'title', 'description', 'thumbnail', 'file_url',
        'external_url', 'is_premium', 'price', 'status', 'published_at',
    ];

    protected function casts(): array
    {
        return [
            'is_premium' => 'boolean',
            'price' => 'integer',
            'published_at' => 'datetime',
        ];
    }

    public function category()
    {
        return $this->belongsTo(ModuleCategory::class, 'category_id');
    }
}
