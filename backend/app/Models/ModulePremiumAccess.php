<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ModulePremiumAccess extends Model
{
    protected $table = 'module_premium_access';

    protected $fillable = ['user_id', 'amount_paid', 'purchased_at'];

    protected function casts(): array
    {
        return [
            'amount_paid' => 'integer',
            'purchased_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
