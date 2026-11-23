<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Recipe;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class RecipeController extends Controller
{
    public function show(Product $product)
    {
        $product->load(['recipes.ingredient']);
        return response()->json(['data' => $product]);
    }

    public function sync(Request $request, Product $product)
    {
        $data = $request->validate([
            'items' => ['present','array'],
            'items.*.ingredient_id' => ['required','exists:ingredients,id'],
            'items.*.quantity_required' => ['required','numeric','gt:0'],
            'items.*.unit' => ['required','string','max:20'],
        ]);

        $ids = collect($data['items'])->pluck('ingredient_id');
        if ($ids->count() !== $ids->unique()->count()) {
            throw ValidationException::withMessages(['items' => ['Bahan duplikat dalam resep.']]);
        }

        DB::transaction(function () use ($product, $data) {
            $product->recipes()->delete();
            foreach ($data['items'] as $item) {
                Recipe::query()->create([
                    'product_id' => $product->id,
                    'ingredient_id' => $item['ingredient_id'],
                    'quantity_required' => $item['quantity_required'],
                    'unit' => $item['unit'],
                ]);
            }
        });

        $product->load(['recipes.ingredient']);
        return response()->json(['data' => $product]);
    }
}
