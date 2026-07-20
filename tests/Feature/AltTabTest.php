<?php

namespace Tests\Feature;

use App\IntegrationProvider;
use App\Models\IntegrationActivity;
use App\Models\IntegrationConnection;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AltTabTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config()->set('services.integrations.encryption_key', 'base64:'.base64_encode(str_repeat('s', 32)));
    }

    public function test_alt_tab_is_public_and_uses_labelled_demo_data_when_empty(): void
    {
        $this->get(route('alt-tab'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('alt-tab')
                ->where('integrations.spotify.connected', false)
                ->where('integrations.spotify.isDemo', true)
                ->where('integrations.spotify.notice', 'Demo data — this integration is not connected yet.')
                ->has('integrations.spotify.activities', 2)
                ->has('integrations.discord.activities', 2));

        $this->assertDatabaseCount('integration_connections', 0);
        $this->assertDatabaseCount('integration_activities', 0);
    }

    public function test_real_history_replaces_demo_data_without_exposing_credentials(): void
    {
        $connection = IntegrationConnection::factory()->create([
            'provider' => IntegrationProvider::Spotify,
            'credentials' => ['access_token' => 'never-render-this-token'],
            'status' => 'connected',
        ]);
        IntegrationActivity::factory()->create([
            'integration_connection_id' => $connection->id,
            'provider' => IntegrationProvider::Spotify,
            'external_id' => 'real-track',
            'payload' => ['title' => 'A real song', 'subtitle' => 'A real artist'],
        ]);

        $response = $this->get(route('alt-tab'));

        $response->assertInertia(fn (Assert $page) => $page
            ->where('integrations.spotify.isDemo', false)
            ->where('integrations.spotify.activities.0.title', 'A real song'));
        $response->assertDontSee('never-render-this-token');
    }
}
