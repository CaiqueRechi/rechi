<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\UpdateUploadFileSettingsRequest;
use App\Models\UploadSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UploadFileSettingsController extends Controller
{
    public function edit(Request $request): Response
    {
        $settings = UploadSetting::briefingDefaults();

        return Inertia::render('settings/general/upload-files', [
            'settings' => [
                'allowedMimeTypes' => $settings->allowed_mime_types,
                'allowedExtensions' => $settings->allowed_extensions,
                'maxFileSizeKb' => $settings->max_file_size_kb,
                'maxTotalSizeKb' => $settings->max_total_size_kb,
                'maxFilesPerBriefing' => $settings->max_files_per_briefing,
                'isActive' => $settings->is_active,
            ],
            'status' => $request->session()->get('status'),
        ]);
    }

    public function update(UpdateUploadFileSettingsRequest $request): RedirectResponse
    {
        UploadSetting::briefingDefaults()->update($request->validated());

        return back()->with('status', 'Configurações de upload atualizadas.');
    }
}
