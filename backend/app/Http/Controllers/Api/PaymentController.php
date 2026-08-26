<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
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

        return $this->success(['transactions' => $transactions]);
    }
}
