<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EvidenceController;
use App\Http\Controllers\ExecutionController;
use App\Http\Controllers\OrganizationMemberController;
use App\Http\Controllers\PlatformSecurityController;
use App\Http\Controllers\ProcedureController;
use App\Http\Controllers\SupportTicketController;
use App\Http\Controllers\WorkController;
use Illuminate\Support\Facades\Route;

Route::view('/', 'welcome')->name('home');
Route::view('/health', 'health')->name('health');
Route::get('/cursos', [CourseController::class, 'index'])->name('courses.index');
Route::get('/cursos/{course}', [CourseController::class, 'show'])->name('courses.show');

Route::middleware('guest')->group(function (): void {
    Route::get('/entrar', [AuthController::class, 'create'])->name('login');
    Route::post('/entrar', [AuthController::class, 'store'])->middleware('throttle:login');
});

Route::middleware('auth')->group(function (): void {
    Route::get('/painel', DashboardController::class)->name('dashboard');
    Route::get('/painel/obras', [WorkController::class, 'index'])->name('works.index');
    Route::get('/painel/organizacoes/{organization}/membros', [OrganizationMemberController::class, 'index'])->name('organizations.members.index');
    Route::post('/painel/suporte/chamados', [SupportTicketController::class, 'store'])->name('support-tickets.store');
    Route::patch('/painel/organizacoes/{organization}/membros/{membership}', [OrganizationMemberController::class, 'update'])->name('organizations.members.update');
    Route::get('/painel/obras/{work}', [WorkController::class, 'show'])->name('works.show');
    Route::patch('/painel/procedimentos/{procedure}/status', [ProcedureController::class, 'updateStatus'])->name('procedures.status.update');
    Route::post('/painel/obras/{work}/procedimentos/{procedure}/execucoes', [ExecutionController::class, 'store'])->name('executions.store');
    Route::patch('/painel/execucoes/{execution}/passos/{executionStep}', [ExecutionController::class, 'updateStep'])->name('execution-steps.update');
    Route::patch('/painel/execucoes/{execution}/reabrir', [ExecutionController::class, 'reopen'])->name('executions.reopen');
    Route::post('/painel/execucoes/passos/{executionStep}/evidencias', [EvidenceController::class, 'store'])->name('evidence.store');
    Route::get('/painel/evidencias/{evidence}/download', [EvidenceController::class, 'download'])->name('evidence.download');
    Route::get('/painel/seguranca', PlatformSecurityController::class)->name('platform-security');
    Route::post('/sair', [AuthController::class, 'destroy'])->name('logout');
});
