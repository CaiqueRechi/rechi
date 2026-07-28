<?php

namespace App\Http\Requests\Admin;

use App\Models\User;
use App\Services\Access\AccessManager;
use Illuminate\Foundation\Http\FormRequest;

class UpdateUserAccessRequest extends FormRequest
{
    public function authorize(): bool
    {
        $actor = $this->user();
        $subject = $this->route('user');
        $accessManager = app(AccessManager::class);

        return $actor instanceof User
            && $subject instanceof User
            && ! $actor->is($subject)
            && ! $accessManager->isOwner($subject)
            && $accessManager->allows($actor, 'access_management.update');
    }

    /** @return array<string, array<int, string>> */
    public function rules(): array
    {
        return [
            'accesses' => ['required', 'array'],
            'version' => ['nullable', 'date'],
        ];
    }

    protected function passedValidation(): void
    {
        app(AccessManager::class)->normalize($this->validated('accesses'));
    }
}
