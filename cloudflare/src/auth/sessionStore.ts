import type { AuthSession } from '../domain/identity';

const encoder = new TextEncoder();

function toBase64Url(bytes: Uint8Array): string {
    let binary = '';

    for (const byte of bytes) {
        binary += String.fromCharCode(byte);
    }

    return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}

async function hashToken(token: string): Promise<string> {
    const digest = await crypto.subtle.digest('SHA-256', encoder.encode(token));

    return toBase64Url(new Uint8Array(digest));
}

function createToken(): string {
    return toBase64Url(crypto.getRandomValues(new Uint8Array(32)));
}

interface SessionRow {
    id: string;
    user_id: string;
    token_hash: string;
    expires_at: string;
    revoked_at: string | null;
    created_at: string;
    last_seen_at: string;
}

function mapSession(row: SessionRow, lastSeenAt = row.last_seen_at): AuthSession {
    return { id: row.id, userId: row.user_id, tokenHash: row.token_hash, expiresAt: row.expires_at, revokedAt: row.revoked_at, createdAt: row.created_at, lastSeenAt };
}

export interface SessionStore {
    create(userId: string, expiresAt: string, now: string): Promise<{ session: AuthSession; token: string }>;
    find(token: string, now: string): Promise<AuthSession | null>;
    revoke(token: string, now: string): Promise<void>;
}

export class D1SessionStore implements SessionStore {
    public constructor(private readonly database: D1Database) { }

    public async create(userId: string, expiresAt: string, now: string): Promise<{ session: AuthSession; token: string }> {
        const token = createToken();
        const tokenHash = await hashToken(token);
        const id = crypto.randomUUID();

        await this.database.prepare(`
            INSERT INTO auth_sessions (id, user_id, token_hash, expires_at, created_at, last_seen_at)
            VALUES (?, ?, ?, ?, ?, ?)
        `).bind(id, userId, tokenHash, expiresAt, now, now).run();

        return { token, session: { id, userId, tokenHash, expiresAt, revokedAt: null, createdAt: now, lastSeenAt: now } };
    }

    public async find(token: string, now: string): Promise<AuthSession | null> {
        const tokenHash = await hashToken(token);
        const row = await this.database.prepare(`
            SELECT id, user_id, token_hash, expires_at, revoked_at, created_at, last_seen_at
            FROM auth_sessions
            WHERE token_hash = ? AND revoked_at IS NULL AND expires_at > ?
            LIMIT 1
        `).bind(tokenHash, now).first<SessionRow>();

        if (!row) {
            return null;
        }

        await this.database.prepare('UPDATE auth_sessions SET last_seen_at = ? WHERE id = ?').bind(now, row.id).run();

        return mapSession(row, now);
    }

    public async revoke(token: string, now: string): Promise<void> {
        const tokenHash = await hashToken(token);

        await this.database.prepare(`
            UPDATE auth_sessions SET revoked_at = ?, last_seen_at = ?
            WHERE token_hash = ? AND revoked_at IS NULL
        `).bind(now, now, tokenHash).run();
    }
}
