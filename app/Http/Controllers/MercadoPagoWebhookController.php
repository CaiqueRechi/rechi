<?php

namespace App\Http\Controllers;

use App\IntegrationProvider;
use App\Models\IntegrationConnection;
use App\Models\PaymentEvent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class MercadoPagoWebhookController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $signature = $request->header('x-signature');
        $requestId = $request->header('x-request-id');
        $resourceId = (string) Arr::get($request->input('data', []), 'id', $request->query('data.id'));
        $secret = $this->webhookSecret();

        if ($secret !== null && ! $this->hasValidSignature($secret, $signature, $requestId, $resourceId)) {
            abort(Response::HTTP_FORBIDDEN);
        }

        $eventId = (string) $request->input('id', $request->input('event_id', $requestId ?: Str::uuid()));
        $event = PaymentEvent::query()->firstOrCreate(
            [
                'gateway' => 'mercado_pago',
                'external_event_id' => $eventId,
            ],
            [
                'external_resource_id' => $resourceId !== '' ? $resourceId : null,
                'event_type' => (string) $request->input('type', $request->input('action', 'unknown')),
                'signature_hash' => $signature ? hash('sha256', $signature) : null,
                'payload' => $request->all(),
            ],
        );

        return response()->json([
            'received' => true,
            'duplicate' => ! $event->wasRecentlyCreated,
        ]);
    }

    private function webhookSecret(): ?string
    {
        $connection = IntegrationConnection::query()
            ->where('provider', IntegrationProvider::MercadoPago)
            ->first();

        $secret = $connection?->credentials['webhook_secret'] ?? null;

        return is_string($secret) && $secret !== '' ? $secret : null;
    }

    private function hasValidSignature(?string $secret, ?string $signature, ?string $requestId, string $resourceId): bool
    {
        if ($secret === null || $signature === null || $requestId === null || $resourceId === '') {
            return false;
        }

        $parts = collect(explode(',', $signature))
            ->mapWithKeys(function (string $part): array {
                [$key, $value] = array_pad(explode('=', trim($part), 2), 2, null);

                return $key && $value ? [$key => $value] : [];
            });

        $timestamp = (string) $parts->get('ts');
        $received = (string) $parts->get('v1');
        $manifest = "id:{$resourceId};request-id:{$requestId};ts:{$timestamp};";
        $expected = hash_hmac('sha256', $manifest, $secret);

        return $timestamp !== '' && $received !== '' && hash_equals($expected, $received);
    }
}
