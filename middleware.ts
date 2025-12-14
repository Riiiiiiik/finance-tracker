import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    const nonce = Buffer.from(crypto.randomUUID()).toString('base64');

    // Configuração de CSP Estrita (Nonces)
    // - script-src: permite scripts próprios (com nonce) e domínios confiáveis (Vercel, Supabase, etc)
    // - style-src: mantemos unsafe-inline para CSS-in-JS (comum em React/Next)
    // - img-src: permite imagens locais e externas
    const cspHeader = `
        default-src 'self';
        script-src 'self' 'nonce-${nonce}' https: http: 'unsafe-inline' ${process.env.NODE_ENV === 'development' ? "'unsafe-eval'" : ""};
        style-src 'self' 'unsafe-inline';
        img-src 'self' blob: data: https://*;
        font-src 'self' data:;
        connect-src 'self' https://*.supabase.co https://vitals.vercel-insights.com https://*.vercel-scripts.com;
        object-src 'none';
        base-uri 'self';
        form-action 'self';
        frame-ancestors 'none';
        block-all-mixed-content;
        upgrade-insecure-requests;
    `.replace(/\s{2,}/g, ' ').trim();

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-nonce', nonce);
    requestHeaders.set('Content-Security-Policy', cspHeader);

    let response = NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });

    response.headers.set('Content-Security-Policy', cspHeader);

    // Criar cliente Supabase para Middleware (gerencia cookies)
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    // Recupera a sessão/usuário
    const { data: { user } } = await supabase.auth.getUser()

    // Rotas Protegidas
    const protectedRoutes = ['/dashboard', '/auditor', '/analytics', '/wishlist', '/settings'];
    const isProtectedRoute = protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route));

    if (isProtectedRoute && !user) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Redirecionamento de usuários logados fora das páginas de auth
    if ((request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register') && user) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - api (API routes can handle their own auth usually, or include them if needed)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
