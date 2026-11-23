<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool { return $this->user()?->can('create', \App\Models\Product::class) ?? false; }

    public function rules(): array
    {
        return [
            'category_id' => ['required','integer','exists:categories,id'],
            'name' => ['required','string','max:255'],
            'slug' => ['nullable','string','max:255','unique:products,slug'],
            'description' => ['nullable','string'],
            'price' => ['required','numeric','min:0'],
            'image' => ['nullable','image','mimes:jpg,jpeg,png,webp','max:2048'],
            'is_available' => ['sometimes','boolean'],
            'is_featured' => ['sometimes','boolean'],
            'sort_order' => ['sometimes','integer','min:0'],
        ];
    }
}
