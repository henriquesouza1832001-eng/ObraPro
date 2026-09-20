import type { D1MembershipRepository } from './membershipRepository';

type OperationalResource = 'works' | 'procedures' | 'checklists' | 'executions';

const resourceQueries: Record<OperationalResource, string> = {
    works: 'SELECT id FROM works WHERE id = ? AND organization_id = ?',
    procedures: 'SELECT id FROM procedures WHERE id = ? AND organization_id = ?',
    checklists: 'SELECT id FROM checklists WHERE id = ? AND organization_id = ?',
    executions: 'SELECT id FROM executions WHERE id = ? AND organization_id = ?',
};

export class D1OperationalAuthorization {
    public constructor(
        private readonly database: D1Database,
        private readonly memberships: Pick<D1MembershipRepository, 'canAccessOrganization'>,
    ) { }

    public async canAccessWork(userId: string, organizationId: string, workId: string): Promise<boolean> {
        return this.canAccessResource(userId, organizationId, workId, 'works');
    }

    public async canAccessProcedure(userId: string, organizationId: string, procedureId: string): Promise<boolean> {
        return this.canAccessResource(userId, organizationId, procedureId, 'procedures');
    }

    public async canAccessChecklist(userId: string, organizationId: string, checklistId: string): Promise<boolean> {
        return this.canAccessResource(userId, organizationId, checklistId, 'checklists');
    }

    public async canAccessExecution(userId: string, organizationId: string, executionId: string): Promise<boolean> {
        return this.canAccessResource(userId, organizationId, executionId, 'executions');
    }

    private async canAccessResource(
        userId: string,
        organizationId: string,
        resourceId: string,
        resource: OperationalResource,
    ): Promise<boolean> {
        if (!await this.memberships.canAccessOrganization(userId, organizationId)) {
            return false;
        }

        const row = await this.database.prepare(resourceQueries[resource])
            .bind(resourceId, organizationId)
            .first<{ id: string }>();

        return row !== null;
    }
}
