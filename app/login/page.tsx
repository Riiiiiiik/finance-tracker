'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Loader2, Fingerprint, Shield, AlertCircle } from 'lucide-react';
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

            {/* 1. Background Tático */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

            {/* Efeito de Luz "Spotlight" no topo */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-[#10B981]/10 to-transparent opacity-60 pointer-events-none blur-3xl"></div>

            {/* 2. O TERMINAL DE ACESSO */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md bg-[#121212] border border-[#333] rounded-3xl p-8 relative z-10 shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-xl"
            >

                {/* Status do Sistema (Badge) */}
                <div className="flex justify-center mb-6">
                    <div className="bg-[#10B981]/10 border border-[#10B981]/20 px-3 py-1 rounded-full flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
                        </span>
                        <span className="text-[10px] text-[#10B981] font-mono font-bold tracking-widest uppercase">
                            Sistema Online
                        </span>
                    </div>
                </div>

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-1">Bem-vindo à Ordem</h1>
                    <p className="text-gray-500 text-sm">Insira suas credenciais para acessar o Vault.</p>
                </div>

                {/* Formulário */}
                <form onSubmit={handleLogin} className="space-y-5">

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-mono flex items-center gap-2">
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Email */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider ml-1">ID do Operador (Email)</label>
                        <div className="relative group">
                            <Mail size={18} className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-[#10B981] transition-colors" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="agente@theorder.com"
                                className="w-full bg-[#09090B] border border-[#333] text-white rounded-xl py-3.5 pl-12 pr-4 focus:border-[#10B981] focus:outline-none focus:shadow-[0_0_15px_rgba(16,185,129,0.1)] transition-all placeholder:text-gray-700 font-medium"
                                required
                            />
                        </div>
                    </div>

                    {/* Senha */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center ml-1">
                            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Protocolo de Senha</label>

                        </div>
                        <div className="relative group">
                            <Lock size={18} className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-[#10B981] transition-colors" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••••••"
                                className="w-full bg-[#09090B] border border-[#333] text-white rounded-xl py-3.5 pl-12 pr-4 focus:border-[#10B981] focus:outline-none focus:shadow-[0_0_15px_rgba(16,185,129,0.1)] transition-all placeholder:text-gray-700"
                                required
                            />
                        </div>
                    </div>

                    {/* Botão de Ação */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#10B981] hover:bg-[#0fa372] text-[#09090B] font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : (
                            <>
                                <Fingerprint size={20} /> Autenticar Acesso
                            </>
                        )}
                    </button>

                </form>

                {/* Footer Link */}
                <div className="mt-8 text-center border-t border-[#222] pt-6">
                    <p className="text-xs text-gray-500">
                        Ainda não é um membro?{' '}
                        <Link href="/register" className="text-[#10B981] font-bold hover:underline transition-colors">
                            Solicitar Acesso
                        </Link>
                    </p>
                </div>

            </motion.div>

            {/* Marca D'água */}
            <div className="absolute bottom-6 flex items-center gap-2 opacity-30">
                <Shield size={14} className="text-white" />
                <span className="text-[10px] text-white font-mono tracking-[0.2em] uppercase">
                    Monk Security Layer v2.0
                </span>
            </div>

        </div>
    );
}
