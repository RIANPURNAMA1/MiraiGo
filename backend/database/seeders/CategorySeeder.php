<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        Category::create([
            'name' => 'JFT Basic',
            'slug' => 'JFT-Basic',
            'description' => 'Kosakata, gramatika, dan pemahaman membaca untuk ujian JFT tingkat dasar.',
            'order' => 1,
            'is_active' => true,
        ]);

        Category::create([
            'name' => 'SSW',
            'slug' => 'SSW',
            'description' => 'Percakapan, listening, dan materi khusus ujian SSW untuk kerja di Jepang.',
            'order' => 2,
            'is_active' => true,
        ]);
    }
}
