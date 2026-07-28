<?php

namespace App\Policies;

use App\Models\Board;
use App\Models\User;
use App\Services\Access\AccessManager;

class BoardPolicy
{
    public function __construct(private AccessManager $accessManager) {}

    public function viewAny(User $user): bool
    {
        return $this->accessManager->allows($user, 'kanban.view');
    }

    public function view(User $user, Board $board): bool
    {
        return $this->viewAny($user) && $board->includes($user);
    }

    public function create(User $user): bool
    {
        return $this->accessManager->allows($user, 'kanban.create_board');
    }

    public function update(User $user, Board $board): bool
    {
        return $this->accessManager->allows($user, 'kanban.edit_board')
            && $board->includes($user);
    }

    public function manageParticipants(User $user, Board $board): bool
    {
        return $this->accessManager->allows($user, 'kanban.manage_participants')
            && $board->owner_id === $user->getKey();
    }

    public function archive(User $user, Board $board): bool
    {
        return $this->accessManager->allows($user, 'kanban.archive_board')
            && $board->owner_id === $user->getKey();
    }

    public function delete(User $user, Board $board): bool
    {
        return $this->accessManager->allows($user, 'kanban.delete_board')
            && $board->owner_id === $user->getKey();
    }
}
