<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\UpdateIntegrationConnectionRequest;
use App\IntegrationProvider;
use App\Models\IntegrationConnection;
use App\Services\Integrations\IntegrationManager;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class IntegrationConnectionController extends Controller
{
    public function __construct(private IntegrationManager $integrationManager) {}

    public function index(Request $request): Response
    {
        return Inertia::render('settings/general/app-keys', [
            'integrations' => $this->integrationManager->settingsData(),
            'status' => $request->session()->get('status'),
        ]);
    }

    public function update(UpdateIntegrationConnectionRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $provider = IntegrationProvider::from($validated['provider']);
        $this->integrationManager->saveCredentials($provider, $validated);

        return back()->with('status', "{$provider->label()} settings saved securely.");
    }

    public function synchronize(IntegrationProvider $provider): RedirectResponse
    {
        $connection = IntegrationConnection::query()->where('provider', $provider)->firstOrFail();

        try {
            $this->integrationManager->synchronize($connection);
        } catch (Throwable) {
            return back()->withErrors(['integration' => "{$provider->label()} could not be synchronized. Check its credentials and status."]);
        }

        return back()->with('status', "{$provider->label()} synchronized.");
    }

    public function destroy(IntegrationProvider $provider): RedirectResponse
    {
        $connection = IntegrationConnection::query()->where('provider', $provider)->firstOrFail();
        $this->integrationManager->disconnect($connection);

        return back()->with('status', "{$provider->label()} disconnected. Saved history was preserved.");
    }
}
