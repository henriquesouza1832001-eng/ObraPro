import { pbkdf2Sync } from 'node:crypto';

const algorithm = 'PBKDF2-SHA256';
const iterations = 100_000;
const saltBytes = 16;
const hashBytes = 32;

function toBase64Url(bytes: Uint8Array): string {
    let binary = '';

    for (const byte of bytes) {
        binary += String.fromCharCode(byte);
    }

    return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}

function fromBase64Url(value: string): Uint8Array {
    const normalized = value.replaceAll('-', '+').replaceAll('_', '/') + '='.repeat((4 - value.length % 4) % 4);
    const binary = atob(normalized);

    return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function derive(password: string, salt: Uint8Array): Promise<Uint8Array> {
    return new Uint8Array(pbkdf2Sync(password, salt, iterations, hashBytes, 'sha256'));
}

function constantTimeEqual(left: Uint8Array, right: Uint8Array): boolean {
    if (left.length !== right.length) {
        return false;
    }

    let difference = 0;

    for (let index = 0; index < left.length; index += 1) {
        difference |= (left[index] ?? 0) ^ (right[index] ?? 0);
    }

    return difference === 0;
}

export async function hashPassword(password: string): Promise<string> {
    if (password.length < 12) {
        throw new Error('password_policy_failed');
    }

    const salt = crypto.getRandomValues(new Uint8Array(saltBytes));
    const hash = await derive(password, salt);

    return `${algorithm}$${iterations}$${toBase64Url(salt)}$${toBase64Url(hash)}`;
}

export async function verifyPassword(password: string, encoded: string): Promise<boolean> {
    const [format, encodedIterations, encodedSalt, encodedHash] = encoded.split('$');

    if (format !== algorithm || encodedIterations !== String(iterations) || !encodedSalt || !encodedHash) {
        return false;
    }

    try {
        const expected = fromBase64Url(encodedHash);
        const actual = await derive(password, fromBase64Url(encodedSalt));

        return expected.length === hashBytes && constantTimeEqual(actual, expected);
    } catch {
        return false;
    }
}
