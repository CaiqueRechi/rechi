<?php

namespace Tests\Feature;

use App\IntegrationProvider;
use App\Models\IntegrationActivity;
use App\Models\IntegrationConnection;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class MeTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config()->set('services.integrations.encryption_key', 'base64:'.base64_encode(str_repeat('m', 32)));
    }

    public function test_personal_profile_is_public_and_labels_skeleton_data(): void
    {
        $this->get(route('me'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('me')
                ->where('integrations.steam.connected', false)
                ->where('integrations.steam.isDemo', true)
                ->where('integrations.wakatime.isDemo', true)
                ->has('integrations', 5));
    }

    public function test_personal_profile_exposes_activity_but_never_credentials(): void
    {
        $connection = IntegrationConnection::factory()->create([
            'provider' => IntegrationProvider::Steam,
            'credentials' => ['api_key' => 'never-render-this-steam-key', 'steam_id' => '76561198000000000'],
            'status' => 'connected',
            'account_name' => 'SpookyPlayer',
        ]);
        IntegrationActivity::factory()->create([
            'integration_connection_id' => $connection->id,
            'provider' => IntegrationProvider::Steam,
            'external_id' => '730',
            'activity_type' => 'game',
            'payload' => [
                'appId' => 730,
                'title' => 'Night Shift',
                'minutesPlayed' => 6660,
                'minutesPlayedTwoWeeks' => 180,
            ],
        ]);

        $response = $this->get(route('me'));

        $response->assertInertia(fn (Assert $page) => $page
            ->where('integrations.steam.connected', true)
            ->where('integrations.steam.isDemo', false)
            ->where('integrations.steam.account.name', 'SpookyPlayer')
            ->where('integrations.steam.activities.0.title', 'Night Shift')
            ->where('integrations.steam.activities.0.minutesPlayed', 6660));
        $response->assertDontSee('never-render-this-steam-key');
    }
}
