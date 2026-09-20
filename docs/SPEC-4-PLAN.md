# Spec 4 - Administracao e acabamento do produto

## Objetivo

Entregar um painel de Super Admin seguro para operar o catalogo editorial e preparar a experiencia publica para revisao humana, sem transformar o ObraPro em uma tela generica de IA ou em um ERP.

## Cards

- S4-01: autenticacao e gate global de Super Admin.
- S4-02: catalogo administrativo de modulos, cursos, aulas e estados de publicacao. O endpoint `GET /api/admin/catalogo` tambem devolve aulas reais com `id`, titulo, modulo, posicao e duracao para o editor escolher uma aula sem digitar identificador.
- S4-03: auditoria de publicacoes e alteracoes administrativas.
- S4-04: edicao/versionamento de conteudo de aula com revisao antes de publicar (backend entregue; tela editorial permanece para o próximo card do frontend).
- S4-05: refinamento visual, acessibilidade e navegacao do frontend.

## Criterios de aceite

- Usuario comum recebe `403` ao consultar qualquer API administrativa.
- Super Admin recebe catalogo agrupado por modulo, com rascunho/publicado claramente diferenciados.
- Publicar/despublicar registra evento imutavel com ator, recurso, acao, estado e horario.
- Conteudo draft nunca aparece na rota publica de aula.
- Alteracoes administrativas nao apagam cursos, aulas, matriculas ou progresso.
- Frontend funciona em mobile e desktop, com estados de carregamento, vazio, erro e foco por teclado.
- Todas as mudancas passam por testes, typecheck, build e PR para `develop`.

## Backend concluido

- S4-01, S4-02, S4-03 e S4-04 possuem contratos Cloudflare protegidos e testados em `develop`.
- S4-05 permanece reservado ao frontend: remodelacao visual publica, painel editorial responsivo e validacao manual em desktop/mobile.
- O backend nao cria checkout, provedor de e-mail, MFA, upload de midia ou regras de preco nesta Spec. Esses contratos entram somente em uma Spec posterior com decisao de produto e infraestrutura.

## Limites

Pagamento, IA, MFA, upload de video/imagem e merge em `main` permanecem fora deste lote ate decisao ou contrato especifico.
