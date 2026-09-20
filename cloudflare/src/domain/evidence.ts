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

export function detectEvidenceMimeType(bytes: Uint8Array): EvidenceMimeType | null {
    if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
        return 'image/jpeg';
    }

    if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
        return 'image/png';
    }

    if (bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP') {
        return 'image/webp';
    }

    if (bytes.length >= 5 && String.fromCharCode(...bytes.slice(0, 5)) === '%PDF-') {
        return 'application/pdf';
    }

    return null;
}

export async function sha256Checksum(bytes: Uint8Array): Promise<string> {
    const digest = await crypto.subtle.digest('SHA-256', bytes);

    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function sanitizedOriginalName(name: string): string {
    return name.trim().replace(/[\\/\u0000-\u001f]/g, '_').slice(0, 255);
}

export function validateEvidenceUpload(input: EvidenceUploadInput): ValidatedEvidenceUpload {
    const originalName = sanitizedOriginalName(input.originalName);
    if (!input.organizationId || !input.executionStepId || !input.evidenceId || !originalName) {
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
        originalName,
        mimeType: input.mimeType as EvidenceMimeType,
        storageKey: `evidence/${input.organizationId}/${input.executionStepId}/${input.evidenceId}`,
    };
}
