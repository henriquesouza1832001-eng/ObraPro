import { describe, expect, it, vi } from 'vitest';
import { D1EvidenceAuthorization } from './evidenceAuthorization';

function databaseFor(status: 'available' | 'deleted'): D1Database {
    return {
        prepare: (query: string) => ({
            bind: () => ({
                first: async <T>(): Promise<T | null> => {
                    expect(query).toContain("status = 'available'");
                    return status === 'available' ? ({ id: 'evidence-1' } as T) : null;
                },
            }),
        }),
    } as unknown as D1Database;
}

describe('D1EvidenceAuthorization', () => {
    it('permite download da evidencia disponivel no tenant ativo', async () => {
        const memberships = { canAccessOrganization: vi.fn().mockResolvedValue(true) };
        const authorization = new D1EvidenceAuthorization(databaseFor('available'), memberships);

        await expect(authorization.canDownload('user-1', 'org-1', 'evidence-1')).resolves.toBe(true);
    });

    it('nega download para tenant sem membership ou evidencia indisponivel', async () => {
        const memberships = { canAccessOrganization: vi.fn().mockResolvedValue(false) };
        const authorization = new D1EvidenceAuthorization(databaseFor('deleted'), memberships);

        await expect(authorization.canDownload('user-1', 'org-1', 'evidence-1')).resolves.toBe(false);
        expect(memberships.canAccessOrganization).toHaveBeenCalledWith('user-1', 'org-1');

        const activeMemberships = { canAccessOrganization: vi.fn().mockResolvedValue(true) };
        const unavailableEvidence = new D1EvidenceAuthorization(databaseFor('deleted'), activeMemberships);

        await expect(unavailableEvidence.canDownload('user-1', 'org-1', 'evidence-1')).resolves.toBe(false);
    });

    it('autoriza upload somente para etapa da execucao do tenant ativo', async () => {
        const memberships = { canAccessOrganization: vi.fn().mockResolvedValue(true) };
        const database = {
            prepare: () => ({
                bind: () => ({ first: async <T>(): Promise<T | null> => ({ id: 'execution-step-1' } as T) }),
            }),
        } as unknown as D1Database;
        const authorization = new D1EvidenceAuthorization(database, memberships);

        await expect(authorization.canUpload('user-1', 'org-1', 'execution-step-1')).resolves.toBe(true);
    });
});
