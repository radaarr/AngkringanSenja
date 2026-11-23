<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventoryMovement extends Model
{
    protected $fillable = ['ingredient_id','type','quantity','balance_before','balance_after','reason','order_id','created_by','notes'];

    protected function casts(): array
    {
        return ['quantity'=>'decimal:3','balance_before'=>'decimal:3','balance_after'=>'decimal:3'];
    }

    public function ingredient(): BelongsTo { return $this->belongsTo(Ingredient::class); }
    public function order(): BelongsTo { return $this->belongsTo(Order::class); }
    public function creator(): BelongsTo { return $this->belongsTo(User::class,'created_by'); }
}
