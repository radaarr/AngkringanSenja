<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreProductRequest;
use App\Http\Requests\Admin\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function index()
    {
        $this->authorize('viewAny', Product::class);
        $products = Product::with('category')->orderByDesc('created_at')->get();
        return ProductResource::collection($products);
    }

    public function store(StoreProductRequest $request)
    {
        $data = $request->validated();
        $data['slug'] = $data['slug'] ?? Str::slug($data['name']);
        $data['is_available'] = $data['is_available'] ?? true;
        $data['is_featured'] = $data['is_featured'] ?? false;
        $data['sort_order'] = $data['sort_order'] ?? 0;
        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('products', 'public');
        }
        unset($data['image']);
        $product = Product::create($data);
        return (new ProductResource($product->load('category')))->response()->setStatusCode(201);
    }

    public function show(Product $product)
    {
        $this->authorize('view', $product);
        return new ProductResource($product->load('category'));
    }

    public function update(UpdateProductRequest $request, Product $product)
    {
        $data = $request->validated();
        if (array_key_exists('name', $data) && empty($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }
        if ($request->hasFile('image')) {
            if ($product->image_path) Storage::disk('public')->delete($product->image_path);
            $data['image_path'] = $request->file('image')->store('products', 'public');
        }
        unset($data['image']);
        $product->update($data);
        return new ProductResource($product->fresh()->load('category'));
    }

    public function destroy(Product $product)
    {
        $this->authorize('delete', $product);
        $product->update(['archived_at' => now(), 'is_available' => false]);
        return response()->noContent();
    }

    public function archive(Product $product)
    {
        $this->authorize('update', $product);
        $product->update(['archived_at' => now(), 'is_available' => false]);
        return new ProductResource($product->fresh()->load('category'));
    }

    public function restore(Product $product)
    {
        $this->authorize('update', $product);
        $product->update(['archived_at' => null]);
        return new ProductResource($product->fresh()->load('category'));
    }
}
