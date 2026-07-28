<?php

namespace App\Http\Controllers\Kanban;

use App\Http\Controllers\Controller;
use App\Http\Requests\Kanban\StoreBoardColumnRequest;
use App\Http\Requests\Kanban\UpdateBoardColumnRequest;
use App\Models\Board;
use App\Models\BoardColumn;
use App\Services\Kanban\BoardManager;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class BoardColumnController extends Controller
{
    public function __construct(private BoardManager $boardManager) {}

    public function store(StoreBoardColumnRequest $request, Board $board): RedirectResponse
    {
        $this->boardManager->createColumn($board, $request->validated());

        return back()->with('status', 'Coluna criada.');
    }

    public function update(UpdateBoardColumnRequest $request, BoardColumn $boardColumn): RedirectResponse
    {
        $boardColumn->update($request->validated());

        return back()->with('status', 'Coluna atualizada.');
    }

    public function archive(Request $request, BoardColumn $boardColumn): RedirectResponse
    {
        Gate::authorize('archive', $boardColumn);
        $boardColumn->update(['archived_at' => now()]);

        return back()->with('status', 'Coluna arquivada com seus cards preservados.');
    }

    public function destroy(Request $request, BoardColumn $boardColumn): RedirectResponse
    {
        Gate::authorize('delete', $boardColumn);
        $this->boardManager->deleteColumn($boardColumn);

        return back()->with('status', 'Coluna excluída.');
    }
}
