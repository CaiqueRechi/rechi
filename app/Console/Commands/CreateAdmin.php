<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class CreateAdmin extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:create-admin {name} {email}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create or reactivate an administrator with a temporary password';

    public function handle(): int
    {
        $password = Str::password(16);
        $email = Str::lower((string) $this->argument('email'));

        $user = User::withTrashed()->firstOrNew(['email' => $email]);
        $user->forceFill([
            'name' => (string) $this->argument('name'),
            'password' => $password,
            'is_admin' => true,
            'is_active' => true,
            'email_verified_at' => now(),
        ]);
        $user->restore();
        $user->save();

        $this->info('Administrador criado com sucesso.');
        $this->line("E-mail: {$email}");
        $this->line("Senha temporária: {$password}");

        return self::SUCCESS;
    }
}
