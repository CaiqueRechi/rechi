<?php

namespace App\Http\Controllers\Kanban;

use App\Http\Controllers\Controller;
use App\Http\Requests\Kanban\UpdateCardAssignmentsRequest;
use App\Models\Card;
use App\Models\CardActivity;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\ValidationException;

class CardAssignmentController extends Controller
{
    public function update(UpdateCardAssignmentsRequest $request, Card $card): RedirectResponse
    {
        $userIds = $request->validated('user_ids');
        $allowedUserIds = $card->board->participants()
            ->pluck('users.id')
            ->push($card->board->owner_id)
            ->map(fn ($userId): int => (int) $userId)
            ->all();

        if (array_diff($userIds, $allowedUserIds) !== []) {
            throw ValidationException::withMessages([
                'user_ids' => 'Responsáveis devem participar do quadro.',
            ]);
        }

        $card->assignees()->sync($userIds);
        CardActivity::query()->create([
            'board_id' => $card->board_id,
            'card_id' => $card->getKey(),
            'user_id' => $request->user()?->getKey(),
            'type' => 'assignees_updated',
            'changes' => ['user_ids' => $userIds],
        ]);

        return back()->with('status', 'Responsáveis atualizados.');
    }
}
