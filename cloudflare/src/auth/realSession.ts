import type { AuthSession } from '../domain/identity';
import type { Env } from '../env';
import { D1UserRepository } from './userRepository';
import { D1SessionStore } from './sessionStore';
import { verifyPassword } from './password';

const cookieName = 'obrapro_session';
const sessionHours = 8;

function cookieValue(request: Request): string | null {
    const match = (request.headers.get('Cookie') ?? '').match(new RegExp(`(?:^|;\\s*)${cookieName}=([^;]+)`));

    return match?.[1] ?? null;
}

function now(): string {
    return new Date().toISOString();
}

function expiresAt(): string {
    return new Date(Date.now() + sessionHours * 60 * 60 * 1000).toISOString();
}

export async function authenticateRequest(request: Request, env: Env): Promise<boolean> {
    return (await authenticatedSession(request, env)) !== null;
}

export async function authenticatedSession(request: Request, env: Env): Promise<AuthSession | null> {
    if (!env.AUTH_DB) {
        return null;
    }

    const token = cookieValue(request);

    return token ? new D1SessionStore(env.AUTH_DB).find(token, now()) : null;
}

export async function loginWithD1(email: string, password: string, env: Env): Promise<string | null> {
    if (!env.AUTH_DB) {
        return null;
    }

    const user = await new D1UserRepository(env.AUTH_DB).findByEmail(email);
    const passwordValid = user ? await verifyPassword(password, user.passwordHash) : false;

    if (!user || !passwordValid) {
        return null;
    }

    const { token } = await new D1SessionStore(env.AUTH_DB).create(user.id, expiresAt(), now());

    return token;
}

export async function logoutFromD1(request: Request, env: Env): Promise<void> {
    if (env.AUTH_DB) {
        const token = cookieValue(request);

        if (token) {
            await new D1SessionStore(env.AUTH_DB).revoke(token, now());
        }
    }
}

export function sessionCookie(token: string, maxAge = sessionHours * 60 * 60): string {
    return `${cookieName}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}
