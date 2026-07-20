<?php

use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\AltTabController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');
Route::get('alt-tab', AltTabController::class)->name('alt-tab');

Route::middleware(['auth', 'active', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::middleware('admin')->group(function () {
        Route::get('users/create', [UserController::class, 'create'])->name('users.create');
        Route::post('users', [UserController::class, 'store'])->name('users.store');
    });
});

require __DIR__.'/settings.php';
