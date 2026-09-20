import { D1UserRepository } from './userRepository';

export class D1CatalogAuthorization {
    public constructor(private readonly users: Pick<D1UserRepository, 'isSuperAdmin'>) { }

    public async canManageCatalog(userId: string): Promise<boolean> {
        return this.users.isSuperAdmin(userId);
    }
}
