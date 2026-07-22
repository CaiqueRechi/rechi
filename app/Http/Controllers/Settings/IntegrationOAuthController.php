<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\IntegrationProvider;
use App\Models\IntegrationConnection;
use App\Services\Integrations\IntegrationManager;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class IntegrationOAuthController extends Controller
{
    public function __construct(private IntegrationManager $integrationManager) {}

    public function redirect(Request $request, IntegrationProvider $provider): RedirectResponse
    {
        $connection = IntegrationConnection::query()->where('provider', $provider)->firstOrFail();
        $credentials = $connection->credentials;
        $callbackUrl = route('settings.integrations.callback', $provider);

        if ($provider === IntegrationProvider::Steam) {
            return redirect()->away('https://steamcommunity.com/openid/login?'.http_build_query([
                'openid.ns' => 'http://specs.openid.net/auth/2.0',
                'openid.mode' => 'checkid_setup',
                'openid.return_to' => $callbackUrl,
                'openid.realm' => config('app.url'),
                'openid.identity' => 'http://specs.openid.net/auth/2.0/identifier_select',
                'openid.claimed_id' => 'http://specs.openid.net/auth/2.0/identifier_select',
            ]));
        }

        abort_unless(
            filled(Arr::get($credentials, 'client_id')) && filled(Arr::get($credentials, 'client_secret')),
            Response::HTTP_UNPROCESSABLE_ENTITY,
            'Save the client ID and client secret before connecting.',
        );

        $state = Str::random(48);
        $request->session()->put("integration_oauth_state.{$provider->value}", $state);

        return redirect()->away($this->authorizationUrl($provider, $credentials, $callbackUrl, $state));
    }

    public function callback(Request $request, IntegrationProvider $provider): RedirectResponse
    {
        $connection = IntegrationConnection::query()->where('provider', $provider)->firstOrFail();

        if ($provider === IntegrationProvider::Steam) {
            return $this->completeSteamConnection($request, $connection);
        }

        if ($request->filled('error')) {
            return to_route('settings.integrations.index')->withErrors([
                'integration' => $request->string('error_description', $request->string('error'))->toString(),
            ]);
        }

        $expectedState = (string) $request->session()->pull("integration_oauth_state.{$provider->value}");
        abort_unless($expectedState !== '' && hash_equals($expectedState, $request->string('state')->toString()), Response::HTTP_FORBIDDEN);

        $credentials = $connection->credentials;
        $token = $this->exchangeAuthorizationCode(
            $provider,
            $credentials,
            $request->string('code')->toString(),
            route('settings.integrations.callback', $provider),
        );
        $credentials = [
            ...$credentials,
            'access_token' => Arr::get($token, 'access_token'),
            'refresh_token' => Arr::get($token, 'refresh_token', Arr::get($credentials, 'refresh_token')),
            'token_expires_at' => now()->addSeconds((int) Arr::get($token, 'expires_in', 3600))->toIso8601String(),
        ];
        $profile = $this->fetchProfile($provider, (string) $credentials['access_token']);

        $connection->update([
            'credentials' => $credentials,
            'status' => 'connected',
            'account_id' => $profile['id'],
            'account_name' => $profile['name'],
            'account_avatar_url' => $profile['avatarUrl'],
            'connected_at' => now(),
            'last_error' => null,
        ]);

        try {
            $this->integrationManager->synchronize($connection->fresh());
        } catch (Throwable) {
            // The connection is valid even when the provider has no activity yet.
        }

        return to_route('settings.integrations.index')->with('status', "{$provider->label()} connected.");
    }

    /** @param array<string, mixed> $credentials */
    private function authorizationUrl(IntegrationProvider $provider, array $credentials, string $callbackUrl, string $state): string
    {
        [$baseUrl, $scope] = match ($provider) {
            IntegrationProvider::Spotify => ['https://accounts.spotify.com/authorize', 'user-read-private user-read-currently-playing user-read-recently-played'],
            IntegrationProvider::WakaTime => ['https://wakatime.com/oauth/authorize', 'read_logged_time,read_stats'],
            IntegrationProvider::Discord => ['https://discord.com/oauth2/authorize', 'identify'],
            default => abort(Response::HTTP_UNPROCESSABLE_ENTITY, 'This provider does not support OAuth.'),
        };

        return $baseUrl.'?'.http_build_query([
            'client_id' => Arr::get($credentials, 'client_id'),
            'redirect_uri' => $callbackUrl,
            'response_type' => 'code',
            'scope' => $scope,
            'state' => $state,
        ]);
    }

    /**
     * @param  array<string, mixed>  $credentials
     * @return array<string, mixed>
     */
    private function exchangeAuthorizationCode(IntegrationProvider $provider, array $credentials, string $code, string $callbackUrl): array
    {
        $client = $this->client()->asForm();
        $payload = [
            'grant_type' => 'authorization_code',
            'code' => $code,
            'redirect_uri' => $callbackUrl,
            'client_id' => Arr::get($credentials, 'client_id'),
            'client_secret' => Arr::get($credentials, 'client_secret'),
        ];

        $response = match ($provider) {
            IntegrationProvider::Spotify => $client
                ->withBasicAuth((string) $payload['client_id'], (string) $payload['client_secret'])
                ->post('https://accounts.spotify.com/api/token', Arr::except($payload, ['client_id', 'client_secret'])),
            IntegrationProvider::WakaTime => $client->post('https://wakatime.com/oauth/token', $payload),
            IntegrationProvider::Discord => $client->post('https://discord.com/api/oauth2/token', $payload),
            default => abort(Response::HTTP_UNPROCESSABLE_ENTITY),
        };

        return $response->throw()->json();
    }

    /** @return array{id: string, name: string, avatarUrl: string|null} */
    private function fetchProfile(IntegrationProvider $provider, string $accessToken): array
    {
        $response = match ($provider) {
            IntegrationProvider::Spotify => $this->client()->withToken($accessToken)->get('https://api.spotify.com/v1/me'),
            IntegrationProvider::WakaTime => $this->client()->withToken($accessToken)->get('https://wakatime.com/api/v1/users/current'),
            IntegrationProvider::Discord => $this->client()->withToken($accessToken)->get('https://discord.com/api/users/@me'),
            default => abort(Response::HTTP_UNPROCESSABLE_ENTITY),
        };
        $data = $response->throw()->json();

        if ($provider === IntegrationProvider::Spotify) {
            return [
                'id' => (string) Arr::get($data, 'id'),
                'name' => (string) Arr::get($data, 'display_name'),
                'avatarUrl' => Arr::get($data, 'images.0.url'),
            ];
        }

        if ($provider === IntegrationProvider::WakaTime) {
            return [
                'id' => (string) Arr::get($data, 'data.id'),
                'name' => (string) Arr::get($data, 'data.display_name', Arr::get($data, 'data.username')),
                'avatarUrl' => Arr::get($data, 'data.photo'),
            ];
        }

        return [
            'id' => (string) Arr::get($data, 'id'),
            'name' => (string) Arr::get($data, 'global_name', Arr::get($data, 'username')),
            'avatarUrl' => Arr::get($data, 'avatar')
                ? 'https://cdn.discordapp.com/avatars/'.Arr::get($data, 'id').'/'.Arr::get($data, 'avatar').'.png'
                : null,
        ];
    }

    private function completeSteamConnection(Request $request, IntegrationConnection $connection): RedirectResponse
    {
        $verificationPayload = $request->query();
        $verificationPayload['openid.mode'] = 'check_authentication';
        $verification = $this->client()->asForm()->post('https://steamcommunity.com/openid/login', $verificationPayload)->throw()->body();
        abort_unless(Str::contains($verification, 'is_valid:true'), Response::HTTP_FORBIDDEN);

        $claimedId = (string) Arr::get($request->query(), 'openid.claimed_id');
        $steamId = Str::afterLast($claimedId, '/');
        abort_unless((bool) preg_match('/^\d{17}$/', $steamId), Response::HTTP_UNPROCESSABLE_ENTITY);

        $credentials = [...$connection->credentials, 'steam_id' => $steamId];
        $accountName = $steamId;
        $avatarUrl = null;

        if (filled(Arr::get($credentials, 'api_key'))) {
            $profile = $this->client()->get('https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/', [
                'key' => Arr::get($credentials, 'api_key'),
                'steamids' => $steamId,
            ])->throw()->json('response.players.0', []);
            $accountName = (string) Arr::get($profile, 'personaname', $steamId);
            $avatarUrl = Arr::get($profile, 'avatarfull');
        }

        $connection->update([
            'credentials' => $credentials,
            'status' => 'connected',
            'account_id' => $steamId,
            'account_name' => $accountName,
            'account_avatar_url' => $avatarUrl,
            'connected_at' => now(),
            'last_error' => null,
        ]);

        try {
            $this->integrationManager->synchronize($connection->fresh());
        } catch (Throwable) {
            // The Steam identity remains connected when activity is private or empty.
        }

        return to_route('settings.integrations.index')->with('status', 'Steam connected.');
    }

    private function client(): PendingRequest
    {
        return Http::acceptJson()->connectTimeout(3)->timeout(8)->retry([100, 300]);
    }
}
