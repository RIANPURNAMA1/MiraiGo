<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Voucher;
use Illuminate\Http\Request;

class VoucherController extends Controller
{
    public function validate(Request $request)
    {
        $data = $request->validate([
            'code'       => ['required', 'string', 'max:50'],
            'package_id' => ['required', 'integer', 'exists:packages,id'],
        ]);

        $voucher = Voucher::where('code', strtoupper(trim($data['code'])))->first();

        if (! $voucher || ! $voucher->isValid()) {
            return $this->error('Voucher tidak valid atau sudah kedaluwarsa.', [], 422);
        }

        $package = \App\Models\Package::findOrFail($data['package_id']);
        $discount = $voucher->calculateDiscount($package->price);

        return $this->success([
            'code'        => $voucher->code,
            'description' => $voucher->description,
            'type'        => $voucher->type,
            'value'       => $voucher->value,
            'discount'    => $discount,
        ], 'Voucher valid.');
    }
}
