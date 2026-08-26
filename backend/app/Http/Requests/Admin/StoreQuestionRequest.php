<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreQuestionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'section_id' => ['required', 'integer', 'exists:package_sections,id'],
            'question_text' => ['required', 'string'],
            'explanation' => ['nullable', 'string'],
            'difficulty' => ['in:easy,medium,hard'],
            'score' => ['integer', 'min:1'],
            'order' => ['integer', 'min:0'],
            'options' => ['required', 'array', 'min:2'],
            'options.*.option' => ['required', 'string'],
            'options.*.option_text' => ['required', 'string'],
            'options.*.is_correct' => ['boolean'],
        ];
    }
}
