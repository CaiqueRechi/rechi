<?php

namespace App;

enum IntegrationProvider: string
{
    case Spotify = 'spotify';
    case Steam = 'steam';
    case LastFm = 'lastfm';
    case WakaTime = 'wakatime';
    case Discord = 'discord';

    /** @return list<string> */
    public function fields(): array
    {
        return match ($this) {
            self::Spotify => ['client_id', 'client_secret'],
            self::Steam => ['api_key', 'steam_id'],
            self::LastFm => ['api_key', 'username'],
            self::WakaTime => ['client_id', 'client_secret'],
            self::Discord => ['client_id', 'client_secret', 'guild_id'],
        };
    }

    public function label(): string
    {
        return match ($this) {
            self::Spotify => 'Spotify',
            self::Steam => 'Steam',
            self::LastFm => 'Last.fm',
            self::WakaTime => 'WakaTime',
            self::Discord => 'Discord',
        };
    }

    public function supportsAutomaticConnection(): bool
    {
        return $this !== self::LastFm;
    }
}
