<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\KotobaCategory;
use App\Models\Kotoba;
use App\Models\KotobaTopic;

class KotobaSampleSeeder extends Seeder
{
    public function run(): void
    {
        $cats = [
            ['name' => 'JFT Basic', 'description' => 'Latihan kosakata dasar untuk ujian JFT-Basic (bahasa Jepang untuk kehidupan kerja).', 'type' => 'JFT', 'icon' => 'book-open', 'color' => 'text-blue-700', 'order' => 1],
            ['name' => 'SSW Kaigo', 'description' => 'Kosakata perawatan lanjut usia (kaigo) untuk pekerja di Jepang: perawatan, kesehatan, dll.', 'type' => 'SSW', 'icon' => 'heart-pulse', 'color' => 'text-pink-700', 'order' => 2],
            ['name' => 'SSW Restoran', 'description' => 'Kosakata industri restoran: menu, pelayanan, memesan, dan percakapan dengan pelanggan.', 'type' => 'SSW', 'icon' => 'utensils', 'color' => 'text-orange-700', 'order' => 3],
            ['name' => 'SSW Pertanian', 'description' => 'Kosakata pertanian: tanaman, musim, alat pertanian, dan pekerjaan di ladang.', 'type' => 'SSW', 'icon' => 'wheat', 'color' => 'text-green-700', 'order' => 4],
            ['name' => 'SSW Peternakan', 'description' => 'Kosakata peternakan: hewan ternak, kandang, pakan, dan kesehatan hewan.', 'type' => 'SSW', 'icon' => 'fish', 'color' => 'text-teal-700', 'order' => 5],
            ['name' => 'SSW Building Cleaning', 'description' => 'Kosakata kebersihan gedung: peralatan, bahan pembersih, dan prosedur kerja.', 'type' => 'SSW', 'icon' => 'building-2', 'color' => 'text-indigo-700', 'order' => 6],
        ];

        $jftBasicId = null;
        $sswKaigoId = null;

        foreach ($cats as $c) {
            $cat = KotobaCategory::create(array_merge($c, ['is_active' => true]));
            if ($c['name'] === 'JFT Basic') $jftBasicId = $cat->id;
            if ($c['name'] === 'SSW Kaigo') $sswKaigoId = $cat->id;
        }

        // JFT Basic - Kosakata Dasar
        $topic1 = KotobaTopic::create([
            'category_id' => $jftBasicId,
            'name' => 'Kosakata Dasar',
            'description' => 'Kosakata sehari-hari: sapaan, angka, waktu, dll.',
            'order' => 1,
            'is_active' => true,
        ]);

        $topic2 = KotobaTopic::create([
            'category_id' => $jftBasicId,
            'name' => 'Kehidupan Sehari-hari',
            'description' => 'Kosakata untuk situasi kerja dan kehidupan sehari-hari di Jepang.',
            'order' => 2,
            'is_active' => true,
        ]);

        $topic3 = KotobaTopic::create([
            'category_id' => $jftBasicId,
            'name' => 'Kerja & Kantor',
            'description' => 'Kosakata untuk lingkungan kerja, kantor, dan instruksi kerja.',
            'order' => 3,
            'is_active' => true,
        ]);

        // SSW Kaigo
        $topic4 = KotobaTopic::create([
            'category_id' => $sswKaigoId,
            'name' => 'Istilah Perawatan Dasar',
            'description' => 'Istilah dasar dalam perawatan lansia: aktivitas sehari-hari, kebersihan, dll.',
            'order' => 1,
            'is_active' => true,
        ]);

        $topic5 = KotobaTopic::create([
            'category_id' => $sswKaigoId,
            'name' => 'Istilah Medis Kaigo',
            'description' => 'Istilah medis yang berkaitan dengan perawatan lansia.',
            'order' => 2,
            'is_active' => true,
        ]);

        $topic6 = KotobaTopic::create([
            'category_id' => $sswKaigoId,
            'name' => 'Komunikasi dengan Lansia',
            'description' => ' ungkapan dan kalimat untuk berkomunikasi dengan lansia.',
            'order' => 3,
            'is_active' => true,
        ]);

        // JFT Basic - Kosakata Dasar words
        $words1 = [
            ['japanese' => 'おはようございます', 'reading' => 'おはようございます', 'meaning' => 'Selamat pagi'],
            ['japanese' => 'こんにちは', 'reading' => 'こんにちは', 'meaning' => 'Selamat siang'],
            ['japanese' => 'ありがとうございます', 'reading' => 'ありがとうございます', 'meaning' => 'Terima kasih'],
            ['japanese' => 'すみません', 'reading' => 'すみません', 'meaning' => 'Permisi / Maaf'],
            ['japanese' => 'おねがいします', 'reading' => 'おねがいします', 'meaning' => 'Tolong / Permisi'],
            ['japanese' => 'はい', 'reading' => 'はい', 'meaning' => 'Ya'],
            ['japanese' => 'いいえ', 'reading' => 'いいえ', 'meaning' => 'Tidak'],
            ['japanese' => 'わかりました', 'reading' => 'わかりました', 'meaning' => 'Mengerti / Baik'],
            ['japanese' => 'がんばってください', 'reading' => 'がんばってください', 'meaning' => 'Semangat / Good luck'],
            ['japanese' => 'おつかれさまです', 'reading' => 'おつかれさまです', 'meaning' => 'Terima kasih atas kerja kerasnya'],
        ];

        // JFT Basic - Kehidupan Sehari-hari words
        $words2 = [
            ['japanese' => 'きっぷ', 'reading' => 'きっぷ', 'meaning' => 'Tiket'],
            ['japanese' => 'えき', 'reading' => 'えき', 'meaning' => 'Stasiun'],
            ['japanese' => 'でんしゃ', 'reading' => 'でんしゃ', 'meaning' => 'Kereta'],
            ['japanese' => 'バス', 'reading' => 'バス', 'meaning' => 'Bus'],
            ['japanese' => 'たべもの', 'reading' => 'たべもの', 'meaning' => 'Makanan'],
            ['japanese' => 'みず', 'reading' => 'みず', 'meaning' => 'Air'],
            ['japanese' => 'トイレ', 'reading' => 'トイレ', 'meaning' => 'Toilet / Kamar kecil'],
            ['japanese' => 'でんわ', 'reading' => 'でんわ', 'meaning' => 'Telepon'],
            ['japanese' => 'じかん', 'reading' => 'じかん', 'meaning' => 'Waktu'],
            ['japanese' => 'にほんご', 'reading' => 'にほんご', 'meaning' => 'Bahasa Jepang'],
        ];

        // JFT Basic - Kerja & Kantor words
        $words3 = [
            ['japanese' => 'しごと', 'reading' => 'しごと', 'meaning' => 'Pekerjaan / Kerja'],
            ['japanese' => 'かちょう', 'reading' => 'かちょう', 'meaning' => 'Kepala bagian'],
            ['japanese' => 'せんせい', 'reading' => 'せんせい', 'meaning' => 'Guru / Instruktur'],
            ['japanese' => 'しょくいん', 'reading' => 'しょくいん', 'meaning' => 'Karyawan'],
            ['japanese' => 'きょうりょく', 'reading' => 'きょうりょく', 'meaning' => 'Kerja sama'],
            ['japanese' => 'ほうこく', 'reading' => 'ほうこく', 'meaning' => 'Laporan'],
            ['japanese' => 'れんしゅう', 'reading' => 'れんしゅう', 'meaning' => 'Latihan'],
            ['japanese' => 'ちゅうい', 'reading' => 'ちゅうい', 'meaning' => 'Hati-hati / Perhatian'],
            ['japanese' => 'きけん', 'reading' => 'きけん', 'meaning' => 'Berbahaya'],
            ['japanese' => 'あんぜん', 'reading' => 'あんぜん', 'meaning' => 'Aman / Keselamatan'],
        ];

        // SSW Kaigo - Istilah Perawatan Dasar
        $words4 = [
            ['japanese' => 'かいご', 'reading' => 'かいご', 'meaning' => 'Perawatan / Kaigo'],
            ['japanese' => 'おれいしゃ', 'reading' => 'おれいしゃ', 'meaning' => 'Penghuni panti jompo'],
            ['japanese' => 'ほしょう', 'reading' => 'ほしょう', 'meaning' => 'Perlindungan'],
            ['japanese' => 'かいだん', 'reading' => 'かいだん', 'meaning' => 'Tangga'],
            ['japanese' => 'よかん', 'reading' => 'よかん', 'meaning' => 'Prediksi / Perkiraan'],
            ['japanese' => 'きょか', 'reading' => 'きょか', 'meaning' => 'Izin'],
            ['japanese' => 'せいれつ', 'reading' => 'せいれつ', 'meaning' => 'Kebersihan'],
            ['japanese' => 'せいかつ', 'reading' => 'せいかつ', 'meaning' => 'Kehidupan sehari-hari'],
            ['japanese' => 'たいいく', 'reading' => 'たいいく', 'meaning' => 'Olahraga'],
            ['japanese' => 'うんどう', 'reading' => 'うんどう', 'meaning' => 'Gerak / Olahraga'],
        ];

        // SSW Kaigo - Istilah Medis Kaigo
        $words5 = [
            ['japanese' => 'びょういん', 'reading' => 'びょういん', 'meaning' => 'Rumah sakit'],
            ['japanese' => 'くすり', 'reading' => 'くすり', 'meaning' => 'Obat'],
            ['japanese' => 'しんちょう', 'reading' => 'しんちょう', 'meaning' => 'Tinggi badan'],
            ['japanese' => 'たいおん', 'reading' => 'たいおん', 'meaning' => 'Suhu tubuh'],
            ['japanese' => 'けんこう', 'reading' => 'けんこう', 'meaning' => 'Kesehatan'],
            ['japanese' => 'しょくどう', 'reading' => 'しょくどう', 'meaning' => 'Nafsu makan'],
            ['japanese' => 'ねむり', 'reading' => 'ねむり', 'meaning' => 'Tidur'],
            ['japanese' => 'たいりょく', 'reading' => 'たいりょく', 'meaning' => 'Daya tahan tubuh'],
            ['japanese' => 'かんせん', 'reading' => 'かんせん', 'meaning' => 'Infeksi'],
            ['japanese' => 'きゅうきゅう', 'reading' => 'きゅうきゅう', 'meaning' => 'Darurat'],
        ];

        // SSW Kaigo - Komunikasi dengan Lansia
        $words6 = [
            ['japanese' => 'おはなし', 'reading' => 'おはなし', 'meaning' => 'Bicara / Percakapan'],
            ['japanese' => 'きいてあげる', 'reading' => 'きいてあげる', 'meaning' => 'Mendengarkan'],
            ['japanese' => 'おだいじに', 'reading' => 'おだいじに', 'meaning' => 'Tolong jaga kesehatan'],
            ['japanese' => 'ごしゅじん', 'reading' => 'ごしゅじん', 'meaning' => 'Tuan / Nyonya (hormat)'],
            ['japanese' => 'いかがですか', 'reading' => 'いかがですか', 'meaning' => 'Bagaimana kabarnya?'],
            ['japanese' => 'たすけてあげる', 'reading' => 'たすけてあげる', 'meaning' => 'Saya akan membantu'],
            ['japanese' => 'ゆっくり', 'reading' => 'ゆっくり', 'meaning' => 'Pelan-pelan'],
            ['japanese' => 'おねがい', 'reading' => 'おねがい', 'meaning' => 'Tolong / Permintaan'],
            ['japanese' => 'だいじょうぶ', 'reading' => 'だいじょうぶ', 'meaning' => 'Tidak apa-apa'],
            ['japanese' => 'かたづける', 'reading' => 'かたづける', 'meaning' => 'Membersihkan / Merapikan'],
        ];

        $allWords = [
            [$topic1, $words1],
            [$topic2, $words2],
            [$topic3, $words3],
            [$topic4, $words4],
            [$topic5, $words5],
            [$topic6, $words6],
        ];

        foreach ($allWords as [$topic, $words]) {
            $ids = [];
            foreach ($words as $w) {
                $kotoba = Kotoba::create(array_merge($w, [
                    'category_id' => $topic->category_id,
                    'japanese' => $w['japanese'],
                    'reading' => $w['reading'],
                    'meaning' => $w['meaning'],
                    'is_active' => true,
                ]));
                $ids[] = $kotoba->id;
            }
            $topic->kotoba()->sync($ids);
            $topic->update(['word_count' => count($ids)]);
        }

        // Update category word counts
        foreach (KotobaCategory::all() as $cat) {
            $cat->update(['total_words' => $cat->kotoba()->count(), 'total_packages' => $cat->topics()->count()]);
        }
    }
}
