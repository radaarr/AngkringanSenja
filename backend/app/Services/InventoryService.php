<?php

namespace App\Services;

use App\Models\Ingredient;
use App\Models\InventoryMovement;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class InventoryService
{
    public function deductForOrder(Order $order, ?User $actor = null): void
    {
        $order->loadMissing(['items.product.recipes']);

        if (InventoryMovement::query()->where('order_id', $order->id)->where('type', 'OUT')->where('reason', 'order_deduction')->exists()) {
            return;
        }

        foreach ($order->items as $item) {
            $product = $item->product;
            if (! $product) {
                continue;
            }
            foreach ($product->recipes as $recipe) {
                $required = round(((float) $recipe->quantity_required) * $item->quantity, 3);
                if ($required <= 0) {
                    continue;
                }
                $ingredient = Ingredient::query()->where('id', $recipe->ingredient_id)->lockForUpdate()->firstOrFail();
                $before = (float) $ingredient->current_stock;
                if ($before < $required) {
                    throw ValidationException::withMessages([
                        'stock' => ["Stok {$ingredient->name} tidak mencukupi (butuh {$required}, tersedia {$before})."],
                    ]);
                }
                $after = round($before - $required, 3);
                $ingredient->update(['current_stock' => $after]);
                InventoryMovement::query()->create([
                    'ingredient_id' => $ingredient->id,
                    'type' => 'OUT',
                    'quantity' => $required,
                    'balance_before' => $before,
                    'balance_after' => $after,
                    'reason' => 'order_deduction',
                    'order_id' => $order->id,
                    'created_by' => $actor?->id,
                    'notes' => "Deduksi untuk {$order->order_number}",
                ]);
            }
        }
    }

    public function compensateForOrder(Order $order, ?User $actor = null): void
    {
        $deductions = InventoryMovement::query()->where('order_id', $order->id)->where('type', 'OUT')->where('reason', 'order_deduction')->get();
        if ($deductions->isEmpty()) {
            return;
        }
        if (InventoryMovement::query()->where('order_id', $order->id)->where('type', 'IN')->where('reason', 'order_cancel_compensation')->exists()) {
            return;
        }

        foreach ($deductions as $deduction) {
            $ingredient = Ingredient::query()->where('id', $deduction->ingredient_id)->lockForUpdate()->firstOrFail();
            $before = (float) $ingredient->current_stock;
            $qty = (float) $deduction->quantity;
            $after = round($before + $qty, 3);
            $ingredient->update(['current_stock' => $after]);
            InventoryMovement::query()->create([
                'ingredient_id' => $ingredient->id,
                'type' => 'IN',
                'quantity' => $qty,
                'balance_before' => $before,
                'balance_after' => $after,
                'reason' => 'order_cancel_compensation',
                'order_id' => $order->id,
                'created_by' => $actor?->id,
                'notes' => "Kompensasi batal {$order->order_number}",
            ]);
        }
    }

    public function adjust(Ingredient $ingredient, array $data, ?User $actor = null): InventoryMovement
    {
        return DB::transaction(function () use ($ingredient, $data, $actor) {
            $ingredient = Ingredient::query()->where('id', $ingredient->id)->lockForUpdate()->firstOrFail();
            $type = $data['type'];
            $qty = round((float) ($data['quantity'] ?? 0), 3);
            $before = (float) $ingredient->current_stock;

            if ($type === 'ADJUSTMENT') {
                $after = round((float) $data['balance_after'], 3);
                if ($after < 0) {
                    throw ValidationException::withMessages(['balance_after' => ['Saldo tidak boleh negatif.']]);
                }
                $qty = round(abs($after - $before), 3);
            } elseif ($type === 'IN') {
                if ($qty <= 0) {
                    throw ValidationException::withMessages(['quantity' => ['Jumlah harus lebih dari 0.']]);
                }
                $after = round($before + $qty, 3);
            } elseif ($type === 'OUT') {
                if ($qty <= 0) {
                    throw ValidationException::withMessages(['quantity' => ['Jumlah harus lebih dari 0.']]);
                }
                if ($before < $qty) {
                    throw ValidationException::withMessages(['quantity' => ['Stok tidak mencukupi.']]);
                }
                $after = round($before - $qty, 3);
            } else {
                throw ValidationException::withMessages(['type' => ['Tipe tidak valid.']]);
            }

            $ingredient->update(['current_stock' => $after]);
            return InventoryMovement::query()->create([
                'ingredient_id' => $ingredient->id,
                'type' => $type,
                'quantity' => $qty,
                'balance_before' => $before,
                'balance_after' => $after,
                'reason' => $data['reason'] ?? 'manual_adjustment',
                'order_id' => null,
                'created_by' => $actor?->id,
                'notes' => $data['notes'] ?? null,
            ]);
        });
    }
}
