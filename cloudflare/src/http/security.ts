/**
 * Aplica os headers de seguranca minimos definidos em docs/SECURITY.md
 * a qualquer resposta servida pelo Worker.
 */
export function withSecurityHeaders(response: Response): Response {
    const secured = new Response(response.body, response);
    secured.headers.set('X-Content-Type-Options', 'nosniff');
    secured.headers.set('X-Frame-Options', 'DENY');
    secured.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    secured.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    return secured;
}

export function redirect(location: string, cookie: string | null = null): Response {
    const headers: HeadersInit = { Location: location };

    if (cookie) {
        headers['Set-Cookie'] = cookie;
    }

    return new Response(null, { status: 303, headers });
}
