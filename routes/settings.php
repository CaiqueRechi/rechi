<?php

use App\Http\Controllers\Settings\IntegrationConnectionController;
use App\Http\Controllers\Settings\IntegrationOAuthController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\SecurityController;
/* @chisel-password-confirmation */
use Illuminate\Auth\Middleware\RequirePassword;
/* @end-chisel-password-confirmation */
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'active'])->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
});

Route::middleware(['auth', 'active', 'verified'])->group(function () {
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/security', [SecurityController::class, 'edit'])
        /* @chisel-password-confirmation */
        ->middleware(RequirePassword::class)
        /* @end-chisel-password-confirmation */
        ->name('security.edit');

    Route::put('settings/password', [SecurityController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    Route::inertia('settings/appearance', 'settings/appearance')->name('appearance.edit');

    Route::middleware('admin')->group(function () {
        Route::get('settings/general/app-keys', [IntegrationConnectionController::class, 'index'])
            ->name('settings.integrations.index');
        Route::put('settings/general/app-keys', [IntegrationConnectionController::class, 'update'])
            ->name('settings.integrations.update');
        Route::post('settings/general/app-keys/{provider}/sync', [IntegrationConnectionController::class, 'synchronize'])
            ->middleware('throttle:10,1')
            ->name('settings.integrations.sync');
        Route::delete('settings/general/app-keys/{provider}', [IntegrationConnectionController::class, 'destroy'])
            ->name('settings.integrations.destroy');
        Route::get('settings/general/app-keys/{provider}/connect', [IntegrationOAuthController::class, 'redirect'])
            ->middleware('throttle:10,1')
            ->name('settings.integrations.connect');
        Route::get('settings/general/app-keys/{provider}/callback', [IntegrationOAuthController::class, 'callback'])
            ->middleware('throttle:20,1')
            ->name('settings.integrations.callback');
    });
});

/* @chisel-passkeys */
Route::get('.well-known/passkey-endpoints', function () {
    return response()->json([
        'enroll' => route('security.edit'),
        'manage' => route('security.edit'),
    ]);
})->name('well-known.passkeys');
/* @end-chisel-passkeys */
