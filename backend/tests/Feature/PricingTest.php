<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Promotion;
use App\Models\Table;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PricingTest extends TestCase
{
    use RefreshDatabase;

    private function product(int $price = 10000): Product
    {
        $category = Category::query()->create([
            'name' => 'Makanan',
            'slug' => 'makanan-pricing',
            'is_active' => true,
            'sort_order' => 0,
        ]);

        return Product::query()->create([
            'category_id' => $category->id,
            'name' => 'Nasi Kucing',
            'slug' => 'nasi-kucing-pricing',
            'price' => $price,
            'is_available' => true,
            'is_featured' => false,
            'sort_order' => 0,
        ]);
    }

    private function promotion(array $overrides = []): Promotion
    {
        return Promotion::query()->create(array_merge([
            'name' => 'Hemat 10%',
            'code' => 'HEMAT10',
            'type' => 'PERCENTAGE',
            'value' => 10,
            'min_order' => 0,
            'starts_at' => now()->subDay(),
            'ends_at' => now()->addDay(),
            'is_active' => true,
        ], $overrides));
    }

    public function test_preview_calculates_percentage_discount_and_tax(): void
    {
        config(['angkringan.tax.enabled' => true, 'angkringan.tax.rate' => 10, 'angkringan.service_charge.enabled' => false]);
        $product = $this->product(10000);
        $this->promotion();

        $res = $this->postJson('/api/v1/pricing/preview', [
            'promo_code' => 'hemat10',
            'items' => [['product_id' => $product->id, 'quantity' => 2]],
        ]);

        $res->assertOk()->assertJsonPath('data.promotion.code', 'HEMAT10');
        $this->assertEquals(20000, $res->json('data.subtotal'));
        $this->assertEquals(2000, $res->json('data.discount_amount'));
        $this->assertEquals(1800, $res->json('data.tax_amount'));
        $this->assertEquals(19800, $res->json('data.total'));
        $this->assertEquals(10, $res->json('data.tax_rate'));
    }

    public function test_preview_supports_service_charge(): void
    {
        config([
            'angkringan.tax.enabled' => true,
            'angkringan.tax.rate' => 10,
            'angkringan.service_charge.enabled' => true,
            'angkringan.service_charge.rate' => 5,
        ]);
        $product = $this->product(20000);
        $this->promotion();

        $res = $this->postJson('/api/v1/pricing/preview', [
            'promo_code' => 'HEMAT10',
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
        ]);

        $res->assertOk();
        $this->assertEquals(2000, $res->json('data.discount_amount'));
        $this->assertEquals(1000, $res->json('data.service_charge_amount'));
        $this->assertEquals(1900, $res->json('data.tax_amount'));
        $this->assertEquals(20900, $res->json('data.total'));
    }

    public function test_fixed_discount_is_capped_at_subtotal(): void
    {
        config(['angkringan.tax.enabled' => false, 'angkringan.service_charge.enabled' => false]);
        $product = $this->product(10000);
        $this->promotion(['code' => 'POTONG50K', 'type' => 'FIXED', 'value' => 50000]);

        $res = $this->postJson('/api/v1/pricing/preview', [
            'promo_code' => 'POTONG50K',
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
        ]);

        $res->assertOk();
        $this->assertEquals(10000, $res->json('data.discount_amount'));
        $this->assertEquals(0, $res->json('data.tax_amount'));
        $this->assertEquals(0, $res->json('data.total'));
    }

    public function test_preview_rejects_unknown_expired_inactive_and_below_minimum_codes(): void
    {
        $product = $this->product(10000);

        $this->postJson('/api/v1/pricing/preview', [
            'promo_code' => 'TIDAKADA',
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
        ])->assertStatus(422)->assertJsonValidationErrors('promo_code');

        $this->promotion(['code' => 'EXPIRED', 'starts_at' => now()->subDays(10), 'ends_at' => now()->subDay()]);

        $this->postJson('/api/v1/pricing/preview', [
            'promo_code' => 'EXPIRED',
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
        ])->assertStatus(422)->assertJsonValidationErrors('promo_code');

        $this->promotion(['code' => 'NONAKTIF', 'is_active' => false]);

        $this->postJson('/api/v1/pricing/preview', [
            'promo_code' => 'NONAKTIF',
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
        ])->assertStatus(422)->assertJsonValidationErrors('promo_code');

        $this->promotion(['code' => 'MINIMAL', 'min_order' => 50000]);

        $this->postJson('/api/v1/pricing/preview', [
            'promo_code' => 'MINIMAL',
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
        ])->assertStatus(422)->assertJsonValidationErrors('promo_code');
    }

    public function test_public_qris_order_persists_promo_and_tax_and_payment_matches_total(): void
    {
        config(['angkringan.tax.enabled' => true, 'angkringan.tax.rate' => 10, 'angkringan.service_charge.enabled' => false]);
        $product = $this->product(10000);
        $this->promotion();
        $table = Table::query()->create(['name' => 'Meja 1', 'code' => 'M1', 'qr_token' => str_repeat('d', 32), 'is_active' => true]);

        $res = $this->postJson('/api/v1/public/orders', [
            'order_type' => 'DINE_IN',
            'table_token' => $table->qr_token,
            'payment_method' => 'QRIS_SIMULATED',
            'promo_code' => 'HEMAT10',
            'idempotency_key' => 'pricing-qris-1',
            'items' => [['product_id' => $product->id, 'quantity' => 2]],
        ]);

        $res->assertCreated()->assertJsonPath('data.paid', true);
        $order = Order::query()->where('order_number', $res->json('data.order_number'))->firstOrFail();

        $this->assertSame('HEMAT10', $order->promotion_code);
        $this->assertNotNull($order->promotion_id);
        $this->assertEquals(2000, (float) $order->discount_amount);
        $this->assertEquals(1800, (float) $order->tax_amount);
        $this->assertEquals(19800, (float) $order->total);

        $payment = Payment::query()->where('order_id', $order->id)->where('status', 'PAID')->firstOrFail();
        $this->assertEquals(19800, (float) $payment->amount);
        $this->assertEquals(19800, (float) $res->json('data.total'));
    }

    public function test_pos_order_applies_promo_code(): void
    {
        $this->seed(DatabaseSeeder::class);
        config(['angkringan.tax.enabled' => false]);
        $this->promotion();

        $cashier = User::where('email', 'cashier@angkringan.test')->firstOrFail();
        $product = Product::where('slug', 'nasi-kucing')->firstOrFail();

        $res = $this->actingAs($cashier)->postJson('/api/v1/pos/orders', [
            'order_type' => 'TAKEAWAY',
            'promo_code' => 'HEMAT10',
            'items' => [['product_id' => $product->id, 'quantity' => 10]],
        ])->assertCreated();

        $this->assertSame('HEMAT10', $res->json('data.promotion_code'));
        $this->assertEquals(5000, (float) $res->json('data.discount_amount'));
        $this->assertEquals(0, (float) $res->json('data.tax_amount'));
        $this->assertEquals(45000, (float) $res->json('data.total'));
    }

    public function test_public_order_without_promo_still_applies_default_tax(): void
    {
        config(['angkringan.tax.enabled' => true, 'angkringan.tax.rate' => 10, 'angkringan.service_charge.enabled' => false]);
        $product = $this->product(10000);

        $res = $this->postJson('/api/v1/public/orders', [
            'order_type' => 'TAKEAWAY',
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
        ])->assertCreated();

        $order = Order::query()->where('order_number', $res->json('data.order_number'))->firstOrFail();
        $this->assertEquals(0, (float) $order->discount_amount);
        $this->assertEquals(1000, (float) $order->tax_amount);
        $this->assertEquals(11000, (float) $order->total);
    }
}
