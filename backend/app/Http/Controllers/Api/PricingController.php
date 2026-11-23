<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PricingService;
use Illuminate\Http\Request;

class PricingController extends Controller
{
    public function preview(Request $request, PricingService $pricing)
    {
        $data = $request->validate([
            'promo_code' => ['nullable', 'string', 'max:50'],
            'items' => ['required', 'array', 'min:1', 'max:50'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:99'],
        ]);

        [, $subtotal] = $pricing->priceItems($data['items']);
        $promotion = $pricing->resolvePromotion($data['promo_code'] ?? null, $subtotal);
        $totals = $pricing->totals($subtotal, $promotion);

        return response()->json([
            'data' => [
                'subtotal' => $totals['subtotal'],
                'discount_amount' => $totals['discount_amount'],
                'service_charge_amount' => $totals['service_charge_amount'],
                'tax_amount' => $totals['tax_amount'],
                'total' => $totals['total'],
                'tax_rate' => $totals['tax_rate'],
                'service_charge_rate' => $totals['service_rate'],
                'promotion' => $promotion ? [
                    'id' => $promotion->id,
                    'code' => $promotion->code,
                    'name' => $promotion->name,
                    'type' => $promotion->type,
                    'value' => (float) $promotion->value,
                ] : null,
            ],
        ]);
    }
}
