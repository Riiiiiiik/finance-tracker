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
                const { data: { session } } = await supabase.auth.getSession();

                if (!session) return; // AuthProvider lidará com redirect de login

                // Buscar perfil para verificar status
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('created_at, email_verified')
                    .eq('id', session.user.id)
                    .single();

                if (profile) {
                    const createdAt = new Date(profile.created_at);
                    const now = new Date();

                    // Lógica de 7 dias
                    const deadline = new Date(createdAt);
                    deadline.setDate(deadline.getDate() + 7);

                    const isExpired = now > deadline;
                    const isVerified = profile.email_verified === true;

                    if (isExpired && !isVerified) {
                        console.warn('GUARD: Acesso bloqueado - Verificação pendente expirada.');
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
