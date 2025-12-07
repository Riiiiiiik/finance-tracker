'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Mail, Lock, LogIn, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                if (error.message.includes('Invalid login credentials')) {
                    throw new Error('Credenciais inválidas.');
                }
                if (error.message.includes('Email not confirmed')) {
                    router.push(`/verify?email=${encodeURIComponent(email)}`);
                    return;
                }
                throw error;
            }

            router.push('/dashboard');
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#09090B]">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-[#09090B] border border-[#333] shadow-[0_0_50px_rgba(16,185,129,0.1)] rounded-2xl overflow-hidden relative"
            >
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#10B981] to-transparent opacity-50"></div>

                {/* Header */}
                <div className="p-8 pb-6 border-b border-[#333]/50">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <ShieldCheck size={24} className="text-[#10B981]" />
                        <span className="text-[#10B981] font-bold text-sm uppercase tracking-[0.2em]">Monk.Vault</span>
                    </div>
                    <h1 className="text-2xl font-bold text-center text-white tracking-tight">Autenticação Segura</h1>
                    <p className="text-gray-500 text-center text-xs uppercase tracking-widest mt-2">Acesse seus ativos protegidos</p>
                </div>

                <div className="p-8 pt-6">
                    <form onSubmit={handleLogin} className="space-y-5">
                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-xs font-mono">
                                <span className="font-bold">ACESSO NEGADO:</span> {error}
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-[10px] text-[#10B981] font-bold uppercase tracking-widest pl-1">Identificador (Email)</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3 top-3.5 text-gray-500" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="agente@monk.vault"
                                    className="w-full bg-[#161616] border border-[#333] text-white rounded-lg p-3 pl-10 focus:border-[#10B981] focus:outline-none transition-all placeholder:text-gray-700 text-sm font-medium"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest pl-1">Chave de Segurança</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3 top-3.5 text-gray-500" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-[#161616] border border-[#333] text-white rounded-lg p-3 pl-10 focus:border-[#10B981] focus:outline-none transition-all placeholder:text-gray-700 text-sm font-medium"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 rounded-xl bg-[#10B981] hover:bg-[#0fa372] text-[#09090B] font-bold text-sm uppercase tracking-wide shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            {loading ? (
                                'Verificando...'
                            ) : (
                                <>
                                    <LogIn size={18} />
                                    Liberar Acesso
                                    <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity -ml-1" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <Link
                            href="/register"
                            className="text-gray-500 hover:text-[#10B981] text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 group"
                        >
                            Novo Agente?
                            <span className="text-[#10B981] group-hover:underline">Iniciar Protocolo</span>
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
