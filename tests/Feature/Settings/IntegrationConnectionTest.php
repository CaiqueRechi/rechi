<?php

namespace Tests\Feature\Settings;

use App\IntegrationProvider;
use App\Models\IntegrationConnection;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class IntegrationConnectionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config()->set('services.integrations.encryption_key', 'base64:'.base64_encode(str_repeat('s', 32)));
    }

    public function test_only_admins_can_open_app_keys_settings(): void
    {
        $this->get(route('settings.integrations.index'))->assertRedirect(route('login'));

        $this->actingAs(User::factory()->create())
            ->get(route('settings.integrations.index'))
            ->assertForbidden();

        $this->actingAs(User::factory()->admin()->create())
            ->get(route('settings.integrations.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('settings/general/app-keys')
                ->has('integrations', 5));
    }

    public function test_credentials_are_encrypted_and_never_returned_to_inertia(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->put(route('settings.integrations.update'), [
            'provider' => 'spotify',
            'client_id' => 'spotify-client-id',
            'client_secret' => 'spotify-super-secret',
        ])->assertRedirect();

        $connection = IntegrationConnection::query()->where('provider', IntegrationProvider::Spotify)->firstOrFail();
        $rawCredentials = (string) DB::table($connection->getTable())->where('id', $connection->id)->value('credentials');

        $this->assertStringNotContainsString('spotify-super-secret', $rawCredentials);
        $this->assertSame('spotify-super-secret', $connection->credentials['client_secret']);

        $this->actingAs($admin)
            ->get(route('settings.integrations.index'))
            ->assertInertia(fn (Assert $page) => $page
                ->where('integrations.0.fields.1.value', '')
                ->where('integrations.0.fields.1.configured', true));
    }

    public function test_blank_secret_fields_preserve_existing_values(): void
    {
        $admin = User::factory()->admin()->create();
        IntegrationConnection::factory()->create([
            'provider' => IntegrationProvider::Spotify,
            'credentials' => ['client_id' => 'existing-id', 'client_secret' => 'existing-secret'],
        ]);

        $this->actingAs($admin)->put(route('settings.integrations.update'), [
            'provider' => 'spotify',
            'client_id' => '',
            'client_secret' => '',
        ])->assertRedirect();

        $credentials = IntegrationConnection::query()->firstOrFail()->credentials;
        $this->assertSame('existing-id', $credentials['client_id']);
        $this->assertSame('existing-secret', $credentials['client_secret']);
    }

    public function test_spotify_oauth_callback_stores_tokens_and_activity(): void
    {
        Http::preventStrayRequests();
        Http::fake([
            'https://accounts.spotify.com/api/token' => Http::response([
                'access_token' => 'oauth-access-token',
                'refresh_token' => 'oauth-refresh-token',
                'expires_in' => 3600,
            ]),
            'https://api.spotify.com/v1/me' => Http::response([
                'id' => 'listener-1',
                'display_name' => 'Caique',
                'images' => [['url' => 'https://images.example/avatar.png']],
            ]),
            'https://api.spotify.com/v1/me/player/recently-played*' => Http::response([
                'items' => [[
                    'played_at' => now()->toIso8601String(),
                    'track' => [
                        'id' => 'track-1',
                        'name' => 'Real Track',
                        'artists' => [['name' => 'Real Artist']],
                        'album' => ['images' => []],
                        'external_urls' => ['spotify' => 'https://open.spotify.com/track/track-1'],
                    ],
                ]],
            ]),
        ]);

        $admin = User::factory()->admin()->create();
        IntegrationConnection::factory()->create([
            'provider' => IntegrationProvider::Spotify,
            'status' => 'configured',
            'credentials' => ['client_id' => 'client-id', 'client_secret' => 'client-secret'],
        ]);

        $this->actingAs($admin)
            ->withSession(['integration_oauth_state.spotify' => 'valid-state'])
            ->get(route('settings.integrations.callback', [
                'provider' => 'spotify',
                'state' => 'valid-state',
                'code' => 'authorization-code',
            ]))
            ->assertRedirect(route('settings.integrations.index'));

        $connection = IntegrationConnection::query()->firstOrFail();
        $this->assertSame('connected', $connection->status);
        $this->assertSame('oauth-access-token', $connection->credentials['access_token']);
        $this->assertSame('Caique', $connection->account_name);
        $this->assertCount(1, $connection->activities);
    }
}
