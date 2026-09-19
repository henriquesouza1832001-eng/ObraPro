import { describe, expect, it, vi } from 'vitest';
import { D1OperationalAuthorization } from './operationalAuthorization';

function databaseFor(resourceOrganizationId: string): D1Database {
    return {
        prepare: () => ({
            bind: (_resourceId: string, organizationId: string) => ({
                first: async <T>(): Promise<T | null> =>
                    (organizationId === resourceOrganizationId ? { id: 'resource-1' } : null) as T | null,
            }),
        }),
    } as unknown as D1Database;
}

describe('D1OperationalAuthorization', () => {
    it('permite recurso do tenant quando a membership esta ativa', async () => {
        const memberships = { canAccessOrganization: vi.fn().mockResolvedValue(true) };
        const authorization = new D1OperationalAuthorization(databaseFor('org-1'), memberships);

        await expect(authorization.canAccessWork('user-1', 'org-1', 'work-1')).resolves.toBe(true);
        expect(memberships.canAccessOrganization).toHaveBeenCalledWith('user-1', 'org-1');
    });

    it('nega recurso de outro tenant mesmo quando o recurso existe', async () => {
        const memberships = { canAccessOrganization: vi.fn().mockResolvedValue(false) };
        const authorization = new D1OperationalAuthorization(databaseFor('org-2'), memberships);

        await expect(authorization.canAccessWork('user-1', 'org-1', 'work-1')).resolves.toBe(false);
    });

    it('aplica a mesma fronteira a procedimento, checklist e execucao', async () => {
        const memberships = { canAccessOrganization: vi.fn().mockResolvedValue(true) };
        const authorization = new D1OperationalAuthorization(databaseFor('org-1'), memberships);

        await expect(authorization.canAccessProcedure('user-1', 'org-1', 'procedure-1')).resolves.toBe(true);
        await expect(authorization.canAccessChecklist('user-1', 'org-1', 'checklist-1')).resolves.toBe(true);
        await expect(authorization.canAccessExecution('user-1', 'org-1', 'execution-1')).resolves.toBe(true);
    });
});
