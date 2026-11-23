<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Promotion;
use Illuminate\Validation\ValidationException;

class PricingService
{
    /**
     * @return array{0: array<int, array<string, mixed>>, 1: float}
     */
    public function priceItems(array $itemsInput): array
    {
        $productIds = collect($itemsInput)->pluck('product_id')->unique()->values();
        $products = Product::query()->whereIn('id', $productIds)->whereNull('archived_at')->get()->keyBy('id');

        $orderItems = [];
        $subtotal = 0.0;

        foreach ($itemsInput as $item) {
            $product = $products->get($item['product_id']);
            if (! $product || ! $product->is_available) {
                throw ValidationException::withMessages(['items' => ["Produk {$item['product_id']} tidak tersedia."]]);
            }

            $quantity = (int) $item['quantity'];
            $lineTotal = round(((float) $product->price) * $quantity, 2);
            $subtotal += $lineTotal;

            $orderItems[] = [
                'product_id' => $product->id,
                'product_name' => $product->name,
                'unit_price' => $product->price,
                'quantity' => $quantity,
                'subtotal' => $lineTotal,
                'notes' => $item['notes'] ?? null,
            ];
        }

        return [$orderItems, round($subtotal, 2)];
    }

    public function resolvePromotion(?string $code, float $subtotal): ?Promotion
    {
        $code = trim((string) $code);

        if ($code === '') {
            return null;
        }

        $promotion = Promotion::query()->where('code', strtoupper($code))->first();

        if (! $promotion || ! $promotion->isCurrentlyActive()) {
            throw ValidationException::withMessages(['promo_code' => ['Kode promo tidak valid atau sudah berakhir.']]);
        }

        if ($subtotal < (float) $promotion->min_order) {
            throw ValidationException::withMessages([
                'promo_code' => ['Minimal belanja untuk kode ini adalah Rp'.number_format((float) $promotion->min_order, 0, ',', '.').'.'],
            ]);
        }

        return $promotion;
    }

    /**
     * @return array{subtotal: float, discount_amount: float, service_charge_amount: float, tax_amount: float, total: float, promotion_id: ?int, promotion_code: ?string, promotion: ?Promotion, tax_rate: float, service_rate: float}
     */
    public function totals(float $subtotal, ?Promotion $promotion = null): array
    {
        $subtotal = round($subtotal, 2);

        $discount = 0.0;
        if ($promotion) {
            $discount = $promotion->type === 'PERCENTAGE'
                ? $subtotal * ((float) $promotion->value / 100)
                : (float) $promotion->value;
            $discount = min($discount, $subtotal);
        }
        $discount = round($discount, 2);

        $serviceRate = config('angkringan.service_charge.enabled')
            ? max(0.0, (float) config('angkringan.service_charge.rate'))
            : 0.0;
        $service = round($subtotal * ($serviceRate / 100), 2);

        $taxRate = config('angkringan.tax.enabled')
            ? max(0.0, (float) config('angkringan.tax.rate'))
            : 0.0;
        $taxable = round($subtotal - $discount + $service, 2);
        $tax = round($taxable * ($taxRate / 100), 2);

        $total = round($subtotal - $discount + $service + $tax, 2);

        return [
            'subtotal' => $subtotal,
            'discount_amount' => $discount,
            'service_charge_amount' => $service,
            'tax_amount' => $tax,
            'total' => $total,
            'promotion_id' => $promotion?->id,
            'promotion_code' => $promotion?->code,
            'promotion' => $promotion,
            'tax_rate' => $taxRate,
            'service_rate' => $serviceRate,
        ];
    }
}
