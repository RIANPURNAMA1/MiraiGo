<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Package;
use App\Models\Payment;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\Voucher;
use App\Services\AccessService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class ManualPaymentController extends Controller
{
    public function index()
    {
        $payments = Payment::with('transaction.items.package:id,name,price')
            ->where('transaction_id', function ($q) {
                $q->select('id')->from('transactions')->where('user_id', Auth::id());
            })
            ->orderByDesc('id')
            ->get()
            ->map(fn ($p) => [
                'id' => $p->id,
                'transaction' => [
                    'id' => $p->transaction->id,
                    'invoice_number' => $p->transaction->invoice_number,
                    'total_amount' => (int) $p->transaction->total_amount,
                    'status' => $p->transaction->status,
                    'items' => $p->transaction->items->map(fn ($i) => [
                        'name' => $i->package->name ?? "Paket #{$i->package_id}",
                        'price' => (int) $i->price,
                    ]),
                ],
                'proof_image' => $p->proof_image,
                'notes' => $p->notes,
                'admin_notes' => $p->admin_notes,
                'status' => $p->status,
                'reviewed_at' => $p->reviewed_at?->toIso8601String(),
                'created_at' => $p->created_at?->toIso8601String(),
            ]);

        return $this->success(['payments' => $payments]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'package_id'  => ['required', 'integer', 'exists:packages,id'],
            'proof_image' => ['required', 'image', 'max:5120'],
            'notes'       => ['nullable', 'string', 'max:500'],
            'voucher_code' => ['nullable', 'string', 'max:50'],
        ]);

        $package = Package::findOrFail($data['package_id']);

        $accessService = new AccessService();

        if (! $accessService->isPremiumPackage($package)) {
            return $this->error('Paket ini gratis, tidak perlu pembayaran.', [], 422);
        }

        // Check if user already has active access to the whole category
        $user = Auth::user();
        $categoryAccessIds = $accessService->packagesInCategory($package)->pluck('id');
        $hasAccess = \App\Models\UserPackageAccess::where('user_id', $user->id)
            ->whereIn('package_id', $categoryAccessIds)
            ->where('status', 'active')
            ->where(function ($q) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->exists();

        if ($hasAccess) {
            return $this->error('Anda sudah memiliki akses aktif untuk kategori ini.', [], 422);
        }

        $packagePrice = $accessService->packagePrice($package);

        // Apply voucher
        $discount = 0;
        $voucher = null;
        if (! empty($data['voucher_code'])) {
            $voucher = Voucher::where('code', strtoupper(trim($data['voucher_code'])))->first();
            if (! $voucher || ! $voucher->isValid()) {
                return $this->error('Voucher tidak valid atau sudah kedaluwarsa.', [], 422);
            }
            $discount = $voucher->calculateDiscount($packagePrice);
            // Increment usage
            $voucher->increment('used_count');
        }

        $finalAmount = max(0, $packagePrice - $discount);

        // Upload proof
        $path = $request->file('proof_image')->store('payment-proofs', 'public');

        // Create transaction
        $invoiceNumber = 'INV-' . strtoupper(Str::random(8)) . '-' . now()->format('ymd');
        $transaction = Transaction::create([
            'invoice_number' => $invoiceNumber,
            'user_id'        => $user->id,
            'total_amount'   => $finalAmount,
            'status'         => 'pending',
        ]);

        TransactionItem::create([
            'transaction_id' => $transaction->id,
            'package_id'     => $package->id,
            'price'          => $packagePrice,
        ]);

        // Create payment with proof
        $payment = Payment::create([
            'transaction_id' => $transaction->id,
            'provider'       => 'manual',
            'status'         => 'pending',
            'proof_image'    => '/storage/' . $path,
            'notes'          => $data['notes'] ?? null,
            'meta'           => $voucher ? ['voucher_code' => $voucher->code, 'discount' => $discount] : null,
        ]);

        return $this->success([
            'id'              => $payment->id,
            'invoice_number'  => $invoiceNumber,
            'original_price'  => (int) $packagePrice,
            'discount'        => $discount,
            'total_amount'    => $finalAmount,
            'package_name'    => $package->name,
            'status'          => 'pending',
        ], 'Bukti pembayaran berhasil dikirim. Menunggu verifikasi admin.', 201);
    }
}
