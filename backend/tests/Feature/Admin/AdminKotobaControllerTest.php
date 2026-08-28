<?php

namespace Tests\Feature\Admin;

use App\Models\Kotoba;
use App\Models\KotobaCategory;
use App\Models\KotobaTopic;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminKotobaControllerTest extends TestCase
{
    use RefreshDatabase;

    private function adminUser(): User
    {
        return User::create([
            'name' => 'Admin',
            'username' => 'admin_test',
            'email' => 'admin_test@miraigo.test',
            'password' => 'password',
            'role' => 'admin',
            'status' => 'active',
        ]);
    }

    private function studentUser(): User
    {
        return User::create([
            'name' => 'Student',
            'username' => 'student_test',
            'email' => 'student_test@miraigo.test',
            'password' => 'password',
            'role' => 'student',
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

    private function topic(KotobaCategory $category, string $name = 'Topik 1'): KotobaTopic
    {
        return KotobaTopic::create([
            'category_id' => $category->id,
            'name' => $name,
        ]);
    }

    public function test_non_admin_cannot_access_kotoba_endpoints(): void
    {
        $this->actingAs($this->studentUser(), 'sanctum')
            ->getJson('/api/admin/kotoba')
            ->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'Forbidden. Admin access required.',
            ]);
    }

    public function test_admin_can_create_kotoba_and_sync_counts(): void
    {
        $category = $this->category();
        $topic = $this->topic($category);

        $this->actingAs($this->adminUser(), 'sanctum')
            ->postJson('/api/admin/kotoba', [
                'category_id' => $category->id,
                'japanese' => '水',
                'reading' => 'みず',
                'meaning' => 'air',
                'order' => 1,
                'is_active' => true,
                'topic_ids' => [$topic->id],
                'options' => [
                    ['option' => 'A', 'option_text' => 'air', 'is_correct' => true],
                    ['option' => 'B', 'option_text' => 'api', 'is_correct' => false],
                ],
            ])
            ->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.japanese', '水');

        $this->assertDatabaseHas('kotoba', ['japanese' => '水', 'meaning' => 'air']);

        // Sinkronisasi jumlah kata otomatis.
        $this->assertEquals(1, Kotoba::where('category_id', $category->id)->count());
        $this->assertEquals(1, $category->fresh()->total_words);
        $this->assertEquals(1, $topic->fresh()->word_count);
    }

    public function test_admin_store_requires_valid_payload(): void
    {
        $category = $this->category();

        $this->actingAs($this->adminUser(), 'sanctum')
            ->postJson('/api/admin/kotoba', [
                'category_id' => $category->id,
                // japanese dan meaning wajib.
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['japanese', 'meaning']);
    }
public function test_admin_can_list_and_filter_kotoba(): void
    {
        $category = $this->category();
        $otherCategory = $this->category('SSW Expert', 'SSW');

        $wanted = Kotoba::create(['category_id' => $category->id, 'japanese' => '地震', 'reading' => 'じしん', 'meaning' => 'gempa']);
        Kotoba::create(['category_id' => $category->id, 'japanese' => '川', 'reading' => 'かわ', 'meaning' => 'sungai']);
        Kotoba::create(['category_id' => $otherCategory->id, 'japanese' => '地震', 'reading' => 'じしん', 'meaning' => 'gempa']);

        $admin = $this->adminUser();

        // Tanpa filter -> semua.
        $this->actingAs($admin, 'sanctum')
            ->getJson('/api/admin/kotoba')
            ->assertOk()
            ->assertJsonPath('data.meta.total', 3)
            ->assertJsonCount(3, 'data.items');

        // Filter category_id.
        $this->actingAs($admin, 'sanctum')
            ->getJson('/api/admin/kotoba?category_id='.$category->id)
            ->assertOk()
            ->assertJsonPath('data.meta.total', 2);

        // Filter search.
        $this->actingAs($admin, 'sanctum')
            ->getJson('/api/admin/kotoba?search=gempa')
            ->assertOk()
            ->assertJsonPath('data.meta.total', 2)
            ->assertJsonPath('data.items.0.id', $wanted->id);
    }

    public function test_admin_can_update_kotoba(): void
    {
        $category = $this->category();
        $kotoba = Kotoba::create(['category_id' => $category->id, 'japanese' => '水', 'reading' => 'みず', 'meaning' => 'air']);

        $this->actingAs($this->adminUser(), 'sanctum')
            ->putJson("/api/admin/kotoba/{$kotoba->id}", ['meaning' => 'air / minuman'])
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertEquals('air / minuman', $kotoba->fresh()->meaning);
    }

    public function test_admin_can_toggle_active(): void
    {
        $category = $this->category();
        $kotoba = Kotoba::create(['category_id' => $category->id, 'japanese' => '水', 'reading' => 'みず', 'meaning' => 'air', 'is_active' => true]);

        $this->assertTrue($kotoba->is_active);

        $this->actingAs($this->adminUser(), 'sanctum')
            ->postJson("/api/admin/kotoba/{$kotoba->id}/toggle-active")
            ->assertOk();

        $this->assertFalse($kotoba->fresh()->is_active);
    }

    public function test_admin_can_delete_kotoba_and_counts_are_resynced(): void
    {
        $category = $this->category();
        $topic = $this->topic($category);

        $kotoba = Kotoba::create(['category_id' => $category->id, 'japanese' => '水', 'reading' => 'みず', 'meaning' => 'air']);
        $kotoba->topics()->attach($topic->id);

        // Simulasi sinkronisasi awal agar count > 0.
        $topic->update(['word_count' => 1]);
        $category->update(['total_words' => 1]);

        $this->actingAs($this->adminUser(), 'sanctum')
            ->deleteJson("/api/admin/kotoba/{$kotoba->id}")
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('kotoba', ['id' => $kotoba->id]);
        $this->assertEquals(0, $topic->fresh()->word_count);
        $this->assertEquals(0, $category->fresh()->total_words);
    }
}