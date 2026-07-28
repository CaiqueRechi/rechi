<?php

namespace App\Services\Access;

use App\Models\Access;
use App\Models\AccessAudit;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AccessUpdater
{
    public function __construct(private AccessManager $accessManager) {}

    /**
     * @param  array<string, mixed>  $permissions
     */
    public function update(
        User $actor,
        User $subject,
        array $permissions,
        ?string $expectedUpdatedAt,
        ?string $ipAddress,
        ?string $userAgent,
    ): Access {
        $this->authorizeUpdate($actor, $subject);
        $normalized = $this->accessManager->normalize($permissions);
        $this->authorizeGrants($actor, $normalized);

        return DB::transaction(function () use (
            $actor,
            $subject,
            $normalized,
            $expectedUpdatedAt,
            $ipAddress,
            $userAgent,
        ): Access {
            $access = Access::query()
                ->whereBelongsTo($subject)
                ->lockForUpdate()
                ->first();

            if ($access === null) {
                $access = Access::query()->create([
                    'user_id' => $subject->getKey(),
                    'accesses' => $this->accessManager->defaults(),
                ]);
            }

            if ($expectedUpdatedAt !== null && $access->updated_at?->toJSON() !== $expectedUpdatedAt) {
                throw ValidationException::withMessages([
                    'version' => 'Os acessos foram alterados em outra sessão. Recarregue a página antes de salvar.',
                ]);
            }

            $before = $access->accesses;

            if ($before === $normalized) {
                return $access;
            }

            $access->update(['accesses' => $normalized]);

            AccessAudit::query()->create([
                'actor_id' => $actor->getKey(),
                'subject_id' => $subject->getKey(),
                'before' => $before,
                'after' => $normalized,
                'ip_address' => $ipAddress,
                'user_agent' => $userAgent,
            ]);

            $this->accessManager->forget($subject);

            return $access->refresh();
        });
    }

    private function authorizeUpdate(User $actor, User $subject): void
    {
        if ($actor->is($subject)) {
            throw new AuthorizationException('Você não pode alterar as próprias permissões.');
        }

        if ($this->accessManager->isOwner($subject)) {
            throw new AuthorizationException('As permissões do proprietário não podem ser alteradas.');
        }

        if (! $this->accessManager->allows($actor, 'access_management.update')) {
            throw new AuthorizationException;
        }
    }

    /** @param array<string, array<string, bool>> $permissions */
    private function authorizeGrants(User $actor, array $permissions): void
    {
        foreach (Arr::dot($permissions) as $permission => $granted) {
            if (! $granted) {
                continue;
            }

            if (in_array($permission, $this->accessManager->criticalPermissions(), true)
                && ! $this->accessManager->isOwner($actor)) {
                throw new AuthorizationException('Somente o proprietário pode conceder permissões administrativas críticas.');
            }

            if (! $this->accessManager->allows($actor, $permission)) {
                throw new AuthorizationException('Você não pode conceder uma permissão que não possui.');
            }
        }
    }
}
