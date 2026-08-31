<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ModuleCategory extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'slug', 'category_id'];

    public function modules()
    {
        return $this->hasMany(LearningModule::class, 'category_id');
    }

    /**
     * The latihan (soal) category this module category is linked to.
     * Buying that latihan category unlocks the premium modules in this
     * module category.
     */
    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }
}
