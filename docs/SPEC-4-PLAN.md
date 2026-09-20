# Spec 4 - Administracao e acabamento do produto

## Objetivo

Entregar um painel de Super Admin seguro para operar o catalogo editorial e preparar a experiencia publica para revisao humana, sem transformar o ObraPro em uma tela generica de IA ou em um ERP.

## Cards

- S4-01: autenticacao e gate global de Super Admin.
- S4-02: catalogo administrativo de modulos, cursos, aulas e estados de publicacao.
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

## Limites

Pagamento, IA, MFA, upload de video/imagem e merge em `main` permanecem fora deste lote ate decisao ou contrato especifico.
