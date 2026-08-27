<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ModulePremiumPayment extends Model
{
    protected $fillable = [
        'user_id',
        'amount',
        'proof_image',
        'notes',
        'admin_notes',
        'status',
        'reviewed_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'integer',
            'reviewed_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
