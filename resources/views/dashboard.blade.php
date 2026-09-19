<!doctype html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Painel | ObraPro</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="min-h-screen overflow-x-hidden bg-surface font-sans text-ink antialiased">
<div class="min-h-screen lg:grid lg:grid-cols-[224px_1fr]">
    <aside class="hidden bg-ink p-5 text-white lg:flex lg:flex-col">
        <div class="flex items-center gap-3"><span class="flex size-10 items-center justify-center rounded-md bg-safety text-xl">⛑</span><strong class="text-lg">ObraPro</strong></div>
        <nav class="mt-8 grid gap-1 text-sm">
            @foreach (['Dashboard', 'Obras', 'Procedimentos', 'Checklists', 'Treinamentos', 'Não conformidades', 'Usuários', 'Relatórios', 'Configurações'] as $item)
                <a class="rounded-md px-3 py-3 {{ $loop->first ? 'bg-white/10 font-bold' : 'text-slate-300 hover:bg-white/10' }}" href="#">{{ $item }}</a>
            @endforeach
        </nav>
        <form class="mt-auto" method="POST" action="{{ route('logout') }}">@csrf<button class="w-full rounded-md border border-white/20 px-3 py-3 text-left text-sm" type="submit">Sair</button></form>
    </aside>

    <main class="min-w-0">
        <header class="border-b border-slate-200 bg-white px-5 py-4 lg:px-8"><div class="flex items-center justify-between"><div><p class="text-xs font-bold uppercase text-slate-500">Obra ativa</p><h1 class="text-xl font-black">Residencial das Flores</h1><p class="text-sm text-slate-500">Belo Horizonte, MG</p></div><div class="flex size-10 items-center justify-center rounded-full bg-blue-100 font-bold text-action">{{ str(auth()->user()->name)->substr(0, 1)->upper() }}</div></div></header>

        <div class="grid gap-6 p-5 lg:p-8">
            <section class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <article class="rounded-md border border-slate-200 bg-white p-5 shadow-sm"><p class="text-sm font-bold text-slate-500">Andamento da obra</p><div class="mt-4 flex items-end justify-between"><strong class="text-3xl">68%</strong><span class="text-3xl text-brand">◔</span></div></article>
                <article class="rounded-md border border-slate-200 bg-white p-5 shadow-sm"><p class="text-sm font-bold text-slate-500">Procedimentos</p><strong class="mt-4 block text-3xl">124</strong></article>
                <article class="rounded-md border border-slate-200 bg-white p-5 shadow-sm"><p class="text-sm font-bold text-slate-500">Checklists concluídos</p><strong class="mt-4 block text-3xl">892</strong></article>
                <article class="rounded-md border border-orange-200 bg-white p-5 shadow-sm"><p class="text-sm font-bold text-slate-500">Não conformidades</p><strong class="mt-4 block text-3xl text-safety">12</strong></article>
            </section>

            <section class="grid gap-6 xl:grid-cols-[1.25fr_1fr]">
                <article class="rounded-md border border-slate-200 bg-white p-5 shadow-sm"><div class="flex items-center justify-between"><h2 class="text-lg font-black">Serviços mais executados</h2><span class="text-xs text-slate-500">Últimos 30 dias</span></div><div class="mt-6 grid gap-5">
                    @foreach ([['Alvenaria', 42], ['Hidráulica', 28], ['Elétrica', 18], ['Acabamentos', 12]] as [$service, $value])
                        <div><div class="mb-2 flex justify-between text-sm"><span>{{ $service }}</span><strong>{{ $value }}%</strong></div><div class="h-3 overflow-hidden rounded-full bg-slate-100"><div class="h-full rounded-full bg-action" style="width: {{ $value }}%"></div></div></div>
                    @endforeach
                </div></article>
                <article class="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm"><img class="aspect-video w-full object-cover" src="/images/bricklayer-training.png" alt="Última evidência registrada na obra"><div class="p-5"><p class="text-xs font-bold uppercase text-brand">Última evidência</p><h2 class="mt-1 text-lg font-black">Primeira fiada concluída</h2><p class="mt-2 text-sm text-slate-500">Alvenaria de vedação · há 18 minutos</p></div></article>
            </section>
        </div>
    </main>
</div>
</body>
</html>
