<?php

use App\Http\Controllers\Admin\AccessManagementController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\AltTabController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\CommercialProductController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\Kanban\BoardColumnController;
use App\Http\Controllers\Kanban\BoardController;
use App\Http\Controllers\Kanban\BoardParticipantController;
use App\Http\Controllers\Kanban\CardAssignmentController;
use App\Http\Controllers\Kanban\CardAttachmentController;
use App\Http\Controllers\Kanban\CardCommentController;
use App\Http\Controllers\Kanban\CardController;
use App\Http\Controllers\Kanban\CardMovementController;
use App\Http\Controllers\Kanban\ChecklistController;
use App\Http\Controllers\Kanban\ChecklistItemController;
use App\Http\Controllers\Kanban\LabelController;
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
    Route::inertia('no-access', 'access-none')->name('access.none');

    Route::get('dashboard', DashboardController::class)
        ->middleware('access:dashboard.view')
        ->name('dashboard');

    Route::get('checkout/{commercialProduct:slug}', [CheckoutController::class, 'show'])
        ->middleware('access:checkout.view')
        ->name('checkout.show');
    Route::post('checkout', [CheckoutController::class, 'store'])
        ->middleware('access:checkout.create')
        ->name('checkout.store');
    Route::get('orders/{order}', [CheckoutController::class, 'order'])
        ->middleware('access:checkout.view_own_orders')
        ->name('orders.show');

    Route::get('users/create', [UserController::class, 'create'])
        ->middleware('access:users.create')
        ->name('users.create');
    Route::post('users', [UserController::class, 'store'])
        ->middleware('access:users.create')
        ->name('users.store');

    Route::prefix('admin/commercial-products')->name('admin.commercial-products.')->group(function () {
        Route::get('/', [App\Http\Controllers\Admin\CommercialProductController::class, 'index'])
            ->middleware('access:commercial_products.view')
            ->name('index');
        Route::get('create', [App\Http\Controllers\Admin\CommercialProductController::class, 'create'])
            ->middleware('access:commercial_products.create')
            ->name('create');
        Route::post('/', [App\Http\Controllers\Admin\CommercialProductController::class, 'store'])
            ->middleware('access:commercial_products.create')
            ->name('store');
        Route::get('{commercialProduct}/edit', [App\Http\Controllers\Admin\CommercialProductController::class, 'edit'])
            ->middleware('access:commercial_products.update')
            ->name('edit');
        Route::match(['put', 'patch'], '{commercialProduct}', [App\Http\Controllers\Admin\CommercialProductController::class, 'update'])
            ->middleware('access:commercial_products.update')
            ->name('update');
        Route::delete('{commercialProduct}', [App\Http\Controllers\Admin\CommercialProductController::class, 'destroy'])
            ->middleware('access:commercial_products.archive')
            ->name('destroy');
    });

    Route::get('admin/orders', [OrderController::class, 'index'])
        ->middleware('access:admin_orders.view')
        ->name('admin.orders.index');
    Route::get('admin/orders/{order}', [OrderController::class, 'show'])
        ->middleware('access:admin_orders.view')
        ->name('admin.orders.show');

    Route::get('admin/access', [AccessManagementController::class, 'index'])
        ->middleware('access:access_management.view')
        ->name('admin.access.index');
    Route::put('admin/access/{user}', [AccessManagementController::class, 'update'])
        ->middleware('access:access_management.update')
        ->name('admin.access.update');

    Route::prefix('kanban')->name('kanban.')->middleware('access:kanban.view')->group(function () {
        Route::get('boards', [BoardController::class, 'index'])->name('boards.index');
        Route::post('boards', [BoardController::class, 'store'])->name('boards.store');
        Route::get('boards/{board}', [BoardController::class, 'show'])->name('boards.show');
        Route::put('boards/{board}', [BoardController::class, 'update'])->name('boards.update');
        Route::post('boards/{board}/archive', [BoardController::class, 'archive'])->name('boards.archive');
        Route::post('boards/{board}/restore', [BoardController::class, 'restore'])->name('boards.restore');
        Route::delete('boards/{board}', [BoardController::class, 'destroy'])->name('boards.destroy');
        Route::put('boards/{board}/participants', [BoardParticipantController::class, 'update'])
            ->name('boards.participants.update');

        Route::post('boards/{board}/columns', [BoardColumnController::class, 'store'])->name('columns.store');
        Route::put('columns/{boardColumn}', [BoardColumnController::class, 'update'])->name('columns.update');
        Route::post('columns/{boardColumn}/archive', [BoardColumnController::class, 'archive'])->name('columns.archive');
        Route::delete('columns/{boardColumn}', [BoardColumnController::class, 'destroy'])->name('columns.destroy');

        Route::post('columns/{boardColumn}/cards', [CardController::class, 'store'])->name('cards.store');
        Route::get('cards/{card}', [CardController::class, 'show'])->name('cards.show');
        Route::put('cards/{card}', [CardController::class, 'update'])->name('cards.update');
        Route::patch('cards/{card}/move', CardMovementController::class)->name('cards.move');
        Route::post('cards/{card}/archive', [CardController::class, 'archive'])->name('cards.archive');
        Route::post('cards/{card}/restore', [CardController::class, 'restore'])->name('cards.restore');
        Route::delete('cards/{card}', [CardController::class, 'destroy'])->name('cards.destroy');

        Route::post('boards/{board}/labels', [LabelController::class, 'store'])->name('labels.store');
        Route::put('cards/{card}/labels', [LabelController::class, 'sync'])->name('cards.labels.update');
        Route::delete('labels/{label}', [LabelController::class, 'destroy'])->name('labels.destroy');
        Route::put('cards/{card}/assignees', [CardAssignmentController::class, 'update'])
            ->name('cards.assignees.update');

        Route::post('cards/{card}/checklists', [ChecklistController::class, 'store'])->name('checklists.store');
        Route::delete('checklists/{checklist}', [ChecklistController::class, 'destroy'])->name('checklists.destroy');
        Route::post('checklists/{checklist}/items', [ChecklistItemController::class, 'store'])
            ->name('checklist-items.store');
        Route::put('checklist-items/{checklistItem}', [ChecklistItemController::class, 'update'])
            ->name('checklist-items.update');
        Route::delete('checklist-items/{checklistItem}', [ChecklistItemController::class, 'destroy'])
            ->name('checklist-items.destroy');

        Route::post('cards/{card}/comments', [CardCommentController::class, 'store'])
            ->middleware('throttle:30,1')
            ->name('comments.store');
        Route::delete('comments/{cardComment}', [CardCommentController::class, 'destroy'])
            ->name('comments.destroy');
        Route::post('cards/{card}/attachments', [CardAttachmentController::class, 'store'])
            ->middleware('throttle:10,1')
            ->name('attachments.store');
        Route::get('attachments/{cardAttachment}/download', [CardAttachmentController::class, 'download'])
            ->name('attachments.download');
        Route::delete('attachments/{cardAttachment}', [CardAttachmentController::class, 'destroy'])
            ->name('attachments.destroy');
    });
});

require __DIR__.'/settings.php';
