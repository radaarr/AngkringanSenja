<?php

namespace Database\Seeders;

use App\Models\Promotion;
use Illuminate\Database\Seeder;

class PromotionSeeder extends Seeder
{
    public function run(): void
    {
        $promotions = [
            [
                'code' => 'HEMAT10',
                'name' => 'Hemat 10%',
                'type' => 'PERCENTAGE',
                'value' => 10,
                'min_order' => 25000,
                'starts_at' => now()->subDay(),
                'ends_at' => now()->addDays(90),
                'is_active' => true,
            ],
            [
                'code' => 'POTONG5K',
                'name' => 'Potongan Rp5.000',
                'type' => 'FIXED',
                'value' => 5000,
                'min_order' => 30000,
                'starts_at' => now()->subDay(),
                'ends_at' => now()->addDays(90),
                'is_active' => true,
            ],
            [
                'code' => 'SENJA15',
                'name' => 'Diskon Senja 15%',
                'type' => 'PERCENTAGE',
                'value' => 15,
                'min_order' => 50000,
                'starts_at' => now()->subDay(),
                'ends_at' => now()->addDays(30),
                'is_active' => true,
            ],
        ];

        foreach ($promotions as $promotion) {
            Promotion::query()->updateOrCreate(['code' => $promotion['code']], $promotion);
        }
    }
}
