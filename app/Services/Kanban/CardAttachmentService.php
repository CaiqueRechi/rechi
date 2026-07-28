<?php

namespace App\Services\Kanban;

use App\Models\Card;
use App\Models\CardActivity;
use App\Models\CardAttachment;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

class CardAttachmentService
{
    public function store(Card $card, User $actor, UploadedFile $file): CardAttachment
    {
        $disk = (string) config('kanban.attachments.disk', 'local');
        $path = $file->store("kanban/{$card->board_id}/{$card->getKey()}", $disk);

        if ($path === false) {
            throw new RuntimeException('The Kanban attachment could not be stored.');
        }

        try {
            return DB::transaction(function () use ($card, $actor, $file, $disk, $path): CardAttachment {
                $attachment = $card->attachments()->create([
                    'user_id' => $actor->getKey(),
                    'disk' => $disk,
                    'path' => $path,
                    'original_name' => Str::limit(basename($file->getClientOriginalName()), 255, ''),
                    'mime_type' => (string) $file->getMimeType(),
                    'size_bytes' => $file->getSize(),
                ]);

                CardActivity::query()->create([
                    'board_id' => $card->board_id,
                    'card_id' => $card->getKey(),
                    'user_id' => $actor->getKey(),
                    'type' => 'attachment_added',
                    'changes' => ['attachment_id' => $attachment->getKey()],
                ]);

                return $attachment;
            });
        } catch (\Throwable $exception) {
            Storage::disk($disk)->delete($path);

            throw $exception;
        }
    }

    public function delete(CardAttachment $attachment, User $actor): void
    {
        DB::transaction(function () use ($attachment, $actor): void {
            $attachment->delete();

            CardActivity::query()->create([
                'board_id' => $attachment->card->board_id,
                'card_id' => $attachment->card_id,
                'user_id' => $actor->getKey(),
                'type' => 'attachment_removed',
                'changes' => ['attachment_id' => $attachment->getKey()],
            ]);

            DB::afterCommit(
                fn () => Storage::disk($attachment->disk)->delete($attachment->path),
            );
        });
    }
}
