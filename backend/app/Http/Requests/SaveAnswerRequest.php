<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SaveAnswerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'question_id' => ['required', 'integer', 'exists:questions,id'],
            // nullable = allow "un-answering" a question by clearing the selection
            'question_option_id' => ['nullable', 'integer', 'exists:question_options,id'],
        ];
    }
}
