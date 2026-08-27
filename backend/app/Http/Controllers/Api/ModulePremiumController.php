<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ModulePremiumSetting;
use App\Models\ModulePremiumAccess;
use Illuminate\Http\Request;

class ModulePremiumController extends Controller
{
    public function settings()
    {
        $settings = ModulePremiumSetting::firstOrCreate([], [
            'premium_price' => 150000,
            'premium_description' => 'Akses semua modul premium selamanya.',
        ]);
        return $this->success($settings);
    }

    public function access(Request $request)
    {
        $hasAccess = ModulePremiumAccess::where('user_id', $request->user()->id)->exists();
        return $this->success(['has_access' => $hasAccess]);
    }

    public function purchase(Request $request)
    {
        $user = $request->user();
        $exists = ModulePremiumAccess::where('user_id', $user->id)->exists();
        if ($exists) {
            return $this->error('Anda sudah memiliki akses modul premium.', 400);
        }

        $settings = ModulePremiumSetting::firstOrCreate([], [
            'premium_price' => 150000,
            'premium_description' => 'Akses semua modul premium selamanya.',
        ]);

        ModulePremiumAccess::create([
            'user_id' => $user->id,
            'amount_paid' => $settings->premium_price,
            'purchased_at' => now(),
        ]);

        return $this->success(['has_access' => true], 'Akses modul premium berhasil dibeli.');
    }
}
