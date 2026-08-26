<?php

namespace Database\Seeders;

use App\Models\Announcement;
use Illuminate\Database\Seeder;

class AnnouncementSeeder extends Seeder
{
    public function run(): void
    {
        Announcement::create([
            'title' => 'Selamat datang di MiraiGo!',
            'description' => 'Mulai latihan JFT/SSW Anda sekarang. Jelajahi paket latihan gratis dan tingkatkan skor Anda secara bertahap.',
            'status' => 'published',
            'published_at' => now()->subDays(2),
        ]);

        Announcement::create([
            'title' => 'Paket Premium Baru: JFT - Basu & Kagi',
            'description' => 'Paket latihan premium kini tersedia dengan soal reading dan listening tambahan.',
            'status' => 'published',
            'published_at' => now()->subDay(),
        ]);
    }
}
