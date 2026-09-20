# Observabilidade

## Sinais locais

- Logs JSON estruturados com timestamp, nivel, ambiente, `correlation_id`, rota e contexto sanitizado.
- Excecoes inesperadas e falhas de jobs.
- Eventos de autenticacao e negacoes de autorizacao como security events.
- Metricas futuras de latencia, taxa de erro, filas e storage.
- Health endpoint publico com estado geral; detalhes somente em endpoint interno autenticado futuro.

O middleware aceita correlation ID externo apenas se cumprir formato e tamanho; caso contrario gera UUID/ULID. O ID acompanha resposta, logs, jobs e eventos. Nao registrar bodies completos por padrao.

## Separacao

Application logs servem diagnostico e podem ser rotacionados rapidamente. Audit events registram quem fez o que em recurso importante. Security events apoiam deteccao/resposta. Metricas e traces descrevem saude. Cada categoria tem armazenamento, acesso e retencao proprios.

Chamados de suporte recebem apenas contexto diagnostico permitido (rota, user agent,
versao e correlation ID) com limites de tamanho. Bodies, cookies, tokens, senhas e
credenciais sao descartados antes da persistencia.

## Operacao

Alertas devem ser acionaveis e evitar dados pessoais. Falha de envio ao MGL gera log sanitizado e estado de delivery; nao falha a request original. Jobs usam tentativas limitadas e backoff. Eventos esgotados ficam disponiveis para inspecao e reprocessamento autorizado.
