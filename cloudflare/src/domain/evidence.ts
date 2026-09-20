export const MAX_EVIDENCE_BYTES = 10 * 1024 * 1024;
export const ALLOWED_EVIDENCE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'] as const;

export type EvidenceMimeType = typeof ALLOWED_EVIDENCE_MIME_TYPES[number];
export type EvidenceStatus = 'available' | 'quarantined' | 'deleted';

export interface Evidence {
    id: string;
    organizationId: string;
    executionStepId: string;
    uploadedBy: string;
    storageKey: string;
    originalName: string;
    mimeType: EvidenceMimeType;
    sizeBytes: number;
    checksum: string;
    note: string | null;
    status: EvidenceStatus;
}

export interface EvidenceUploadInput {
    organizationId: string;
    executionStepId: string;
    evidenceId: string;
    originalName: string;
    mimeType: string;
    sizeBytes: number;
    checksum: string;
}

export interface ValidatedEvidenceUpload extends EvidenceUploadInput {
    mimeType: EvidenceMimeType;
    storageKey: string;
}

export function validateEvidenceUpload(input: EvidenceUploadInput): ValidatedEvidenceUpload {
    if (!input.organizationId || !input.executionStepId || !input.evidenceId || !input.originalName) {
        throw new Error('evidence_identity_invalid');
    }

    if (!(ALLOWED_EVIDENCE_MIME_TYPES as readonly string[]).includes(input.mimeType)) {
        throw new Error('evidence_mime_type_invalid');
    }

    if (!Number.isInteger(input.sizeBytes) || input.sizeBytes < 1 || input.sizeBytes > MAX_EVIDENCE_BYTES) {
        throw new Error('evidence_size_invalid');
    }

    if (!/^[a-f0-9]{64}$/i.test(input.checksum)) {
        throw new Error('evidence_checksum_invalid');
    }

    return {
        ...input,
        mimeType: input.mimeType as EvidenceMimeType,
        storageKey: `evidence/${input.organizationId}/${input.executionStepId}/${input.evidenceId}`,
    };
}
