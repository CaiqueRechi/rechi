<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\DeviceManagement\DeviceConfigurationIssuer;
use App\Services\DeviceManagement\JwtSigningException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Response;
use InvalidArgumentException;
use Throwable;

class DeviceConfigurationController extends Controller
{
    public function __construct(private DeviceConfigurationIssuer $issuer) {}

    public function __invoke(string $deviceId): Response
    {
        try {
            $token = $this->issuer->issue($deviceId);
        } catch (InvalidArgumentException|ModelNotFoundException) {
            abort(404);
        } catch (JwtSigningException $exception) {
            report($exception);

            return response('', 503)
                ->header('Cache-Control', 'no-store, private')
                ->header('X-Content-Type-Options', 'nosniff');
        } catch (Throwable $exception) {
            report($exception);

            return response('', 503)
                ->header('Cache-Control', 'no-store, private')
                ->header('X-Content-Type-Options', 'nosniff');
        }

        return response($token, 200)
            ->header('Content-Type', 'application/jwt')
            ->header('Cache-Control', 'no-store, private')
            ->header('Pragma', 'no-cache')
            ->header('X-Content-Type-Options', 'nosniff');
    }
}
