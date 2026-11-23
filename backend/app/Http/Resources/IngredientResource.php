<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class IngredientResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $current = (float) $this->current_stock;
        $min = (float) $this->min_stock;
        return [
            'id' => $this->id,
            'name' => $this->name,
            'unit' => $this->unit,
            'current_stock' => $current,
            'min_stock' => $min,
            'is_active' => (bool) $this->is_active,
            'is_low_stock' => $this->is_active && $current <= $min,
            'movements' => $this->whenLoaded('movements'),
            'updated_at' => $this->updated_at,
        ];
    }
}
