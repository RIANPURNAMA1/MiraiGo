<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LearningModule;
use App\Services\AccessService;

class ModuleController extends Controller
{
    public function index()
    {
        $user = request()->user();
        $service = new AccessService();

        $modules = LearningModule::with('category')
            ->where('status', 'published')
            ->orderByDesc('published_at')
            ->paginate(request('per_page', 12));

        collect($modules->items())->each(function (LearningModule $module) use ($user, $service) {
            $module->setAttribute('is_premium', $service->moduleIsPremium($module));
            $module->setAttribute('accessible', $service->canAccessModule($user, $module));
        });

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

        $service = new AccessService();
        $module->setAttribute('is_premium', $service->moduleIsPremium($module));
        $module->setAttribute('accessible', $service->canAccessModule(request()->user(), $module));

        return $this->success($module->load('category'));
    }
}
