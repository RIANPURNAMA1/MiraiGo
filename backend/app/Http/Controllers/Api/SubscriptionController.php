<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserPackageAccess;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;

class SubscriptionController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $accesses = UserPackageAccess::with('package:id,name')
            ->where('user_id', $user->id)
            ->orderByDesc('id')
            ->get()
            ->map(fn ($a) => [
                'package' => $a->package->name,
                'status' => $a->isCurrentlyActive() ? 'active' : 'expired',
                'started_at' => $a->started_at?->toIso8601String(),
                'expires_at' => $a->expires_at?->toIso8601String(),
                'days_left' => $a->expires_at
                    ? max(0, (int) ceil(now()->diffInDays(Carbon::parse($a->expires_at))))
                    : null,
            ]);

        $anyActive = UserPackageAccess::where('user_id', $user->id)
            ->where('status', 'active')
            ->where(function ($q) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->exists();

        return $this->success([
            'is_active' => $anyActive,
            'referral_bonus_days' => (int) $user->referral_bonus_days,
            'accesses' => $accesses,
        ]);
    }
}
