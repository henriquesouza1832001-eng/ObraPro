<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Criar conta | ObraPro</title></head>
<body><main><a href="{{ route('home') }}">ObraPro</a><h1>Comece sua obra com clareza</h1><form method="POST" action="{{ route('register.store') }}">@csrf
<label for="name">Seu nome</label><input id="name" name="name" value="{{ old('name') }}" autocomplete="name" required>
<label for="organization">Nome da sua obra ou empresa</label><input id="organization" name="organization" value="{{ old('organization') }}" required>
<label for="email">E-mail</label><input id="email" name="email" type="email" value="{{ old('email') }}" autocomplete="email" required>
<label for="password">Senha</label><input id="password" name="password" type="password" autocomplete="new-password" minlength="12" required>
<label for="password_confirmation">Confirme a senha</label><input id="password_confirmation" name="password_confirmation" type="password" autocomplete="new-password" required>
@error('name')<p role="alert">{{ $message }}</p>@enderror @error('organization')<p role="alert">{{ $message }}</p>@enderror @error('email')<p role="alert">{{ $message }}</p>@enderror @error('password')<p role="alert">{{ $message }}</p>@enderror
<button type="submit">Criar conta</button></form><p>Ja tem conta? <a href="{{ route('login') }}">Entrar</a></p></main></body></html>
