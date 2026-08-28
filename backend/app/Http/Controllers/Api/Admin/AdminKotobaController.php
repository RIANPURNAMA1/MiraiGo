<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Kotoba;
use App\Models\KotobaCategory;
use App\Models\KotobaTopic;
use Illuminate\Http\Request;

class AdminKotobaController extends Controller
{
    public function index(Request $request)
    {
        $query = Kotoba::with(['category', 'topics'])->orderBy('category_id')->orderBy('order')->orderBy('id');

        if ($categoryId = $request->get('category_id')) {
            $query->where('category_id', $categoryId);
        }

        if ($topicId = $request->get('topic_id')) {
            $query->whereHas('topics', function ($q) use ($topicId) {
                $q->where('kotoba_topics.id', $topicId);
            });
        }

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('japanese', 'like', "%{$search}%")
                  ->orWhere('reading', 'like', "%{$search}%")
                  ->orWhere('meaning', 'like', "%{$search}%");
            });
        }

        $kotoba = $query->paginate($request->get('per_page', 20));

        return $this->success([
            'items' => $kotoba->items(),
            'meta' => [
                'current_page' => $kotoba->currentPage(),
                'last_page' => $kotoba->lastPage(),
                'total' => $kotoba->total(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:kotoba_categories,id',
            'japanese' => 'required|string|max:255',
            'reading' => 'nullable|string|max:255',
            'meaning' => 'required|string|max:255',
            'example_sentence' => 'nullable|string|max:500',
            'example_translation' => 'nullable|string|max:500',
            'order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
            'topic_ids' => 'nullable|array',
            'topic_ids.*' => 'integer|exists:kotoba_topics,id',
            'options' => 'nullable|array',
            'options.*.option' => 'required|string|max:5',
            'options.*.option_text' => 'required|string|max:255',
            'options.*.is_correct' => 'required|boolean',
        ]);

        $topicIds = $validated['topic_ids'] ?? [];
        unset($validated['topic_ids']);

        $kotoba = Kotoba::create($validated);
        $kotoba->topics()->sync($topicIds);

        $this->syncTopicCount($validated['category_id'], $topicIds);
        $this->syncCategoryCount($validated['category_id']);

        return $this->success($kotoba->load(['category', 'topics']), 'Kotoba berhasil dibuat.', 201);
    }

    public function update(Request $request, Kotoba $kotoba)
    {
        $validated = $request->validate([
            'category_id' => 'sometimes|required|exists:kotoba_categories,id',
            'japanese' => 'sometimes|required|string|max:255',
            'reading' => 'nullable|string|max:255',
            'meaning' => 'sometimes|required|string|max:255',
            'example_sentence' => 'nullable|string|max:500',
            'example_translation' => 'nullable|string|max:500',
            'order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
            'topic_ids' => 'nullable|array',
            'topic_ids.*' => 'integer|exists:kotoba_topics,id',
            'options' => 'nullable|array',
            'options.*.option' => 'required|string|max:5',
            'options.*.option_text' => 'required|string|max:255',
            'options.*.is_correct' => 'required|boolean',
        ]);

        $oldCategoryId = $kotoba->category_id;
        $newCategoryId = $validated['category_id'] ?? $oldCategoryId;
        $topicIds = $validated['topic_ids'] ?? [];
        unset($validated['topic_ids']);

        $kotoba->update($validated);
        $kotoba->topics()->sync($topicIds);

        if ($newCategoryId !== null && $newCategoryId != $oldCategoryId) {
            $this->syncTopicCount($oldCategoryId, []);
            $this->syncCategoryCount($oldCategoryId);
            $this->syncTopicCount($newCategoryId, $topicIds);
            $this->syncCategoryCount($newCategoryId);
        } else {
            $this->syncTopicCount($newCategoryId, $topicIds);
            $this->syncCategoryCount($oldCategoryId);
        }

        return $this->success($kotoba->load(['category', 'topics']), 'Kotoba berhasil diperbarui.');
    }

    public function destroy(Kotoba $kotoba)
    {
        $categoryId = $kotoba->category_id;
        $kotoba->delete();
        $this->syncTopicCount($categoryId, []);
        $this->syncCategoryCount($categoryId);

        return $this->success(null, 'Kotoba berhasil dihapus.');
    }

    public function toggleActive(Kotoba $kotoba)
    {
        $kotoba->update(['is_active' => !$kotoba->is_active]);
        return $this->success($kotoba->load('topics'));
    }

    protected function syncCategoryCount(int $categoryId): void
    {
        $count = Kotoba::where('category_id', $categoryId)->count();
        KotobaCategory::where('id', $categoryId)->update(['total_words' => $count]);
    }

    protected function syncTopicCount(int $categoryId, array $topicIds): void
    {
        $affected = $topicIds;
        if ($categoryId !== null) {
            $affected = array_merge($affected, KotobaTopic::where('category_id', $categoryId)->pluck('id')->toArray());
            KotobaCategory::where('id', $categoryId)->update(['total_packages' => KotobaTopic::where('category_id', $categoryId)->count()]);
        }
        foreach (array_unique($affected) as $id) {
            $topic = KotobaTopic::find($id);
            if ($topic) {
                $topic->update(['word_count' => $topic->kotoba()->count()]);
            }
        }
    }
}
