<?php

namespace App\Console\Commands;

use App\Models\Access;
use App\Models\User;
use App\Services\Access\AccessManager;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('access:sync {--owner= : Owner user ID for this execution}')]
#[Description('Create safe access records and guarantee full effective owner access')]
class SyncUserAccess extends Command
{
    public function handle(AccessManager $accessManager): int
    {
        $ownerOption = $this->option('owner');

        if (filled($ownerOption)) {
            $owner = User::query()->find($ownerOption);

            if ($owner === null) {
                $this->error('The supplied owner user does not exist.');

                return self::FAILURE;
            }

            config()->set('access.owner_user_id', $owner->getKey());
        }

        User::query()->select('id')->chunkById(200, function ($users) use ($accessManager): void {
            foreach ($users as $user) {
                Access::query()->firstOrCreate(
                    ['user_id' => $user->getKey()],
                    ['accesses' => $accessManager->defaults()],
                );
            }
        });

        if (! filled(config('access.owner_user_id'))) {
            $this->warn('APP_OWNER_USER_ID is not configured. Records were created with safe defaults only.');
        }

        $this->info('User access records synchronized.');

        return self::SUCCESS;
    }
}
