import type { Evidence } from '../domain/evidence';

interface EvidenceRow {
    id: string;
    organization_id: string;
    execution_step_id: string;
    uploaded_by: string;
    storage_key: string;
    original_name: string;
    mime_type: Evidence['mimeType'];
    size_bytes: number;
    checksum: string;
    note: string | null;
    status: Evidence['status'];
}

function mapEvidence(row: EvidenceRow): Evidence {
    return {
        id: row.id,
        organizationId: row.organization_id,
        executionStepId: row.execution_step_id,
        uploadedBy: row.uploaded_by,
        storageKey: row.storage_key,
        originalName: row.original_name,
        mimeType: row.mime_type,
        sizeBytes: row.size_bytes,
        checksum: row.checksum,
        note: row.note,
        status: row.status,
    };
}

export class D1EvidenceRepository {
    public constructor(private readonly database: D1Database) { }

    public async create(evidence: Evidence, createdAt: string): Promise<void> {
        await this.database.prepare(`
            INSERT INTO evidence (
                id, organization_id, execution_step_id, uploaded_by, storage_key, original_name,
                mime_type, size_bytes, checksum, note, status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            evidence.id,
            evidence.organizationId,
            evidence.executionStepId,
            evidence.uploadedBy,
            evidence.storageKey,
            evidence.originalName,
            evidence.mimeType,
            evidence.sizeBytes,
            evidence.checksum,
            evidence.note,
            evidence.status,
            createdAt,
            createdAt,
        ).run();
    }

    public async findAvailable(organizationId: string, evidenceId: string): Promise<Evidence | null> {
        const row = await this.database.prepare(`
            SELECT id, organization_id, execution_step_id, uploaded_by, storage_key, original_name,
                   mime_type, size_bytes, checksum, note, status
            FROM evidence
            WHERE id = ? AND organization_id = ? AND status = 'available'
            LIMIT 1
        `).bind(evidenceId, organizationId).first<EvidenceRow>();

        return row ? mapEvidence(row) : null;
    }
}
