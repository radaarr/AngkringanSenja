<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::query()
            ->with('category')
            ->whereNull('archived_at')
            ->where('is_available', true);

        if ($request->filled('category')) {
            $query->whereHas('category', fn ($q) => $q->where('slug', $request->query('category')));
        }
        if ($request->filled('search')) {
            $query->where('name', 'like', '%'.$request->query('search').'%');
        }
        if ($request->boolean('featured')) {
            $query->where('is_featured', true);
        }

        $products = $query->orderBy('sort_order')->orderBy('name')->get();
        return ProductResource::collection($products);
    }

    public function show(string $slug)
    {
        $product = Product::query()
            ->with('category')
            ->where('slug', $slug)
            ->whereNull('archived_at')
            ->where('is_available', true)
            ->firstOrFail();
        return new ProductResource($product);
    }
}
