import { describe, expect, it } from 'vitest';
import { D1MembershipRepository } from './membershipRepository';

type Row = {
    id: string;
    organization_id: string;
    user_id: string;
    role: 'owner' | 'admin' | 'engineer' | 'supervisor' | 'worker' | 'student';
    status: 'invited' | 'active' | 'suspended';
};

function databaseFor(rows: Row[], activeOrganizationIds = rows.map((row) => row.organization_id)): D1Database {
    return {
        prepare: (query: string) => ({
            bind: (...values: unknown[]) => ({
                all: async <T>(): Promise<D1Result<T>> => {
                    const userId = String(values[0]);
                    const organizationId = values[1] === undefined ? null : String(values[1]);
                    const matches = rows.filter((row) =>
                        row.user_id === userId
                        && row.status === 'active'
                        && (organizationId === null || row.organization_id === organizationId),
                    );

                    expect(query).toContain('status = \'active\'');

                    return { results: matches as T[], success: true, meta: {} as D1Meta & Record<string, unknown> };
                },
                first: async <T>(): Promise<T | null> => {
                    const userId = String(values[0]);
                    const organizationId = String(values[1]);
                    const match = rows.find((row) =>
                        row.user_id === userId
                        && row.organization_id === organizationId
                        && row.status === 'active'
                        && activeOrganizationIds.includes(organizationId),
                    );

                    expect(query).toContain('status = \'active\'');
                    expect(query).toContain('o.is_active = 1');

                    return (match ? { id: match.id } : null) as T | null;
                },
            }),
        }),
    } as unknown as D1Database;
}

describe('D1MembershipRepository', () => {
    const rows: Row[] = [
        { id: 'membership-1', organization_id: 'org-1', user_id: 'user-1', role: 'owner', status: 'active' },
        { id: 'membership-2', organization_id: 'org-2', user_id: 'user-1', role: 'worker', status: 'invited' },
        { id: 'membership-3', organization_id: 'org-3', user_id: 'user-1', role: 'worker', status: 'suspended' },
        { id: 'membership-4', organization_id: 'org-1', user_id: 'user-2', role: 'admin', status: 'active' },
    ];

    it('lista somente memberships ativas do usuario', async () => {
        const repository = new D1MembershipRepository(databaseFor(rows));

        await expect(repository.listActiveForUser('user-1')).resolves.toEqual([
            {
                id: 'membership-1',
                organizationId: 'org-1',
                userId: 'user-1',
                role: 'owner',
                status: 'active',
            },
        ]);
    });

    it('autoriza usuario na organizacao com membership ativa', async () => {
        const repository = new D1MembershipRepository(databaseFor(rows));

        await expect(repository.canAccessOrganization('user-1', 'org-1')).resolves.toBe(true);
    });

    it('nega convite, suspensao e organizacao de outro usuario', async () => {
        const repository = new D1MembershipRepository(databaseFor(rows));

        await expect(repository.canAccessOrganization('user-1', 'org-2')).resolves.toBe(false);
        await expect(repository.canAccessOrganization('user-1', 'org-3')).resolves.toBe(false);
        await expect(repository.canAccessOrganization('user-1', 'org-4')).resolves.toBe(false);
    });

    it('nega uma organizacao desativada mesmo que a membership esteja ativa', async () => {
        const repository = new D1MembershipRepository(databaseFor(rows, []));

        await expect(repository.canAccessOrganization('user-1', 'org-1')).resolves.toBe(false);
    });
});
