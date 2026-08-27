<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ModulePremiumAccess;
use App\Models\ModulePremiumPayment;
use App\Models\ModulePremiumSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ModulePremiumPaymentController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'proof_image' => ['required', 'image', 'max:5120'],
            'notes'       => ['nullable', 'string', 'max:500'],
        ]);

        $user = Auth::user();

        $hasAccess = ModulePremiumAccess::where('user_id', $user->id)->exists();
        if ($hasAccess) {
            return $this->error('Anda sudah memiliki akses modul premium.', [], 422);
        }

        $hasPending = ModulePremiumPayment::where('user_id', $user->id)
            ->where('status', 'pending')
            ->exists();
        if ($hasPending) {
            return $this->error('Anda masih memiliki pembayaran yang menunggu verifikasi.', [], 422);
        }

        $settings = ModulePremiumSetting::firstOrCreate([], [
            'premium_price' => 150000,
            'premium_description' => 'Akses semua modul premium.',
        ]);

        $path = $request->file('proof_image')->store('module-premium-proofs', 'public');

        $payment = ModulePremiumPayment::create([
            'user_id'     => $user->id,
            'amount'      => $settings->premium_price,
            'proof_image' => '/storage/' . $path,
            'notes'       => $data['notes'] ?? null,
            'status'      => 'pending',
        ]);

        return $this->success([
            'id'         => $payment->id,
            'amount'     => (int) $payment->amount,
            'status'     => 'pending',
        ], 'Bukti pembayaran berhasil dikirim. Menunggu verifikasi admin.', 201);
    }

    public function index()
    {
        $payments = ModulePremiumPayment::where('user_id', Auth::id())
            ->orderByDesc('id')
            ->get()
            ->map(fn ($p) => [
                'id'          => $p->id,
                'amount'      => (int) $p->amount,
                'proof_image' => $p->proof_image,
                'notes'       => $p->notes,
                'admin_notes' => $p->admin_notes,
                'status'      => $p->status,
                'reviewed_at' => $p->reviewed_at?->toIso8601String(),
                'created_at'  => $p->created_at?->toIso8601String(),
            ]);

        return $this->success(['payments' => $payments]);
    }
}
