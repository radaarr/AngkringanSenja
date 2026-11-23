<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool { return $this->user()?->can('update', $this->route('product')) ?? false; }

    public function rules(): array
    {
        $id = $this->route('product')?->id;
        return [
            'category_id' => ['sometimes','required','integer','exists:categories,id'],
            'name' => ['sometimes','required','string','max:255'],
            'slug' => ['sometimes','nullable','string','max:255', Rule::unique('products','slug')->ignore($id)],
            'description' => ['nullable','string'],
            'price' => ['sometimes','required','numeric','min:0'],
            'image' => ['nullable','image','mimes:jpg,jpeg,png,webp','max:2048'],
            'is_available' => ['sometimes','boolean'],
            'is_featured' => ['sometimes','boolean'],
            'sort_order' => ['sometimes','integer','min:0'],
        ];
    }
}
