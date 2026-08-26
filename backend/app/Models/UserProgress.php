<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserProgress extends Model
{
    use HasFactory;

    protected $table = 'user_progress';

    protected $fillable = [
        'user_id', 'section_id', 'attempts_count', 'best_score',
        'last_score', 'average_score', 'last_attempted_at',
    ];

    protected function casts(): array
    {
        return [
            'best_score' => 'decimal:2',
            'last_score' => 'decimal:2',
            'average_score' => 'decimal:2',
            'last_attempted_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function section()
    {
        return $this->belongsTo(PackageSection::class, 'section_id');
    }
}
