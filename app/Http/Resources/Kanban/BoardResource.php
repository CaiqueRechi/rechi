<?php

namespace App\Http\Resources\Kanban;

use App\Models\Board;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use LogicException;

class BoardResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $board = $this->resource;

        if (! $board instanceof Board) {
            throw new LogicException('BoardResource requires a Board model.');
        }

        return [
            'id' => $board->id,
            'title' => $board->title,
            'description' => $board->description,
            'color' => $board->color,
            'visibility' => $board->visibility,
            'archivedAt' => $board->archived_at?->toIso8601String(),
            'owner' => $board->owner->only(['id', 'name', 'email']),
            'participants' => $this->participants($board),
            'labels' => $this->labels($board),
            'columns' => $this->columns($board, $request),
        ];
    }

    /** @return array<int, array<string, mixed>> */
    private function participants(Board $board): array
    {
        $participants = [];

        foreach ($board->participants as $participant) {
            $participants[] = $participant->only(['id', 'name', 'email']);
        }

        return $participants;
    }

    /** @return array<int, array<string, mixed>> */
    private function labels(Board $board): array
    {
        $labels = [];

        foreach ($board->labels as $label) {
            $labels[] = $label->only(['id', 'name', 'color']);
        }

        return $labels;
    }

    /** @return array<int, array<string, mixed>> */
    private function columns(Board $board, Request $request): array
    {
        $columns = [];

        foreach ($board->columns as $column) {
            $columns[] = [
                'id' => $column->id,
                'title' => $column->title,
                'position' => $column->position,
                'cardLimit' => $column->card_limit,
                'cardCount' => $column->cards->count(),
                'cards' => CardResource::collection($column->cards)->resolve($request),
            ];
        }

        return $columns;
    }
}
