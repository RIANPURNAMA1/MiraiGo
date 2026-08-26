<?php

namespace Database\Seeders;

use App\Models\Package;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class JftPackageSeeder extends Seeder
{
    public function run(): void
    {
        $packages = [
            [
                'name' => 'JFT - Soba (そば)',
                'category' => 'JFT-Basic',
                'level' => 'A2',
                'description' => 'Latihan kosakata dan tata bahasa dasar bertema makanan sehari-hari (soba, restoran, memesan makanan).',
                'is_premium' => false,
                'duration' => 30,
                'sections' => [
                    'Script & Vocabulary' => [
                        ['q' => 'そばを____。（食べます）', 'opts' => ['たべます' => true, 'のみます' => false, 'かいます' => false, 'つくります' => false]],
                        ['q' => '「そば」の意味は何ですか？', 'opts' => ['蕎麦（麺の一種）' => true, '果物' => false, '飲み物' => false, '野菜' => false]],
                    ],
                    'Grammar' => [
                        ['q' => 'レストランで＿＿＿を注文します。', 'opts' => ['そば' => true, 'そばで' => false, 'そばが' => false, 'そばの' => false]],
                    ],
                ],
            ],
            [
                'name' => 'JFT - Toire (トイレ)',
                'category' => 'JFT-Basic',
                'level' => 'A2',
                'description' => 'Latihan kosakata seputar fasilitas umum, arah, dan permintaan izin.',
                'is_premium' => false,
                'duration' => 30,
                'sections' => [
                    'Script & Vocabulary' => [
                        ['q' => 'トイレは＿＿＿にあります。', 'opts' => ['あそこ' => true, 'あの' => false, 'あそこの' => false, 'あそこで' => false]],
                        ['q' => '「すみません、トイレはどこですか」の返事として正しいのは？', 'opts' => ['あちらです。' => true, 'ありがとう。' => false, 'こんにちは。' => false, 'さようなら。' => false]],
                    ],
                ],
            ],
            [
                'name' => 'JFT - Basu (バス)',
                'category' => 'JFT-Basic',
                'level' => 'A2',
                'description' => 'Latihan kosakata dan percakapan seputar transportasi umum (bus).',
                'is_premium' => true,
                'duration' => 45,
                'sections' => [
                    'Script & Vocabulary' => [
                        ['q' => 'バス停は＿＿＿にありますか。', 'opts' => ['どこ' => true, 'なに' => false, 'だれ' => false, 'いつ' => false]],
                    ],
                    'Reading' => [
                        ['q' => '次の文を読んでください：「バスは9時に出発します」。バスは何時に出ますか。', 'opts' => ['9時' => true, '8時' => false, '10時' => false, '11時' => false]],
                    ],
                    'Listening' => [
                        ['q' => '（音声）バスの行き先はどこですか。', 'opts' => ['空港' => true, '駅' => false, '学校' => false, '病院' => false]],
                    ],
                ],
            ],
            [
                'name' => 'JFT - Kagi (鍵)',
                'category' => 'JFT-Basic',
                'level' => 'A2',
                'description' => 'Latihan kosakata seputar tempat tinggal dan keamanan (kunci, pintu, kamar).',
                'is_premium' => true,
                'duration' => 45,
                'sections' => [
                    'Script & Vocabulary' => [
                        ['q' => '部屋の＿＿＿をかけてください。', 'opts' => ['鍵' => true, '窓' => false, '机' => false, '椅子' => false]],
                    ],
                    'Grammar' => [
                        ['q' => '鍵を＿＿＿しました。（忘れる）', 'opts' => ['わすれ' => true, 'わすれて' => false, 'わすれます' => false, 'わすれた' => false]],
                    ],
                ],
            ],
        ];

        foreach ($packages as $index => $data) {
            $package = Package::create([
                'name' => $data['name'],
                'slug' => Str::slug($data['name']).'-'.Str::random(4),
                'category' => $data['category'],
                'description' => $data['description'],
                'level' => $data['level'],
                'duration_minutes' => $data['duration'],
                'price' => $data['is_premium'] ? 49000 : 0,
                'is_premium' => $data['is_premium'],
                'status' => 'published',
            ]);

            $sectionOrder = 0;
            foreach ($data['sections'] as $sectionName => $questions) {
                $section = $package->sections()->create([
                    'name' => $sectionName,
                    'order' => $sectionOrder++,
                    'duration_minutes' => intdiv($data['duration'], count($data['sections'])),
                ]);

                foreach ($questions as $qIndex => $q) {
                    $question = $section->questions()->create([
                        'question_text' => $q['q'],
                        'explanation' => 'Perhatikan konteks kalimat untuk menentukan jawaban yang tepat.',
                        'difficulty' => 'medium',
                        'score' => 1,
                        'order' => $qIndex,
                    ]);

                    $labels = ['A', 'B', 'C', 'D'];
                    $i = 0;
                    foreach ($q['opts'] as $text => $isCorrect) {
                        $question->options()->create([
                            'option' => $labels[$i],
                            'option_text' => $text,
                            'is_correct' => $isCorrect,
                            'order' => $i,
                        ]);
                        $i++;
                    }
                }
            }
        }
    }
}
