<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateUserAccessRequest;
use App\Models\Access;
use App\Models\User;
use App\Services\Access\AccessManager;
use App\Services\Access\AccessUpdater;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Inertia\Inertia;
use Inertia\Response;

class AccessManagementController extends Controller
{
    public function __construct(
        private AccessManager $accessManager,
        private AccessUpdater $accessUpdater,
    ) {}

    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->toString();
        $users = User::query()
            ->with('access')
            ->when($search !== '', fn ($query) => $query->where(function ($query) use ($search): void {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            }))
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (User $user): array => $this->serializeUser($user));

        return Inertia::render('admin/access/index', [
            'catalogue' => $this->accessManager->catalogueForUi(),
            'users' => $users,
            'filters' => ['search' => $search],
        ]);
    }

    public function update(UpdateUserAccessRequest $request, User $user): RedirectResponse
    {
        /** @var User $actor */
        $actor = $request->user();

        $this->accessUpdater->update(
            $actor,
            $user,
            $request->validated('accesses'),
            $request->validated('version'),
            $request->ip(),
            $request->userAgent(),
        );

        return back()->with('status', "Acessos de {$user->name} atualizados.");
    }

    /** @return array<string, mixed> */
    private function serializeUser(User $user): array
    {
        $access = Access::query()->firstOrNew(
            ['user_id' => $user->getKey()],
            ['accesses' => []],
        );
        $stored = $access->accesses;

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'isOwner' => $this->accessManager->isOwner($user),
            'accesses' => $this->accessManager->permissionsFor($user),
            'configured' => collect(Arr::dot($this->accessManager->defaults()))
                ->mapWithKeys(fn (bool $value, string $permission): array => [
                    $permission => Arr::has($stored, $permission),
                ])
                ->all(),
            'version' => $access->updated_at?->toJSON(),
        ];
    }
}
