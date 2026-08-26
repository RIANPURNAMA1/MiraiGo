<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Package extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name', 'slug', 'category', 'description', 'level',
        'duration_minutes', 'price', 'is_premium', 'status', 'thumbnail',
    ];

    protected function casts(): array
    {
        return [
            'is_premium' => 'boolean',
            'price' => 'integer',
        ];
    }

    public function sections()
    {
        return $this->hasMany(PackageSection::class)->orderBy('order');
    }

    public function quizAttempts()
    {
        return $this->hasMany(QuizAttempt::class);
    }

    public function userAccess()
    {
        return $this->hasMany(UserPackageAccess::class);
    }

    public function totalQuestions(): int
    {
        return Question::whereIn('section_id', $this->sections()->pluck('id'))->count();
    }
}
