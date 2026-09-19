param(
    [int]$IntervalSeconds = 15,
    [switch]$Once
)

$ErrorActionPreference = 'Stop'

$projectRoot = 'C:\projetos\Obra Pro'
$worktrees = @(
    @{ Name = 'Codex'; Path = 'C:\projetos\ObraPro-Codex' },
    @{ Name = 'Claude'; Path = 'C:\projetos\ObraPro-Claude' }
)
$logPath = Join-Path $projectRoot 'AI-COLLABORATION-LOG.md'

function Get-WorktreeStatus {
    param([hashtable]$Worktree)

    if (-not (Test-Path $Worktree.Path)) {
        return [pscustomobject]@{
            Name = $Worktree.Name
            Branch = 'pasta ausente'
            Changes = 'pasta ausente'
        }
    }

    $branch = (& git -C $Worktree.Path branch --show-current).Trim()
    $changes = @(& git -C $Worktree.Path status --short)
    $changeSummary = if ($changes.Count -eq 0) { 'limpa' } else { "$($changes.Count) arquivo(s) alterado(s)" }

    return [pscustomobject]@{
        Name = $Worktree.Name
        Branch = $branch
        Changes = $changeSummary
    }
}

function Show-Status {
    Clear-Host
    Write-Host "ObraPro AI Coordinator" -ForegroundColor Cyan
    Write-Host "Diario: $logPath"
    Write-Host "Atualizado: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    Write-Host ''

    foreach ($worktree in $worktrees) {
        $status = Get-WorktreeStatus -Worktree $worktree
        Write-Host ("{0,-8} | branch: {1,-34} | estado: {2}" -f $status.Name, $status.Branch, $status.Changes)
    }

    Write-Host ''
    Write-Host 'O coordenador nao edita codigo, nao usa secrets e nao faz merge.' -ForegroundColor DarkGray
}

do {
    Show-Status
    if ($Once) {
        break
    }

    Start-Sleep -Seconds $IntervalSeconds
} while ($true)
