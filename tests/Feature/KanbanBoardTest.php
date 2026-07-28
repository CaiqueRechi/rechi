<?php

namespace Tests\Feature;

use App\Models\Board;
use App\Models\BoardColumn;
use App\Models\Card;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class KanbanBoardTest extends TestCase
{
    use RefreshDatabase;

    public function test_authorized_user_can_view_create_and_edit_a_board(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->get(route('kanban.boards.index'))->assertOk();
        $response = $this->actingAs($user)->post(route('kanban.boards.store'), [
            'title' => 'Projeto secreto',
            'description' => 'Plano de execução',
            'color' => '#7c3aed',
            'visibility' => 'private',
        ]);

        $board = Board::query()->firstOrFail();
        $response->assertRedirect(route('kanban.boards.show', $board));
        $this->assertSame(3, $board->columns()->count());

        $this->actingAs($user)->put(route('kanban.boards.update', $board), [
            'title' => 'Projeto atualizado',
            'description' => null,
            'color' => '#0891b2',
            'visibility' => 'shared',
        ])->assertRedirect();

        $this->assertSame('Projeto atualizado', $board->fresh()?->title);
    }

    public function test_user_without_global_permission_cannot_view_or_create_boards(): void
    {
        $user = User::factory()->create();
        $this->setAccess($user, [
            'kanban.view' => false,
            'kanban.create_board' => false,
        ]);

        $this->actingAs($user)->get(route('kanban.boards.index'))->assertForbidden();
        $this->actingAs($user)->post(route('kanban.boards.store'), [
            'title' => 'Bloqueado',
            'color' => '#7c3aed',
            'visibility' => 'private',
        ])->assertForbidden();
    }

    public function test_membership_is_required_even_with_global_permission(): void
    {
        $owner = User::factory()->create();
        $outsider = User::factory()->create();
        $board = Board::factory()->for($owner, 'owner')->create();

        $this->actingAs($outsider)
            ->get(route('kanban.boards.show', $board))
            ->assertForbidden();

        $board->participants()->attach($outsider, ['role' => 'member']);

        $this->actingAs($outsider)
            ->get(route('kanban.boards.show', $board))
            ->assertOk();
    }

    public function test_column_with_cards_cannot_be_deleted_silently(): void
    {
        $owner = User::factory()->create();
        $this->grantAccess($owner, ['kanban.delete_column']);
        $board = Board::factory()->for($owner, 'owner')->create();
        $column = BoardColumn::factory()->for($board)->create(['position' => 0]);
        Card::factory()->create([
            'board_id' => $board->id,
            'board_column_id' => $column->id,
            'position' => 0,
        ]);

        $this->actingAs($owner)
            ->delete(route('kanban.columns.destroy', $column))
            ->assertSessionHasErrors('column');

        $this->assertModelExists($column);
        $this->assertSame(1, $column->cards()->count());
    }

    public function test_board_must_be_archived_before_permanent_deletion(): void
    {
        $owner = User::factory()->create();
        $this->grantAccess($owner, ['kanban.delete_board']);
        $board = Board::factory()->for($owner, 'owner')->create();

        $this->actingAs($owner)
            ->delete(route('kanban.boards.destroy', $board))
            ->assertSessionHasErrors('board');

        $this->actingAs($owner)
            ->post(route('kanban.boards.archive', $board))
            ->assertRedirect(route('kanban.boards.index'));
        $this->actingAs($owner)
            ->delete(route('kanban.boards.destroy', $board))
            ->assertRedirect(route('kanban.boards.index'));

        $this->assertDatabaseMissing('boards', ['id' => $board->id]);
    }
}
