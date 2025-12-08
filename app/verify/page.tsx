'use client';

import { useState, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Key, ArrowRight, CornerUpLeft } from 'lucide-react';
import { motion } from 'framer-motion';

function VerifyContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const emailParam = searchParams.get('email') || '';

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
                email: emailParam,
                token,
                type: 'signup',
            });

            if (error) throw error;

            setMessage('Acesso Autorizado. Iniciando Protocolo...');
            setTimeout(() => {
                router.push('/onboarding');
                router.refresh();
            }, 2000);
        } catch (err: any) {
            if (err.message.includes('expired') || err.message.includes('invalid')) {
                setError('Código expirado ou inválido. Solicite um novo código.');
            } else {
                setError(err.message || 'Código inválido. Tente novamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: emailParam,
            });

            if (error) throw error;

            setMessage('Novo código transmitido. Verifique seu terminal.');
        } catch (err: any) {
            if (err.message.includes('Too many requests')) {
                setError('Limite de requisições atingido. Aguarde.');
            } else {
                setError(err.message || 'Erro ao reenviar código.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#09090B]">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-[#09090B] border border-[#333] shadow-[0_0_50px_rgba(16,185,129,0.1)] rounded-2xl overflow-hidden relative"
            >
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#10B981] to-transparent opacity-50"></div>

                {/* Header */}
                <div className="p-8 pb-6 border-b border-[#333]/50">
                    <Link href="/" className="flex items-center justify-center gap-2 mb-4 hover:opacity-80 transition-opacity">
                        <Image src="/logo.png" alt="Logo" width={24} height={24} className="rounded-md" />
                        <span className="text-[#10B981] font-bold text-sm uppercase tracking-[0.2em]">Monk.Vault</span>
                    </Link>
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <ShieldCheck size={20} className="text-[#10B981]" />
                        <h1 className="text-2xl font-bold text-center text-white tracking-tight">Verificação de Acesso</h1>
                    </div>
                    <p className="text-gray-500 text-center text-xs uppercase tracking-widest mt-2">
                        Código enviado para {emailParam.substring(0, 3)}***@***
                    </p>
                </div>

                <div className="p-8 pt-6">
                    <form onSubmit={handleVerify} className="space-y-5">
                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-xs font-mono">
                                <span className="font-bold">ERRO:</span> {error}
                            </div>
                        )}

                        {message && (
                            <div className="p-3 bg-[#10B981]/10 border border-[#10B981]/20 rounded-lg text-[#10B981] text-xs font-mono">
                                <span className="font-bold">OK:</span> {message}
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-[10px] text-[#10B981] font-bold uppercase tracking-widest pl-1">Código de Autorização</label>
                            <div className="relative">
                                <Key size={16} className="absolute left-3 top-3.5 text-gray-500" />
                                <input
                                    type="text"
                                    value={token}
                                    onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
                                    placeholder="000000"
                                    maxLength={6}
                                    className="w-full bg-[#161616] border border-[#333] text-white rounded-lg p-3 pl-10 focus:border-[#10B981] focus:outline-none transition-all placeholder:text-gray-700 text-center text-2xl font-mono tracking-[0.5em] font-bold"
                                    required
                                />
                            </div>
                            <p className="text-gray-600 text-[10px] uppercase tracking-wider pl-1 mt-1">
                                Digite o código de 6 dígitos
                            </p>
                        </div>

                        {/* Spam Warning */}
                        <div className="p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
                            <p className="text-yellow-500/80 text-[10px] uppercase tracking-wider font-medium flex items-center gap-2">
                                <span className="text-yellow-500">⚠</span>
                                Não recebeu? Verifique sua caixa de spam
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || token.length !== 6}
                            className="w-full py-4 rounded-xl bg-[#10B981] hover:bg-[#0fa372] text-[#09090B] font-bold text-sm uppercase tracking-wide shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            {loading ? (
                                'Validando...'
                            ) : (
                                <>
                                    <ShieldCheck size={18} />
                                    Autorizar Acesso
                                    <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity -ml-1" />
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={loading}
                            className="w-full text-xs text-gray-500 hover:text-[#10B981] transition-colors uppercase tracking-wider font-medium"
                        >
                            Não recebeu? Retransmitir código
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <Link
                            href="/login"
                            className="text-gray-500 hover:text-[#10B981] text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 group"
                        >
                            <CornerUpLeft size={14} />
                            Voltar ao Terminal
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default function VerifyPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#09090B]"><div className="text-[#10B981] font-mono">Carregando...</div></div>}>
            <VerifyContent />
        </Suspense>
    );
}
