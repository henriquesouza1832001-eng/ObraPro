# Seguranca e Privacidade

## Baseline

No Worker, `D1SessionStore` gera o token em memoria, armazena somente seu hash
SHA-256 e rejeita sessoes expiradas ou revogadas. O binding D1 permanece no
ambiente; o token bruto nao e persistido nem registrado em logs.

Senhas do fluxo real usam o formato versionado `PBKDF2-SHA256$iteracoes$salt$hash`.
Salt e hash sao aleatorios, a politica minima atual e de doze caracteres e a
verificacao compara os bytes sem retornar detalhes do motivo da falha.

O acesso tenant-aware usa `D1MembershipRepository.canAccessOrganization`: somente
membership `active` da dupla usuario/organizacao concede acesso. IDs enviados pelo
cliente nao substituem essa verificacao server-side.

Recursos operacionais tambem validam `organization_id` na consulta ao D1 depois da
membership. `D1OperationalAuthorization` cobre obras, procedimentos, checklists e
execucoes; uma organizacao informada pelo cliente nao consegue ampliar o escopo.

Evidencias aceitam somente JPEG, PNG, WebP ou PDF ate 10 MiB, com checksum SHA-256
hexadecimal validado. O download exige membership ativa e status `available`; o
objeto fica privado no R2 e somente a metadata sanitizada permanece no D1.

O sistema aplica deny-by-default, validacao e autorizacao server-side, CSRF do framework, escaping por padrao, queries parametrizadas, sessoes regeneradas, hash de senha suportado e rate limiting. Producao exige HTTPS, `APP_DEBUG=false`, cookies `Secure`, `HttpOnly` e `SameSite` apropriado.

Headers iniciais: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, protecao contra framing via CSP `frame-ancestors` ou `X-Frame-Options`, e CSP incremental depois de inventariar assets. HSTS so deve ser habilitado quando todo o dominio estiver em HTTPS.

## Controle de acesso

RBAC define capacidades amplas; Policies validam tenant, recurso e estado. Identificadores opacos nao substituem autorizacao. Testes negativos devem cobrir usuario anonimo, papel insuficiente, recurso de outro tenant e alteracao de IDs.

Administradores de organizacao gerenciam operacao, conteudo, cursos e configuracoes comerciais dentro do tenant. Somente super administradores da plataforma acessam security events, operacoes de auditoria, configuracao de provedores, limites globais e MGL. Ocultar menus nao substitui Gate ou Policy server-side.

A fundacao implementada exige organizacao e membership `active` para acesso ao tenant, com Policy por organizacao. Owner e admin podem administrar a organizacao; tenants inativos e memberships convidadas ou suspensas nao concedem acesso. O Gate `viewPlatformSecurity` exige `users.is_super_admin`, e esse atributo nao e mass assignable. Super Admin nao possui bypass global de Policies e nao acessa automaticamente organizacoes de clientes.

## Inteligencia artificial

Chaves de provedores ficam em secret manager e nunca no banco ou browser. Entrada do usuario e resposta do modelo sao nao confiaveis, limitadas em tamanho e validadas contra schema. Chamadas possuem timeout, rate limit, quota por conta e limite de tokens/custo. Logs guardam IDs e metricas sanitizadas, nao prompts completos, plantas privadas ou credenciais.

Conteudo gerado exibe origem, versao e aviso de estudo preliminar. A IA nao pode aprovar tecnicamente uma planta, executar ferramentas arbitrarias, acessar dados de outro tenant ou escolher autorizacoes.

## Uploads

Privados por padrao, tamanho limitado, MIME detectado no servidor, extensoes permitidas, nome aleatorio e storage fora da raiz publica. Downloads passam por Policy. Processamento futuro ocorre isolado e arquivos podem ficar em quarentena ate verificacao.

## Secrets e dados pessoais

Secrets ficam no ambiente/secret manager e sao redigidos de logs. Coletar PII minima. IP e user-agent podem apoiar seguranca por periodo limitado, com acesso restrito e eventual truncamento/hashing conforme avaliacao legal. Sem fingerprinting invasivo.

Categorias de retencao devem ser configuraveis e aprovadas por responsaveis juridicos: application logs curtos; security events conforme necessidade de deteccao; audit events conforme obrigacao e finalidade; evidencias conforme contrato e regra da obra.

## Resposta a incidentes

Preservar evidencias, limitar acesso, rotacionar secrets comprometidos, registrar linha do tempo e avaliar comunicacoes legais. Stack traces e detalhes internos nunca aparecem para usuarios. Correlation IDs permitem localizar eventos sem expor o erro.
- Downloads de evidencias passam por rota autenticada e autorizada pela organizacao da execucao; o disco privado nunca e exposto diretamente.
