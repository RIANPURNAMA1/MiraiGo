<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\LearningModule;
use Illuminate\Support\Str;

class AdminModuleManagementController extends Controller
{
    public function index()
    {
        $query = LearningModule::with('category');

        if ($search = request('search')) {
            $query->where('title', 'like', "%{$search}%");
        }

        if (($status = request('status')) && $status !== 'all') {
            $query->where('status', $status);
        }

        if (request('type') === 'premium') {
            $query->whereHas('category', fn ($q) => $q->where('is_premium', true));
        } elseif (request('type') === 'free') {
            $query->whereHas('category', fn ($q) => $q->where('is_premium', false));
        }

        $modules = $query->orderByDesc('id')->paginate(request('per_page', 15));

        foreach ($modules->items() as $module) {
            $module->setAttribute('is_premium', (bool) ($module->category?->is_premium ?? false));
        }

        return $this->success([
            'items' => $modules->items(),
            'meta' => [
                'current_page' => $modules->currentPage(),
                'last_page' => $modules->lastPage(),
                'total' => $modules->total(),
            ],
        ]);
    }

    public function store()
    {
        $data = request()->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'status' => ['in:draft,published'],
            'external_url' => ['nullable', 'url', 'max:255'],
            'file' => ['nullable', 'file', 'max:20480'],
            'thumbnail' => ['nullable', 'file', 'max:2048'],
        ]);

        $data['status'] = $data['status'] ?? 'draft';

        if (isset($data['file'])) {
            $data['file_url'] = request()->file('file')->store('modules', 'public');
            unset($data['file']);
        }

        if (isset($data['thumbnail'])) {
            $data['thumbnail'] = request()->file('thumbnail')->store('modules/thumbnails', 'public');
            unset($data['thumbnail']);
        }

        if ($data['status'] === 'published' && empty($data['published_at'])) {
            $data['published_at'] = now();
        }

        $module = LearningModule::create($data);

        return $this->success($module->load('category'), 'Module created.', 201);
    }

    public function update(LearningModule $module)
    {
        $data = request()->validate([
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'status' => ['in:draft,published'],
            'external_url' => ['nullable', 'url', 'max:255'],
            'file' => ['nullable', 'file', 'max:20480'],
            'thumbnail' => ['nullable', 'file', 'max:2048'],
        ]);

        if (isset($data['file'])) {
            $data['file_url'] = request()->file('file')->store('modules', 'public');
            unset($data['file']);
        }

        if (isset($data['thumbnail'])) {
            $data['thumbnail'] = request()->file('thumbnail')->store('modules/thumbnails', 'public');
            unset($data['thumbnail']);
        }

        if (isset($data['status']) && $data['status'] === 'published' && empty($module->published_at)) {
            $data['published_at'] = now();
        }

        $module->update($data);

        return $this->success($module->load('category'), 'Module updated.');
    }

    public function destroy(LearningModule $module)
    {
        $module->delete();

        return $this->success([], 'Module deleted.');
    }

    public function togglePublish(LearningModule $module)
    {
        $newStatus = $module->status === 'published' ? 'draft' : 'published';

        $module->update([
            'status' => $newStatus,
            'published_at' => $newStatus === 'published' ? ($module->published_at ?? now()) : $module->published_at,
        ]);

        return $this->success($module->load('category'), 'Status updated.');
    }
}
