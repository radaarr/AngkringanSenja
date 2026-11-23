<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminCatalogTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\DatabaseSeeder::class);
    }

    public function test_owner_can_list_products_and_categories(): void
    {
        $owner = User::where('email', 'owner@angkringan.test')->firstOrFail();
        Sanctum::actingAs($owner);

        $products = $this->getJson('/api/v1/admin/products')->assertOk();
        $this->assertNotEmpty($products->json('data'));

        $categories = $this->getJson('/api/v1/admin/categories')->assertOk();
        $this->assertNotEmpty($categories->json('data'));
    }
}
