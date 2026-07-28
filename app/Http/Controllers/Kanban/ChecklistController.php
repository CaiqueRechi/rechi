<?php

namespace App\Http\Controllers\Kanban;

use App\Http\Controllers\Controller;
use App\Http\Requests\Kanban\StoreChecklistRequest;
use App\Models\Card;
use App\Models\CardActivity;
use App\Models\Checklist;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ChecklistController extends Controller
{
    public function store(StoreChecklistRequest $request, Card $card): RedirectResponse
    {
        DB::transaction(function () use ($request, $card): void {
            $checklist = $card->checklists()->create([
                'title' => $request->validated('title'),
                'position' => (int) $card->checklists()->max('position') + 1,
            ]);
            $this->record($request, $card, 'checklist_created', ['checklist_id' => $checklist->getKey()]);
        });

        return back()->with('status', 'Checklist criado.');
    }

    public function destroy(Request $request, Checklist $checklist): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user instanceof User && $user->can('manageChecklists', $checklist->card), 403);

        $card = $checklist->card;
        $checklistId = $checklist->getKey();
        $checklist->delete();
        $this->record($request, $card, 'checklist_removed', ['checklist_id' => $checklistId]);

        return back()->with('status', 'Checklist excluído.');
    }

    /** @param array<string, mixed> $changes */
    private function record(Request $request, Card $card, string $type, array $changes): void
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
