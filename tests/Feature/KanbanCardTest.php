<?php

namespace Tests\Feature;

use App\Models\Board;
use App\Models\BoardColumn;
use App\Models\Card;
use App\Models\CardActivity;
use App\Models\Label;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class KanbanCardTest extends TestCase
{
    use RefreshDatabase;

    public function test_member_can_create_and_edit_card_with_activity_history(): void
    {
        [$owner, $member, $board, $column] = $this->boardWithMember();

        $this->actingAs($member)->post(route('kanban.cards.store', $column), [
            'title' => 'Escrever testes',
            'description' => 'Cobrir os fluxos críticos',
            'priority' => 'high',
            'starts_at' => null,
            'due_at' => now()->addDay()->toJSON(),
        ])->assertRedirect();

        $card = Card::query()->firstOrFail();
        $this->assertSame($board->id, $card->board_id);
        $this->assertSame('created', $card->activities()->firstOrFail()->type);

        $this->actingAs($member)->put(route('kanban.cards.update', $card), [
            'title' => 'Escrever testes automatizados',
            'description' => 'Cobrir os fluxos críticos',
            'priority' => 'urgent',
            'starts_at' => null,
            'due_at' => now()->addDays(2)->toJSON(),
            'completed' => true,
        ])->assertRedirect();

        $this->assertNotNull($card->fresh()?->completed_at);
        $this->assertSame(2, CardActivity::query()->whereBelongsTo($card)->count());
    }

    public function test_user_without_edit_permission_cannot_change_card(): void
    {
        [, $member, , $column] = $this->boardWithMember();
        $card = Card::factory()->create([
            'board_id' => $column->board_id,
            'board_column_id' => $column->id,
            'position' => 0,
        ]);
        $this->setAccess($member, ['kanban.edit_card' => false]);

        $this->actingAs($member)->put(route('kanban.cards.update', $card), [
            'title' => 'Tentativa',
            'description' => null,
            'priority' => 'low',
            'starts_at' => null,
            'due_at' => null,
            'completed' => false,
        ])->assertForbidden();
    }

    public function test_assignee_must_belong_to_board(): void
    {
        [, $member, , $column] = $this->boardWithMember();
        $outsider = User::factory()->create();
        $card = Card::factory()->create([
            'board_id' => $column->board_id,
            'board_column_id' => $column->id,
            'position' => 0,
        ]);

        $this->actingAs($member)
            ->put(route('kanban.cards.assignees.update', $card), [
                'user_ids' => [$outsider->id],
            ])
            ->assertSessionHasErrors('user_ids');

        $this->assertSame(0, $card->assignees()->count());
    }

    public function test_label_from_another_board_is_rejected(): void
    {
        [, $member, $board, $column] = $this->boardWithMember();
        $otherBoard = Board::factory()->create();
        $foreignLabel = Label::factory()->for($otherBoard)->create();
        $card = Card::factory()->create([
            'board_id' => $board->id,
            'board_column_id' => $column->id,
            'position' => 0,
        ]);

        $this->actingAs($member)
            ->put(route('kanban.cards.labels.update', $card), [
                'label_ids' => [$foreignLabel->id],
            ])
            ->assertSessionHasErrors('label_ids');

        $this->assertSame(0, $card->labels()->count());
    }

    public function test_card_must_be_archived_before_permanent_deletion(): void
    {
        [$owner, , $board, $column] = $this->boardWithMember();
        $this->grantAccess($owner, ['kanban.delete_card']);
        $card = Card::factory()->create([
            'board_id' => $board->id,
            'board_column_id' => $column->id,
            'position' => 0,
        ]);

        $this->actingAs($owner)
            ->delete(route('kanban.cards.destroy', $card))
            ->assertSessionHasErrors('card');
        $this->actingAs($owner)
            ->post(route('kanban.cards.archive', $card))
            ->assertRedirect();
        $this->actingAs($owner)
            ->delete(route('kanban.cards.destroy', $card))
            ->assertRedirect();

        $this->assertDatabaseMissing('cards', ['id' => $card->id]);
    }

    /** @return array{User, User, Board, BoardColumn} */
    private function boardWithMember(): array
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();
        $board = Board::factory()->for($owner, 'owner')->create();
        $board->participants()->attach($member, ['role' => 'member']);
        $column = BoardColumn::factory()->for($board)->create(['position' => 0]);

        return [$owner, $member, $board, $column];
    }
}
