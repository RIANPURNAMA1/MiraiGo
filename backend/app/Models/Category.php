<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'slug', 'icon', 'description', 'features', 'order', 'is_active', 'is_premium', 'is_popular', 'price', 'duration_days',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'is_premium' => 'boolean',
            'is_popular' => 'boolean',
            'order' => 'integer',
            'price' => 'integer',
            'duration_days' => 'integer',
            'features' => 'array',
        ];
    }
}
