# Roadmap

## Sprint 0 - Fundacao

Documentacao, Laravel minimo, autenticacao, contratos de auditoria/security telemetry, observabilidade local, isolamento MGL, health check, base PWA, CI e testes de seguranca essenciais.

## Sprint 1 - Organizacoes e acesso

Consolidar Organizations, memberships, selecao de tenant, RBAC e Policies. Separar administrador de organizacao e super administrador da plataforma, com testes de isolamento e auditoria de mudancas de papel.

## Sprint 2 - Obras e procedimentos

Works, procedimentos versionados, passos, aprovacao tecnica, publicacao e leitura mobile. Preparar midia privada e QR Codes revogaveis.

## Sprint 3 - Conteudo, cursos e comercial

Landing page publica, conteudos vindos de redes sociais, catalogo de cursos, modulos, aulas, progresso e regras gratuito/incluso/avulso. Painel configura planos, precos, beneficios e limites. O gateway de pagamento entra depois de o catalogo e os direitos de acesso estarem testados.

## Sprint 4 - Execucao

Checklists, execucoes, evidencias, filas de upload e nao conformidades basicas. Validar fluxo de campo com usuarios reais.

## Sprint 5 - Estudo preliminar assistido

Questionario versionado, contrato de provedor de IA, primeira integracao com camada gratuita, resposta estruturada e limites de uso. Em seguida, motor deterministico de distribuicao espacial, visualizacao, revisao humana e exportacao claramente marcada como estudo preliminar.

## Infraestrutura atual e posterior

O preview de `develop` ja e publicado no Cloudflare Workers por GitHub Actions. Antes de producao, definir runtime Laravel, banco, storage, dominio, backup, rollback e ambientes separados. Cloudflare Pages nao e necessario para o preview atual.

Indicadores, offline avancado e transcodificacao evoluem progressivamente. A integracao MGL fica para fase posterior, conforme contrato oficial, como painel exclusivo de observabilidade e seguranca; permanece opcional e nao pode degradar acessos normais.
