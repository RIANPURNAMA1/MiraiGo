<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ModulePremiumSetting extends Model
{
    protected $fillable = ['premium_price', 'premium_description'];

    protected function casts(): array
    {
        return ['premium_price' => 'integer'];
    }
}
