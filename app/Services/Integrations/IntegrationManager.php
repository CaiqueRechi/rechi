<?php

namespace App\Services\Integrations;

use App\IntegrationProvider;
use App\Models\IntegrationActivity;
use App\Models\IntegrationConnection;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Arr;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Throwable;

class IntegrationManager
{
    /** @return array<string, array<string, mixed>> */
    public function publicData(): array
    {
        $connections = IntegrationConnection::query()
            ->with(['activities' => fn ($query) => $query->latest('occurred_at')->limit(12)])
            ->get()
            ->keyBy(fn (IntegrationConnection $connection) => $connection->provider->value);

        return collect(IntegrationProvider::cases())
            ->mapWithKeys(function (IntegrationProvider $provider) use ($connections): array {
                $connection = $connections->get($provider->value);
                $activities = $connection?->activities ?? collect();
                $isDemo = ! $connection || $connection->status !== 'connected' || $activities->isEmpty();

                return [$provider->value => [
                    'provider' => $provider->value,
                    'label' => $provider->label(),
                    'connected' => $connection?->status === 'connected',
                    'isDemo' => $isDemo,
                    'notice' => $isDemo ? 'Demo data — this integration is not connected yet.' : null,
                    'account' => $connection ? [
                        'name' => $connection->account_name,
                        'avatarUrl' => $connection->account_avatar_url,
                    ] : null,
                    'lastSyncedAt' => $connection?->last_synced_at?->toIso8601String(),
                    'activities' => $isDemo
                        ? $this->demoActivities($provider)
                        : $activities->map(fn (IntegrationActivity $activity) => [
                            ...$activity->payload,
                            'occurredAt' => $activity->occurred_at->toIso8601String(),
                        ])->values()->all(),
                ]];
            })
            ->all();
    }

    /** @return array<string, mixed> */
    public function settingsData(): array
    {
        $connections = IntegrationConnection::query()->get()->keyBy(
            fn (IntegrationConnection $connection) => $connection->provider->value,
        );

        return collect(IntegrationProvider::cases())->map(function (IntegrationProvider $provider) use ($connections): array {
            $connection = $connections->get($provider->value);
            $credentials = $connection?->credentials ?? [];

            return [
                'provider' => $provider->value,
                'label' => $provider->label(),
                'fields' => collect($provider->fields())->map(fn (string $field) => [
                    'name' => $field,
                    'label' => Str::of($field)->replace('_', ' ')->title()->toString(),
                    'configured' => filled(Arr::get($credentials, $field)),
                    'secret' => Str::contains($field, ['key', 'secret']),
                    'value' => Str::contains($field, ['key', 'secret']) ? '' : (string) Arr::get($credentials, $field, ''),
                ])->values()->all(),
                'status' => $connection?->status ?? 'disconnected',
                'accountName' => $connection?->account_name,
                'lastSyncedAt' => $connection?->last_synced_at?->toIso8601String(),
                'lastError' => $connection?->last_error,
                'automaticConnection' => $provider->supportsAutomaticConnection(),
                'canConnect' => $connection !== null && match ($provider) {
                    IntegrationProvider::Steam => true,
                    IntegrationProvider::LastFm => false,
                    default => filled(Arr::get($credentials, 'client_id')) && filled(Arr::get($credentials, 'client_secret')),
                },
                'callbackUrl' => route('settings.integrations.callback', $provider),
            ];
        })->values()->all();
    }

    /** @param array<string, mixed> $input */
    public function saveCredentials(IntegrationProvider $provider, array $input): IntegrationConnection
    {
        $connection = IntegrationConnection::query()->firstOrNew(['provider' => $provider]);
        $credentials = $connection->exists ? $connection->credentials : [];

        foreach ($provider->fields() as $field) {
            if (filled(Arr::get($input, $field))) {
                $credentials[$field] = $input[$field];
            }
        }

        $connection->fill([
            'credentials' => $credentials,
            'status' => $this->hasRequiredConfiguration($provider, $credentials) ? 'configured' : 'disconnected',
            'last_error' => null,
        ])->save();

        return $connection;
    }

    public function synchronize(IntegrationConnection $connection): void
    {
        try {
            $activities = $this->fetchActivities($connection);

            foreach ($activities as $activity) {
                $connection->activities()->updateOrCreate(
                    [
                        'external_id' => $activity['externalId'],
                        'activity_type' => $activity['activityType'],
                    ],
                    [
                        'provider' => $connection->provider,
                        'payload' => $activity['payload'],
                        'occurred_at' => $activity['occurredAt'],
                    ],
                );
            }

            $connection->update([
                'status' => 'connected',
                'connected_at' => $connection->connected_at ?? now(),
                'last_synced_at' => now(),
                'last_error' => null,
            ]);
        } catch (Throwable $exception) {
            report($exception);
            $connection->update(['last_error' => Str::limit($exception->getMessage(), 1000)]);
            throw $exception;
        }
    }

