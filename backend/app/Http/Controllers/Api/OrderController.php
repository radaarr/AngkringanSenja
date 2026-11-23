<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::query()->with(['items','table','payments','promotion'])->orderByDesc('created_at');
        if ($request->filled('status')) $query->where('status', $request->query('status'));
        if ($request->filled('source')) $query->where('source', $request->query('source'));
        if ($request->filled('order_type')) $query->where('order_type', $request->query('order_type'));
        if ($request->filled('date')) $query->whereDate('created_at', $request->query('date'));
        $orders = $query->limit(100)->get();
        return OrderResource::collection($orders);
    }

    public function show(Order $order)
    {
        $order->load(['items','table','payments','promotion','statusHistories']);
        return new OrderResource($order);
    }

    public function updateStatus(Request $request, Order $order, OrderService $service)
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(['CONFIRMED','PREPARING','READY','COMPLETED','CANCELLED'])],
            'reason' => ['nullable','string','max:500'],
        ]);
        $order = $service->transitionStatus($order, $data['status'], $request->user(), $data['reason'] ?? null);
        return new OrderResource($order);
    }

    public function kitchen()
    {
        $orders = Order::query()
            ->with(['items','table','payments','promotion'])
            ->whereIn('status', ['CONFIRMED','PREPARING','READY'])
            ->orderBy('created_at')
            ->get();
        return OrderResource::collection($orders);
    }
}
