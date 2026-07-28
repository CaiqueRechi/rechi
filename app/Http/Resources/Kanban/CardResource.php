<?php

namespace App\Http\Resources\Kanban;

use App\Models\Card;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use LogicException;

class CardResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $card = $this->resource;

        if (! $card instanceof Card) {
            throw new LogicException('CardResource requires a Card model.');
        }

        return [
            'id' => $card->id,
            'boardId' => $card->board_id,
            'columnId' => $card->board_column_id,
            'title' => $card->title,
            'description' => $card->description,
            'priority' => $card->priority,
            'startsAt' => $card->starts_at?->toIso8601String(),
            'dueAt' => $card->due_at?->toIso8601String(),
            'completedAt' => $card->completed_at?->toIso8601String(),
            'archivedAt' => $card->archived_at?->toIso8601String(),
            'isOverdue' => $card->completed_at === null && $card->due_at?->isPast(),
            'position' => $card->position,
            'assignees' => $this->assignees($card),
            'labels' => $this->labels($card),
            'checklists' => $this->checklists($card),
            'comments' => $this->comments($card),
            'attachments' => $this->attachments($card),
            'activities' => $this->activities($card),
        ];
    }

    /** @return array<int, array<string, mixed>> */
    private function assignees(Card $card): array
    {
        $assignees = [];

        foreach ($card->assignees as $assignee) {
            $assignees[] = $assignee->only(['id', 'name', 'email']);
        }

        return $assignees;
    }

    /** @return array<int, array<string, mixed>> */
    private function labels(Card $card): array
    {
        $labels = [];

        foreach ($card->labels as $label) {
            $labels[] = $label->only(['id', 'name', 'color']);
        }

        return $labels;
    }

    /** @return array<int, array<string, mixed>> */
    private function checklists(Card $card): array
    {
        $checklists = [];

        foreach ($card->checklists as $checklist) {
            $items = [];

            foreach ($checklist->items as $item) {
                $items[] = [
                    'id' => $item->id,
                    'content' => $item->content,
                    'position' => $item->position,
                    'completedAt' => $item->completed_at?->toIso8601String(),
                ];
            }

            $checklists[] = [
                'id' => $checklist->id,
                'title' => $checklist->title,
                'position' => $checklist->position,
                'items' => $items,
            ];
        }

        return $checklists;
    }

    /** @return array<int, array<string, mixed>> */
    private function comments(Card $card): array
    {
        $comments = [];

        foreach ($card->comments as $comment) {
            $comments[] = [
                'id' => $comment->id,
                'body' => $comment->body,
                'author' => $comment->user?->only(['id', 'name']),
                'createdAt' => $comment->created_at?->toIso8601String(),
            ];
        }

        return $comments;
    }

    /** @return array<int, array<string, mixed>> */
    private function attachments(Card $card): array
    {
        $attachments = [];

        foreach ($card->attachments as $attachment) {
            $attachments[] = [
                'id' => $attachment->id,
                'name' => $attachment->original_name,
                'mimeType' => $attachment->mime_type,
                'sizeBytes' => $attachment->size_bytes,
                'createdAt' => $attachment->created_at?->toIso8601String(),
            ];
        }

        return $attachments;
    }

    /** @return array<int, array<string, mixed>> */
    private function activities(Card $card): array
    {
        $activities = [];

        foreach ($card->activities->take(30) as $activity) {
            $activities[] = [
                'id' => $activity->id,
                'type' => $activity->type,
                'changes' => $activity->changes,
                'actor' => $activity->user?->only(['id', 'name']),
                'createdAt' => $activity->created_at->toIso8601String(),
            ];
        }

        return $activities;
    }
}
