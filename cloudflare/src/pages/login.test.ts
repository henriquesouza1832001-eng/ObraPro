import { describe, expect, it } from 'vitest';
import { renderLoginPage } from './login';

describe('renderLoginPage', () => {
    it('mostra o cabecalho de demonstracao e o aviso quando a autenticacao real esta desligada', () => {
        const html = renderLoginPage({ realAuthEnabled: false });

        expect(html).toContain('Acesso de demonstração');
        expect(html).toContain('Ambiente de demonstração');
    });

    it('mostra o cabecalho real e omite o aviso de demonstracao quando a autenticacao real esta ligada', () => {
        const html = renderLoginPage({ realAuthEnabled: true });

        expect(html).toContain('Entrar no Obra Mais');
        expect(html).not.toContain('Ambiente de demonstração');
    });

    it('nao mostra erro por padrao', () => {
        const html = renderLoginPage();

        expect(html).not.toContain('role="alert"');
    });

    it('mostra mensagem de erro generica e acessivel (role=alert) quando hasError e verdadeiro', () => {
        const html = renderLoginPage({ hasError: true });

        expect(html).toContain('role="alert"');
        expect(html).toContain('Não foi possível entrar com esses dados.');
        expect(html).not.toContain('conta suspensa');
        expect(html).not.toContain('E-mail nao encontrado');
    });

    it('associa o formulario ao erro via aria-describedby para leitores de tela', () => {
        const html = renderLoginPage({ hasError: true });

        expect(html).toContain('aria-describedby="login-error"');
        expect(html).toContain('id="login-error"');
    });

    it('campos de e-mail e senha tem label associado e autocomplete correto', () => {
        const html = renderLoginPage();

        expect(html).toContain('for="email"');
        expect(html).toContain('id="email"');
        expect(html).toContain('autocomplete="username"');
        expect(html).toContain('for="password"');
        expect(html).toContain('id="password"');
        expect(html).toContain('autocomplete="current-password"');
    });

    it('nao inventa um formulario de cadastro; oferece apenas um link informativo para o catalogo', () => {
        const html = renderLoginPage();

        expect(html).not.toContain('action="/cadastro"');
        expect(html).toContain('href="/cursos"');
    });

    it('nao inclui nenhum segredo, token ou credencial no HTML renderizado', () => {
        const html = renderLoginPage({ hasError: true, realAuthEnabled: true });

        expect(html).not.toMatch(/DEMO_PASSWORD|SESSION_SECRET|token_hash|password_hash/i);
    });
});
