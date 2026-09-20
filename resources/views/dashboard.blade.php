<!doctype html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="theme-color" content="#176b4d">
    <link rel="manifest" href="/manifest.webmanifest">
    <title>Painel | ObraPro</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="min-h-screen overflow-x-hidden bg-surface pb-16 font-sans text-ink antialiased lg:pb-0">
<div class="min-h-screen lg:grid lg:grid-cols-[224px_1fr]">
    <aside class="hidden bg-ink p-5 text-white lg:flex lg:flex-col">
        <div class="flex items-center gap-3"><span class="flex size-10 items-center justify-center rounded-md bg-safety text-sm font-black">OP</span><strong class="text-lg">ObraPro</strong></div>
        <nav class="mt-8 grid gap-1 text-sm" aria-label="Painel administrativo">
            @foreach ([['overview', 'Dashboard'], ['works', 'Obras'], ['procedures', 'Procedimentos'], ['checklists', 'Checklists'], ['issues', 'Nao conformidades']] as [$view, $label])
                <button class="rounded-md px-3 py-3 text-left {{ $loop->first ? 'bg-white/10 font-bold' : 'text-slate-300 hover:bg-white/10' }}" type="button" data-dashboard-go="{{ $view }}">{{ $label }}</button>
            @endforeach
            <a class="rounded-md px-3 py-3 text-left text-slate-300 hover:bg-white/10" href="{{ route('courses.index') }}">Cursos e conteúdos</a>
            @can('viewPlatformSecurity')
                <a class="mt-3 rounded-md border border-white/15 px-3 py-3 text-slate-200 hover:bg-white/10" href="{{ route('platform-security') }}">Seguranca da plataforma</a>
            @endcan
        </nav>
        <form class="mt-auto" method="POST" action="{{ route('logout') }}">@csrf<button class="w-full rounded-md border border-white/20 px-3 py-3 text-left text-sm" type="submit">Sair</button></form>
    </aside>

    <main class="min-w-0">
        <header class="border-b border-slate-200 bg-white px-5 py-4 lg:px-8"><div class="flex items-center justify-between gap-4"><div><p class="text-xs font-bold uppercase text-slate-500">Organizacao ativa</p><h1 class="text-xl font-black">{{ $organization?->name ?? 'Ambiente de demonstracao' }}</h1><p class="text-sm text-slate-500">Residencial das Flores - Belo Horizonte, MG</p></div><div class="flex items-center gap-3"><span class="hidden rounded-md bg-emerald-50 px-3 py-2 text-xs font-bold text-brand sm:block">Sincronizado</span><div class="flex size-10 items-center justify-center rounded-full bg-blue-100 font-bold text-action">{{ str(auth()->user()->name)->substr(0, 1)->upper() }}</div></div></div></header>

        <div class="grid gap-6 p-5 lg:p-8" data-dashboard-view="overview">
            <section class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                @foreach ([['Obras ativas', $works->count(), 'text-brand'], ['Procedimentos', $procedureCount, 'text-ink'], ['Execucoes concluidas', $completedExecutionCount, 'text-action'], ['Em andamento', $activeExecutionCount, 'text-safety']] as [$label,$value,$color])
                    <article class="rounded-md border border-slate-200 bg-white p-5 shadow-sm"><p class="text-sm font-bold text-slate-500">{{ $label }}</p><strong class="mt-4 block text-3xl {{ $color }}">{{ $value }}</strong></article>
                @endforeach
            </section>
            <section class="grid gap-6 xl:grid-cols-[1.25fr_1fr]">
                <article class="rounded-md border border-slate-200 bg-white p-5 shadow-sm"><div class="flex items-center justify-between"><h2 class="text-lg font-black">Servicos mais executados</h2><span class="text-xs text-slate-500">Ultimos 30 dias</span></div><div class="mt-6 grid gap-5">@foreach ([['Alvenaria',42],['Hidraulica',28],['Eletrica',18],['Acabamentos',12]] as [$service,$value])<div><div class="mb-2 flex justify-between text-sm"><span>{{ $service }}</span><strong>{{ $value }}%</strong></div><div class="h-3 overflow-hidden rounded-full bg-slate-100"><div class="h-full rounded-full bg-action" style="width: {{ $value }}%"></div></div></div>@endforeach</div></article>
                <article class="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm"><img class="aspect-video w-full object-cover" src="/images/bricklayer-training.png" alt="Ultima evidencia registrada"><div class="p-5"><p class="text-xs font-bold uppercase text-brand">Ultima evidencia</p><h2 class="mt-1 text-lg font-black">Primeira fiada concluida</h2><p class="mt-2 text-sm text-slate-500">Alvenaria de vedacao - ha 18 minutos</p></div></article>
            </section>
            <section><div class="flex items-center justify-between"><h2 class="text-lg font-black">Atividade recente</h2><button class="text-sm font-bold text-action" data-dashboard-go="checklists">Ver checklists</button></div><div class="mt-3 overflow-x-auto rounded-md border border-slate-200 bg-white"><table class="w-full min-w-[620px] text-left text-sm"><thead class="bg-slate-50 text-slate-500"><tr><th class="p-4">Equipe</th><th class="p-4">Atividade</th><th class="p-4">Status</th><th class="p-4">Horario</th></tr></thead><tbody class="divide-y divide-slate-100">@foreach ([['Equipe A','Primeira fiada','Concluida','09:42'],['Equipe B','Instalacao hidraulica','Em andamento','09:18'],['Qualidade','Inspecao pavimento 2','Revisao','08:55']] as $row)<tr>@foreach ($row as $cell)<td class="p-4 {{ $loop->first ? 'font-bold' : '' }}">{{ $cell }}</td>@endforeach</tr>@endforeach</tbody></table></div></section>
        </div>

        <section class="hidden p-5 lg:p-8" data-dashboard-view="works"><div class="flex items-center justify-between gap-3"><div><h2 class="text-2xl font-black">Obras</h2><p class="text-sm text-slate-500">3 obras ativas</p></div><button class="touch-button bg-action text-white">Nova obra</button></div><div class="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">@foreach ([['Residencial das Flores','Belo Horizonte, MG',68],['Edificio Horizonte','Contagem, MG',42],['Vila Nova','Nova Lima, MG',19]] as [$name,$city,$progress])<article class="rounded-md border border-slate-200 bg-white p-5 shadow-sm"><span class="text-xs font-bold uppercase text-brand">Em execucao</span><h3 class="mt-2 text-lg font-black">{{ $name }}</h3><p class="text-sm text-slate-500">{{ $city }}</p><div class="mt-6 flex justify-between text-sm"><span>Progresso</span><strong>{{ $progress }}%</strong></div><div class="mt-2 h-2 rounded-full bg-slate-100"><div class="h-2 rounded-full bg-brand" style="width: {{ $progress }}%"></div></div></article>@endforeach</div></section>
        <section class="hidden p-5 lg:p-8" data-dashboard-view="procedures"><h2 class="text-2xl font-black">Procedimentos</h2><p class="text-sm text-slate-500">Biblioteca operacional</p><div class="mt-6 overflow-x-auto rounded-md border border-slate-200 bg-white"><table class="w-full min-w-[620px] text-left text-sm"><thead class="bg-slate-50 text-slate-500"><tr><th class="p-4">Procedimento</th><th class="p-4">Categoria</th><th class="p-4">Versao</th><th class="p-4">Situacao</th></tr></thead><tbody class="divide-y divide-slate-100">@foreach ([['Alvenaria de vedacao','Alvenaria','v2.1','Publicado'],['Instalacao de agua fria','Hidraulica','v1.4','Publicado'],['Quadro de distribuicao','Eletrica','v1.2','Revisao']] as $row)<tr>@foreach ($row as $cell)<td class="p-4 {{ $loop->first ? 'font-bold' : '' }}">{{ $cell }}</td>@endforeach</tr>@endforeach</tbody></table></div></section>
        <section class="hidden p-5 lg:p-8" data-dashboard-view="checklists"><h2 class="text-2xl font-black">Checklists</h2><p class="text-sm text-slate-500">Execucoes registradas pelas equipes</p><div class="mt-6 grid gap-3">@foreach ([['Primeira fiada - Torre A','Equipe A','5/5','Concluido'],['Tubulacao banheiro 204','Equipe B','3/6','Em andamento'],['Conferencia de prumo','Equipe A','0/4','Pendente']] as [$title,$team,$count,$status])<article class="grid gap-3 rounded-md border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[1fr_auto_auto] sm:items-center"><div><h3 class="font-bold">{{ $title }}</h3><p class="text-sm text-slate-500">{{ $team }}</p></div><strong>{{ $count }}</strong><span class="rounded-md bg-slate-100 px-3 py-2 text-xs font-bold">{{ $status }}</span></article>@endforeach</div></section>
        <section class="hidden p-5 lg:p-8" data-dashboard-view="issues"><div class="flex items-center justify-between gap-3"><div><h2 class="text-2xl font-black">Nao conformidades</h2><p class="text-sm text-slate-500">12 registros abertos</p></div><button class="touch-button bg-safety text-white">Novo registro</button></div><div class="mt-6 grid gap-3">@foreach ([['NC-028','Junta fora da espessura','Alta','Carlos Mendes'],['NC-027','EPI incompleto na frente 2','Media','Ana Souza'],['NC-026','Material sem identificacao','Baixa','Equipe B']] as [$code,$title,$priority,$owner])<article class="grid gap-3 rounded-md border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[90px_1fr_100px_180px] md:items-center"><strong class="text-action">{{ $code }}</strong><span class="font-bold">{{ $title }}</span><span>{{ $priority }}</span><span class="text-sm text-slate-500">{{ $owner }}</span></article>@endforeach</div></section>
    </main>
</div>
<nav class="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-slate-200 bg-white p-2 lg:hidden"><button class="min-h-12 text-xs font-bold text-action" data-dashboard-go="overview">Inicio</button><button class="min-h-12 text-xs" data-dashboard-go="works">Obras</button><button class="min-h-12 text-xs" data-dashboard-go="checklists">Checklists</button><button class="min-h-12 text-xs" data-dashboard-go="issues">Pendencias</button></nav>
</body>
</html>
