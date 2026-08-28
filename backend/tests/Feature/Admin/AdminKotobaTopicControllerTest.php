<?php

namespace Tests\Feature\Admin;

use App\Models\Kotoba;
use App\Models\KotobaCategory;
use App\Models\KotobaTopic;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminKotobaTopicControllerTest extends TestCase
{
    use RefreshDatabase;

    private function adminUser(): User
    {
        return User::create([
            'name' => 'Admin',
            'username' => 'topic_admin',
            'email' => 'topic_admin@miraigo.test',
            'password' => 'password',
            'role' => 'admin',
            'status' => 'active',
        ]);
    }

    private function category(string $name = 'JFT Basic', string $type = 'JFT'): KotobaCategory
    {
        return KotobaCategory::create([
            'name' => $name,
            'type' => $type,
            'color' => 'text-red-700',
        ]);
    }

    public function test_admin_can_create_topic_and_sync_category_package_count(): void
    {
        $category = $this->category();

        $this->actingAs($this->adminUser(), 'sanctum')
            ->postJson('/api/admin/kotoba-topics', [
                'category_id' => $category->id,
                'name' => 'Bencana Alam',
                'order' => 1,
            ])
            ->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'Bencana Alam');

        $this->assertDatabaseHas('kotoba_topics', ['name' => 'Bencana Alam']);
        $this->assertEquals(1, $category->fresh()->total_packages);
    }

    public function test_admin_can_sync_words_and_counts(): void
    {
        $category = $this->category();
        $topic = KotobaTopic::create(['category_id' => $category->id, 'name' => 'Bencana Alam']);

        $k1 = Kotoba::create(['category_id' => $category->id, 'japanese' => '地震', 'reading' => 'じしん', 'meaning' => 'gempa']);
        $k2 = Kotoba::create(['category_id' => $category->id, 'japanese' => '津波', 'reading' => 'つなみ', 'meaning' => 'tsunami']);

        $this->actingAs($this->adminUser(), 'sanctum')
            ->postJson("/api/admin/kotoba-topics/{$topic->id}/sync-words", [
                'kotoba_ids' => [$k1->id, $k2->id],
            ])
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertEquals(2, $topic->fresh()->word_count);
        $this->assertCount(2, $topic->fresh()->kotoba);
    }

    public function test_admin_can_toggle_topic_active(): void
    {
        $category = $this->category();
        $topic = KotobaTopic::create(['category_id' => $category->id, 'name' => 'Bencana Alam']);

        $this->actingAs($this->adminUser(), 'sanctum')
            ->postJson("/api/admin/kotoba-topics/{$topic->id}/toggle-active")
            ->assertOk();

        $this->assertFalse($topic->fresh()->is_active);
    }

    public function test_admin_can_delete_topic_and_category_count_resynced(): void
    {
        $category = $this->category();
        $topic = KotobaTopic::create(['category_id' => $category->id, 'name' => 'Bencana Alam']);
        $category->update(['total_packages' => 1]);

        $this->actingAs($this->adminUser(), 'sanctum')
            ->deleteJson("/api/admin/kotoba-topics/{$topic->id}")
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('kotoba_topics', ['id' => $topic->id]);
        $this->assertEquals(0, $category->fresh()->total_packages);
    }
}