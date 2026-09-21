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
    secured.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    secured.headers.set(
        'Content-Security-Policy',
        "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; media-src 'self' https:; font-src 'self' data:; connect-src 'self'",
    );

    return secured;
}

export function redirect(location: string, cookie: string | null = null): Response {
    const headers: HeadersInit = { Location: location };

    if (cookie) {
        headers['Set-Cookie'] = cookie;
    }

    return new Response(null, { status: 303, headers });
}
