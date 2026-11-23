<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Http\Resources\PaymentResource;
use App\Models\Order;
use App\Models\Table;
use App\Services\OrderService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PosController extends Controller
{
    public function products()
    {
        $products = \App\Models\Product::query()->with('category')->whereNull('archived_at')->where('is_available', true)->orderBy('sort_order')->orderBy('name')->get();
        return \App\Http\Resources\ProductResource::collection($products);
    }

    public function tables()
    {
        return response()->json(['data' => Table::query()->where('is_active', true)->orderBy('name')->get(['id','name','code'])]);
    }

    public function storeOrder(Request $request, OrderService $service)
    {
        $data = $request->validate([
            'order_type' => ['required', Rule::in(['DINE_IN', 'TAKEAWAY'])],
            'table_id' => ['nullable','integer','exists:tables,id'],
            'customer_name' => ['nullable','string','max:100'],
            'notes' => ['nullable','string','max:500'],
            'promo_code' => ['nullable','string','max:50'],
            'items' => ['required','array','min:1','max:50'],
            'items.*.product_id' => ['required','integer','exists:products,id'],
            'items.*.quantity' => ['required','integer','min:1','max:99'],
            'items.*.notes' => ['nullable','string','max:255'],
        ]);

        $order = $service->createPosOrder($data, $request->user());
        return (new OrderResource($order))->response()->setStatusCode(201);
    }

    public function orders(Request $request)
    {
        $orders = Order::query()->where('source','POS')->with(['items','table','payments','promotion'])->orderByDesc('created_at')->limit(50)->get();
        return OrderResource::collection($orders);
    }

    public function show(Order $order)
    {
        $order->load(['items','table','payments','promotion']);
        return new OrderResource($order);
    }

    public function storePayment(Request $request, Order $order, OrderService $service)
    {
        $data = $request->validate([
            'method' => ['required', Rule::in(['CASH','QRIS_SIMULATED'])],
            'amount_received' => ['nullable','numeric','min:0'],
            'idempotency_key' => ['nullable','string','max:100'],
        ]);
        $payment = $service->recordPayment($order, $data, $request->user());
        return (new PaymentResource($payment))->response()->setStatusCode(201);
    }
}
