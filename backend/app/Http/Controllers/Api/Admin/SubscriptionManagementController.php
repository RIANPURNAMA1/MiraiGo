<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\UserPackageAccess;

class SubscriptionManagementController extends Controller
{
    public function index()
    {
        $query = UserPackageAccess::with(['user:id,name,email', 'package:id,name,price']);

        if ($search = request('search')) {
            $query->whereHas('user', fn ($q) => $q->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%"));
        }
        if ($status = request('status')) {
            $query->where('status', $status);
        }

        $items = $query->orderByDesc('id')->paginate(request('per_page', 15));

        $mapped = collect($items->items())->map(fn ($a) => [
            'id' => $a->id,
            'user' => $a->user,
            'package' => $a->package,
            'status' => $a->isCurrentlyActive() ? 'active' : 'expired',
            'started_at' => $a->started_at?->toIso8601String(),
            'expires_at' => $a->expires_at?->toIso8601String(),
            'days_left' => $a->expires_at
                ? max(0, (int) ceil(now()->diffInDays($a->expires_at)))
                : null,
        ]);

        return $this->success([
            'items' => $mapped,
            'meta' => ['current_page' => $items->currentPage(), 'last_page' => $items->lastPage()],
        ]);
    }
}
