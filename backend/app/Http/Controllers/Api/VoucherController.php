<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Package;
use App\Models\Voucher;
use App\Services\AccessService;
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

        $package = Package::findOrFail($data['package_id']);
        $price = (new AccessService())->packagePrice($package);
        $discount = $voucher->calculateDiscount($price);

        return $this->success([
            'code'        => $voucher->code,
            'description' => $voucher->description,
            'type'        => $voucher->type,
            'value'       => $voucher->value,
            'discount'    => $discount,
        ], 'Voucher valid.');
    }
}
