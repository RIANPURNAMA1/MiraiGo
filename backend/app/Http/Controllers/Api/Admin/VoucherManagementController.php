<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Voucher;
use Illuminate\Http\Request;

class VoucherManagementController extends Controller
{
    public function index()
    {
        $vouchers = Voucher::orderByDesc('id')->paginate(20);
        return $this->success([
            'vouchers' => $vouchers->items(),
            'total'    => $vouchers->total(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'code'           => ['required', 'string', 'max:50', 'unique:vouchers,code'],
            'description'    => ['nullable', 'string', 'max:255'],
            'type'           => ['required', 'in:percentage,fixed'],
            'value'          => ['required', 'integer', 'min:1'],
            'min_purchase'   => ['nullable', 'integer', 'min:0'],
            'max_discount'   => ['nullable', 'integer', 'min:0'],
            'usage_limit'    => ['nullable', 'integer', 'min:1'],
            'starts_at'      => ['nullable', 'date'],
            'expires_at'     => ['nullable', 'date', 'after_or_equal:starts_at'],
            'is_active'      => ['boolean'],
        ]);

        $data['code'] = strtoupper(trim($data['code']));
        $data['is_active'] = $data['is_active'] ?? true;

        $voucher = Voucher::create($data);

        return $this->success($voucher, 'Voucher berhasil dibuat.', 201);
    }

    public function update(Request $request, Voucher $voucher)
    {
        $data = $request->validate([
            'description'    => ['nullable', 'string', 'max:255'],
            'type'           => ['in:percentage,fixed'],
            'value'          => ['integer', 'min:1'],
            'min_purchase'   => ['nullable', 'integer', 'min:0'],
            'max_discount'   => ['nullable', 'integer', 'min:0'],
            'usage_limit'    => ['nullable', 'integer', 'min:1'],
            'starts_at'      => ['nullable', 'date'],
            'expires_at'     => ['nullable', 'date'],
            'is_active'      => ['boolean'],
        ]);

        $voucher->update($data);

        return $this->success($voucher, 'Voucher berhasil diperbarui.');
    }

    public function destroy(Voucher $voucher)
    {
        $voucher->delete();
        return $this->success([], 'Voucher berhasil dihapus.');
    }
}