    public function disconnect(IntegrationConnection $connection): void
    {
        $preserved = Arr::only($connection->credentials, $connection->provider->fields());
        $connection->update([
            'credentials' => $preserved,
            'status' => $preserved === [] ? 'disconnected' : 'configured',
            'account_id' => null,
            'account_name' => null,
            'account_avatar_url' => null,
            'connected_at' => null,
            'last_error' => null,
        ]);
    }

    /** @return list<array{externalId: string, activityType: string, payload: array<string, mixed>, occurredAt: Carbon}> */
    private function fetchActivities(IntegrationConnection $connection): array
    {
        return match ($connection->provider) {
            IntegrationProvider::Spotify => $this->fetchSpotify($connection),
            IntegrationProvider::Steam => $this->fetchSteam($connection),
            IntegrationProvider::LastFm => $this->fetchLastFm($connection),
            IntegrationProvider::WakaTime => $this->fetchWakaTime($connection),
            IntegrationProvider::Discord => $this->fetchDiscord($connection),
        };
    }

    /** @return list<array{externalId: string, activityType: string, payload: array<string, mixed>, occurredAt: Carbon}> */
    private function fetchSpotify(IntegrationConnection $connection): array
    {
        $response = $this->client()->withToken($this->validAccessToken($connection))
            ->get('https://api.spotify.com/v1/me/player/recently-played', ['limit' => 12])->throw();

        return collect($response->json('items', []))->map(fn (array $item) => [
            'externalId' => (string) Arr::get($item, 'track.id', Str::uuid()),
            'activityType' => 'track',
            'payload' => [
                'title' => Arr::get($item, 'track.name'),
                'subtitle' => collect(Arr::get($item, 'track.artists', []))->pluck('name')->join(', '),
                'imageUrl' => Arr::get($item, 'track.album.images.0.url'),
                'url' => Arr::get($item, 'track.external_urls.spotify'),
            ],
            'occurredAt' => Carbon::parse(Arr::get($item, 'played_at', now())),
        ])->all();
    }

    /** @return list<array{externalId: string, activityType: string, payload: array<string, mixed>, occurredAt: Carbon}> */
    private function fetchSteam(IntegrationConnection $connection): array
    {
        $credentials = $connection->credentials;
        $response = $this->client()->get('https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/', [
            'key' => Arr::get($credentials, 'api_key'),
            'steamid' => Arr::get($credentials, 'steam_id'),
            'format' => 'json',
        ])->throw();

        return collect($response->json('response.games', []))->map(fn (array $game) => [
            'externalId' => (string) Arr::get($game, 'appid'),
            'activityType' => 'game',
            'payload' => [
                'title' => Arr::get($game, 'name'),
                'subtitle' => round(((int) Arr::get($game, 'playtime_2weeks', 0)) / 60, 1).'h in the last two weeks',
                'imageUrl' => 'https://cdn.cloudflare.steamstatic.com/steam/apps/'.Arr::get($game, 'appid').'/header.jpg',
                'minutesPlayed' => Arr::get($game, 'playtime_forever', 0),
            ],
            'occurredAt' => now(),
        ])->all();
    }

    /** @return list<array{externalId: string, activityType: string, payload: array<string, mixed>, occurredAt: Carbon}> */
    private function fetchLastFm(IntegrationConnection $connection): array
    {
        $credentials = $connection->credentials;
        $response = $this->client()->get('https://ws.audioscrobbler.com/2.0/', [
            'method' => 'user.getrecenttracks',
            'user' => Arr::get($credentials, 'username'),
            'api_key' => Arr::get($credentials, 'api_key'),
            'format' => 'json',
            'limit' => 12,
        ])->throw();

        return collect($response->json('recenttracks.track', []))->map(fn (array $track, int $index) => [
            'externalId' => sha1((string) Arr::get($track, 'url').Arr::get($track, 'date.uts', $index)),
            'activityType' => 'track',
            'payload' => [
                'title' => Arr::get($track, 'name'),
                'subtitle' => Arr::get($track, 'artist.#text'),
                'imageUrl' => Arr::get($track, 'image.3.#text'),
                'url' => Arr::get($track, 'url'),
                'nowPlaying' => Arr::get($track, '@attr.nowplaying') === 'true',
            ],
            'occurredAt' => Carbon::createFromTimestamp((int) Arr::get($track, 'date.uts', now()->timestamp)),
        ])->all();
    }

    /** @return list<array{externalId: string, activityType: string, payload: array<string, mixed>, occurredAt: Carbon}> */
    private function fetchWakaTime(IntegrationConnection $connection): array
    {
        $response = $this->client()->withToken($this->validAccessToken($connection))
            ->get('https://wakatime.com/api/v1/users/current/summaries', [
                'start' => today()->toDateString(),
                'end' => today()->toDateString(),
            ])->throw();

        return collect($response->json('data.0.projects', []))->map(fn (array $project) => [
            'externalId' => sha1((string) Arr::get($project, 'name').today()->toDateString()),
            'activityType' => 'coding',
            'payload' => [
                'title' => Arr::get($project, 'name'),
                'subtitle' => Arr::get($project, 'text'),
                'seconds' => Arr::get($project, 'total_seconds', 0),
            ],
            'occurredAt' => now(),
        ])->all();
    }

