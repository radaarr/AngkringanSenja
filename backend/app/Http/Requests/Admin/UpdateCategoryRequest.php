<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCategoryRequest extends FormRequest
{
    public function authorize(): bool { return $this->user()?->can('update', $this->route('category')) ?? false; }

    public function rules(): array
    {
        $id = $this->route('category')?->id;
        return [
            'name' => ['sometimes','required','string','max:255'],
            'slug' => ['sometimes','nullable','string','max:255', Rule::unique('categories','slug')->ignore($id)],
            'description' => ['nullable','string'],
            'is_active' => ['sometimes','boolean'],
            'sort_order' => ['sometimes','integer','min:0'],
        ];
    }
}
