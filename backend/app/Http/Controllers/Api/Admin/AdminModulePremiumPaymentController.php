<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ModulePremiumAccess;
use App\Models\ModulePremiumPayment;
use Illuminate\Http\Request;

class AdminModulePremiumPaymentController extends Controller
{
    public function index()
    {
        $payments = ModulePremiumPayment::with('user:id,name,email')
            ->orderByDesc('id')
            ->paginate(20);

        return $this->success([
            'payments' => $payments->items(),
            'total'    => $payments->total(),
        ]);
    }

    public function approve(ModulePremiumPayment $payment, Request $request)
    {
        if ($payment->status !== 'pending') {
            return $this->error('Pembayaran ini sudah diproses.', [], 422);
        }

        $data = $request->validate([
            'admin_notes' => ['nullable', 'string', 'max:500'],
        ]);

        $user = $payment->user;

        $payment->update([
            'status'      => 'paid',
            'admin_notes' => $data['admin_notes'] ?? null,
            'reviewed_at' => now(),
        ]);

        ModulePremiumAccess::firstOrCreate(
            ['user_id' => $user->id],
            [
                'amount_paid'  => $payment->amount,
                'purchased_at' => now(),
            ]
        );

        return $this->success([], 'Pembayaran disetujui. Akses modul premium telah diberikan.');
    }

    public function reject(ModulePremiumPayment $payment, Request $request)
    {
        if ($payment->status !== 'pending') {
            return $this->error('Pembayaran ini sudah diproses.', [], 422);
        }

        $data = $request->validate([
            'admin_notes' => ['required', 'string', 'max:500'],
        ]);

        $payment->update([
            'status'      => 'failed',
            'admin_notes' => $data['admin_notes'],
            'reviewed_at' => now(),
        ]);

        return $this->success([], 'Pembayaran ditolak.');
    }
}
