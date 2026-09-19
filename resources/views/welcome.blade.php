<!doctype html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="theme-color" content="#176b4d">
    <link rel="manifest" href="/manifest.webmanifest">
    <title>ObraPro</title>
    <style>
        *{box-sizing:border-box}body{margin:0;font-family:Arial,sans-serif;background:#f4f6f5;color:#18201d}main{max-width:760px;margin:auto;padding:64px 24px}h1{font-size:48px;margin:0 0 8px;color:#176b4d}p{font-size:20px;line-height:1.5}.primary{display:inline-block;margin:18px 0 40px;padding:14px 22px;background:#176b4d;color:#fff;text-decoration:none;border-radius:6px;font-weight:700}.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}.item{padding:20px;border:1px solid #c9d2ce;background:#fff;border-radius:6px;font-weight:700}@media(max-width:520px){main{padding-top:40px}h1{font-size:40px}.grid{grid-template-columns:1fr}}
    </style>
</head>
<body>
<main>
    <h1>ObraPro</h1>
    <p>Passo a passo. Obra bem feita.</p>
    <a class="primary" href="{{ route('login') }}">Acessar</a>
    <section class="grid" aria-label="Areas principais">
        <div class="item">Aprender</div><div class="item">Minha obra</div><div class="item">Atividades</div><div class="item">Ajuda</div>
    </section>
</main>
<script>if('serviceWorker' in navigator){navigator.serviceWorker.register('/service-worker.js')}</script>
</body>
</html>
