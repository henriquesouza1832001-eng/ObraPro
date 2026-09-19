<!doctype html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#10233f">
    <title>{{ $course->title }} | ObraPro</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="min-h-screen bg-surface font-sans text-ink antialiased">
<header class="border-b border-slate-200 bg-white"><div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 lg:px-8"><a class="flex items-center gap-3" href="{{ route('courses.index') }}"><span class="flex size-10 items-center justify-center rounded-md bg-safety text-white"><x-icon name="hardhat" /></span><strong>ObraPro Cursos</strong></a><a class="text-sm font-bold text-action" href="{{ route('login') }}">Entrar</a></div></header>
<main class="mx-auto grid max-w-6xl gap-8 px-5 py-8 lg:grid-cols-[1fr_340px] lg:px-8 lg:py-12">
    <div><a class="text-sm font-bold text-action" href="{{ route('courses.index') }}">&larr; Todos os cursos</a><div class="mt-6 flex flex-wrap items-center gap-3"><span class="rounded-md bg-blue-50 px-3 py-2 text-xs font-bold uppercase text-action">{{ $course->category }}</span><span class="text-sm text-slate-500">{{ $course->level === 'beginner' ? 'Comece do zero' : 'Intermediário' }}</span></div><h1 class="mt-4 text-4xl font-black leading-tight">{{ $course->title }}</h1><p class="mt-4 max-w-2xl text-lg leading-8 text-slate-600">{{ $course->description }}</p><div class="mt-6 flex flex-wrap gap-4 text-sm font-bold text-slate-600"><span>{{ $course->duration_minutes }} minutos</span><span>{{ $course->modules->count() }} módulos</span><span>Passo a passo</span></div>
        <section class="mt-10"><h2 class="text-2xl font-black">O que você vai aprender</h2><div class="mt-5 grid gap-3">@foreach ($course->modules as $module)<article class="rounded-md border border-slate-200 bg-white p-5"><div class="flex items-start justify-between gap-4"><div><span class="text-xs font-bold uppercase text-brand">Módulo {{ $loop->iteration }}</span><h3 class="mt-1 text-lg font-black">{{ $module->title }}</h3><p class="mt-1 text-sm text-slate-600">{{ $module->description }}</p></div><span class="text-sm text-slate-500">{{ $module->lessons->count() }} aulas</span></div><ul class="mt-4 grid gap-2 border-t border-slate-100 pt-4 text-sm text-slate-600">@foreach ($module->lessons as $lesson)<li class="flex items-start gap-2"><span class="mt-1 text-brand" aria-hidden="true">&#10003;</span><span>{{ $lesson->title }} <small class="text-slate-400">&middot; {{ $lesson->duration_minutes }} min</small></span></li>@endforeach</ul></article>@endforeach</div></section>
    </div>
    <aside class="h-fit rounded-md border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-6"><span class="text-sm font-bold text-brand">Acesso ObraPro</span><h2 class="mt-3 text-2xl font-black">Aprenda no seu ritmo</h2><p class="mt-3 text-sm leading-6 text-slate-600">Conteúdo direto para consultar no celular, no computador ou no canteiro.</p><a class="touch-button mt-6 w-full bg-action text-white" href="{{ route('login') }}">{{ $course->access_type === 'free' ? 'Começar gratuitamente' : 'Quero conhecer este curso' }}</a><p class="mt-3 text-center text-xs text-slate-500">Este curso é um apoio educativo e não substitui projeto ou responsável técnico.</p></aside>
</main>
</body>
</html>
