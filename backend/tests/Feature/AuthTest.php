<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\DatabaseSeeder::class);
    }

    private function statefulHeaders(): array
    {
        return ['Referer' => 'http://localhost:5173'];
    }

    public function test_staff_can_login_and_get_me(): void
    {
        $this->withHeaders($this->statefulHeaders())->get('/sanctum/csrf-cookie')->assertNoContent();
        $response = $this->withHeaders($this->statefulHeaders())->postJson('/api/v1/auth/login', [
            'email' => 'owner@angkringan.test',
            'password' => 'password',
        ]);
        $response->assertOk()->assertJsonPath('data.role.slug', 'owner');

        $this->withHeaders($this->statefulHeaders())->getJson('/api/v1/auth/me')
            ->assertOk()
            ->assertJsonPath('data.email', 'owner@angkringan.test');
    }

    public function test_login_fails_with_invalid_credentials(): void
    {
        $this->withHeaders($this->statefulHeaders())->get('/sanctum/csrf-cookie')->assertNoContent();
        $this->withHeaders($this->statefulHeaders())->postJson('/api/v1/auth/login', [
            'email' => 'owner@angkringan.test',
            'password' => 'wrong',
        ])->assertUnprocessable();
    }

    public function test_inactive_user_cannot_login(): void
    {
        $role = Role::where('slug','owner')->first();
        $user = User::create([
            'name' => 'Inactive',
            'email' => 'inactive@angkringan.test',
            'password' => Hash::make('password'),
            'role_id' => $role->id,
            'is_active' => false,
        ]);
        $this->withHeaders($this->statefulHeaders())->get('/sanctum/csrf-cookie')->assertNoContent();
        $this->withHeaders($this->statefulHeaders())->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertUnprocessable();
    }

    public function test_unauthenticated_cannot_access_me(): void
    {
        $this->getJson('/api/v1/auth/me')->assertUnauthorized();
    }

    public function test_logout_invalidates_session(): void
    {
        $this->withHeaders($this->statefulHeaders())->get('/sanctum/csrf-cookie')->assertNoContent();
        $this->withHeaders($this->statefulHeaders())->postJson('/api/v1/auth/login', [
            'email' => 'owner@angkringan.test',
            'password' => 'password',
        ])->assertOk();
        $this->withHeaders($this->statefulHeaders())->postJson('/api/v1/auth/logout')->assertNoContent();
        $this->app['auth']->forgetGuards();
        $this->withHeaders($this->statefulHeaders())->getJson('/api/v1/auth/me')->assertUnauthorized();
    }
}