    /** @return list<array{externalId: string, activityType: string, payload: array<string, mixed>, occurredAt: Carbon}> */
    private function fetchDiscord(IntegrationConnection $connection): array
    {
        $guildId = (string) Arr::get($connection->credentials, 'guild_id');
        $response = $this->client()->get("https://discord.com/api/guilds/{$guildId}/widget.json")->throw();

        return collect($response->json('members', []))->take(12)->map(fn (array $member) => [
            'externalId' => (string) Arr::get($member, 'id', Str::uuid()),
            'activityType' => 'community',
            'payload' => [
                'title' => Arr::get($member, 'username'),
                'subtitle' => Arr::get($member, 'game.name', 'Online in the community'),
                'imageUrl' => Arr::get($member, 'avatar_url'),
                'status' => Arr::get($member, 'status'),
            ],
            'occurredAt' => now(),
        ])->all();
    }

    private function client(): PendingRequest
    {
        return Http::acceptJson()->connectTimeout(3)->timeout(8)->retry([100, 300]);
    }

    private function validAccessToken(IntegrationConnection $connection): string
    {
        $credentials = $connection->credentials;
        $expiresAt = Arr::get($credentials, 'token_expires_at');
        $accessToken = (string) Arr::get($credentials, 'access_token');

        if ($accessToken !== '' && (! $expiresAt || Carbon::parse($expiresAt)->isAfter(now()->addMinute()))) {
            return $accessToken;
        }

        $refreshToken = (string) Arr::get($credentials, 'refresh_token');
        abort_unless($refreshToken !== '', 422, 'Reconnect this provider to renew its authorization.');

        $payload = [
            'grant_type' => 'refresh_token',
            'refresh_token' => $refreshToken,
            'client_id' => Arr::get($credentials, 'client_id'),
            'client_secret' => Arr::get($credentials, 'client_secret'),
        ];
        $client = $this->client()->asForm();
        $response = match ($connection->provider) {
            IntegrationProvider::Spotify => $client
                ->withBasicAuth((string) $payload['client_id'], (string) $payload['client_secret'])
                ->post('https://accounts.spotify.com/api/token', Arr::except($payload, ['client_id', 'client_secret'])),
            IntegrationProvider::WakaTime => $client->post('https://wakatime.com/oauth/token', $payload),
            IntegrationProvider::Discord => $client->post('https://discord.com/api/oauth2/token', $payload),
            default => abort(422, 'This provider does not use renewable access tokens.'),
        };
        $token = $response->throw()->json();
        $credentials = [
            ...$credentials,
            'access_token' => Arr::get($token, 'access_token'),
            'refresh_token' => Arr::get($token, 'refresh_token', $refreshToken),
            'token_expires_at' => now()->addSeconds((int) Arr::get($token, 'expires_in', 3600))->toIso8601String(),
        ];
        $connection->update(['credentials' => $credentials]);

        return (string) $credentials['access_token'];
    }

    /** @param array<string, mixed> $credentials */
    private function hasRequiredConfiguration(IntegrationProvider $provider, array $credentials): bool
    {
        return collect($provider->fields())->every(fn (string $field) => filled(Arr::get($credentials, $field)));
    }

    /** @return list<array<string, mixed>> */
    private function demoActivities(IntegrationProvider $provider): array
    {
        return match ($provider) {
            IntegrationProvider::Spotify => [
                ['title' => 'Neon Skyline', 'subtitle' => 'Synthetic Memory', 'meta' => 'demo track'],
                ['title' => 'Midnight Compiler', 'subtitle' => 'The Runtime', 'meta' => 'demo track'],
            ],
            IntegrationProvider::Steam => [
                ['title' => 'Signal // Lost', 'subtitle' => '7.4h in the last two weeks', 'meta' => 'demo game'],
                ['title' => 'Night City Builder', 'subtitle' => '42 achievements', 'meta' => 'demo game'],
            ],
            IntegrationProvider::LastFm => [
                ['title' => 'Offline Frequency', 'subtitle' => 'Demo Artist', 'meta' => 'demo scrobble'],
                ['title' => 'Static Hearts', 'subtitle' => 'No Connection', 'meta' => 'demo scrobble'],
            ],
            IntegrationProvider::WakaTime => [
                ['title' => 'rechi', 'subtitle' => '2 hrs 18 mins', 'meta' => 'demo coding time'],
                ['title' => 'TypeScript', 'subtitle' => '46% of coding time', 'meta' => 'demo language'],
            ],
            IntegrationProvider::Discord => [
                ['title' => 'Caique // demo', 'subtitle' => 'Building something after midnight', 'meta' => 'demo member'],
                ['title' => 'rechi-bot // demo', 'subtitle' => 'Disconnected', 'meta' => 'demo member'],
            ],
        };
    }
}
