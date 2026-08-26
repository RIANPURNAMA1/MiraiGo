<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Support\Str;

class CategoryManagementController extends Controller
{
    public function index()
    {
        $query = Category::query();

        if ($search = request('search')) {
            $query->where('name', 'like', "%{$search}%");
        }

        $categories = $query->orderBy('order')->orderBy('id')->paginate(request('per_page', 15));

        return $this->success([
            'items' => $categories->items(),
            'meta' => [
                'current_page' => $categories->currentPage(),
                'last_page' => $categories->lastPage(),
                'total' => $categories->total(),
            ],
        ]);
    }

    public function store()
    {
        $data = request()->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        $data['slug'] = Str::slug($data['name']);

        $category = Category::create($data);

        return $this->success($category, 'Category created.', 201);
    }

    public function update(Category $category)
    {
        $data = request()->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        if (isset($data['name'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        $category->update($data);

        return $this->success($category, 'Category updated.');
    }

    public function destroy(Category $category)
    {
        $category->delete();

        return $this->success([], 'Category deleted.');
    }

    public function toggleActive(Category $category)
    {
        $category->update(['is_active' => !$category->is_active]);

        return $this->success($category, 'Status updated.');
    }
}
