<?php

namespace Database\Seeders;

use App\Models\ModuleCategory;
use Illuminate\Database\Seeder;

class ModuleCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Kosakata',     'slug' => 'kosakata'],
            ['name' => 'Grammar',      'slug' => 'grammar'],
            ['name' => 'Listening',    'slug' => 'listening'],
            ['name' => 'Percakapan',   'slug' => 'percakapan'],
            ['name' => 'Reading',      'slug' => 'reading'],
            ['name' => 'Writing',      'slug' => 'writing'],
            ['name' => 'E-Learning',   'slug' => 'e-learning'],
        ];

        foreach ($categories as $cat) {
            ModuleCategory::updateOrCreate(
                ['slug' => $cat['slug']],
                ['name' => $cat['name']]
            );
        }
    }
}
