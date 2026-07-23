<?php

namespace App\Http\Controllers;

use App\Services\Integrations\IntegrationManager;
use Inertia\Inertia;
use Inertia\Response;

class MeController extends Controller
{
    public function __invoke(IntegrationManager $integrationManager): Response
    {
        return Inertia::render('me', [
            'integrations' => $integrationManager->publicData(24),
        ]);
    }
}
