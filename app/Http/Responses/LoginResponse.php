<?php

namespace App\Http\Responses;

use App\Models\User;
use App\Services\Access\AccessManager;
use App\Services\Access\PostLoginRedirector;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class LoginResponse implements LoginResponseContract
{
    public function __construct(
        private PostLoginRedirector $redirector,
        private AccessManager $accessManager,
    ) {}

    public function toResponse($request): Response
    {
        if ($request->wantsJson()) {
            return response()->json(['two_factor' => false]);
        }

        /** @var User $user */
        $user = $request->user();
        $intended = $request->session()->pull('url.intended');

        if (is_string($intended) && $this->intendedUrlIsAuthorized($request, $user, $intended)) {
            return redirect()->to($intended);
        }

        return redirect()->to($this->redirector->destination($user));
    }

    private function intendedUrlIsAuthorized(Request $request, User $user, string $intended): bool
    {
        $intendedHost = parse_url($intended, PHP_URL_HOST);

        if ($intendedHost !== null && $intendedHost !== $request->getHost()) {
            return false;
        }

        try {
            $route = Route::getRoutes()->match(Request::create($intended, Request::METHOD_GET));
        } catch (Throwable) {
            return false;
        }

        $permissions = collect($route->gatherMiddleware())
            ->filter(fn (string $middleware): bool => str_starts_with($middleware, 'access:'))
            ->flatMap(fn (string $middleware): array => explode(',', str($middleware)->after('access:')->toString()))
            ->values();

        return $permissions->isNotEmpty()
            && $permissions->every(fn (string $permission): bool => $this->accessManager->allows($user, $permission));
    }
}
