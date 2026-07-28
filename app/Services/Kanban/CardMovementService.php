<?php

namespace App\Services\Kanban;

use App\Models\BoardColumn;
use App\Models\Card;
use App\Models\CardActivity;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CardMovementService
{
    public function move(Card $card, BoardColumn $targetColumn, int $targetPosition, User $actor): Card
    {
        return DB::transaction(function () use ($card, $targetColumn, $targetPosition, $actor): Card {
            $lockedCard = Card::query()->whereKey($card)->lockForUpdate()->firstOrFail();
            $lockedColumns = BoardColumn::query()
                ->whereIn('id', [$lockedCard->board_column_id, $targetColumn->getKey()])
                ->orderBy('id')
                ->lockForUpdate()
                ->get()
                ->keyBy('id');
            $destination = $lockedColumns->get($targetColumn->getKey());

            if ($destination === null
                || $destination->board_id !== $lockedCard->board_id
                || $destination->archived_at !== null) {
                throw ValidationException::withMessages([
                    'target_column_id' => 'A coluna de destino não pertence a este quadro ou está arquivada.',
                ]);
            }

            $destinationCount = Card::query()
                ->whereBelongsTo($destination, 'column')
                ->whereNull('archived_at')
                ->whereKeyNot($lockedCard)
                ->lockForUpdate()
                ->count();

            if ($destination->card_limit !== null && $destinationCount >= $destination->card_limit) {
                throw ValidationException::withMessages([
                    'target_column_id' => 'A coluna de destino atingiu o limite de cards.',
                ]);
            }

            $sourceColumnId = $lockedCard->board_column_id;
            $sourcePosition = $lockedCard->position;
            $sourceCards = $this->lockedCardsForColumn($sourceColumnId)->reject->is($lockedCard)->values();

            if ($sourceColumnId === $destination->getKey()) {
                $destinationCards = $sourceCards;
            } else {
                $destinationCards = $this->lockedCardsForColumn($destination->getKey())
                    ->reject->is($lockedCard)
                    ->values();
            }

            $insertAt = min($targetPosition, $destinationCards->count());
            $destinationCards->splice($insertAt, 0, [$lockedCard]);

            $this->persistPositions($destinationCards, $destination->getKey());

            if ($sourceColumnId !== $destination->getKey()) {
                $this->persistPositions($sourceCards, $sourceColumnId);
            }

            CardActivity::query()->create([
                'board_id' => $lockedCard->board_id,
                'card_id' => $lockedCard->getKey(),
                'user_id' => $actor->getKey(),
                'type' => 'moved',
                'changes' => [
                    'from_column_id' => $sourceColumnId,
                    'from_position' => $sourcePosition,
                    'to_column_id' => $destination->getKey(),
                    'to_position' => $insertAt,
                ],
            ]);

            return $lockedCard->refresh();
        }, 3);
    }

    /** @return Collection<int, Card> */
    private function lockedCardsForColumn(int $columnId): Collection
    {
        return Card::query()
            ->where('board_column_id', $columnId)
            ->whereNull('archived_at')
            ->orderBy('position')
            ->orderBy('id')
            ->lockForUpdate()
            ->get();
    }

    /** @param Collection<int, Card> $cards */
    private function persistPositions(Collection $cards, int $columnId): void
    {
        $cards->values()->each(function (Card $card, int $position) use ($columnId): void {
            if ($card->board_column_id !== $columnId || $card->position !== $position) {
                $card->forceFill([
                    'board_column_id' => $columnId,
                    'position' => $position,
                ])->save();
            }
        });
    }
}
