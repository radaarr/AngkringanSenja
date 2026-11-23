<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Ingredient extends Model
{
    protected $fillable = ['name','unit','current_stock','min_stock','is_active'];

    protected function casts(): array
    {
        return ['current_stock'=>'decimal:3','min_stock'=>'decimal:3','is_active'=>'boolean'];
    }

    public function recipes(): HasMany { return $this->hasMany(Recipe::class); }
    public function movements(): HasMany { return $this->hasMany(InventoryMovement::class); }
    public function products(): BelongsToMany { return $this->belongsToMany(Product::class,'recipes')->withPivot('quantity_required','unit')->withTimestamps(); }
}
