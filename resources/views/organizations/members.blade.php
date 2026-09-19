<!doctype html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Membros | ObraPro</title></head>
<body>
<main>
    <a href="{{ route('dashboard') }}">Voltar ao painel</a>
    <h1>Membros de {{ $organization->name }}</h1>
    @if (session('status'))<p role="status">{{ session('status') }}</p>@endif
    @foreach ($memberships as $membership)
        <article>
            <h2>{{ $membership->user->name }}</h2>
            <p>{{ $membership->user->email }}</p>
            <form method="post" action="{{ route('organizations.members.update', [$organization, $membership]) }}">
                @csrf @method('PATCH')
                <label>Papel <select name="role">@foreach (\App\Enums\MembershipRole::cases() as $role)<option value="{{ $role->value }}" @selected($membership->role === $role)>{{ $role->value }}</option>@endforeach</select></label>
                <label>Status <select name="status">@foreach (\App\Enums\MembershipStatus::cases() as $status)<option value="{{ $status->value }}" @selected($membership->status === $status)>{{ $status->value }}</option>@endforeach</select></label>
                <button type="submit">Salvar</button>
            </form>
        </article>
    @endforeach
</main>
</body>
</html>
