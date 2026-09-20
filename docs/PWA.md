# PWA e Offline

## Estrategia

Online-first com degradacao graciosa. A primeira versao instala manifest e service worker conservador. Cache automatico limita-se ao app shell e assets publicos versionados; respostas autenticadas e dados privados usam `no-store` ate existir desenho de armazenamento seguro.

Estado atual: manifest instalavel, icones 192/512, registro global e cache publico versionado. O preview em Cloudflare Workers e HTTPS e recebe deploy automatico de `develop`. `/entrar`, `/painel`, APIs e respostas autenticadas nao sao interceptados pelo cache; as APIs privadas tambem enviam `Cache-Control: no-store`, inclusive em falhas.

## Evolucao

Conteudo tecnico aprovado podera ser marcado para download offline com versao, checksum, validade e revogacao. Checklists e evidencias pendentes usarao fila local criptografada quando a plataforma permitir, IDs gerados no cliente, operacoes idempotentes e estados claros: pendente, enviando, concluido, conflito e falha.

Videos nao devem ser cacheados indiscriminadamente. Downloads offline exigem opt-in, limite de armazenamento e politica de expiracao. Logout e revogacao de dispositivo limpam material sensivel local.

Conflitos nunca sao resolvidos silenciosamente quando alteram evidencia ou aprovacao. O servidor continua autoridade para permissoes e versoes. Background sync e conveniencia, nao garantia.

## Seguranca

Service worker somente sob HTTPS (localhost em desenvolvimento), escopo minimo, cache names versionados e nenhuma credencial em cache keys. QR Codes nao concedem acesso. Testar atualizacao, cache corrompido, dispositivo compartilhado e perda de conectividade.
