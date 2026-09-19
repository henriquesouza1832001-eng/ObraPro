export type MembershipRole = 'owner' | 'admin' | 'engineer' | 'supervisor' | 'worker' | 'student';
export type MembershipStatus = 'invited' | 'active' | 'suspended';

export interface AuthenticatedUser {
    id: string;
    name: string;
    email: string;
    isSuperAdmin: boolean;
}

export interface OrganizationMembership {
    id: string;
    organizationId: string;
    userId: string;
    role: MembershipRole;
    status: MembershipStatus;
}

export interface AuthSession {
    id: string;
    userId: string;
    tokenHash: string;
    expiresAt: string;
    revokedAt: string | null;
    createdAt: string;
    lastSeenAt: string;
}
