<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name', 'username', 'email', 'password', 'phone', 'avatar', 'role', 'status',
        'referral_code', 'referral_bonus_days',
    ];

    protected $hidden = [
        'password', 'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isStudentMendunia(): bool
    {
        return $this->role === 'studentmendunia';
    }

    public function referredTransactions()
    {
        return $this->hasMany(Transaction::class, 'referred_by');
    }

    public function ensureReferralCode(): string
    {
        if ($this->referral_code) {
            return $this->referral_code;
        }

        $words = preg_split('/\s+/', trim($this->name)) ?: ['User'];
        $prefix = strtoupper(substr($words[0], 0, 1));
        if (isset($words[1])) {
            $prefix .= strtoupper(substr($words[1], 0, 1));
        } else {
            $prefix .= strtoupper(substr($words[0], 1, 1));
        }
        $suffix = strtoupper(substr(end($words), -1));

        do {
            $code = $prefix.str_pad((string) random_int(0, 99), 2, '0', STR_PAD_LEFT).$suffix;
        } while (self::where('referral_code', $code)->exists());

        $this->forceFill(['referral_code' => $code])->save();

        return $code;
    }

    public function quizAttempts()
    {
        return $this->hasMany(QuizAttempt::class);
    }

    public function packageAccess()
    {
        return $this->hasMany(UserPackageAccess::class);
    }

    public function progress()
    {
        return $this->hasMany(UserProgress::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }

    public function notifications()
    {
        return $this->hasMany(AppNotification::class);
    }
}
