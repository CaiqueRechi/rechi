<?php

namespace App\Http\Controllers\Kanban;

use App\Http\Controllers\Controller;
use App\Http\Requests\Kanban\StoreCardCommentRequest;
use App\Models\Card;
use App\Models\CardActivity;
use App\Models\CardComment;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class CardCommentController extends Controller
{
    public function store(StoreCardCommentRequest $request, Card $card): RedirectResponse
    {
        $comment = $card->comments()->create([
            'user_id' => $request->user()?->getKey(),
            'body' => $request->validated('body'),
        ]);
        CardActivity::query()->create([
            'board_id' => $card->board_id,
            'card_id' => $card->getKey(),
            'user_id' => $request->user()?->getKey(),
            'type' => 'commented',
            'changes' => ['comment_id' => $comment->getKey()],
        ]);

        return back()->with('status', 'Comentário adicionado.');
    }

    public function destroy(Request $request, CardComment $cardComment): RedirectResponse
    {
        $user = $request->user();
        abort_unless(
            $user instanceof User
            && $user->can('comment', $cardComment->card)
            && ($cardComment->user_id === $user->getKey() || $cardComment->card->board->owner_id === $user->getKey()),
            403,
        );
        $cardComment->delete();

        return back()->with('status', 'Comentário excluído.');
    }
}
