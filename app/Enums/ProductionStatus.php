<?php

namespace App\Enums;

enum ProductionStatus: string
{
    case NotStarted = 'not_started';
    case BriefingPending = 'briefing_pending';
    case ReadyToStart = 'ready_to_start';
    case InProgress = 'in_progress';
    case AwaitingCustomer = 'awaiting_customer';
    case Review = 'review';
    case Delivered = 'delivered';
    case Archived = 'archived';

    public function label(): string
    {
        return match ($this) {
            self::NotStarted => 'Não iniciado',
            self::BriefingPending => 'Aguardando briefing',
            self::ReadyToStart => 'Pronto para iniciar',
            self::InProgress => 'Em produção',
            self::AwaitingCustomer => 'Aguardando cliente',
            self::Review => 'Em revisão',
            self::Delivered => 'Entregue',
            self::Archived => 'Arquivado',
        };
    }
}
