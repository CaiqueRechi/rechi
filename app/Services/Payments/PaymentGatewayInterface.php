<?php

namespace App\Services\Payments;

use App\Models\Order;
use App\Models\Payment;

interface PaymentGatewayInterface
{
    public function createCheckout(Order $order): Payment;
}
