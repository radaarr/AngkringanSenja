<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderTrackingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'order_number' => $this->order_number,
            'source' => $this->source,
            'order_type' => $this->order_type,
            'status' => $this->status,
            'table' => $this->whenLoaded('table', fn () => $this->table ? ['id' => $this->table->id, 'name' => $this->table->name, 'code' => $this->table->code] : null),
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'subtotal' => (float) $this->subtotal,
            'discount_amount' => (float) $this->discount_amount,
            'service_charge_amount' => (float) $this->service_charge_amount,
            'tax_amount' => (float) $this->tax_amount,
            'promotion_code' => $this->promotion_code,
            'promotion' => $this->whenLoaded('promotion', fn () => $this->promotion ? [
                'id' => $this->promotion->id,
                'code' => $this->promotion->code,
                'name' => $this->promotion->name,
                'type' => $this->promotion->type,
                'value' => (float) $this->promotion->value,
            ] : null),
            'total' => (float) $this->total,
            'created_at' => $this->created_at?->toISOString(),
            'payments' => PaymentResource::collection($this->whenLoaded('payments')),
            'paid' => $this->whenLoaded('payments', fn () => $this->payments->contains('status', 'PAID'), false),
            'status_histories' => $this->whenLoaded('statusHistories', fn () => $this->statusHistories->map(fn ($h) => [
                'from_status' => $h->from_status, 'to_status' => $h->to_status, 'created_at' => $h->created_at?->toISOString(),
            ])->values()),
        ];
    }
}
