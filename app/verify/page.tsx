'use client';

import { useState, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function VerifyContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const emailParam = searchParams.get('email') || '';

    const [email, setEmail] = useState(emailParam);
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const { error } = await supabase.auth.verifyOtp({
                email,
                token,
                type: 'signup',
            });

            if (error) throw error;

            setMessage('Email verificado com sucesso! Redirecionando...');
            setTimeout(() => {
                router.push('/dashboard');
                router.refresh();
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Erro ao verificar código.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!email) {
            setError('Digite seu email para reenviar o código.');
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');

        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email,
            });

            if (error) throw error;

            setMessage('Código reenviado! Verifique seu email.');
        } catch (err: any) {
            if (err.message.includes('Too many requests')) {
                setError('Aguarde alguns segundos antes de tentar novamente.');
            } else {
                setError(err.message || 'Erro ao reenviar código.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8 bg-card p-8 rounded-xl border border-white/10">
                <div className="text-center">
                    <h1 className="text-2xl font-bold">Verificar Email</h1>
                    <p className="text-muted-foreground mt-2">Digite o código enviado para seu email</p>
                </div>

                <form onSubmit={handleVerify} className="space-y-4">
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-500 text-sm">
                            {error}
                        </div>
                    )}

                    {message && (
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded text-emerald-500 text-sm">
                            {message}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 rounded-md bg-secondary border border-input focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Código de Verificação</label>
                        <input
                            type="text"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            placeholder="123456"
                            className="w-full p-2 rounded-md bg-secondary border border-input focus:outline-none focus:ring-2 focus:ring-primary tracking-widest text-center text-lg"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-primary-foreground p-2 rounded-md font-medium hover:opacity-90 disabled:opacity-50"
                    >
                        {loading ? 'Verificando...' : 'Verificar Conta'}
                    </button>

                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={loading}
                        className="w-full text-sm text-muted-foreground hover:text-white transition-colors"
                    >
                        Não recebeu o código? Reenviar
                    </button>
                </form>

                <div className="text-center text-sm">
                    <Link href="/login" className="text-primary hover:underline">
                        Voltar para Login
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function VerifyPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Carregando...</div>}>
            <VerifyContent />
        </Suspense>
    );
}
