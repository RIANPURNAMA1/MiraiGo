<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ModulePremiumPayment;
use App\Models\Payment;
use App\Models\Transaction;
use App\Services\AccessService;
use Illuminate\Http\Request;

class PaymentApprovalController extends Controller
{
    public function index(Request $request)
    {
        $page = (int) $request->input('page', 1);
        $perPage = 20;

        $payments = Payment::with([
            'transaction.user:id,name,email',
            'transaction.items.package:id,name,price',
        ])
            ->where('provider', 'manual')
            ->orderByDesc('id')
            ->get()
            ->map(fn (Payment $p) => [
                'id'          => $p->id,
                'type'        => 'package',
                'transaction' => [
                    'id'             => $p->transaction->id,
                    'invoice_number' => $p->transaction->invoice_number,
                    'total_amount'   => (int) $p->transaction->total_amount,
                    'status'         => $p->transaction->status,
                    'user'           => $p->transaction->user ? [
                        'id'    => $p->transaction->user->id,
                        'name'  => $p->transaction->user->name,
                        'email' => $p->transaction->user->email,
                    ] : null,
                    'items' => $p->transaction->items->map(fn ($i) => [
                        'name'  => $i->package->name ?? "Paket #{$i->package_id}",
                        'price' => (int) $i->price,
                    ]),
                ],
                'proof_image' => $p->proof_image,
                'notes'       => $p->notes,
                'admin_notes' => $p->admin_notes,
                'status'      => $p->status,
                'reviewed_at' => $p->reviewed_at?->toIso8601String(),
                'created_at'  => $p->created_at?->toIso8601String(),
            ]);

        $modulePayments = ModulePremiumPayment::with('user:id,name,email')
            ->orderByDesc('id')
            ->get()
            ->map(fn (ModulePremiumPayment $mp) => [
                'id'          => $mp->id,
                'type'        => 'module-premium',
                'transaction' => [
                    'id'             => $mp->id,
                    'invoice_number' => 'MP-' . str_pad((string) $mp->id, 4, '0', STR_PAD_LEFT),
                    'total_amount'   => (int) $mp->amount,
                    'status'         => $mp->status,
                    'user'           => $mp->user ? [
                        'id'    => $mp->user->id,
                        'name'  => $mp->user->name,
                        'email' => $mp->user->email,
                    ] : null,
                    'items' => [[
                        'name'  => 'Akses Modul Premium',
                        'price' => (int) $mp->amount,
                    ]],
                ],
                'proof_image' => $mp->proof_image,
                'notes'       => $mp->notes,
                'admin_notes' => $mp->admin_notes,
                'status'      => $mp->status,
                'reviewed_at' => $mp->reviewed_at?->toIso8601String(),
                'created_at'  => $mp->created_at?->toIso8601String(),
            ]);

        $merged = $modulePayments->concat($payments)
            ->sortByDesc('created_at')
            ->values();

        $total = $merged->count();
        $paged = $merged->forPage($page, $perPage)->values();

        return $this->success([
            'payments' => $paged,
            'total'    => $total,
        ]);
    }

    public function pendingCount()
    {
        $packagePending = Payment::where('provider', 'manual')
            ->where('status', 'pending')
            ->count();

        $modulePending = ModulePremiumPayment::where('status', 'pending')
            ->count();

        return $this->success(['count' => $packagePending + $modulePending]);
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
