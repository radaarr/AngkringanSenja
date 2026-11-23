<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderTrackingResource;
use App\Http\Resources\PaymentResource;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PublicOrderController extends Controller
{
    public function store(Request $request, OrderService $service)
    {
        $data = $request->validate([
            'order_type' => ['required', Rule::in(['DINE_IN', 'TAKEAWAY'])],
            'table_token' => ['nullable', 'string', 'size:32'],
            'customer_name' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string', 'max:500'],
            'payment_method' => ['nullable', Rule::in(['QRIS_SIMULATED'])],
            'promo_code' => ['nullable', 'string', 'max:50'],
            'idempotency_key' => ['nullable', 'string', 'max:128'],
            'items' => ['required', 'array', 'min:1', 'max:50'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:99'],
            'items.*.notes' => ['nullable', 'string', 'max:255'],
        ]);
        if ($data['order_type'] === 'DINE_IN' && empty($data['table_token'])) {
            return response()->json(['message' => 'Token meja wajib untuk dine-in.', 'errors' => ['table_token' => ['Token meja wajib.']]], 422);
        }

        $result = $service->createPublicOrder($data);
        $order = $result['order'];
        return response()->json([
            'data' => [
                'order_number' => $order->order_number,
                'tracking_token' => $result['tracking_token'],
                'status' => $order->status,
                'total' => (float) $order->total,
                'paid' => (bool) ($result['paid'] ?? false),
            ],
        ], 201);
    }

    public function show(string $token)
    {
        $order = $this->findByToken($token);
        if (! $order) {
            return response()->json(['message' => 'Pesanan tidak ditemukan.'], 404);
        }
        $order->load(['items', 'table', 'statusHistories', 'payments', 'promotion']);
        return new OrderTrackingResource($order);
    }

    public function pay(Request $request, string $token, OrderService $service)
    {
        $order = $this->findByToken($token);
        if (! $order) {
            return response()->json(['message' => 'Pesanan tidak ditemukan.'], 404);
        }

        $data = $request->validate([
            'method' => ['required', Rule::in(['QRIS_SIMULATED'])],
            'idempotency_key' => ['nullable', 'string', 'max:128'],
        ]);

        $payment = $service->recordPublicPayment($order, $data);
        $order->refresh()->load(['items', 'table', 'statusHistories', 'payments', 'promotion']);

        return response()->json([
            'data' => [
                'payment' => new PaymentResource($payment),
                'order' => new OrderTrackingResource($order),
            ],
        ]);
    }

    private function findByToken(string $token): ?Order
    {
        return Order::query()->where('tracking_token_hash', hash('sha256', $token))->first();
    }
}
