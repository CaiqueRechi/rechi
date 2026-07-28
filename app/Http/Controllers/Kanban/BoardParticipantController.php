<?php

namespace App\Http\Controllers\Kanban;

use App\Http\Controllers\Controller;
use App\Http\Requests\Kanban\UpdateBoardParticipantsRequest;
use App\Models\Board;
use App\Services\Kanban\BoardManager;
use Illuminate\Http\RedirectResponse;

class BoardParticipantController extends Controller
{
    public function __construct(private BoardManager $boardManager) {}

    public function update(UpdateBoardParticipantsRequest $request, Board $board): RedirectResponse
    {
        $this->boardManager->updateParticipants($board, $request->validated('user_ids'));

        return back()->with('status', 'Participantes atualizados.');
    }
}
