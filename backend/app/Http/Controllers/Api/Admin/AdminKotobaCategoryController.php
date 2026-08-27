<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\KotobaCategory;
use Illuminate\Http\Request;

class AdminKotobaCategoryController extends Controller
{
    public function index()
    {
        $categories = KotobaCategory::withCount('kotoba')
            ->orderBy('order')
            ->orderBy('id')
            ->get()
            ->map(function ($cat) {
                $cat->total_words = $cat->kotoba_count;
                return $cat;
            });

        return $this->success($categories);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:JFT,SSW',
            'total_packages' => 'nullable|integer|min:0',
            'icon' => 'nullable|string|max:100',
            'color' => 'nullable|string|max:50',
            'order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        $category = KotobaCategory::create($validated);
        return $this->success($category, 'Kategori kotoba berhasil dibuat.', 201);
    }

    public function update(Request $request, KotobaCategory $kotobaCategory)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'sometimes|required|in:JFT,SSW',
            'total_packages' => 'nullable|integer|min:0',
            'icon' => 'nullable|string|max:100',
            'color' => 'nullable|string|max:50',
            'order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        $kotobaCategory->update($validated);
        return $this->success($kotobaCategory, 'Kategori kotoba berhasil diperbarui.');
    }

    public function destroy(KotobaCategory $kotobaCategory)
    {
        $kotobaCategory->delete();
        return $this->success(null, 'Kategori kotoba berhasil dihapus.');
    }

    public function toggleActive(KotobaCategory $kotobaCategory)
    {
        $kotobaCategory->update(['is_active' => !$kotobaCategory->is_active]);
        return $this->success($kotobaCategory);
    }
}
