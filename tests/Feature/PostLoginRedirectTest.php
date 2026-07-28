<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PostLoginRedirectTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_is_redirected_to_dashboard_after_login(): void
    {
        $owner = $this->createOwner(['password' => 'password']);

        $this->post(route('login'), [
            'email' => $owner->email,
            'password' => 'password',
        ])->assertRedirect(route('dashboard'));
    }

    public function test_regular_user_is_redirected_to_kanban_after_login(): void
    {
        $user = User::factory()->create(['password' => 'password']);

        $this->post(route('login'), [
            'email' => $user->email,
            'password' => 'password',
        ])->assertRedirect(route('kanban.boards.index'));
    }

    public function test_unauthorized_intended_url_is_not_preserved(): void
    {
        $user = User::factory()->create(['password' => 'password']);

        $this->withSession(['url.intended' => route('dashboard')])
            ->post(route('login'), [
                'email' => $user->email,
                'password' => 'password',
            ])
            ->assertRedirect(route('kanban.boards.index'));
    }
}
