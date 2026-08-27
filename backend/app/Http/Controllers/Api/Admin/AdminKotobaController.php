<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Kotoba;
use App\Models\KotobaCategory;
use Illuminate\Http\Request;

class AdminKotobaController extends Controller
{
    public function index(Request $request)
    {
        $query = Kotoba::with('category')->orderBy('category_id')->orderBy('order')->orderBy('id');

        if ($categoryId = $request->get('category_id')) {
            $query->where('category_id', $categoryId);
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
        ]);

        $kotoba = Kotoba::create($validated);
        $this->syncCategoryCount($validated['category_id']);

        return $this->success($kotoba->load('category'), 'Kotoba berhasil dibuat.', 201);
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
        ]);

        $oldCategoryId = $kotoba->category_id;
        $kotoba->update($validated);

        $this->syncCategoryCount($oldCategoryId);
        if (isset($validated['category_id']) && $validated['category_id'] != $oldCategoryId) {
            $this->syncCategoryCount($validated['category_id']);
        }

        return $this->success($kotoba->load('category'), 'Kotoba berhasil diperbarui.');
    }

    public function destroy(Kotoba $kotoba)
    {
        $categoryId = $kotoba->category_id;
        $kotoba->delete();
        $this->syncCategoryCount($categoryId);

        return $this->success(null, 'Kotoba berhasil dihapus.');
    }

    public function toggleActive(Kotoba $kotoba)
    {
        $kotoba->update(['is_active' => !$kotoba->is_active]);
        return $this->success($kotoba);
    }

    protected function syncCategoryCount(int $categoryId): void
    {
        $count = Kotoba::where('category_id', $categoryId)->count();
        KotobaCategory::where('id', $categoryId)->update(['total_words' => $count]);
    }
}
