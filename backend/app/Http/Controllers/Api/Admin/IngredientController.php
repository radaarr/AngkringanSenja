<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\IngredientResource;
use App\Models\Ingredient;
use App\Services\InventoryService;
use Illuminate\Http\Request;

class IngredientController extends Controller
{
    public function index()
    {
        $ingredients = Ingredient::query()->orderBy('name')->get();
        return IngredientResource::collection($ingredients);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required','string','max:150'],
            'unit' => ['required','string','max:20'],
            'current_stock' => ['nullable','numeric','min:0'],
            'min_stock' => ['nullable','numeric','min:0'],
            'is_active' => ['boolean'],
        ]);
        $data['current_stock'] = $data['current_stock'] ?? 0;
        $data['min_stock'] = $data['min_stock'] ?? 0;
        $ingredient = Ingredient::query()->create($data);
        return (new IngredientResource($ingredient))->response()->setStatusCode(201);
    }

    public function show(Ingredient $ingredient)
    {
        $ingredient->load(['movements' => fn($q) => $q->latest()->limit(50)->with('creator')]);
        return new IngredientResource($ingredient);
    }

    public function update(Request $request, Ingredient $ingredient)
    {
        $data = $request->validate([
            'name' => ['sometimes','required','string','max:150'],
            'unit' => ['sometimes','required','string','max:20'],
            'min_stock' => ['nullable','numeric','min:0'],
            'is_active' => ['boolean'],
        ]);
        $ingredient->update($data);
        return new IngredientResource($ingredient->fresh());
    }

    public function destroy(Ingredient $ingredient)
    {
        if ($ingredient->recipes()->exists() || $ingredient->movements()->exists()) {
            $ingredient->update(['is_active' => false]);
            return response()->json(['message' => 'Bahan dinonaktifkan karena sudah memiliki riwayat/resep.']);
        }
        $ingredient->delete();
        return response()->noContent();
    }

    public function adjust(Request $request, Ingredient $ingredient, InventoryService $inventory)
    {
        $data = $request->validate([
            'type' => ['required','in:IN,OUT,ADJUSTMENT'],
            'quantity' => ['nullable','numeric','min:0'],
            'balance_after' => ['nullable','numeric','min:0'],
            'reason' => ['nullable','string','max:150'],
            'notes' => ['nullable','string','max:1000'],
        ]);
        $movement = $inventory->adjust($ingredient, $data, $request->user());
        return response()->json(['data' => $movement->load('creator')], 201);
    }

    public function movements(Ingredient $ingredient)
    {
        $movements = $ingredient->movements()->with('creator','order')->latest()->limit(100)->get();
        return response()->json(['data' => $movements]);
    }
}
