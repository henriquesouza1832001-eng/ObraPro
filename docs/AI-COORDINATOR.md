# Coordenador Local de IAs

O ObraPro possui dois agentes trabalhando em worktrees separadas:

- Codex: C:\projetos\ObraPro-Codex
- Claude: C:\projetos\ObraPro-Claude

O canal compartilhado e:

C:\projetos\Obra Pro\AI-COLLABORATION-LOG.md

## Executar

No PowerShell:

    .\tools\ai-coordinator.ps1

Para uma leitura única:

    .\tools\ai-coordinator.ps1 -Once

Para alterar o intervalo:

    .\tools\ai-coordinator.ps1 -IntervalSeconds 30

## Responsabilidades

O coordenador:

- mostra a branch atual de cada agente;
- mostra se existem arquivos alterados;
- ajuda a identificar trabalho parado ou não publicado;
- não edita código;
- não acessa secrets;
- não executa migrations;
- não apaga dados;
- não aprova PRs;
- não faz merge.

Codex e Claude continuam responsáveis por ler e atualizar o diário compartilhado, executar testes e abrir PRs. O coordenador é deliberadamente determinístico e não consome tokens.

## Regra para futuros projetos

O mesmo padrão pode ser reutilizado: duas worktrees, um diário local, reservas explícitas de arquivos, agente coordenador sem escrita e uma IA chamada somente sob demanda para conflitos ou bloqueios.
