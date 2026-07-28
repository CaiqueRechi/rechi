<?php

use App\Http\Controllers\Settings\IntegrationConnectionController;
use App\Http\Controllers\Settings\IntegrationOAuthController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\SecurityController;
use App\Http\Controllers\Settings\UploadFileSettingsController;
/* @chisel-password-confirmation */
use Illuminate\Auth\Middleware\RequirePassword;
/* @end-chisel-password-confirmation */
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'active'])->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])
        ->middleware('access:account_settings.profile')
        ->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])
        ->middleware('access:account_settings.profile')
        ->name('profile.update');
});

Route::middleware(['auth', 'active', 'verified'])->group(function () {
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])
        ->middleware('access:account_settings.profile')
        ->name('profile.destroy');

    Route::get('settings/security', [SecurityController::class, 'edit'])
        /* @chisel-password-confirmation */
        ->middleware(RequirePassword::class)
        /* @end-chisel-password-confirmation */
        ->middleware('access:account_settings.security')
        ->name('security.edit');

    Route::put('settings/password', [SecurityController::class, 'update'])
        ->middleware('throttle:6,1')
        ->middleware('access:account_settings.security')
        ->name('user-password.update');

    Route::inertia('settings/appearance', 'settings/appearance')
        ->middleware('access:account_settings.appearance')
        ->name('appearance.edit');

    Route::get('settings/general/app-keys', [IntegrationConnectionController::class, 'index'])
        ->middleware('access:integration_settings.view')
        ->name('settings.integrations.index');
    Route::get('settings/general/upload-files', [UploadFileSettingsController::class, 'edit'])
        ->middleware('access:upload_settings.view')
        ->name('settings.upload-files.edit');
    Route::put('settings/general/upload-files', [UploadFileSettingsController::class, 'update'])
        ->middleware('access:upload_settings.update')
        ->name('settings.upload-files.update');
    Route::put('settings/general/app-keys', [IntegrationConnectionController::class, 'update'])
        ->middleware('access:integration_settings.update')
        ->name('settings.integrations.update');
    Route::post('settings/general/app-keys/{provider}/sync', [IntegrationConnectionController::class, 'synchronize'])
        ->middleware(['access:integration_settings.update', 'throttle:10,1'])
        ->name('settings.integrations.sync');
    Route::delete('settings/general/app-keys/{provider}', [IntegrationConnectionController::class, 'destroy'])
        ->middleware('access:integration_settings.update')
        ->name('settings.integrations.destroy');
    Route::get('settings/general/app-keys/{provider}/connect', [IntegrationOAuthController::class, 'redirect'])
        ->middleware(['access:integration_settings.update', 'throttle:10,1'])
        ->name('settings.integrations.connect');
    Route::get('settings/general/app-keys/{provider}/callback', [IntegrationOAuthController::class, 'callback'])
        ->middleware(['access:integration_settings.update', 'throttle:20,1'])
        ->name('settings.integrations.callback');
});

/* @chisel-passkeys */
Route::get('.well-known/passkey-endpoints', function () {
    return response()->json([
        'enroll' => route('security.edit'),
        'manage' => route('security.edit'),
    ]);
})->name('well-known.passkeys');
/* @end-chisel-passkeys */
