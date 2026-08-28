<?php

namespace Tests\Unit;

use App\Models\Kotoba;
use App\Models\KotobaCategory;
use App\Models\KotobaTopic;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class KotobaModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_kotoba_options_are_cast_to_array(): void
    {
        $category = KotobaCategory::create([
            'name' => 'JFT Basic',
            'type' => 'JFT',
            'color' => 'text-red-700',
        ]);

        $kotoba = Kotoba::create([
            'category_id' => $category->id,
            'japanese' => '水',
            'reading' => 'みず',
            'meaning' => 'air',
            'is_active' => true,
            'options' => [
                ['option' => 'A', 'option_text' => 'air', 'is_correct' => true],
                ['option' => 'B', 'option_text' => 'api', 'is_correct' => false],
            ],
        ]);

        $this->assertIsArray($kotoba->options);
        $this->assertCount(2, $kotoba->options);
        $this->assertTrue($kotoba->options[0]['is_correct']);
        $this->assertTrue($kotoba->is_active);
    }

    public function test_kotoba_belongs_to_category_and_belongs_to_many_topics(): void
    {
        $category = KotobaCategory::create([
            'name' => 'JFT Basic',
            'type' => 'JFT',
        ]);

        $topic = KotobaTopic::create([
            'category_id' => $category->id,
            'name' => 'Bencana Alam',
        ]);

        $kotoba = Kotoba::create([
            'category_id' => $category->id,
            'japanese' => '地震',
            'reading' => 'じしん',
            'meaning' => 'gempa',
        ]);

        $kotoba->topics()->attach($topic->id);

        $this->assertInstanceOf(KotobaCategory::class, $kotoba->category);
        $this->assertCount(1, $kotoba->topics);
        $this->assertEquals('Bencana Alam', $kotoba->topics->first()->name);
    }
}