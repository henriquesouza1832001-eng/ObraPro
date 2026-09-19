<!doctype html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="theme-color" content="#176b4d">
    <title>Seguranca da plataforma | ObraPro</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="min-h-screen bg-surface font-sans text-ink antialiased">
<header class="border-b border-slate-200 bg-white px-5 py-4 lg:px-8"><div class="mx-auto flex max-w-6xl items-center justify-between gap-4"><div><p class="text-xs font-bold uppercase text-safety">Super Admin</p><h1 class="text-xl font-black">Seguranca da plataforma</h1></div><a class="text-sm font-bold text-action" href="{{ route('dashboard') }}">Voltar ao painel</a></div></header>
<main class="mx-auto grid max-w-6xl gap-6 p-5 lg:p-8">
    <section class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        @foreach ([['Eventos nas ultimas 24h','38'],['Falhas de login','7'],['Jobs pendentes','0'],['Integracoes ativas','1']] as [$label,$value])
            <article class="rounded-md border border-slate-200 bg-white p-5 shadow-sm"><p class="text-sm font-bold text-slate-500">{{ $label }}</p><strong class="mt-4 block text-3xl">{{ $value }}</strong></article>
        @endforeach
    </section>
    <section><h2 class="text-lg font-black">Controles reservados</h2><div class="mt-3 overflow-x-auto rounded-md border border-slate-200 bg-white"><table class="w-full min-w-[620px] text-left text-sm"><thead class="bg-slate-50 text-slate-500"><tr><th class="p-4">Area</th><th class="p-4">Estado</th><th class="p-4">Observacao</th></tr></thead><tbody class="divide-y divide-slate-100"><tr><td class="p-4 font-bold">Auditoria</td><td class="p-4 text-brand">Local ativa</td><td class="p-4">Eventos administrativos separados</td></tr><tr><td class="p-4 font-bold">Security events</td><td class="p-4 text-brand">Local ativo</td><td class="p-4">Metadados sanitizados</td></tr><tr><td class="p-4 font-bold">MGL</td><td class="p-4 text-slate-500">Desativado</td><td class="p-4">Aguardando contrato oficial</td></tr><tr><td class="p-4 font-bold">IA</td><td class="p-4 text-slate-500">Nao configurada</td><td class="p-4">Secrets permanecem fora do banco</td></tr></tbody></table></div></section>
</main>
</body>
</html>
