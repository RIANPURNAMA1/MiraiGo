<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Voucher extends Model
{
    use HasFactory;

    protected $fillable = [
        'code', 'description', 'type', 'value',
        'min_purchase', 'max_discount', 'usage_limit', 'used_count',
        'starts_at', 'expires_at', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'value'         => 'integer',
            'min_purchase'  => 'integer',
            'max_discount'  => 'integer',
            'usage_limit'   => 'integer',
            'used_count'    => 'integer',
            'is_active'     => 'boolean',
            'starts_at'     => 'datetime',
            'expires_at'    => 'datetime',
        ];
    }

    public function isValid(): bool
    {
        if (! $this->is_active) return false;
        if ($this->starts_at && $this->starts_at->isFuture()) return false;
        if ($this->expires_at && $this->expires_at->isPast()) return false;
        if ($this->usage_limit !== null && $this->used_count >= $this->usage_limit) return false;
        return true;
    }

    public function calculateDiscount(int $price): int
    {
        if ($price < $this->min_purchase) return 0;

        if ($this->type === 'fixed') {
            return min($this->value, $price);
        }

        // percentage
        $discount = (int) ceil($price * $this->value / 100);
        if ($this->max_discount !== null) {
            $discount = min($discount, $this->max_discount);
        }
        return min($discount, $price);
    }
}
