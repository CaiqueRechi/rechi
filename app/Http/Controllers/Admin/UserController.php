<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Fortify\CreateNewUser;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function create(Request $request): Response
    {
        return Inertia::render('admin/users/create', [
            'passwordRules' => Password::defaults()->toPasswordRulesString(),
            'status' => $request->session()->get('status'),
        ]);
    }

    public function store(Request $request, CreateNewUser $createNewUser): RedirectResponse
    {
        $createNewUser->create($request->only([
            'name',
            'email',
            'password',
            'password_confirmation',
        ]));

        return to_route('users.create')->with('status', 'Usuário criado com sucesso.');
    }
}
