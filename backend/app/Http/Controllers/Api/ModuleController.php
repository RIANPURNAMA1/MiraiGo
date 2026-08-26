<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LearningModule;

class ModuleController extends Controller
{
    public function index()
    {
        $modules = LearningModule::with('category')
            ->where('status', 'published')
            ->orderByDesc('published_at')
            ->paginate(request('per_page', 12));

        return $this->success([
            'items' => $modules->items(),
            'meta' => ['current_page' => $modules->currentPage(), 'last_page' => $modules->lastPage()],
        ]);
    }

    public function show(LearningModule $module)
    {
        if ($module->status !== 'published') {
            return $this->error('Module not found.', [], 404);
        }

        return $this->success($module->load('category'));
    }
}
