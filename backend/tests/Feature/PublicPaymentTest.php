<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Ingredient;
use App\Models\Order;
use App\Models\Product;
use App\Models\Table;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicPaymentTest extends TestCase
{
    use RefreshDatabase;

    private function productWithStock(int $stock = 50): array
    {
        $category = Category::query()->create(['name' => 'Makanan', 'slug' => 'makanan-test', 'is_active' => true, 'sort_order' => 0]);
        $ingredient = Ingredient::query()->create([
            'name' => 'Beras',
            'unit' => 'gram',
            'current_stock' => $stock,
            'min_stock' => 1,
            'is_active' => true,
        ]);
        $product = Product::query()->create([
            'category_id' => $category->id,
            'name' => 'Nasi Kucing',
            'slug' => 'nasi-kucing-test',
            'price' => 5000,
            'is_available' => true,
            'is_featured' => false,
            'sort_order' => 0,
        ]);
        $product->recipes()->create(['ingredient_id' => $ingredient->id, 'quantity_required' => 10, 'unit' => 'gram']);
        return [$product, $ingredient];
    }

    public function test_qris_public_order_is_paid_and_stock_deducted(): void
    {
        [$product, $ingredient] = $this->productWithStock(50);
        $table = Table::query()->create(['name' => 'Meja 1', 'code' => 'M1', 'qr_token' => str_repeat('a', 32), 'is_active' => true]);

        $res = $this->postJson('/api/v1/public/orders', [
            'order_type' => 'DINE_IN',
            'table_token' => $table->qr_token,
            'payment_method' => 'QRIS_SIMULATED',
            'idempotency_key' => 'pub-qris-1',
            'items' => [['product_id' => $product->id, 'quantity' => 2]],
        ]);

        $res->assertCreated()->assertJsonPath('data.paid', true)->assertJsonPath('data.status', 'CONFIRMED');
        $token = $res->json('data.tracking_token');

        $order = Order::query()->where('order_number', $res->json('data.order_number'))->firstOrFail();
        $this->assertSame('CONFIRMED', $order->status);
        $this->assertSame($table->id, $order->table_id);
        $this->assertEquals(10000.0, (float) $order->total);
        $this->assertDatabaseHas('payments', ['order_id' => $order->id, 'status' => 'PAID', 'method' => 'QRIS_SIMULATED']);
        $this->assertEquals(30.0, (float) $ingredient->fresh()->current_stock);

        $track = $this->getJson("/api/v1/public/orders/{$token}");
        $track->assertOk()->assertJsonPath('data.paid', true)->assertJsonPath('data.status', 'CONFIRMED');
    }

    public function test_cash_public_order_is_unpaid_pending(): void
    {
        [$product] = $this->productWithStock(50);
        $table = Table::query()->create(['name' => 'Meja 2', 'code' => 'M2', 'qr_token' => str_repeat('b', 32), 'is_active' => true]);

        $res = $this->postJson('/api/v1/public/orders', [
            'order_type' => 'DINE_IN',
            'table_token' => $table->qr_token,
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
        ]);

        $res->assertCreated()->assertJsonPath('data.paid', false)->assertJsonPath('data.status', 'PENDING');
        $order = Order::query()->where('order_number', $res->json('data.order_number'))->firstOrFail();
        $this->assertDatabaseMissing('payments', ['order_id' => $order->id, 'status' => 'PAID']);
    }

    public function test_public_pay_endpoint_is_idempotent_and_confirms(): void
    {
        [$product, $ingredient] = $this->productWithStock(50);
        $table = Table::query()->create(['name' => 'Meja 3', 'code' => 'M3', 'qr_token' => str_repeat('c', 32), 'is_active' => true]);

        $res = $this->postJson('/api/v1/public/orders', [
            'order_type' => 'DINE_IN',
            'table_token' => $table->qr_token,
            'items' => [['product_id' => $product->id, 'quantity' => 2]],
        ]);
        $token = $res->json('data.tracking_token');
        $orderId = Order::query()->where('order_number', $res->json('data.order_number'))->value('id');

        $pay = $this->postJson("/api/v1/public/orders/{$token}/payments", ['method' => 'QRIS_SIMULATED', 'idempotency_key' => 'track-pay-1']);
        $pay->assertOk()->assertJsonPath('data.order.paid', true)->assertJsonPath('data.order.status', 'CONFIRMED');

        $pay2 = $this->postJson("/api/v1/public/orders/{$token}/payments", ['method' => 'QRIS_SIMULATED', 'idempotency_key' => 'track-pay-1']);
        $pay2->assertOk();

        $this->assertEquals(1, \App\Models\Payment::query()->where('order_id', $orderId)->where('status', 'PAID')->count());
        $this->assertEquals(30.0, (float) $ingredient->fresh()->current_stock);
    }
}
