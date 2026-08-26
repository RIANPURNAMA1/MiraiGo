<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StorePackageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // gate handled by 'admin' route middleware
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'level' => ['nullable', 'string', 'max:50'],
            'duration_minutes' => ['required', 'integer', 'min:1'],
            'price' => ['nullable', 'integer', 'min:0'],
            'is_premium' => ['boolean'],
            'status' => ['in:draft,published,archived'],
        ];
    }
}
