<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCategoryRequest extends FormRequest
{
    public function authorize(): bool { return $this->user()?->can('create', \App\Models\Category::class) ?? false; }

    public function rules(): array
    {
        return [
            'name' => ['required','string','max:255'],
            'slug' => ['nullable','string','max:255','unique:categories,slug'],
            'description' => ['nullable','string'],
            'is_active' => ['sometimes','boolean'],
            'sort_order' => ['sometimes','integer','min:0'],
        ];
    }
}
