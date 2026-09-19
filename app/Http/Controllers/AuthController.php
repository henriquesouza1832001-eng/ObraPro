<?php

namespace App\Http\Controllers;

use App\Contracts\SecurityTelemetry;
use App\Enums\SecurityEventType;
use App\Http\Requests\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

class AuthController extends Controller
{
    public function create(): View
    {
        return view('auth.login');
    }

    public function store(LoginRequest $request, SecurityTelemetry $telemetry): RedirectResponse
    {
        $credentials = $request->safe()->only(['email', 'password']);

        if (! Auth::attempt($credentials, false)) {
            $telemetry->record(SecurityEventType::AuthLoginFailure, 'warning', [
                'route' => 'login',
                'result' => 'denied',
            ]);

            return back()->withErrors(['email' => 'Nao foi possivel entrar com esses dados.'])->onlyInput('email');
        }

        $request->session()->regenerate();
        $telemetry->record(SecurityEventType::AuthLoginSuccess, actorId: (string) $request->user()->getAuthIdentifier());

        return redirect()->intended(route('dashboard'));
    }

    public function destroy(Request $request, SecurityTelemetry $telemetry): RedirectResponse
    {
        $actorId = (string) $request->user()->getAuthIdentifier();
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        $telemetry->record(SecurityEventType::AuthLogout, actorId: $actorId);

        return redirect()->route('home');
    }
}
