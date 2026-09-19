<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

Route::view('/', 'welcome')->name('home');
Route::view('/health', 'health')->name('health');

Route::middleware('guest')->group(function (): void {
    Route::get('/entrar', [AuthController::class, 'create'])->name('login');
    Route::post('/entrar', [AuthController::class, 'store'])->middleware('throttle:login');
});

Route::middleware('auth')->group(function (): void {
    Route::view('/painel', 'dashboard')->name('dashboard');
    Route::post('/sair', [AuthController::class, 'destroy'])->name('logout');
});
