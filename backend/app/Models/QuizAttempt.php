<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QuizAttempt extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'package_id', 'started_at', 'expires_at', 'submitted_at',
        'status', 'score', 'total_questions', 'correct_answers', 'wrong_answers', 'unanswered',
    ];

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'expires_at' => 'datetime',
            'submitted_at' => 'datetime',
            'score' => 'decimal:2',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function package()
    {
        return $this->belongsTo(Package::class);
    }

    public function answers()
    {
        return $this->hasMany(QuizAnswer::class);
    }

    /**
     * Server-authoritative expiration check. Frontend timer is a display only —
     * this is the single source of truth for whether the attempt can still be modified.
     */
    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    public function isActive(): bool
    {
        return $this->status === 'in_progress' && ! $this->isExpired();
    }
}
