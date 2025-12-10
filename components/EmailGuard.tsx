'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const PUBLIC_ROUTES = [
    '/login',
    '/register',
    '/blocked',
    '/verify',
    '/auth',
    '/onboarding'
];

export default function EmailGuard() {
    const router = useRouter();
    const pathname = usePathname();
    const [checking, setChecking] = useState(false);

    useEffect(() => {
        // Ignorar rotas públicas
        if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
            return;
        }

        const checkGuard = async () => {
            setChecking(true);
            try {
                // USAR getUser() PARA DADOS FRESCOS DO SERVIDOR
                // getSession() pode retornar dados em cache, causando o loop.
                const { data: { user }, error: userError } = await supabase.auth.getUser();

                if (userError || !user) return; // AuthProvider lida com login

                // Buscar perfil para verificar status
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('created_at, email_verified')
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    const createdAt = new Date(profile.created_at);
                    const now = new Date();

                    // Lógica de 7 dias
                    const deadline = new Date(createdAt);
                    deadline.setDate(deadline.getDate() + 7);

                    const isExpired = now > deadline;

                    // Verifica status com dados REAIS do servidor OU Bypass Local (Instantâneo)
                    const localBypass = typeof window !== 'undefined' && localStorage.getItem('monk_verified_client') === 'true';
                    const profileVerified = profile.email_verified === true;
                    const authVerified = !!user.email_confirmed_at;
                    const metaVerified = user.user_metadata?.monk_verified === true;

                    const isVerified = localBypass || profileVerified || authVerified || metaVerified;



                    if (isExpired && !isVerified) {
                        console.warn('GUARD: Acesso bloqueado - Verificação pendente expirada (Server Check).');
                        router.replace('/blocked');
                    }
                }
            } catch (error) {
                console.error('EmailGuard Error:', error);
            } finally {
                setChecking(false);
            }
        };

        checkGuard();
    }, [pathname, router]);

    return null; // Componente lógico, sem renderização
}
