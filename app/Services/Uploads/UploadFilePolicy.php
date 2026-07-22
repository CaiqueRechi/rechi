<?php

namespace App\Services\Uploads;

use App\Models\Briefing;
use App\Models\UploadSetting;
use Illuminate\Http\UploadedFile;
use Illuminate\Validation\ValidationException;

class UploadFilePolicy
{
    public function settings(): UploadSetting
    {
        return UploadSetting::briefingDefaults();
    }

    public function validateForBriefing(Briefing $briefing, UploadedFile $file): void
    {
        $settings = $this->settings();

        if (! $settings->is_active) {
            throw ValidationException::withMessages([
                'file' => 'O envio de arquivos está temporariamente desativado.',
            ]);
        }

        if (! in_array($file->getMimeType(), $settings->allowed_mime_types, true)) {
            throw ValidationException::withMessages([
                'file' => 'Tipo de arquivo não permitido.',
            ]);
        }

        if (! in_array(strtolower((string) $file->extension()), $settings->allowed_extensions, true)) {
            throw ValidationException::withMessages([
                'file' => 'Extensão de arquivo não permitida.',
            ]);
        }

        if (($file->getSize() ?: 0) > $settings->max_file_size_kb * 1024) {
            throw ValidationException::withMessages([
                'file' => 'Arquivo maior que o limite permitido.',
            ]);
        }

        $currentTotalBytes = (int) $briefing->files()->sum('size_bytes');
        if ($currentTotalBytes + ($file->getSize() ?: 0) > $settings->max_total_size_kb * 1024) {
            throw ValidationException::withMessages([
                'file' => 'O total de arquivos do briefing ultrapassa o limite configurado.',
            ]);
        }

        if ($briefing->files()->count() >= $settings->max_files_per_briefing) {
            throw ValidationException::withMessages([
                'file' => 'O briefing já atingiu o limite de arquivos.',
            ]);
        }
    }
}
