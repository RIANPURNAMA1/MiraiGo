<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        Category::updateOrCreate(
            ['slug' => 'JFT-Basic'],
            [
                'name' => 'JFT Basic',
                'description' => 'Kosakata, gramatika, dan pemahaman membaca untuk ujian JFT tingkat dasar.',
                'order' => 1,
                'is_active' => true,
                'is_premium' => true,
                'price' => 2999999,
                'duration_days' => null,
            ]
        );

        Category::updateOrCreate(
            ['slug' => 'SSW'],
            [
                'name' => 'SSW',
                'description' => 'Percakapan, listening, dan materi khusus ujian SSW untuk kerja di Jepang.',
                'order' => 2,
                'is_active' => true,
                'is_premium' => false,
                'price' => 0,
                'duration_days' => null,
            ]
        );
    }
}
