<?php

namespace App\Http\Middleware;

use App\Services\Access\AccessManager;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureHasAccess
{
    public function __construct(private AccessManager $accessManager) {}

    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$permissions): Response
    {
        $user = $request->user();

        abort_unless(
            $user !== null
            && $permissions !== []
            && collect($permissions)->every(
                fn (string $permission): bool => $this->accessManager->allows($user, $permission),
            ),
            Response::HTTP_FORBIDDEN,
        );

        return $next($request);
    }
}
