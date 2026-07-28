<?php

namespace App\Policies;

use App\Models\BoardColumn;
use App\Models\Card;
use App\Models\User;
use App\Services\Access\AccessManager;

class CardPolicy
{
    public function __construct(private AccessManager $accessManager) {}

    public function view(User $user, Card $card): bool
    {
        return $this->accessManager->allows($user, 'kanban.view_card')
            && $card->board->includes($user);
    }

    public function create(User $user, BoardColumn $column): bool
    {
        return $this->accessManager->allows($user, 'kanban.create_card')
            && $column->board->includes($user);
    }

    public function update(User $user, Card $card): bool
    {
        return $this->accessManager->allows($user, 'kanban.edit_card')
            && $card->board->includes($user);
    }

    public function archive(User $user, Card $card): bool
    {
        return $this->accessManager->allows($user, 'kanban.archive_card')
            && $card->board->includes($user);
    }

    public function delete(User $user, Card $card): bool
    {
        return $this->accessManager->allows($user, 'kanban.delete_card')
            && $card->board->includes($user);
    }

    public function move(User $user, Card $card): bool
    {
        return $this->accessManager->allows($user, 'kanban.move_card')
            && $card->board->includes($user);
    }

    public function manageLabels(User $user, Card $card): bool
    {
        return $this->accessManager->allows($user, 'kanban.manage_labels')
            && $card->board->includes($user);
    }

    public function manageAssignees(User $user, Card $card): bool
    {
        return $this->accessManager->allows($user, 'kanban.manage_assignees')
            && $card->board->includes($user);
    }

    public function manageChecklists(User $user, Card $card): bool
    {
        return $this->accessManager->allows($user, 'kanban.manage_checklists')
            && $card->board->includes($user);
    }

    public function comment(User $user, Card $card): bool
    {
        return $this->accessManager->allows($user, 'kanban.comment')
            && $card->board->includes($user);
    }

    public function manageAttachments(User $user, Card $card): bool
    {
        return $this->accessManager->allows($user, 'kanban.manage_attachments')
            && $card->board->includes($user);
    }
}
