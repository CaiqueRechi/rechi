<?php

namespace App\Http\Controllers;

use App\Services\Integrations\IntegrationManager;
use Inertia\Inertia;
use Inertia\Response;

class AltTabController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(IntegrationManager $integrationManager): Response
    {
        return Inertia::render('alt-tab', [
            'integrations' => $integrationManager->publicData(),
        ]);
    }
}
