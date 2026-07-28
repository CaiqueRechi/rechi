<?php

namespace Tests\Feature;

use App\Models\Board;
use App\Models\BoardColumn;
use App\Models\Card;
use App\Models\Checklist;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class KanbanCollaborationTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_manage_participants_but_member_cannot(): void
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();
        $newMember = User::factory()->create();
        $board = Board::factory()->for($owner, 'owner')->create();
        $board->participants()->attach($member, ['role' => 'member']);

        $this->actingAs($member)
            ->put(route('kanban.boards.participants.update', $board), [
                'user_ids' => [$newMember->id],
            ])
            ->assertForbidden();

        $this->actingAs($owner)
            ->put(route('kanban.boards.participants.update', $board), [
                'user_ids' => [$owner->id, $newMember->id],
            ])
            ->assertRedirect();

        $this->assertSame([$newMember->id], $board->participants()->pluck('users.id')->all());
    }

    public function test_member_can_comment_and_manage_checklist_when_authorized(): void
    {
        [$member, $card] = $this->cardForMember();

        $this->actingAs($member)
            ->post(route('kanban.comments.store', $card), ['body' => 'Pronto para revisão'])
            ->assertRedirect();
        $this->actingAs($member)
            ->post(route('kanban.checklists.store', $card), ['title' => 'Definition of done'])
            ->assertRedirect();

        $checklist = Checklist::query()->firstOrFail();
        $this->actingAs($member)
            ->post(route('kanban.checklist-items.store', $checklist), ['content' => 'Testes verdes'])
            ->assertRedirect();

        $this->assertSame('Pronto para revisão', $card->comments()->firstOrFail()->body);
        $this->assertSame('Testes verdes', $checklist->items()->firstOrFail()->content);
    }

    public function test_comment_and_checklist_actions_respect_global_permissions(): void
    {
        [$member, $card] = $this->cardForMember();
        $this->setAccess($member, [
            'kanban.comment' => false,
            'kanban.manage_checklists' => false,
        ]);

        $this->actingAs($member)
            ->post(route('kanban.comments.store', $card), ['body' => 'Bloqueado'])
            ->assertForbidden();
        $this->actingAs($member)
            ->post(route('kanban.checklists.store', $card), ['title' => 'Bloqueado'])
            ->assertForbidden();
    }

    public function test_outsider_cannot_comment_on_foreign_board(): void
    {
        [, $card] = $this->cardForMember();
        $outsider = User::factory()->create();

        $this->actingAs($outsider)
            ->post(route('kanban.comments.store', $card), ['body' => 'Invasão'])
            ->assertForbidden();
    }

    /** @return array{User, Card} */
    private function cardForMember(): array
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();
        $board = Board::factory()->for($owner, 'owner')->create();
        $board->participants()->attach($member, ['role' => 'member']);
        $column = BoardColumn::factory()->for($board)->create(['position' => 0]);
        $card = Card::factory()->create([
            'board_id' => $board->id,
            'board_column_id' => $column->id,
            'position' => 0,
        ]);

        return [$member, $card];
    }
}
