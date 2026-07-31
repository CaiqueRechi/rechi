<?php

namespace App\Http\Requests\DeviceManagement;

use App\Enums\DeviceProfileType;
use App\Models\DeviceProfile;
use App\Rules\SecureHttpsUrl;
use App\Services\Access\AccessManager;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDeviceProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null
            && app(AccessManager::class)->allows($this->user(), 'device_profiles.update');
    }

    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        $profile = $this->route('deviceProfile');

        return [
            'name' => ['required', 'string', 'max:120'],
            'slug' => [
                'required',
                'string',
                'max:140',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique('device_profiles', 'slug')->ignore($profile instanceof DeviceProfile ? $profile->getKey() : null),
            ],
            'type' => ['required', Rule::enum(DeviceProfileType::class)],
            'description' => ['nullable', 'string', 'max:5000'],
            'is_active' => ['required', 'boolean'],
            'config' => ['required', 'array:url'],
            'config.url' => ['required', 'string', 'max:2048', new SecureHttpsUrl],
        ];
    }
}
