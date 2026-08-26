<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Transaction;
use App\Services\AccessService;
use Illuminate\Http\Request;

class PaymentApprovalController extends Controller
{
    public function index()
    {
        $payments = Payment::with([
            'transaction.user:id,name,email',
            'transaction.items.package:id,name,price',
        ])
            ->where('provider', 'manual')
            ->orderByDesc('id')
            ->paginate(20);

        return $this->success([
            'payments' => $payments->items(),
            'total'    => $payments->total(),
        ]);
    }

    public function approve(Payment $payment, Request $request)
    {
        if ($payment->status !== 'pending') {
            return $this->error('Pembayaran ini sudah diproses.', [], 422);
        }

        $data = $request->validate([
            'admin_notes' => ['nullable', 'string', 'max:500'],
        ]);

        $transaction = $payment->transaction;
        $user = $transaction->user;

        // Update payment status
        $payment->update([
            'status'       => 'paid',
            'admin_notes'  => $data['admin_notes'] ?? null,
            'reviewed_at'  => now(),
        ]);

        // Update transaction status
        $transaction->update([
            'status'     => 'paid',
            'paid_at'    => now(),
            'admin_notes' => $data['admin_notes'] ?? null,
        ]);

        // Grant access for each package in the transaction
        $accessService = new AccessService();
        foreach ($transaction->items as $item) {
            $package = $item->package;
            $expiresAt = now()->addDays(30); // 30 days access
            $accessService->grantAccess($user, $package, $expiresAt);
        }

        return $this->success([], 'Pembayaran disetujui. Akses paket telah diberikan.');
    }

    public function reject(Payment $payment, Request $request)
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

        $payment->transaction->update([
            'status'      => 'failed',
            'admin_notes' => $data['admin_notes'],
        ]);

        return $this->success([], 'Pembayaran ditolak.');
    }
}
