<?php

namespace App\Policies;

use App\Models\Board;
use App\Models\BoardColumn;
use App\Models\User;
use App\Services\Access\AccessManager;

class BoardColumnPolicy
{
    public function __construct(private AccessManager $accessManager) {}

    public function create(User $user, Board $board): bool
    {
        return $this->accessManager->allows($user, 'kanban.create_column')
            && $board->includes($user);
    }

    public function update(User $user, BoardColumn $column): bool
    {
        return $this->accessManager->allows($user, 'kanban.edit_column')
            && $column->board->includes($user);
    }

    public function archive(User $user, BoardColumn $column): bool
    {
        return $this->accessManager->allows($user, 'kanban.archive_column')
            && $column->board->includes($user);
    }

    public function delete(User $user, BoardColumn $column): bool
    {
        return $this->accessManager->allows($user, 'kanban.delete_column')
            && $column->board->includes($user);
    }
}
