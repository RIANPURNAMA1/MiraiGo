<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PackageSection extends Model
{
    use HasFactory;

    protected $fillable = ['package_id', 'name', 'description', 'order', 'duration_minutes'];

    public function package()
    {
        return $this->belongsTo(Package::class);
    }

    public function questions()
    {
        return $this->hasMany(Question::class, 'section_id')->orderBy('order');
    }

    public function progress()
    {
        return $this->hasMany(UserProgress::class, 'section_id');
    }
}
