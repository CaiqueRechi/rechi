<?php

use App\Http\Controllers\Api\V1\DeviceConfigurationController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->name('api.v1.')->group(function () {
    Route::get('devices/{deviceId}/configuration', DeviceConfigurationController::class)
        ->whereUuid('deviceId')
        ->middleware('throttle:device-configuration')
        ->name('devices.configuration');
});
