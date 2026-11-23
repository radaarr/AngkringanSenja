<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\Ingredient;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    public function dashboard(Request $request)
    {
        $from = $request->date('from') ? Carbon::parse($request->date('from'))->startOfDay() : now()->startOfDay();
        $to = $request->date('to') ? Carbon::parse($request->date('to'))->endOfDay() : now()->endOfDay();

        $paidOrders = Order::query()->whereHas('payments', fn($q) => $q->where('status', 'PAID'))->whereBetween('created_at', [$from, $to]);
        $sales = (clone $paidOrders)->sum('total');
        $ordersCount = (clone $paidOrders)->count();
        $avg = $ordersCount ? round($sales / $ordersCount, 2) : 0;

        $expenses = Expense::query()->whereBetween('expense_date', [$from->toDateString(), $to->toDateString()])->sum('amount');
        $profit = round($sales - $expenses, 2);

        $byStatus = Order::query()->whereBetween('created_at', [$from, $to])->select('status', DB::raw('count(*) as count'))->groupBy('status')->pluck('count', 'status');
        $lowStock = Ingredient::query()->where('is_active', true)->whereColumn('current_stock', '<=', 'min_stock')->count();

        $daily = Order::query()
            ->whereHas('payments', fn($q) => $q->where('status', 'PAID'))
            ->whereBetween('created_at', [now()->subDays(13)->startOfDay(), now()->endOfDay()])
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('SUM(total) as total'), DB::raw('COUNT(*) as orders'))
            ->groupBy('date')->orderBy('date')->get();

        $topProducts = OrderItem::query()
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('payments', function($j){ $j->on('payments.order_id','=','orders.id')->where('payments.status','=','PAID'); })
            ->whereBetween('orders.created_at', [$from, $to])
            ->select('order_items.product_name', DB::raw('SUM(order_items.quantity) as qty'), DB::raw('SUM(order_items.subtotal) as revenue'))
            ->groupBy('order_items.product_name')->orderByDesc('qty')->limit(5)->get();

        return response()->json(['data' => [
            'range' => ['from' => $from->toDateString(), 'to' => $to->toDateString()],
            'sales_total' => (float) $sales,
            'orders_count' => $ordersCount,
            'avg_order' => (float) $avg,
            'expenses_total' => (float) $expenses,
            'profit_estimate' => (float) $profit,
            'low_stock_count' => $lowStock,
            'orders_by_status' => $byStatus,
            'daily_sales' => $daily,
            'top_products' => $topProducts,
        ]]);
    }

    public function sales(Request $request)
    {
        [$from, $to] = $this->range($request);
        $rows = Order::query()->with(['items','payments'])
            ->whereHas('payments', fn($q) => $q->where('status','PAID'))
            ->whereBetween('created_at', [$from,$to])->orderByDesc('created_at')->get();
        if ($request->query('format') === 'csv') {
            return $this->csv('sales-report.csv', ['order_number','date','source','type','status','subtotal','discount','service_charge','tax','total','promo_code','items'], $rows->map(fn($o)=>[
                $o->order_number,$o->created_at,$o->source,$o->order_type,$o->status,$o->subtotal,$o->discount_amount,$o->service_charge_amount,$o->tax_amount,$o->total,$o->promotion_code,$o->items->map(fn($i)=>$i->quantity.'x '.$i->product_name)->implode('; ')
            ]));
        }
        return response()->json(['data'=>$rows]);
    }

    public function products(Request $request)
    {
        [$from,$to]=$this->range($request);
        $rows = OrderItem::query()->join('orders','order_items.order_id','=','orders.id')
            ->join('payments', function($j){ $j->on('payments.order_id','=','orders.id')->where('payments.status','=','PAID'); })
            ->whereBetween('orders.created_at', [$from,$to])
            ->select('order_items.product_name', DB::raw('SUM(order_items.quantity) as qty'), DB::raw('SUM(order_items.subtotal) as revenue'))
            ->groupBy('order_items.product_name')->orderByDesc('revenue')->get();
        if ($request->query('format')==='csv') return $this->csv('product-report.csv',['product','qty_sold','revenue'],$rows->map(fn($r)=>[$r->product_name,$r->qty,$r->revenue]));
        return response()->json(['data'=>$rows]);
    }

    public function inventory(Request $request)
    {
        $rows = Ingredient::query()->with(['movements'=>fn($q)=>$q->latest()->limit(5)])->orderBy('name')->get();
        if ($request->query('format')==='csv') return $this->csv('inventory-report.csv',['name','unit','current_stock','min_stock','status'],$rows->map(fn($i)=>[$i->name,$i->unit,$i->current_stock,$i->min_stock,($i->is_active && $i->current_stock <= $i->min_stock)?'LOW':'OK']));
        return response()->json(['data'=>$rows]);
    }

    public function expenses(Request $request)
    {
        [$from,$to]=$this->range($request);
        $rows = Expense::query()->whereBetween('expense_date', [$from->toDateString(), $to->toDateString()])->orderByDesc('expense_date')->get();
        if ($request->query('format')==='csv') return $this->csv('expense-report.csv',['date','category','description','amount'],$rows->map(fn($e)=>[$e->expense_date,$e->category,$e->description,$e->amount]));
        $summary = Expense::query()->whereBetween('expense_date', [$from->toDateString(), $to->toDateString()])->select('category', DB::raw('SUM(amount) as total'))->groupBy('category')->get();
        return response()->json(['data'=>$rows,'summary'=>$summary]);
    }

    private function range(Request $request): array
    {
        $from = $request->date('from') ? Carbon::parse($request->date('from'))->startOfDay() : now()->startOfMonth();
        $to = $request->date('to') ? Carbon::parse($request->date('to'))->endOfDay() : now()->endOfDay();
        return [$from,$to];
    }

    private function csv(string $filename, array $headers, $rows): StreamedResponse
    {
        return response()->streamDownload(function () use ($headers, $rows) {
            $out = fopen('php://output', 'w');
            fputcsv($out, $headers);
            foreach ($rows as $row) {
                fputcsv($out, is_array($row) ? $row : (array) $row);
            }
            fclose($out);
        }, $filename, ['Content-Type' => 'text/csv']);
    }
}
