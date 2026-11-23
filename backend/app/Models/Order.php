<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    protected $fillable = ['order_number','source','order_type','status','table_id','promotion_id','promotion_code','customer_name','tracking_token_hash','subtotal','discount_amount','service_charge_amount','tax_amount','total','created_by','notes','completed_at','cancelled_at'];

    protected function casts(): array
    {
        return [
            'subtotal' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'service_charge_amount' => 'decimal:2',
            'tax_amount' => 'decimal:2',
            'total' => 'decimal:2',
            'completed_at' => 'datetime',
            'cancelled_at' => 'datetime',
        ];
    }

    public function table(): BelongsTo { return $this->belongsTo(Table::class); }
    public function promotion(): BelongsTo { return $this->belongsTo(Promotion::class); }
    public function creator(): BelongsTo { return $this->belongsTo(User::class, 'created_by'); }
    public function items(): HasMany { return $this->hasMany(OrderItem::class); }
    public function payments(): HasMany { return $this->hasMany(Payment::class); }
    public function statusHistories(): HasMany { return $this->hasMany(OrderStatusHistory::class); }
}
