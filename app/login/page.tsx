'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Lock, Loader2, ArrowRight, CornerUpLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                if (error.message.includes('Invalid login credentials')) {
                    throw new Error('Credenciais de acesso inválidas.');
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
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden font-sans">

            {/* Background Sutil */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                {/* Header: MONK.VAULT */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center justify-center gap-2 mb-4 text-[#10B981] tracking-[0.2em] font-bold text-sm uppercase hover:opacity-80 transition-opacity">
                        <Image src="/logo.png" alt="Logo" width={24} height={24} className="rounded-md" />
                        <span>Monk.Vault</span>
                    </Link>
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Autenticação Segura</h1>
                    <p className="text-gray-500 text-[10px] tracking-[0.1em] uppercase font-bold">
                        Acesse seus ativos protegidos
                    </p>
                </div>

                {/* Card do Formulário */}
                <div className="bg-[#0A0A0A] border border-[#222] rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                    {/* Linha topo destaque */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#10B981] to-transparent opacity-50"></div>

                    <form onSubmit={handleLogin} className="space-y-6">

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-500 text-xs font-mono text-center">
                                {error}
                            </div>
                        )}

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-[10px] text-[#10B981] font-bold uppercase tracking-wider block">
                                Identificador (Email)
                            </label>
                            <div className="relative group">
                                <Mail size={16} className="absolute left-4 top-3.5 text-gray-600 group-focus-within:text-[#10B981] transition-colors" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="agente@monk.vault"
                                    className="w-full bg-[#121212] border border-[#333] text-gray-300 rounded-lg py-3 pl-12 pr-4 focus:border-[#10B981] focus:outline-none focus:ring-1 focus:ring-[#10B981]/20 transition-all placeholder:text-gray-700 text-sm font-medium"
                                    required
                                />
                            </div>
                        </div>

                        {/* Senha */}
                        <div className="space-y-2">
                            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">
                                Chave de Segurança
                            </label>
                            <div className="relative group">
                                <Lock size={16} className="absolute left-4 top-3.5 text-gray-600 group-focus-within:text-[#10B981] transition-colors" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-[#121212] border border-[#333] text-gray-300 rounded-lg py-3 pl-12 pr-4 focus:border-[#10B981] focus:outline-none focus:ring-1 focus:ring-[#10B981]/20 transition-all placeholder:text-gray-700 text-sm font-medium"
                                    required
                                />
                            </div>
                        </div>

                        {/* Botão */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#10B981] hover:bg-[#0EA572] text-black font-bold py-3.5 rounded-lg shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all flex items-center justify-center gap-2 mt-2 uppercase tracking-wide text-sm"
                        >
                            {isLoading ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <>
                                    <ArrowRight size={18} /> Liberar Acesso
                                </>
                            )}
                        </button>

                    </form>

                    {/* Footer Menor */}
                    <div className="mt-8 text-center">
                        <p className="text-[10px] text-gray-600 uppercase tracking-wider font-bold">
                            Novo Agente?{' '}
                            <Link href="/register" className="text-[#10B981] hover:text-[#34D399] transition-colors ml-1">
                                Iniciar Protocolo
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Back Link */}
                <div className="text-center mt-8">
                    <Link href="/" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#121212] border border-[#333] text-gray-400 hover:text-white hover:border-[#10B981] hover:bg-[#161616] transition-all duration-300 text-xs font-medium uppercase tracking-wider group">
                        Retornar à Ordem
                    </Link>
                </div>

            </motion.div>
        </div>
    );
}
