<?php

use App\Http\Controllers\Api\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Api\Admin\ExpenseController;
use App\Http\Controllers\Api\Admin\IngredientController;
use App\Http\Controllers\Api\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Api\Admin\PromotionController;
use App\Http\Controllers\Api\Admin\RecipeController;
use App\Http\Controllers\Api\Admin\ReportController;
use App\Http\Controllers\Api\Admin\TableController as AdminTableController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PosController;
use App\Http\Controllers\Api\PricingController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\PublicOrderController;
use App\Http\Controllers\Api\TableController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::get('/health', fn () => ['status' => 'ok']);

    Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:login');
    Route::post('/auth/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('/auth/me', [AuthController::class, 'me'])->middleware('auth:sanctum');

    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{slug}', [ProductController::class, 'show']);

    Route::post('/pricing/preview', [PricingController::class, 'preview'])->middleware('throttle:pricing_preview');

    Route::get('/tables/resolve/{token}', [TableController::class, 'resolve']);
    Route::post('/public/orders', [PublicOrderController::class, 'store'])->middleware('throttle:public_orders');
    Route::get('/public/orders/{token}', [PublicOrderController::class, 'show'])->middleware('throttle:60,1');
    Route::post('/public/orders/{token}/payments', [PublicOrderController::class, 'pay'])->middleware('throttle:60,1');

    Route::middleware(['auth:sanctum', 'role:owner,cashier'])->prefix('pos')->group(function (): void {
        Route::get('/products', [PosController::class, 'products']);
        Route::get('/tables', [PosController::class, 'tables']);
        Route::post('/orders', [PosController::class, 'storeOrder']);
        Route::get('/orders', [PosController::class, 'orders']);
        Route::get('/orders/{order}', [PosController::class, 'show']);
    });

    Route::middleware(['auth:sanctum', 'role:owner,cashier,kitchen_staff'])->group(function (): void {
        Route::get('/kitchen/orders', [OrderController::class, 'kitchen']);
        Route::patch('/orders/{order}/status', [OrderController::class, 'updateStatus']);
    });

    Route::middleware(['auth:sanctum', 'role:owner,cashier'])->group(function (): void {
        Route::get('/orders', [OrderController::class, 'index']);
        Route::get('/orders/{order}', [OrderController::class, 'show']);
        Route::post('/orders/{order}/payments', [PosController::class, 'storePayment']);
        Route::get('/admin/tables', [AdminTableController::class, 'index']);
    });

    Route::middleware(['auth:sanctum', 'role:owner'])->prefix('admin')->group(function (): void {
        Route::apiResource('categories', AdminCategoryController::class);
        Route::apiResource('products', AdminProductController::class);
        Route::post('products/{product}/archive', [AdminProductController::class, 'archive']);
        Route::post('products/{product}/restore', [AdminProductController::class, 'restore']);

        Route::apiResource('ingredients', IngredientController::class);
        Route::post('ingredients/{ingredient}/adjust', [IngredientController::class, 'adjust']);
        Route::get('ingredients/{ingredient}/movements', [IngredientController::class, 'movements']);
        Route::get('products/{product}/recipe', [RecipeController::class, 'show']);
        Route::put('products/{product}/recipe', [RecipeController::class, 'sync']);

        Route::apiResource('expenses', ExpenseController::class);
        Route::apiResource('promotions', PromotionController::class);

        Route::apiResource('tables', AdminTableController::class)->except(['index', 'show']);
        Route::post('tables/{table}/regenerate', [AdminTableController::class, 'regenerate']);

        Route::get('dashboard', [ReportController::class, 'dashboard']);
        Route::get('reports/sales', [ReportController::class, 'sales']);
        Route::get('reports/products', [ReportController::class, 'products']);
        Route::get('reports/inventory', [ReportController::class, 'inventory']);
        Route::get('reports/expenses', [ReportController::class, 'expenses']);
    });
});
