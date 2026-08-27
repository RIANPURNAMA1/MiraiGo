<?php

namespace Database\Seeders;

use App\Models\KotobaCategory;
use Illuminate\Database\Seeder;

class KotobaCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'JFT Basic',
                'description' => 'Latihan kosakata dasar untuk ujian JFT-Basic (bahasa Jepang untuk kehidupan kerja).',
                'type' => 'JFT',
                'total_words' => 300,
                'total_packages' => 8,
                'icon' => 'book-open',
                'color' => 'text-blue-700',
                'order' => 1,
            ],
            [
                'name' => 'SSW Kaigo',
                'description' => 'Kosakata perawatan lanjut usia (kaigo) untuk pekerja di Jepang: perawatan, kesehatan, dll.',
                'type' => 'SSW',
                'total_words' => 250,
                'total_packages' => 6,
                'icon' => 'sparkles',
                'color' => 'text-rose-700',
                'order' => 2,
            ],
            [
                'name' => 'SSW Restoran',
                'description' => 'Kosakata industri restoran: menu, pelayanan, memesan, dan percakapan dengan pelanggan.',
                'type' => 'SSW',
                'total_words' => 220,
                'total_packages' => 5,
                'icon' => 'utensils',
                'color' => 'text-amber-700',
                'order' => 3,
            ],
            [
                'name' => 'SSW Pertanian',
                'description' => 'Kosakata pertanian: tanaman, musim, alat pertanian, dan pekerjaan di ladang.',
                'type' => 'SSW',
                'total_words' => 200,
                'total_packages' => 5,
                'icon' => 'wheat',
                'color' => 'text-emerald-700',
                'order' => 4,
            ],
            [
                'name' => 'SSW Peternakan',
                'description' => 'Kosakata peternakan: hewan ternak, kandang, pakan, dan kesehatan hewan.',
                'type' => 'SSW',
                'total_words' => 180,
                'total_packages' => 4,
                'icon' => 'fish',
                'color' => 'text-teal-700',
                'order' => 5,
            ],
            [
                'name' => 'SSW Building Cleaning',
                'description' => 'Kosakata kebersihan gedung: peralatan, bahan pembersih, dan prosedur kerja.',
                'type' => 'SSW',
                'total_words' => 210,
                'total_packages' => 5,
                'icon' => 'building-2',
                'color' => 'text-indigo-700',
                'order' => 6,
            ],
        ];

        foreach ($categories as $data) {
            KotobaCategory::updateOrCreate(
                ['name' => $data['name']],
                $data
            );
        }
    }
}
