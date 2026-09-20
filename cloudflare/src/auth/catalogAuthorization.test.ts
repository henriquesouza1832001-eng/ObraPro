import { describe, expect, it, vi } from 'vitest';
import { D1CatalogAuthorization } from './catalogAuthorization';

describe('D1CatalogAuthorization', () => {
    it('allows only super administrators to manage the platform catalog', async () => {
        const users = { isSuperAdmin: vi.fn().mockResolvedValueOnce(true).mockResolvedValueOnce(false) };
        const authorization = new D1CatalogAuthorization(users);

        await expect(authorization.canManageCatalog('admin-1')).resolves.toBe(true);
        await expect(authorization.canManageCatalog('student-1')).resolves.toBe(false);
        expect(users.isSuperAdmin).toHaveBeenNthCalledWith(1, 'admin-1');
        expect(users.isSuperAdmin).toHaveBeenNthCalledWith(2, 'student-1');
    });
});
