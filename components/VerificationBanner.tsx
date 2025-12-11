'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, X } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function VerificationBanner() {
    const [isVisible, setIsVisible] = useState(false);
    const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
    const pathname = usePathname();

    useEffect(() => {
        checkStatus();
    }, [pathname]);

    const checkStatus = async () => {
        // Não mostrar em rotas públicas ou de auth
        if (['/login', '/register', '/verify', '/onboarding', '/', '/blocked'].includes(pathname)) {
            setIsVisible(false);
            return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            setIsVisible(false);
            return;
        }

        const user = session.user;

        // Verificação Robusta (Mesma do EmailGuard)
        const { data: profile } = await supabase
            .from('profiles')
            .select('created_at, email_verified')
            .eq('id', user.id)
            .single();

        const localBypass = typeof window !== 'undefined' && localStorage.getItem('monk_verified_client') === 'true';
        const profileVerified = profile?.email_verified === true;
        const authVerified = !!user.email_confirmed_at;
        const metaVerified = user.user_metadata?.monk_verified === true;

        const isVerified = localBypass || profileVerified || authVerified || metaVerified;

        if (isVerified) {
            setIsVisible(false);
            return;
        }

        // Se não verificado, calcular dias restantes
        if (profile?.created_at) {
            const createdAt = new Date(profile.created_at);
            const now = new Date();
            const deadline = new Date(createdAt);
            deadline.setDate(deadline.getDate() + 7);

            const diffTime = deadline.getTime() - now.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            setDaysRemaining(diffDays > 0 ? diffDays : 0);
            setIsVisible(true);
        }
    };

    if (!isVisible) return null;

    return (
        <div className="bg-yellow-500/10 border-b border-yellow-500/20 backdrop-blur-sm relative z-50">
            <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-yellow-500/20 p-1.5 rounded-full animate-pulse">
                        <AlertTriangle size={16} className="text-yellow-500" />
                    </div>
                    <div>
                        <p className="text-yellow-500 text-xs font-bold uppercase tracking-wider">
                            Verificação Pendente
                        </p>
                        <p className="text-yellow-500/80 text-[10px]">
                            {daysRemaining !== null && daysRemaining <= 0
                                ? 'Acesso expirando em breve.'
                                : `Risco de bloqueio em ${daysRemaining} dia(s).`}
                        </p>
                    </div>
                </div>

                <Link
                    href="/profile"
                    className="flex items-center gap-1 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-colors border border-yellow-500/30"
                >
                    Verificar
                    <ArrowRight size={12} />
                </Link>
            </div>
        </div>
    );
}
