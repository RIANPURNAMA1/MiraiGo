<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ModulePremiumSetting;
use Illuminate\Http\Request;

class AdminModulePremiumController extends Controller
{
    public function settings()
    {
        $settings = ModulePremiumSetting::firstOrCreate([], [
            'premium_price' => 150000,
            'premium_description' => 'Akses semua modul premium selamanya.',
        ]);
        return $this->success($settings);
    }

    public function updateSettings(Request $request)
    {
        $validated = $request->validate([
            'premium_price' => 'required|integer|min:0',
            'premium_description' => 'nullable|string',
        ]);

        $settings = ModulePremiumSetting::firstOrCreate([]);
        $settings->update($validated);

        return $this->success($settings, 'Pengaturan berhasil diperbarui.');
    }
}
