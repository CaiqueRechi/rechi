<?php

namespace App\Http\Controllers\Kanban;

use App\Http\Controllers\Controller;
use App\Http\Requests\Kanban\MoveCardRequest;
use App\Http\Resources\Kanban\CardResource;
use App\Models\BoardColumn;
use App\Models\Card;
use App\Models\User;
use App\Services\Kanban\CardMovementService;

class CardMovementController extends Controller
{
    public function __construct(private CardMovementService $cardMovementService) {}

    public function __invoke(MoveCardRequest $request, Card $card): CardResource
    {
        /** @var User $actor */
        $actor = $request->user();
        $targetColumn = BoardColumn::query()->findOrFail($request->integer('target_column_id'));
        $movedCard = $this->cardMovementService->move(
            $card,
            $targetColumn,
            $request->integer('target_position'),
            $actor,
        );

        return new CardResource($movedCard);
    }
}
