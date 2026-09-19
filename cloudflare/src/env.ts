/**
 * Bindings e variaveis disponiveis no Worker de preview.
 * ASSETS serve os arquivos estaticos de cloudflare/public.
 * As demais variaveis alimentam apenas o login de demonstracao (nao e autenticacao real).
 */
export interface Env {
    ASSETS: Fetcher;
    COURSES_DB?: D1Database;
    AUTH_DB?: D1Database;
    DEMO_EMAIL: string;
    DEMO_PASSWORD: string;
    SESSION_SECRET: string;
}
