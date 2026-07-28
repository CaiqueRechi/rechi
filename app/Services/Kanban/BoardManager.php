<?php

namespace App\Services\Kanban;

use App\Models\Board;
use App\Models\BoardColumn;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class BoardManager
{
    /** @param array<string, mixed> $attributes */
    public function create(User $owner, array $attributes): Board
    {
        return DB::transaction(function () use ($owner, $attributes): Board {
            $board = $owner->ownedBoards()->create($attributes);

            foreach (['Ideias', 'Em movimento', 'Finalizado'] as $position => $title) {
                $board->columns()->create([
                    'title' => $title,
                    'position' => $position,
                ]);
            }

            return $board;
        });
    }

    /** @param array<int, int> $userIds */
    public function updateParticipants(Board $board, array $userIds): void
    {
        $participants = collect($userIds)
            ->reject(fn (int $userId): bool => $userId === $board->owner_id)
            ->mapWithKeys(fn (int $userId): array => [$userId => ['role' => 'member']])
            ->all();

        DB::transaction(fn () => $board->participants()->sync($participants));
    }

    /** @param array<string, mixed> $attributes */
    public function createColumn(Board $board, array $attributes): BoardColumn
    {
        return DB::transaction(function () use ($board, $attributes): BoardColumn {
            Board::query()->whereKey($board)->lockForUpdate()->firstOrFail();
            $position = (int) $board->columns()->withTrashed()->max('position') + 1;

            return $board->columns()->create([
                ...$attributes,
                'position' => $position,
            ]);
        });
    }

    public function deleteColumn(BoardColumn $column): void
    {
        if ($column->cards()->withTrashed()->exists()) {
            throw ValidationException::withMessages([
                'column' => 'Mova ou exclua os cards antes de excluir a coluna.',
            ]);
        }

        $column->forceDelete();
    }

    public function deleteBoard(Board $board): void
    {
        if ($board->archived_at === null) {
            throw ValidationException::withMessages([
                'board' => 'Arquive o quadro antes de excluí-lo definitivamente.',
            ]);
        }

        DB::transaction(function () use ($board): void {
            $files = $board->cards()
                ->withTrashed()
                ->with(['attachments' => fn ($query) => $query->withTrashed()])
                ->get()
                ->flatMap->attachments
                ->map(fn ($attachment): array => [
                    'disk' => $attachment->disk,
                    'path' => $attachment->path,
                ]);

            $board->forceDelete();

            DB::afterCommit(function () use ($files): void {
                foreach ($files as $file) {
                    Storage::disk($file['disk'])->delete($file['path']);
                }
            });
        });
    }
}
