<?php

namespace App\Providers;

use App\Http\Responses\LoginResponse;
use App\Models\User;
use App\Services\Access\AccessManager;
use App\Services\Payments\MercadoPagoPaymentGateway;
use App\Services\Payments\PaymentGatewayInterface;
use Carbon\CarbonImmutable;
use Illuminate\Auth\Events\Login;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(PaymentGatewayInterface::class, MercadoPagoPaymentGateway::class);
        $this->app->scoped(AccessManager::class);
        $this->app->singleton(LoginResponseContract::class, LoginResponse::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureAccessGates();

        Event::listen(Login::class, function (Login $event): void {
            if ($event->user instanceof User) {
                $event->user->forceFill(['last_login_at' => now()])->save();
            }
        });

        $this->configureDefaults();
    }

    private function configureAccessGates(): void
    {
        foreach (config('access.modules', []) as $moduleKey => $module) {
            foreach (array_keys($module['permissions']) as $permissionKey) {
                $permission = "{$moduleKey}.{$permissionKey}";

                Gate::define(
                    $permission,
                    fn (User $user): bool => app(AccessManager::class)->allows($user, $permission),
                );
            }
        }
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
