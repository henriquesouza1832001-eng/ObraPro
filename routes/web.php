<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PlatformSecurityController;
use Illuminate\Support\Facades\Route;

Route::view('/', 'welcome')->name('home');
Route::view('/health', 'health')->name('health');

Route::middleware('guest')->group(function (): void {
    Route::get('/entrar', [AuthController::class, 'create'])->name('login');
    Route::post('/entrar', [AuthController::class, 'store'])->middleware('throttle:login');
});

Route::middleware('auth')->group(function (): void {
    Route::get('/painel', DashboardController::class)->name('dashboard');
    Route::get('/painel/seguranca', PlatformSecurityController::class)->name('platform-security');
    Route::post('/sair', [AuthController::class, 'destroy'])->name('logout');
});
