<?php

namespace App\Enums;

enum PaymentStatus: string
{
    case Pending = 'pending';
    case Approved = 'approved';
    case Authorized = 'authorized';
    case Rejected = 'rejected';
    case Canceled = 'canceled';
    case Refunded = 'refunded';
    case ChargedBack = 'charged_back';
    case InProcess = 'in_process';
    case Unknown = 'unknown';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Pendente',
            self::Approved => 'Aprovado',
            self::Authorized => 'Autorizado',
            self::Rejected => 'Recusado',
            self::Canceled => 'Cancelado',
            self::Refunded => 'Reembolsado',
            self::ChargedBack => 'Chargeback',
            self::InProcess => 'Em processamento',
            self::Unknown => 'Desconhecido',
        };
    }
}
