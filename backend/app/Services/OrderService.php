<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStatusHistory;
use App\Models\Payment;
use App\Models\Table;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class OrderService
{
    private const TRANSITIONS = [
        'PENDING' => ['CONFIRMED', 'CANCELLED'],
        'CONFIRMED' => ['PREPARING', 'CANCELLED'],
        'PREPARING' => ['READY', 'CANCELLED'],
        'READY' => ['COMPLETED'],
        'COMPLETED' => [],
        'CANCELLED' => [],
    ];

    public function createPublicOrder(array $data): array
    {
        return DB::transaction(function () use ($data) {
            [$table, $orderItems, $pricing] = $this->buildOrderParts($data, true);

            $trackingToken = Str::random(48);
            $paymentMethod = $data['payment_method'] ?? null;
            $isQris = $paymentMethod === 'QRIS_SIMULATED';
            $status = $isQris ? 'CONFIRMED' : 'PENDING';

            $order = Order::query()->create([
                'order_number' => $this->generateOrderNumber(),
                'source' => 'QR_ORDERING',
                'order_type' => $data['order_type'],
                'status' => $status,
                'table_id' => $table?->id,
                'customer_name' => $data['customer_name'] ?? null,
                'tracking_token_hash' => hash('sha256', $trackingToken),
                'subtotal' => $pricing['subtotal'],
                'discount_amount' => $pricing['discount_amount'],
                'service_charge_amount' => $pricing['service_charge_amount'],
                'tax_amount' => $pricing['tax_amount'],
                'promotion_id' => $pricing['promotion_id'],
                'promotion_code' => $pricing['promotion_code'],
                'total' => $pricing['total'],
                'notes' => $data['notes'] ?? null,
            ]);

            $this->persistItemsAndHistory($order, $orderItems, null);

            if ($isQris) {
                $order->payments()->create([
                    'method' => 'QRIS_SIMULATED',
                    'status' => 'PAID',
                    'amount' => $pricing['total'],
                    'amount_received' => null,
                    'change_amount' => null,
                    'idempotency_key' => $data['idempotency_key'] ?? null,
                    'confirmed_by' => null,
                    'meta' => ['simulated' => true],
                    'paid_at' => now(),
                ]);
                app(\App\Services\InventoryService::class)->deductForOrder($order, null);
            }

            $order->load(['items', 'table', 'payments', 'promotion']);

            return ['order' => $order, 'tracking_token' => $trackingToken, 'paid' => $isQris];
        });
    }

    public function recordPublicPayment(Order $order, array $data): Payment
    {
        return DB::transaction(function () use ($order, $data) {
            $order = Order::query()->lockForUpdate()->findOrFail($order->id);

            $idempotencyKey = $data['idempotency_key'] ?? null;
            if ($idempotencyKey) {
                $existing = Payment::query()->where('idempotency_key', $idempotencyKey)->first();
                if ($existing) {
                    if ($existing->order_id !== $order->id) {
                        throw ValidationException::withMessages(['idempotency_key' => ['Kunci idempotensi sudah digunakan untuk pesanan lain.']]);
                    }
                    return $existing;
                }
            }

            $existingPaid = $order->payments()->where('status', 'PAID')->lockForUpdate()->first();
            if ($existingPaid) {
                return $existingPaid;
            }

            $method = $data['method'];
            $amount = round((float) $order->total, 2);

            $payment = $order->payments()->create([
                'method' => $method,
                'status' => 'PAID',
                'amount' => $amount,
                'amount_received' => null,
                'change_amount' => null,
                'idempotency_key' => $idempotencyKey,
                'confirmed_by' => null,
                'meta' => ['simulated' => $method === 'QRIS_SIMULATED'],
                'paid_at' => now(),
            ]);

            app(\App\Services\InventoryService::class)->deductForOrder($order, null);

            if ($order->status === 'PENDING') {
                $from = $order->status;
                $order->status = 'CONFIRMED';
                $order->save();
                OrderStatusHistory::query()->create([
                    'order_id' => $order->id,
                    'from_status' => $from,
                    'to_status' => 'CONFIRMED',
                    'actor_id' => null,
                    'reason' => 'Pembayaran QRIS berhasil',
                ]);
            }

            return $payment;
        });
    }

    public function createPosOrder(array $data, User $cashier): Order
    {
        return DB::transaction(function () use ($data, $cashier) {
            [$table, $orderItems, $pricing] = $this->buildOrderParts($data, false);

            $order = Order::query()->create([
                'order_number' => $this->generateOrderNumber(),
                'source' => 'POS',
                'order_type' => $data['order_type'],
                'status' => 'CONFIRMED',
                'table_id' => $table?->id,
                'customer_name' => $data['customer_name'] ?? null,
                'tracking_token_hash' => null,
                'subtotal' => $pricing['subtotal'],
                'discount_amount' => $pricing['discount_amount'],
                'service_charge_amount' => $pricing['service_charge_amount'],
                'tax_amount' => $pricing['tax_amount'],
                'promotion_id' => $pricing['promotion_id'],
                'promotion_code' => $pricing['promotion_code'],
                'total' => $pricing['total'],
                'notes' => $data['notes'] ?? null,
                'created_by' => $cashier->id,
            ]);

            $this->persistItemsAndHistory($order, $orderItems, $cashier->id);

            return $order->load(['items','table','payments','promotion','creator']);
        });
    }

    public function recordPayment(Order $order, array $data, User $actor): Payment
    {
        return DB::transaction(function () use ($order, $data, $actor) {
            $order = Order::query()->lockForUpdate()->findOrFail($order->id);

            $idempotencyKey = $data['idempotency_key'] ?? null;
            if ($idempotencyKey) {
                $existing = Payment::query()->where('idempotency_key', $idempotencyKey)->first();
                if ($existing) {
                    if ($existing->order_id !== $order->id) {
                        throw ValidationException::withMessages(['idempotency_key' => ['Kunci idempotensi sudah digunakan untuk pesanan lain.']]);
                    }
                    return $existing;
                }
            }

            $existingPaid = $order->payments()->where('status', 'PAID')->lockForUpdate()->first();
            if ($existingPaid) {
                return $existingPaid;
            }

            $method = $data['method'];
            $amount = round((float) $order->total, 2);
            $amountReceived = null;
            $change = null;
            $meta = ['simulated' => $method === 'QRIS_SIMULATED'];

            if ($method === 'CASH') {
                $amountReceived = round((float) ($data['amount_received'] ?? 0), 2);
                if ($amountReceived < $amount) {
                    throw ValidationException::withMessages(['amount_received' => ['Uang diterima kurang dari total.']]);
                }
                $change = round($amountReceived - $amount, 2);
            }

            $payment = $order->payments()->create([
                'method' => $method,
                'status' => 'PAID',
                'amount' => $amount,
                'amount_received' => $amountReceived,
                'change_amount' => $change,
                'idempotency_key' => $idempotencyKey,
                'confirmed_by' => $actor->id,
                'meta' => $meta,
                'paid_at' => now(),
            ]);

            app(\App\Services\InventoryService::class)->deductForOrder($order, $actor);

            return $payment->load('confirmer');
        });
    }

    public function transitionStatus(Order $order, string $toStatus, User $actor, ?string $reason = null): Order
    {
        return DB::transaction(function () use ($order, $toStatus, $actor, $reason) {
            $order = Order::query()->lockForUpdate()->findOrFail($order->id);
            $from = $order->status;

            $allowed = self::TRANSITIONS[$from] ?? [];
            if (! in_array($toStatus, $allowed, true)) {
                throw ValidationException::withMessages(['status' => ["Transisi dari {$from} ke {$toStatus} tidak diizinkan."]]);
            }

            $this->assertTransitionPermission($order, $from, $toStatus, $actor);

            if ($toStatus === 'CANCELLED' && empty($reason)) {
                throw ValidationException::withMessages(['reason' => ['Alasan pembatalan wajib diisi.']]);
            }
            if ($toStatus === 'COMPLETED') {
                $isPaid = $order->payments()->where('status', 'PAID')->exists();
                if (! $isPaid) {
                    throw ValidationException::withMessages(['status' => ['Pesanan harus dibayar sebelum diselesaikan.']]);
                }
                $order->completed_at = now();
            }
            if ($toStatus === 'CANCELLED') {
                $order->cancelled_at = now();
            }

            $order->status = $toStatus;
            $order->save();

            OrderStatusHistory::query()->create([
                'order_id' => $order->id,
                'from_status' => $from,
                'to_status' => $toStatus,
                'actor_id' => $actor->id,
                'reason' => $reason,
            ]);

            if ($toStatus === 'CANCELLED') {
                app(\App\Services\InventoryService::class)->compensateForOrder($order, $actor);
            }

            return $order->load(['items','table','payments']);
        });
    }

    private function assertTransitionPermission(Order $order, string $from, string $to, User $actor): void
    {
        $role = $actor->role?->slug;
        if ($role === 'owner') return;

        if ($role === 'kitchen_staff') {
            $ok = ($from === 'CONFIRMED' && $to === 'PREPARING') || ($from === 'PREPARING' && $to === 'READY');
            if (! $ok) {
                throw ValidationException::withMessages(['status' => ['Peran dapur tidak diizinkan melakukan transisi ini.']]);
            }
            return;
        }

        if ($role === 'cashier') {
            $forbidden = ($from === 'CONFIRMED' && $to === 'PREPARING') || ($from === 'PREPARING' && $to === 'READY');
            if ($forbidden) {
                throw ValidationException::withMessages(['status' => ['Kasir tidak diizinkan melakukan transisi dapur ini.']]);
            }
            return;
        }

        throw ValidationException::withMessages(['status' => ['Tidak diizinkan.']]);
    }

    private function buildOrderParts(array $data, bool $requireTableToken): array
    {
        $table = null;
        $orderType = $data['order_type'];
        if ($orderType === 'DINE_IN') {
            if ($requireTableToken) {
                $table = Table::query()->where('qr_token', $data['table_token'] ?? null)->where('is_active', true)->lockForUpdate()->first();
                if (! $table) {
                    throw ValidationException::withMessages(['table_token' => ['Meja tidak valid atau tidak aktif.']]);
                }
            } elseif (! empty($data['table_id'])) {
                $table = Table::query()->where('id', $data['table_id'])->where('is_active', true)->lockForUpdate()->first();
                if (! $table) {
                    throw ValidationException::withMessages(['table_id' => ['Meja tidak valid atau tidak aktif.']]);
                }
            }
        }

        $pricing = app(PricingService::class);
        [$orderItems, $subtotal] = $pricing->priceItems($data['items']);
        $promotion = $pricing->resolvePromotion($data['promo_code'] ?? null, $subtotal);
        $totals = $pricing->totals($subtotal, $promotion);

        return [$table, $orderItems, $totals];
    }

    private function persistItemsAndHistory(Order $order, array $orderItems, ?int $actorId): void
    {
        foreach ($orderItems as $oi) {
            $order->items()->create($oi);
        }
        OrderStatusHistory::query()->create([
            'order_id' => $order->id,
            'from_status' => null,
            'to_status' => $order->status,
            'actor_id' => $actorId,
        ]);
    }

    private function generateOrderNumber(): string
    {
        $date = now()->format('Ymd');
        $rand = strtoupper(Str::random(4));
        return "AS-{$date}-{$rand}";
    }
}
