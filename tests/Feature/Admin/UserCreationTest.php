<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserCreationTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_registration_routes_are_disabled(): void
    {
        $this->get('/register')->assertNotFound();
        $this->post('/register')->assertNotFound();
    }

    public function test_guests_are_redirected_to_login(): void
    {
        $this->get(route('users.create'))->assertRedirect(route('login'));
    }

    public function test_regular_users_cannot_access_user_creation(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('users.create'))
            ->assertForbidden();
    }

    public function test_authorized_users_can_access_user_creation(): void
    {
        $admin = User::factory()->create();
        $this->grantAccess($admin, ['users.create']);

        $this->actingAs($admin)
            ->get(route('users.create'))
            ->assertOk();
    }

    public function test_authorized_users_can_create_users(): void
    {
        $admin = User::factory()->create();
        $this->grantAccess($admin, ['users.create']);

        $this->actingAs($admin)
            ->post(route('users.store'), [
                'name' => 'Novo Usuário',
                'email' => 'novo@example.com',
                'password' => 'password',
                'password_confirmation' => 'password',
            ])
            ->assertRedirect(route('users.create'));

        $this->assertDatabaseHas('users', [
            'email' => 'novo@example.com',
            'is_admin' => false,
        ]);
        $this->assertDatabaseHas('access', [
            'user_id' => User::query()->where('email', 'novo@example.com')->value('id'),
        ]);
    }

    public function test_regular_users_cannot_create_users(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('users.store'), [
                'name' => 'Novo Usuário',
                'email' => 'novo@example.com',
                'password' => 'password',
                'password_confirmation' => 'password',
            ])
            ->assertForbidden();

        $this->assertDatabaseMissing('users', [
            'email' => 'novo@example.com',
        ]);
    }

    public function test_admin_command_creates_a_new_user_with_safe_access_defaults(): void
    {
        $this->artisan('app:create-admin', [
            'name' => 'Usuário Demo',
            'email' => 'demo@rechi.test',
        ])->assertSuccessful();

        $user = User::query()->where('email', 'demo@rechi.test')->firstOrFail();

        $this->assertTrue($user->is_admin);
        $this->assertTrue($user->is_active);
        $this->assertNotNull($user->email_verified_at);
        $this->assertDatabaseHas('access', ['user_id' => $user->id]);
        $this->assertTrue($user->access()->firstOrFail()->accesses['kanban']['view']);
        $this->assertFalse($user->access()->firstOrFail()->accesses['dashboard']['view']);
    }
}
