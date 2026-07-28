<?php

namespace App\Http\Controllers\Kanban;

use App\Http\Controllers\Controller;
use App\Http\Requests\Kanban\StoreCardAttachmentRequest;
use App\Models\Card;
use App\Models\CardAttachment;
use App\Models\User;
use App\Services\Kanban\CardAttachmentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CardAttachmentController extends Controller
{
    public function __construct(private CardAttachmentService $cardAttachmentService) {}

    public function store(StoreCardAttachmentRequest $request, Card $card): RedirectResponse
    {
        /** @var User $actor */
        $actor = $request->user();
        $this->cardAttachmentService->store($card, $actor, $request->file('file'));

        return back()->with('status', 'Anexo enviado.');
    }

    public function download(Request $request, CardAttachment $cardAttachment): StreamedResponse
    {
        $user = $request->user();
        abort_unless(
            $user instanceof User && $user->can('view', $cardAttachment->card),
            403,
        );

        return Storage::disk($cardAttachment->disk)
            ->download($cardAttachment->path, $cardAttachment->original_name);
    }

    public function destroy(Request $request, CardAttachment $cardAttachment): RedirectResponse
    {
        $user = $request->user();
        abort_unless(
            $user instanceof User && $user->can('manageAttachments', $cardAttachment->card),
            403,
        );
        $this->cardAttachmentService->delete($cardAttachment, $user);

        return back()->with('status', 'Anexo excluído.');
    }
}
