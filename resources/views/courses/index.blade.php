<!doctype html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#10233f">
    <title>Cursos de obra | ObraPro</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="min-h-screen bg-surface font-sans text-ink antialiased">
<header class="border-b border-slate-200 bg-white">
    <div class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
        <a class="flex items-center gap-3" href="{{ route('home') }}"><span class="flex size-10 items-center justify-center rounded-md bg-safety text-white"><x-icon name="hardhat" /></span><span><strong class="block text-lg">ObraPro</strong><small class="text-slate-500">Aprenda. Planeje. Construa.</small></span></a>
        <nav class="flex items-center gap-3 text-sm font-bold"><a class="hidden text-slate-600 sm:inline" href="{{ route('home') }}">Como funciona</a><a class="rounded-md bg-action px-4 py-3 text-white" href="{{ route('login') }}">Entrar</a></nav>
    </div>
</header>
<main>
    <section class="bg-ink px-5 py-14 text-white lg:px-8 lg:py-20"><div class="mx-auto max-w-7xl"><span class="text-sm font-bold uppercase tracking-wide text-orange-300">Cursos ObraPro</span><h1 class="mt-3 max-w-3xl text-4xl font-black leading-tight sm:text-5xl">Do terreno ao acabamento, com clareza em cada etapa.</h1><p class="mt-5 max-w-2xl text-lg leading-8 text-slate-200">Conteúdo direto, checklists e orientação prática para você construir com menos erro e mais confiança.</p></div></section>
    <section class="mx-auto max-w-7xl px-5 py-10 lg:px-8"><div class="flex flex-wrap items-end justify-between gap-4"><div><h2 class="text-2xl font-black">Trilhas para sua obra</h2><p class="mt-1 text-slate-600">Comece pelo conteúdo gratuito e avance no seu ritmo.</p></div><span class="rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold text-brand">{{ $courses->count() }} cursos publicados</span></div>
        <div class="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            @foreach ($courses as $course)
                <a class="group flex h-full flex-col rounded-md border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-action" href="{{ route('courses.show', $course) }}">
                    <div class="flex items-center justify-between gap-3"><span class="rounded-md bg-blue-50 px-3 py-2 text-xs font-bold uppercase text-action">{{ $course->category }}</span><span class="text-sm font-bold {{ $course->access_type === 'free' ? 'text-brand' : 'text-safety' }}">{{ $course->access_type === 'free' ? 'Gratuito' : 'A partir de R$ '.number_format(($course->price_cents ?? 0) / 100, 2, ',', '.') }}</span></div>
                    <h3 class="mt-5 text-xl font-black group-hover:text-action">{{ $course->title }}</h3><p class="mt-2 flex-1 text-sm leading-6 text-slate-600">{{ $course->description }}</p>
                    <div class="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-sm text-slate-500"><span>{{ $course->modules_count }} módulos</span><span>{{ $course->duration_minutes }} min</span><span class="inline-flex items-center gap-1 font-bold text-action">Ver curso <x-icon name="arrow-right" :size="16" /></span></div>
                </a>
            @endforeach
        </div>
    </section>
</main>
</body>
</html>
