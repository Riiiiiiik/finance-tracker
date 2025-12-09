'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const handleAuthCallback = async () => {
            try {
                // Tenta capturar o CODE da URL (PKCE Flow)
                const searchParams = new URLSearchParams(window.location.search);
                const code = searchParams.get('code');
                const next = searchParams.get('next') || '/dashboard';

                if (code) {
                    const { error } = await supabase.auth.exchangeCodeForSession(code);
                    if (error) throw error;
                    // Se a troca foi bem sucedida, supabase.auth.getSession() abaixo retornará a sessão
                }

                // Get the session 
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) throw sessionError;

                if (session && session.user) {
                    // User is authenticated via Magic Link/OTP
                    const userId = session.user.id;

                    // Update email_verified to true in profiles table
                    const { error: updateError } = await supabase
                        .from('profiles')
                        .update({ email_verified: true })
                        .eq('id', userId);

                    if (updateError) {
                        console.error('Error updating email_verified:', updateError);
                        // Não vamos travar o login se falhar o update do profile, mas logamos
                    }

                    setStatus('success');
                    setMessage('E-mail verificado com sucesso! Redirecionando...');

                    // Redirect to dashboard
                    setTimeout(() => {
                        router.push(next);
                    }, 1500);
                } else {
                    // Se não tiver código e não tiver sessão, erro
                    if (!code) throw new Error('Link de autenticação inválido ou expirado.');
                    throw new Error('Sessão não estabelecida.');
                }
            } catch (error: any) {
                console.error('Auth callback error:', error);
                setStatus('error');
                setMessage(error.message || 'Erro ao processar autenticação');

                // Redirect to login after error
                setTimeout(() => {
                    router.push('/login');
                }, 4000);
            }
        };

        handleAuthCallback();
    }, [router]);

    return (
        <div className="min-h-screen bg-[#09090B] flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-[#161616] border border-[#333] rounded-2xl p-8 text-center">
                {status === 'loading' && (
                    <>
                        <div className="w-16 h-16 mx-auto mb-6 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin"></div>
                        <h1 className="text-white font-bold text-xl mb-2 uppercase tracking-wider">
                            Protocolo de Verificação
                        </h1>
                        <p className="text-gray-400 text-sm">
                            Processando autenticação...
                        </p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="w-16 h-16 mx-auto mb-6 bg-[#10B981]/10 rounded-full flex items-center justify-center border-2 border-[#10B981]">
                            <svg className="w-8 h-8 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1 className="text-[#10B981] font-bold text-xl mb-2 uppercase tracking-wider">
                            Sincronização Concluída
                        </h1>
                        <p className="text-gray-400 text-sm">
                            {message}
                        </p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="w-16 h-16 mx-auto mb-6 bg-red-500/10 rounded-full flex items-center justify-center border-2 border-red-500">
                            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h1 className="text-red-500 font-bold text-xl mb-2 uppercase tracking-wider">
                            Falha no Protocolo
                        </h1>
                        <p className="text-gray-400 text-sm">
                            {message}
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}
