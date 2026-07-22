<?php

namespace App\Enums;

enum OrderStatus: string
{
    case Pending = 'pending';
    case AwaitingPayment = 'awaiting_payment';
    case Paid = 'paid';
    case BriefingPending = 'briefing_pending';
    case BriefingReceived = 'briefing_received';
    case InProgress = 'in_progress';
    case AwaitingCustomer = 'awaiting_customer';
    case Review = 'review';
    case Completed = 'completed';
    case Canceled = 'canceled';
    case Refunded = 'refunded';
    case Failed = 'failed';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Pendente',
            self::AwaitingPayment => 'Aguardando pagamento',
            self::Paid => 'Pago',
            self::BriefingPending => 'Aguardando briefing',
            self::BriefingReceived => 'Briefing recebido',
            self::InProgress => 'Em produção',
            self::AwaitingCustomer => 'Aguardando cliente',
            self::Review => 'Em revisão',
            self::Completed => 'Concluído',
            self::Canceled => 'Cancelado',
            self::Refunded => 'Reembolsado',
            self::Failed => 'Falhou',
        };
    }
}
