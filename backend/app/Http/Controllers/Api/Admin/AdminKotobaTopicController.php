<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\KotobaTopic;
use App\Models\Kotoba;
use Illuminate\Http\Request;

class AdminKotobaTopicController extends Controller
{
    public function index(Request $request)
    {
        $query = KotobaTopic::withCount('kotoba')->orderBy('category_id')->orderBy('order')->orderBy('id');

        if ($categoryId = $request->get('category_id')) {
            $query->where('category_id', $categoryId);
        }

        $topics = $query->paginate($request->get('per_page', 20));

        return $this->success([
            'items' => $topics->items(),
            'meta' => [
                'current_page' => $topics->currentPage(),
                'last_page' => $topics->lastPage(),
                'total' => $topics->total(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:kotoba_categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        $topic = KotobaTopic::create($validated);
        $this->syncTopicCount($validated['category_id']);

        return $this->success($topic->load('category'), 'Topik kotoba berhasil dibuat.', 201);
    }

    public function update(Request $request, KotobaTopic $kotobaTopic)
    {
        $validated = $request->validate([
            'category_id' => 'sometimes|required|exists:kotoba_categories,id',
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        $oldCategoryId = $kotobaTopic->category_id;
        $kotobaTopic->update($validated);

        $this->syncTopicCount($oldCategoryId);
        if (isset($validated['category_id']) && $validated['category_id'] != $oldCategoryId) {
            $this->syncTopicCount($validated['category_id']);
        }

        return $this->success($kotobaTopic->load('category'), 'Topik kotoba berhasil diperbarui.');
    }

    public function destroy(KotobaTopic $kotobaTopic)
    {
        $categoryId = $kotobaTopic->category_id;
        $kotobaTopic->delete();
        $this->syncTopicCount($categoryId);

        return $this->success(null, 'Topik kotoba berhasil dihapus.');
    }

    public function toggleActive(KotobaTopic $kotobaTopic)
    {
        $kotobaTopic->update(['is_active' => !$kotobaTopic->is_active]);
        return $this->success($kotobaTopic);
    }

    public function syncWords(Request $request, KotobaTopic $kotobaTopic)
    {
        $validated = $request->validate([
            'kotoba_ids' => 'required|array',
            'kotoba_ids.*' => 'integer|exists:kotoba,id',
        ]);

        $kotobaTopic->kotoba()->sync($validated['kotoba_ids']);
        $kotobaTopic->update(['word_count' => $kotobaTopic->kotoba()->count()]);

        $this->syncTopicCount($kotobaTopic->category_id);

        return $this->success($kotobaTopic->load('kotoba'), 'Kata berhasil disinkronkan.');
    }

    protected function syncTopicCount(int $categoryId): void
    {
        $count = KotobaTopic::where('category_id', $categoryId)->count();
        \App\Models\KotobaCategory::where('id', $categoryId)->update(['total_packages' => $count]);
    }
}
