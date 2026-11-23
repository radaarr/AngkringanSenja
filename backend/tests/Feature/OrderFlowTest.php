<?php

namespace Tests\Feature;

use App\Models\Ingredient;
use App\Models\InventoryMovement;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderFlowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\DatabaseSeeder::class);
    }

    public function test_cash_payment_deducts_inventory_and_is_idempotent(): void
    {
        $cashier = User::where('email', 'cashier@angkringan.test')->firstOrFail();
        $product = Product::where('slug', 'nasi-kucing')->firstOrFail();
        $beras = Ingredient::where('name', 'Beras')->firstOrFail();
        $initial = (float) $beras->current_stock;

        $orderRes = $this->actingAs($cashier)->postJson('/api/v1/pos/orders', [
            'order_type' => 'TAKEAWAY',
            'items' => [['product_id' => $product->id, 'quantity' => 2]],
        ])->assertCreated();
        $orderId = $orderRes->json('data.id');

        $payload = ['method' => 'CASH', 'amount_received' => 20000, 'idempotency_key' => 'pay-key-1'];
        $this->actingAs($cashier)->postJson("/api/v1/orders/{$orderId}/payments", $payload)
            ->assertCreated()->assertJsonPath('data.status', 'PAID');

        $beras->refresh();
        $this->assertSame(round($initial - 0.2, 3), round((float) $beras->current_stock, 3));
        $this->assertSame(1, InventoryMovement::where('order_id', $orderId)->where('reason', 'order_deduction')->count());

        $this->actingAs($cashier)->postJson("/api/v1/orders/{$orderId}/payments", $payload)->assertCreated();
        $beras->refresh();
        $this->assertSame(round($initial - 0.2, 3), round((float) $beras->current_stock, 3));
        $this->assertSame(1, InventoryMovement::where('order_id', $orderId)->where('reason', 'order_deduction')->count());
    }

    public function test_cancel_paid_order_compensates_inventory(): void
    {
        $cashier = User::where('email', 'cashier@angkringan.test')->firstOrFail();
        $product = Product::where('slug', 'nasi-kucing')->firstOrFail();
        $beras = Ingredient::where('name', 'Beras')->firstOrFail();
        $initial = (float) $beras->current_stock;

        $orderRes = $this->actingAs($cashier)->postJson('/api/v1/pos/orders', [
            'order_type' => 'TAKEAWAY',
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
        ])->assertCreated();
        $orderId = $orderRes->json('data.id');

        $this->actingAs($cashier)->postJson("/api/v1/orders/{$orderId}/payments", [
            'method' => 'CASH', 'amount_received' => 10000, 'idempotency_key' => 'pay-key-2',
        ])->assertCreated();

        $this->actingAs($cashier)->patchJson("/api/v1/orders/{$orderId}/status", [
            'status' => 'CANCELLED', 'reason' => 'Tes batal',
        ])->assertOk()->assertJsonPath('data.status', 'CANCELLED');

        $beras->refresh();
        $this->assertSame(round($initial, 3), round((float) $beras->current_stock, 3));
        $this->assertSame(1, InventoryMovement::where('order_id', $orderId)->where('reason', 'order_cancel_compensation')->count());
    }

    public function test_qris_simulated_payment_is_recorded(): void
    {
        $cashier = User::where('email', 'cashier@angkringan.test')->firstOrFail();
        $product = Product::where('slug', 'nasi-kucing')->firstOrFail();
        $orderRes = $this->actingAs($cashier)->postJson('/api/v1/pos/orders', [
            'order_type' => 'TAKEAWAY',
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
        ])->assertCreated();
        $orderId = $orderRes->json('data.id');

        $this->actingAs($cashier)->postJson("/api/v1/orders/{$orderId}/payments", [
            'method' => 'QRIS_SIMULATED',
        ])->assertCreated()
            ->assertJsonPath('data.method', 'QRIS_SIMULATED')
            ->assertJsonPath('data.status', 'PAID');
    }

    public function test_cannot_complete_unpaid_ready_order(): void
    {
        $owner = User::where('email', 'owner@angkringan.test')->firstOrFail();
        $cashier = User::where('email', 'cashier@angkringan.test')->firstOrFail();
        $product = Product::where('slug', 'nasi-kucing')->firstOrFail();
        $orderRes = $this->actingAs($cashier)->postJson('/api/v1/pos/orders', [
            'order_type' => 'TAKEAWAY',
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
        ])->assertCreated();
        $orderId = $orderRes->json('data.id');

        $this->actingAs($owner)->patchJson("/api/v1/orders/{$orderId}/status", ['status' => 'PREPARING'])->assertOk();
        $this->actingAs($owner)->patchJson("/api/v1/orders/{$orderId}/status", ['status' => 'READY'])->assertOk();
        $this->actingAs($owner)->patchJson("/api/v1/orders/{$orderId}/status", ['status' => 'COMPLETED'])
            ->assertStatus(422);
    }
}
