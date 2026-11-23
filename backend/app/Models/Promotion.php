<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Promotion extends Model
{
    protected $fillable = ['name','code','type','value','min_order','starts_at','ends_at','is_active'];

    protected function casts(): array
    {
        return ['value'=>'decimal:2','min_order'=>'decimal:2','starts_at'=>'datetime','ends_at'=>'datetime','is_active'=>'boolean'];
    }

    public function isCurrentlyActive(): bool
    {
        $now = now();

        return $this->is_active
            && (! $this->starts_at || $this->starts_at <= $now)
            && (! $this->ends_at || $this->ends_at >= $now);
    }
}
