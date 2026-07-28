<?php

namespace App\Services\Access;

use App\Models\User;

class PostLoginRedirector
{
    public function __construct(private AccessManager $accessManager) {}

    public function destination(User $user): string
    {
        foreach ([
            'dashboard.view' => 'dashboard',
            'kanban.view' => 'kanban.boards.index',
        ] as $permission => $routeName) {
            if ($this->accessManager->allows($user, $permission)) {
                return route($routeName);
            }
        }

        $firstNavigation = $this->accessManager->navigationFor($user)[0] ?? null;

        return $firstNavigation
            ? route($firstNavigation['route'])
            : route('access.none');
    }
}
