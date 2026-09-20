declare module 'node:crypto' {
    export function pbkdf2Sync(
        password: string | Uint8Array,
        salt: string | Uint8Array,
        iterations: number,
        keyLength: number,
        digest: string,
    ): Uint8Array;
}
