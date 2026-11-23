<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'source' => $this->source,
            'order_type' => $this->order_type,
            'status' => $this->status,
            'table_id' => $this->table_id,
            'table' => $this->whenLoaded('table', fn () => $this->table ? ['id'=>$this->table->id,'name'=>$this->table->name,'code'=>$this->table->code] : null),
            'customer_name' => $this->customer_name,
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
            'notes' => $this->notes,
            'created_at' => $this->created_at?->toISOString(),
            'completed_at' => $this->completed_at?->toISOString(),
            'cancelled_at' => $this->cancelled_at?->toISOString(),
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'payments' => PaymentResource::collection($this->whenLoaded('payments')),
        ];
    }
}
