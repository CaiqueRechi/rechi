<?php

namespace App\Http\Controllers\Kanban;

use App\Http\Controllers\Controller;
use App\Http\Requests\Kanban\StoreBoardRequest;
use App\Http\Requests\Kanban\UpdateBoardRequest;
use App\Http\Resources\Kanban\BoardResource;
use App\Models\Board;
use App\Models\User;
use App\Services\Kanban\BoardManager;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class BoardController extends Controller
{
    public function __construct(private BoardManager $boardManager) {}

    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Board::class);

        /** @var User $user */
        $user = $request->user();
        $search = $request->string('search')->trim()->toString();
        $archived = $request->boolean('archived');
        $boards = Board::query()
            ->accessibleTo($user)
            ->with(['owner:id,name,email', 'participants:id,name,email'])
            ->withCount(['columns' => fn ($query) => $query->whereNull('archived_at'), 'cards' => fn ($query) => $query->whereNull('archived_at')])
            ->when($archived, fn ($query) => $query->whereNotNull('archived_at'), fn ($query) => $query->whereNull('archived_at'))
            ->when($search !== '', fn ($query) => $query->where(function ($query) use ($search): void {
                $query->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            }))
            ->latest('updated_at')
            ->paginate(18)
            ->withQueryString();

        $boardPayload = $boards->toArray();
        $boardPayload['data'] = array_map(
            fn (Board $board): array => $this->serializeBoardSummary($board),
            $boards->items(),
        );

        return Inertia::render('kanban/index', [
            'boards' => $boardPayload,
            'filters' => ['search' => $search, 'archived' => $archived],
        ]);
    }

    public function store(StoreBoardRequest $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();
        $board = $this->boardManager->create($user, $request->validated());

        return to_route('kanban.boards.show', $board)->with('status', 'Quadro criado.');
    }

    public function show(Request $request, Board $board): Response
    {
        Gate::authorize('view', $board);

        $board->load([
            'owner:id,name,email',
            'participants:id,name,email',
            'labels:id,board_id,name,color',
            'columns' => fn ($query) => $query
                ->whereNull('archived_at')
                ->with(['cards' => fn ($query) => $query
                    ->whereNull('archived_at')
                    ->with([
                        'assignees:id,name,email',
                        'labels:id,name,color',
                        'checklists.items',
                        'comments.user:id,name',
                        'attachments',
                        'activities.user:id,name',
                    ])]),
        ]);

        $availableUsers = User::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        return Inertia::render('kanban/show', [
            'board' => (new BoardResource($board))->resolve($request),
            'availableUsers' => $availableUsers,
        ]);
    }

    public function update(UpdateBoardRequest $request, Board $board): RedirectResponse
    {
        $board->update($request->validated());

        return back()->with('status', 'Quadro atualizado.');
    }

    public function archive(Request $request, Board $board): RedirectResponse
    {
        Gate::authorize('archive', $board);
        $board->update(['archived_at' => now()]);

        return to_route('kanban.boards.index')->with('status', 'Quadro arquivado.');
    }

    public function restore(Request $request, Board $board): RedirectResponse
    {
        Gate::authorize('archive', $board);
        $board->update(['archived_at' => null]);

        return back()->with('status', 'Quadro restaurado.');
    }

    /** @return array<string, mixed> */
    private function serializeBoardSummary(Board $board): array
    {
        return [
            'id' => $board->id,
            'title' => $board->title,
            'description' => $board->description,
            'color' => $board->color,
            'visibility' => $board->visibility,
            'archivedAt' => $board->archived_at?->toIso8601String(),
            'owner' => $board->owner->only(['id', 'name']),
            'participants' => $board->participants
                ->map(fn (User $participant): array => $participant->only(['id', 'name']))
                ->all(),
            'columnCount' => $board->columns_count,
            'cardCount' => $board->cards_count,
            'updatedAt' => $board->updated_at?->toIso8601String(),
        ];
    }

    public function destroy(Request $request, Board $board): RedirectResponse
    {
        Gate::authorize('delete', $board);
        $this->boardManager->deleteBoard($board);

        return to_route('kanban.boards.index')->with('status', 'Quadro excluído definitivamente.');
    }
}
