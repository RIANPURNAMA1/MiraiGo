<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'transaction_id', 'provider', 'provider_reference', 'status', 'meta',
        'proof_image', 'notes', 'admin_notes', 'reviewed_at',
    ];

    protected function casts(): array
    {
        return [
            'meta' => 'array',
            'reviewed_at' => 'datetime',
        ];
    }

    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }
}
