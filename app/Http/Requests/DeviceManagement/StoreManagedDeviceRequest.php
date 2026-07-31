<?php

namespace App\Http\Requests\DeviceManagement;

use App\Services\Access\AccessManager;
use Illuminate\Foundation\Http\FormRequest;

class StoreManagedDeviceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null
            && app(AccessManager::class)->allows($this->user(), 'device_profiles.manage_devices');
    }

    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return [
            'device_uuid' => ['required', 'uuid'],
            'label' => ['nullable', 'string', 'max:120'],
        ];
    }
}
