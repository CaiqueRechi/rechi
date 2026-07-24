<?php

use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\AltTabController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\CommercialProductController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\MeController;
use App\Http\Controllers\MercadoPagoWebhookController;
use App\Http\Controllers\OtherServiceLeadController;
use App\Http\Controllers\SitemapController;
use Illuminate\Support\Facades\Route;

Route::get('/', HomeController::class)->name('home');
Route::get('sitemap.xml', SitemapController::class)->name('sitemap');
Route::inertia('old-lp-1', 'old-lp-1')->name('old-lp-1');
Route::inertia('termos-de-uso', 'legal/terms')->name('legal.terms');
Route::inertia('privacidade', 'legal/privacy')->name('legal.privacy');
Route::inertia('arrependimento-e-reembolso', 'legal/refund')->name('legal.refund');
Route::get('alt-tab', AltTabController::class)->name('alt-tab');
Route::get('landing-pages', [CommercialProductController::class, 'index'])->name('commercial-products.index');
Route::get('landing-pages/{commercialProduct:slug}', [CommercialProductController::class, 'show'])->name('commercial-products.show');
Route::post('solicitar-servico', OtherServiceLeadController::class)->name('other-service-leads.store');
Route::post('payments/mercado-pago/webhook', MercadoPagoWebhookController::class)
    ->middleware('throttle:60,1')
    ->name('payments.mercado-pago.webhook');
Route::get('me', MeController::class)->name('me');

Route::middleware(['auth', 'active', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');
    Route::get('checkout/{commercialProduct:slug}', [CheckoutController::class, 'show'])->name('checkout.show');
    Route::post('checkout', [CheckoutController::class, 'store'])->name('checkout.store');
    Route::get('orders/{order}', [CheckoutController::class, 'order'])->name('orders.show');

    Route::middleware('admin')->group(function () {
        Route::get('users/create', [UserController::class, 'create'])->name('users.create');
        Route::post('users', [UserController::class, 'store'])->name('users.store');
        Route::resource('admin/commercial-products', App\Http\Controllers\Admin\CommercialProductController::class)
            ->names('admin.commercial-products')
            ->except(['show']);
        Route::get('admin/orders', [OrderController::class, 'index'])->name('admin.orders.index');
        Route::get('admin/orders/{order}', [OrderController::class, 'show'])->name('admin.orders.show');
    });
});

require __DIR__.'/settings.php';
