<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ModulePurchase extends Model
{
    use HasFactory;

    protected $table = 'module_purchases';

    protected $fillable = [
        'user_id', 'module_id', 'amount_paid', 'status',
        'purchased_at', 'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'amount_paid' => 'integer',
            'purchased_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function module()
    {
        return $this->belongsTo(LearningModule::class, 'module_id');
    }

    public function isCurrentlyActive(): bool
    {
        if ($this->status !== 'active') {
            return false;
        }

        return $this->expires_at === null || $this->expires_at->isFuture();
    }
}
