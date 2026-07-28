<?php

namespace Tests\Feature;

use App\Models\Board;
use App\Models\BoardColumn;
use App\Models\Card;
use App\Models\CardAttachment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class KanbanAttachmentTest extends TestCase
{
    use RefreshDatabase;

    public function test_authorized_member_can_upload_and_download_valid_attachment(): void
    {
        Storage::fake('local');
        [$member, $card] = $this->cardForMember();

        $this->actingAs($member)
            ->post(route('kanban.attachments.store', $card), [
                'file' => UploadedFile::fake()->create('briefing.pdf', 100, 'application/pdf'),
            ])
            ->assertRedirect();

        $attachment = CardAttachment::query()->firstOrFail();
        Storage::disk('local')->assertExists($attachment->path);
        $this->assertNotSame('briefing.pdf', basename($attachment->path));

        $this->actingAs($member)
            ->get(route('kanban.attachments.download', $attachment))
            ->assertOk()
            ->assertDownload('briefing.pdf');
    }

    public function test_invalid_attachment_is_rejected(): void
    {
        Storage::fake('local');
        [$member, $card] = $this->cardForMember();

        $this->actingAs($member)
            ->post(route('kanban.attachments.store', $card), [
                'file' => UploadedFile::fake()->create('payload.exe', 10, 'application/x-msdownload'),
            ])
            ->assertSessionHasErrors('file');

        $this->assertDatabaseCount((new CardAttachment)->getTable(), 0);
    }

    public function test_outsider_cannot_download_or_delete_attachment(): void
    {
        Storage::fake('local');
        [$member, $card] = $this->cardForMember();
        $outsider = User::factory()->create();
        $attachment = CardAttachment::factory()->create([
            'card_id' => $card->id,
            'user_id' => $member->id,
            'disk' => 'local',
            'path' => 'kanban/secure.pdf',
        ]);
        Storage::disk('local')->put($attachment->path, 'secret');

        $this->actingAs($outsider)
            ->get(route('kanban.attachments.download', $attachment))
            ->assertForbidden();
        $this->actingAs($outsider)
            ->delete(route('kanban.attachments.destroy', $attachment))
            ->assertForbidden();

        $this->assertModelExists($attachment);
        Storage::disk('local')->assertExists($attachment->path);
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
