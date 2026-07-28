<?php

namespace App\Services\Access;

use App\Models\Access;
use App\Models\User;
use Illuminate\Support\Arr;
use Illuminate\Validation\ValidationException;

class AccessManager
{
    /** @var array<int, array<string, array<string, bool>>> */
    private array $resolvedPermissions = [];

    public function isOwner(User $user): bool
    {
        $ownerUserId = config('access.owner_user_id');

        return filled($ownerUserId) && $user->getKey() === (int) $ownerUserId;
    }

    public function allows(User $user, string $permission): bool
    {
        return (bool) Arr::get($this->permissionsFor($user), $permission, false);
    }

    /** @return array<string, array<string, bool>> */
    public function permissionsFor(User $user): array
    {
        if ($this->isOwner($user)) {
            return $this->allGranted();
        }

        return $this->resolvedPermissions[$user->getKey()] ??= $this->mergeWithDefaults(
            $this->storedPermissions($user),
        );
    }

    /** @return array<string, array<string, bool>> */
    public function defaults(): array
    {
        $defaults = [];

        foreach ($this->modules() as $moduleKey => $module) {
            foreach ($module['permissions'] as $permissionKey => $permission) {
                $defaults[$moduleKey][$permissionKey] = (bool) $permission['default'];
            }
        }

        return $defaults;
    }

    /** @return array<string, array<string, bool>> */
    public function allGranted(): array
    {
        $granted = [];

        foreach ($this->modules() as $moduleKey => $module) {
            foreach (array_keys($module['permissions']) as $permissionKey) {
                $granted[$moduleKey][$permissionKey] = true;
            }
        }

        return $granted;
    }

    /**
     * @param  array<string, mixed>  $permissions
     * @return array<string, array<string, bool>>
     */
    public function normalize(array $permissions): array
    {
        $normalized = [];
        $errors = [];

        foreach ($permissions as $moduleKey => $modulePermissions) {
            if (! array_key_exists($moduleKey, $this->modules())) {
                $errors["accesses.{$moduleKey}"] = 'Módulo de permissão desconhecido.';

                continue;
            }

            if (! is_array($modulePermissions)) {
                $errors["accesses.{$moduleKey}"] = 'As permissões do módulo devem ser um objeto.';

                continue;
            }

            foreach ($modulePermissions as $permissionKey => $granted) {
                if (! array_key_exists($permissionKey, $this->modules()[$moduleKey]['permissions'])) {
                    $errors["accesses.{$moduleKey}.{$permissionKey}"] = 'Permissão desconhecida.';

                    continue;
                }

                if (! is_bool($granted)) {
                    $errors["accesses.{$moduleKey}.{$permissionKey}"] = 'O valor da permissão deve ser booleano.';

                    continue;
                }

                $normalized[$moduleKey][$permissionKey] = $granted;
            }
        }

        if ($errors !== []) {
            throw ValidationException::withMessages($errors);
        }

        return $normalized;
    }

    /** @return array<int, array<string, mixed>> */
    public function catalogueForUi(): array
    {
        $catalogue = [];

        foreach ($this->modules() as $moduleKey => $module) {
            $permissions = [];

            foreach ($module['permissions'] as $permissionKey => $permission) {
                $permissions[] = [
                    'key' => $permissionKey,
                    'label' => $permission['label'],
                    'default' => (bool) $permission['default'],
                    'critical' => (bool) ($permission['critical'] ?? false),
                ];
            }

            $catalogue[] = [
                'key' => $moduleKey,
                'label' => $module['label'],
                'permissions' => $permissions,
            ];
        }

        return $catalogue;
    }

    /** @return array<int, array{label: string, route: string, permission: string}> */
    public function navigationFor(User $user): array
    {
        $navigation = [];

        foreach ($this->modules() as $moduleKey => $module) {
            if (! isset($module['navigation'])) {
                continue;
            }

            $permissionKey = $module['navigation']['permission']
                ?? array_key_first($module['permissions']);
            $permission = "{$moduleKey}.{$permissionKey}";

            if ($this->allows($user, $permission)) {
                $navigation[] = [
                    'label' => $module['navigation']['label'],
                    'route' => $module['navigation']['route'],
                    'permission' => $permission,
                ];
            }
        }

        return $navigation;
    }

    /** @return array<int, string> */
    public function criticalPermissions(): array
    {
        $critical = [];

        foreach ($this->modules() as $moduleKey => $module) {
            foreach ($module['permissions'] as $permissionKey => $permission) {
                if ((bool) ($permission['critical'] ?? false)) {
                    $critical[] = "{$moduleKey}.{$permissionKey}";
                }
            }
        }

        return $critical;
    }

    public function forget(User $user): void
    {
        unset($this->resolvedPermissions[$user->getKey()]);
        $user->unsetRelation('access');
    }

    /**
     * @return array<string, array{
     *     label: string,
     *     navigation?: array{label: string, route: string, permission?: string},
     *     permissions: array<string, array{label: string, default: bool, critical?: bool}>
     * }>
     */
    private function modules(): array
    {
        return config('access.modules', []);
    }

    /** @return array<string, array<string, bool>> */
    private function storedPermissions(User $user): array
    {
        $user->loadMissing('access');
        $access = Access::query()->firstOrNew(
            ['user_id' => $user->getKey()],
            ['accesses' => []],
        );

        return $access->accesses;
    }

    /**
     * @param  array<string, mixed>  $stored
     * @return array<string, array<string, bool>>
     */
    private function mergeWithDefaults(array $stored): array
    {
        $normalized = $this->normalize($stored);
        $merged = $this->defaults();

        foreach ($normalized as $moduleKey => $modulePermissions) {
            foreach ($modulePermissions as $permissionKey => $granted) {
                $merged[$moduleKey][$permissionKey] = $granted;
            }
        }

        return $merged;
    }
}
