<?php

namespace App\Http\Controllers\Api;

use App\Models\LearningModule;
use App\Models\ModulePurchase;
use App\Services\AccessService;

class ModuleAccessController extends Controller
{
    public function store()
    {
        $data = request()->validate([
            'module_id' => ['required', 'integer', 'exists:modules,id'],
        ]);

        $user = request()->user();
        $module = LearningModule::findOrFail($data['module_id']);
        $accessService = new AccessService();

        if ($accessService->canAccessModule($user, $module)) {
            return $this->error('Anda sudah memiliki akses ke modul ini.', [], 422);
        }

        $purchase = $accessService->grantModuleAccess($user, $module, $module->price);

        return $this->success($purchase, 'Modul berhasil dibeli.', 201);
    }

    public function index()
    {
        $purchases = ModulePurchase::where('user_id', request()->user()->id)
            ->with('module')
            ->orderByDesc('purchased_at')
            ->get();

        return $this->success($purchases);
    }
}
