<?php

namespace Tests\Feature;

use App\Models\Board;
use App\Models\BoardColumn;
use App\Models\Card;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class KanbanMovementTest extends TestCase
{
    use RefreshDatabase;

    public function test_authorized_move_between_columns_preserves_deterministic_order(): void
    {
        [$user, $board, $source, $target] = $this->boardWithColumns();
        $first = $this->card($board, $source, 'Primeiro', 0);
        $moving = $this->card($board, $source, 'Mover', 1);
        $targetCard = $this->card($board, $target, 'Destino', 0);

        $this->actingAs($user)
            ->patchJson(route('kanban.cards.move', $moving), [
                'target_column_id' => $target->id,
                'target_position' => 0,
            ])
            ->assertOk();

        $this->assertSame(
            [$moving->id, $targetCard->id],
            $target->cards()->pluck('id')->all(),
        );
        $this->assertSame([0], $source->cards()->pluck('position')->all());
        $this->assertSame([0, 1], $target->cards()->pluck('position')->all());
        $this->assertSame($first->id, $source->cards()->firstOrFail()->id);
    }

    public function test_reordering_inside_column_normalizes_positions(): void
    {
        [$user, $board, $source] = $this->boardWithColumns();
        $first = $this->card($board, $source, 'Primeiro', 0);
        $second = $this->card($board, $source, 'Segundo', 1);
        $third = $this->card($board, $source, 'Terceiro', 2);

        $this->actingAs($user)
            ->patchJson(route('kanban.cards.move', $third), [
                'target_column_id' => $source->id,
                'target_position' => 0,
            ])
            ->assertOk();

        $this->assertSame(
            [$third->id, $first->id, $second->id],
            $source->cards()->pluck('id')->all(),
        );
        $this->assertSame([0, 1, 2], $source->cards()->pluck('position')->all());
    }

    public function test_unauthorized_movement_is_rejected_without_partial_state(): void
    {
        [$user, $board, $source, $target] = $this->boardWithColumns();
        $card = $this->card($board, $source, 'Imóvel', 0);
        $this->setAccess($user, ['kanban.move_card' => false]);

        $this->actingAs($user)
            ->patchJson(route('kanban.cards.move', $card), [
                'target_column_id' => $target->id,
                'target_position' => 0,
            ])
            ->assertForbidden();

        $this->assertSame($source->id, $card->fresh()?->board_column_id);
        $this->assertSame(0, $card->fresh()?->position);
    }

    public function test_movement_to_another_board_is_rejected(): void
    {
        [$user, $board, $source] = $this->boardWithColumns();
        $card = $this->card($board, $source, 'Protegido', 0);
        $foreignColumn = BoardColumn::factory()->create(['position' => 0]);

        $this->actingAs($user)
            ->patchJson(route('kanban.cards.move', $card), [
                'target_column_id' => $foreignColumn->id,
                'target_position' => 0,
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('target_column_id');

        $this->assertSame($source->id, $card->fresh()?->board_column_id);
    }

    public function test_column_limit_is_respected_without_changing_source(): void
    {
        [$user, $board, $source, $target] = $this->boardWithColumns();
        $target->update(['card_limit' => 1]);
        $this->card($board, $target, 'Ocupante', 0);
        $moving = $this->card($board, $source, 'Sem vaga', 0);

        $this->actingAs($user)
            ->patchJson(route('kanban.cards.move', $moving), [
                'target_column_id' => $target->id,
                'target_position' => 0,
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('target_column_id');

        $this->assertSame($source->id, $moving->fresh()?->board_column_id);
        $this->assertSame(1, $target->cards()->count());
    }

    /** @return array{User, Board, BoardColumn, BoardColumn} */
    private function boardWithColumns(): array
    {
        $user = User::factory()->create();
        $board = Board::factory()->for($user, 'owner')->create();
        $source = BoardColumn::factory()->for($board)->create(['title' => 'A', 'position' => 0]);
        $target = BoardColumn::factory()->for($board)->create(['title' => 'B', 'position' => 1]);

        return [$user, $board, $source, $target];
    }

    private function card(Board $board, BoardColumn $column, string $title, int $position): Card
    {
        return Card::factory()->create([
            'board_id' => $board->id,
            'board_column_id' => $column->id,
            'title' => $title,
            'position' => $position,
        ]);
    }
}
