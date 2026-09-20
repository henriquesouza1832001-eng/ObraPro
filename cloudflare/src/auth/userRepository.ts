import type { AuthenticatedUser } from '../domain/identity';

export interface UserRecord extends AuthenticatedUser {
    passwordHash: string;
}

interface UserRow {
    id: string;
    name: string;
    email: string;
    password_hash: string;
    is_super_admin: number;
}

export class D1UserRepository {
    public constructor(private readonly database: D1Database) { }

    public async findByEmail(email: string): Promise<UserRecord | null> {
        const row = await this.database.prepare(`
            SELECT id, name, email, password_hash, is_super_admin
            FROM users
            WHERE email = ?
            LIMIT 1
        `).bind(email.toLowerCase()).first<UserRow>();

        if (!row) {
            return null;
        }

        return {
            id: row.id,
            name: row.name,
            email: row.email,
            passwordHash: row.password_hash,
            isSuperAdmin: row.is_super_admin === 1,
        };
    }

    public async isSuperAdmin(userId: string): Promise<boolean> {
        const row = await this.database.prepare(`
            SELECT is_super_admin
            FROM users
            WHERE id = ?
            LIMIT 1
        `).bind(userId).first<{ is_super_admin: number }>();

        return row?.is_super_admin === 1;
    }
}
