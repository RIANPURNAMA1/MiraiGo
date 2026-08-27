<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ModulePremiumPayment;
use App\Models\Transaction;
use Illuminate\Support\Facades\Auth;

class PaymentController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $transactions = Transaction::with(['items.package:id,name', 'payments:id,transaction_id,proof_image,status'])
            ->where('user_id', $user->id)
            ->orderByDesc('id')
            ->limit(50)
            ->get()
            ->map(fn ($t) => [
                'id' => $t->id,
                'type' => 'package',
                'invoice_number' => $t->invoice_number,
                'total_amount' => (int) $t->total_amount,
                'status' => $t->status,
                'paid_at' => $t->paid_at?->toIso8601String(),
                'created_at' => $t->created_at?->toIso8601String(),
                'items' => $t->items->map(fn ($i) => [
                    'name' => $i->package->name ?? "Paket #{$i->package_id}",
                    'price' => (int) $i->price,
                ]),
                'proof_image' => $t->payments->first()?->proof_image,
                'payment_status' => $t->payments->first()?->status,
            ]);

        $modulePayments = ModulePremiumPayment::where('user_id', $user->id)
            ->orderByDesc('id')
            ->get()
            ->map(fn ($p) => [
                'id' => $p->id,
                'type' => 'module-premium',
                'invoice_number' => 'MP-' . str_pad((string) $p->id, 4, '0', STR_PAD_LEFT),
                'total_amount' => (int) $p->amount,
                'status' => $p->status,
                'paid_at' => $p->reviewed_at?->toIso8601String(),
                'created_at' => $p->created_at?->toIso8601String(),
                'items' => [[
                    'name' => 'Akses Modul Premium',
                    'price' => (int) $p->amount,
                ]],
                'proof_image' => $p->proof_image,
                'payment_status' => $p->status,
            ]);

        $merged = $modulePayments->concat($transactions)
            ->sortByDesc('created_at')
            ->values();

        return $this->success(['transactions' => $merged]);
    }
}
