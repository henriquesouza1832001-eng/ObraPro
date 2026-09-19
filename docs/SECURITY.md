# Seguranca e Privacidade

## Baseline

O sistema aplica deny-by-default, validacao e autorizacao server-side, CSRF do framework, escaping por padrao, queries parametrizadas, sessoes regeneradas, hash de senha suportado e rate limiting. Producao exige HTTPS, `APP_DEBUG=false`, cookies `Secure`, `HttpOnly` e `SameSite` apropriado.

Headers iniciais: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, protecao contra framing via CSP `frame-ancestors` ou `X-Frame-Options`, e CSP incremental depois de inventariar assets. HSTS so deve ser habilitado quando todo o dominio estiver em HTTPS.

## Controle de acesso

RBAC define capacidades amplas; Policies validam tenant, recurso e estado. Identificadores opacos nao substituem autorizacao. Testes negativos devem cobrir usuario anonimo, papel insuficiente, recurso de outro tenant e alteracao de IDs.

## Uploads

Privados por padrao, tamanho limitado, MIME detectado no servidor, extensoes permitidas, nome aleatorio e storage fora da raiz publica. Downloads passam por Policy. Processamento futuro ocorre isolado e arquivos podem ficar em quarentena ate verificacao.

## Secrets e dados pessoais

Secrets ficam no ambiente/secret manager e sao redigidos de logs. Coletar PII minima. IP e user-agent podem apoiar seguranca por periodo limitado, com acesso restrito e eventual truncamento/hashing conforme avaliacao legal. Sem fingerprinting invasivo.

Categorias de retencao devem ser configuraveis e aprovadas por responsaveis juridicos: application logs curtos; security events conforme necessidade de deteccao; audit events conforme obrigacao e finalidade; evidencias conforme contrato e regra da obra.

## Resposta a incidentes

Preservar evidencias, limitar acesso, rotacionar secrets comprometidos, registrar linha do tempo e avaliar comunicacoes legais. Stack traces e detalhes internos nunca aparecem para usuarios. Correlation IDs permitem localizar eventos sem expor o erro.
