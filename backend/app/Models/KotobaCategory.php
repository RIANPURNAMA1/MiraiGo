<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KotobaCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'description', 'type', 'total_words', 'total_packages',
        'icon', 'color', 'order', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'total_words' => 'integer',
            'total_packages' => 'integer',
            'order' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function kotoba()
    {
        return $this->hasMany(Kotoba::class, 'category_id');
    }

    public function topics()
    {
        return $this->hasMany(KotobaTopic::class, 'category_id');
    }
}
