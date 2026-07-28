<?php

namespace App\Http\Controllers\Kanban;

use App\Http\Controllers\Controller;
use App\Http\Requests\Kanban\StoreCardRequest;
use App\Http\Requests\Kanban\UpdateCardRequest;
use App\Http\Resources\Kanban\CardResource;
use App\Models\BoardColumn;
use App\Models\Card;
use App\Models\CardActivity;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;

class CardController extends Controller
{
    public function store(StoreCardRequest $request, BoardColumn $boardColumn): RedirectResponse
    {
        /** @var User $actor */
        $actor = $request->user();

        DB::transaction(function () use ($request, $boardColumn, $actor): void {
            $column = BoardColumn::query()->whereKey($boardColumn)->lockForUpdate()->firstOrFail();
            $activeCards = $column->cards()->whereNull('archived_at')->lockForUpdate()->count();

            if ($column->card_limit !== null && $activeCards >= $column->card_limit) {
                throw ValidationException::withMessages(['column' => 'A coluna atingiu o limite de cards.']);
            }

            $card = $column->cards()->create([
                ...$request->validated(),
                'board_id' => $column->board_id,
                'position' => $activeCards,
            ]);

            CardActivity::query()->create([
                'board_id' => $card->board_id,
                'card_id' => $card->getKey(),
                'user_id' => $actor->getKey(),
                'type' => 'created',
                'changes' => [],
            ]);
        });

        return back()->with('status', 'Card criado.');
    }

    public function show(Request $request, Card $card): CardResource
    {
        Gate::authorize('view', $card);
        $card->load([
            'assignees:id,name,email',
            'labels:id,name,color',
            'checklists.items',
            'comments.user:id,name',
            'attachments',
            'activities.user:id,name',
        ]);

        return new CardResource($card);
    }

    public function update(UpdateCardRequest $request, Card $card): RedirectResponse
    {
        /** @var User $actor */
        $actor = $request->user();
        $validated = $request->safe()->except('completed');
        $validated['completed_at'] = $request->boolean('completed') ? ($card->completed_at ?? now()) : null;
        $before = $card->only(array_keys($validated));
        $card->update($validated);
        $changes = collect($card->only(array_keys($validated)))
            ->filter(fn ($value, string $key): bool => $before[$key] != $value)
            ->mapWithKeys(fn ($value, string $key): array => [
                $key => ['from' => $before[$key], 'to' => $value],
            ])
            ->all();

        if ($changes !== []) {
            CardActivity::query()->create([
                'board_id' => $card->board_id,
                'card_id' => $card->getKey(),
                'user_id' => $actor->getKey(),
                'type' => $request->boolean('completed') ? 'completed' : 'updated',
                'changes' => $changes,
            ]);
        }

        return back()->with('status', 'Card atualizado.');
    }

    public function archive(Request $request, Card $card): RedirectResponse
    {
        Gate::authorize('archive', $card);
        $this->setArchivedState($request, $card, true);

        return back()->with('status', 'Card arquivado.');
    }

    public function restore(Request $request, Card $card): RedirectResponse
    {
        Gate::authorize('archive', $card);
        $this->setArchivedState($request, $card, false);

        return back()->with('status', 'Card restaurado.');
    }

    public function destroy(Request $request, Card $card): RedirectResponse
    {
        Gate::authorize('delete', $card);

        if ($card->archived_at === null) {
            throw ValidationException::withMessages(['card' => 'Arquive o card antes de excluí-lo definitivamente.']);
        }

        $card->forceDelete();

        return back()->with('status', 'Card excluído definitivamente.');
    }

    private function setArchivedState(Request $request, Card $card, bool $archived): void
    {
        /** @var User $actor */
        $actor = $request->user();
        $card->update(['archived_at' => $archived ? now() : null]);
        CardActivity::query()->create([
            'board_id' => $card->board_id,
            'card_id' => $card->getKey(),
            'user_id' => $actor->getKey(),
            'type' => $archived ? 'archived' : 'restored',
            'changes' => [],
        ]);
    }
}
