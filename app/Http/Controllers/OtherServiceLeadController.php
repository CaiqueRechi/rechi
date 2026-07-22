<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOtherServiceLeadRequest;
use App\Models\Lead;
use Illuminate\Http\RedirectResponse;

class OtherServiceLeadController extends Controller
{
    public function __invoke(StoreOtherServiceLeadRequest $request): RedirectResponse
    {
        $data = $request->validated();
        unset($data['consent_accepted']);

        Lead::query()->create([
            ...$data,
            'user_id' => $request->user()?->id,
            'type' => 'other_service',
            'status' => 'new',
            'lead_source' => 'home_other_services',
            'entry_page' => $request->headers->get('referer'),
            'consent_accepted_at' => now(),
        ]);

        return back()->with('status', 'Solicitacao enviada.');
    }
}
