<?php

use App\Http\Controllers\Api\V1\DeviceConfigurationController;
use App\Services\DeviceManagement\JwtSigningException;
use App\Services\DeviceManagement\Rs256JwtSigner;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->name('api.v1.')->group(function () {
    Route::get('device-configuration/public-key', function (Rs256JwtSigner $signer) {
        try {
            $publicKey = $signer->publicKeyBase64();
        } catch (JwtSigningException $exception) {
            report($exception);

            return response()->json(['message' => 'Device JWT signing key is unavailable.'], 503)
                ->header('Cache-Control', 'no-store, private')
                ->header('X-Content-Type-Options', 'nosniff');
        }

        return response()->json([
            'public_key_base64' => $publicKey,
            'issuer' => (string) config('device-management.jwt.issuer'),
            'audience' => (string) config('device-management.jwt.audience'),
            'ttl_seconds' => min(max((int) config('device-management.jwt.ttl_seconds', 300), 60), 900),
        ])->header('Cache-Control', 'no-store, private')
            ->header('X-Content-Type-Options', 'nosniff');
    })->middleware('throttle:device-configuration')->name('device-configuration.public-key');

    Route::get('devices/{deviceId}/configuration', DeviceConfigurationController::class)
        ->whereUuid('deviceId')
        ->middleware('throttle:device-configuration')
        ->name('devices.configuration');
});
