<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    protected $fillable = ['order_id','method','status','amount','amount_received','change_amount','idempotency_key','confirmed_by','meta','paid_at'];

    protected function casts(): array
    {
        return [
            'amount'=>'decimal:2','amount_received'=>'decimal:2','change_amount'=>'decimal:2',
            'meta'=>'array','paid_at'=>'datetime',
        ];
    }

    public function order(): BelongsTo { return $this->belongsTo(Order::class); }
    public function confirmer(): BelongsTo { return $this->belongsTo(User::class,'confirmed_by'); }
}
