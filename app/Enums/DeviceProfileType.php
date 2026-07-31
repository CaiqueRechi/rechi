<?php

namespace App\Enums;

enum DeviceProfileType: string
{
    case Kiosk = 'kiosk';

    public function label(): string
    {
        return match ($this) {
            self::Kiosk => 'Modo quiosque',
        };
    }
}
