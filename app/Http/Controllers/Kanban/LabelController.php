<?php

namespace App\Http\Controllers\Kanban;

use App\Http\Controllers\Controller;
use App\Http\Requests\Kanban\StoreLabelRequest;
use App\Http\Requests\Kanban\UpdateCardLabelsRequest;
use App\Models\Board;
use App\Models\Card;
use App\Models\CardActivity;
use App\Models\Label;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class LabelController extends Controller
{
    public function store(StoreLabelRequest $request, Board $board): RedirectResponse
    {
        $board->labels()->create($request->validated());

        return back()->with('status', 'Etiqueta criada.');
    }

    public function sync(UpdateCardLabelsRequest $request, Card $card): RedirectResponse
    {
        $labelIds = $request->validated('label_ids');
        $validCount = Label::query()
            ->whereBelongsTo($card->board)
            ->whereKey($labelIds)
            ->count();

        if ($validCount !== count($labelIds)) {
            throw ValidationException::withMessages([
                'label_ids' => 'Todas as etiquetas devem pertencer ao mesmo quadro do card.',
            ]);
        }

        $card->labels()->sync($labelIds);
        $this->recordActivity($request, $card, 'labels_updated', ['label_ids' => $labelIds]);

        return back()->with('status', 'Etiquetas atualizadas.');
    }

    public function destroy(Request $request, Label $label): RedirectResponse
    {
        $user = $request->user();
        abort_unless(
            $user instanceof User
            && $user->can('kanban.manage_labels')
            && $label->board->includes($user),
            403,
        );

        $label->delete();

        return back()->with('status', 'Etiqueta excluída.');
    }

    /** @param array<string, mixed> $changes */
    private function recordActivity(Request $request, Card $card, string $type, array $changes): void
    {
        CardActivity::query()->create([
            'board_id' => $card->board_id,
            'card_id' => $card->getKey(),
            'user_id' => $request->user()?->getKey(),
            'type' => $type,
            'changes' => $changes,
        ]);
    }
}
