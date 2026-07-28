<?php

namespace App\Http\Controllers\Kanban;

use App\Http\Controllers\Controller;
use App\Http\Requests\Kanban\StoreChecklistItemRequest;
use App\Http\Requests\Kanban\UpdateChecklistItemRequest;
use App\Models\CardActivity;
use App\Models\Checklist;
use App\Models\ChecklistItem;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ChecklistItemController extends Controller
{
    public function store(StoreChecklistItemRequest $request, Checklist $checklist): RedirectResponse
    {
        $item = $checklist->items()->create([
            'content' => $request->validated('content'),
            'position' => (int) $checklist->items()->max('position') + 1,
        ]);
        $this->record($request, $item, 'checklist_item_created');

        return back()->with('status', 'Item adicionado.');
    }

    public function update(UpdateChecklistItemRequest $request, ChecklistItem $checklistItem): RedirectResponse
    {
        $checklistItem->update([
            'content' => $request->validated('content'),
            'completed_at' => $request->boolean('completed') ? ($checklistItem->completed_at ?? now()) : null,
        ]);
        $this->record($request, $checklistItem, 'checklist_item_updated');

        return back()->with('status', 'Item atualizado.');
    }

    public function destroy(Request $request, ChecklistItem $checklistItem): RedirectResponse
    {
        $user = $request->user();
        abort_unless(
            $user instanceof User && $user->can('manageChecklists', $checklistItem->checklist->card),
            403,
        );
        $this->record($request, $checklistItem, 'checklist_item_removed');
        $checklistItem->delete();

        return back()->with('status', 'Item excluído.');
    }

    private function record(Request $request, ChecklistItem $item, string $type): void
    {
        $card = $item->checklist->card;
        CardActivity::query()->create([
            'board_id' => $card->board_id,
            'card_id' => $card->getKey(),
            'user_id' => $request->user()?->getKey(),
            'type' => $type,
            'changes' => ['checklist_item_id' => $item->getKey()],
        ]);
    }
}
