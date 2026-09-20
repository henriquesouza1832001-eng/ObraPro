import { describe, expect, it } from 'vitest';
import { detectEvidenceMimeType, MAX_EVIDENCE_BYTES, sha256Checksum, validateEvidenceUpload } from './evidence';

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

    it('detecta tipos permitidos pelo conteudo e calcula checksum SHA-256', async () => {
        expect(detectEvidenceMimeType(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0, 0, 0, 0]))).toBe('image/png');
        expect(detectEvidenceMimeType(new Uint8Array([0x3c, 0x68, 0x74, 0x6d, 0x6c]))).toBeNull();
        await expect(sha256Checksum(new TextEncoder().encode('obrapro'))).resolves.toBe('4f65d74d898e46dad9c3981a3903daa27782695c8b0d87e6a114aedcd3868bb9');
    });
});
