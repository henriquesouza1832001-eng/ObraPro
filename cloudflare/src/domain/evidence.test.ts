import { describe, expect, it } from 'vitest';
import { MAX_EVIDENCE_BYTES, validateEvidenceUpload } from './evidence';

const validInput = {
    organizationId: 'org-1',
    executionStepId: 'execution-step-1',
    evidenceId: 'evidence-1',
    originalName: 'parede.jpg',
    mimeType: 'image/jpeg',
    sizeBytes: 1024,
    checksum: 'a'.repeat(64),
};

describe('validateEvidenceUpload', () => {
    it('produz uma chave privada e preserva checksum validado', () => {
        expect(validateEvidenceUpload(validInput)).toMatchObject({
            storageKey: 'evidence/org-1/execution-step-1/evidence-1',
            checksum: validInput.checksum,
        });
    });

    it('rejeita MIME fora da lista e arquivo acima do limite', () => {
        expect(() => validateEvidenceUpload({ ...validInput, mimeType: 'text/html' })).toThrow('evidence_mime_type_invalid');
        expect(() => validateEvidenceUpload({ ...validInput, sizeBytes: MAX_EVIDENCE_BYTES + 1 })).toThrow('evidence_size_invalid');
    });

    it('rejeita checksum que nao seja SHA-256 hexadecimal', () => {
        expect(() => validateEvidenceUpload({ ...validInput, checksum: 'invalid' })).toThrow('evidence_checksum_invalid');
    });
});
