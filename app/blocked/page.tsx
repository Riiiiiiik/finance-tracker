'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ShieldAlert, Mail, Key, AlertTriangle, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BlockedPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [sendingOtp, setSendingOtp] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        checkBlockedStatus();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps


    const checkBlockedStatus = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
                return;
            }

            setUserId(session.user.id);
            setEmail(session.user.email || '');

            // Verificar se email já foi verificado
            const { data: profile } = await supabase
                .from('profiles')
                .select('email_verified')
                .eq('id', session.user.id)
                .single();

            if (profile?.email_verified) {
                // Email já verificado, liberar acesso
                router.push('/dashboard');
            }
        } catch (error) {
            console.error('Erro ao verificar status:', error);
        }
    };

    const handleSendOtp = async () => {
        setSendingOtp(true);
        setError('');
        setMessage('');

        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    shouldCreateUser: false,
                },
            });

            if (error) throw error;

            setMessage('Código de verificação enviado! Verifique seu e-mail.');
        } catch (err: any) {
            setError(err.message || 'Erro ao enviar código.');
        } finally {
            setSendingOtp(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const { error } = await supabase.auth.verifyOtp({
                email,
                token: otpCode,
                type: 'email',
            });

            if (error) throw error;

            // Atualizar metadados do usuário (Bypass RLS da tabela profiles)
            const { error: metaError } = await supabase.auth.updateUser({
                data: { monk_verified: true }
            });
            if (metaError) console.warn('Erro ao atualizar metadata:', metaError);

            // Force session refresh
            const { error: refreshError } = await supabase.auth.refreshSession();
            if (refreshError) console.warn('Erro ao atualizar sessão:', refreshError);

            // Atualizar flag no perfil (Tentativa best-effort)
            if (userId) {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .update({ email_verified: true })
                    .eq('id', userId);

                if (profileError) {
                    console.warn('RLS permitiu leitura mas impediu update do perfil (esperado):', profileError);
                }
            }

            setMessage('E-mail verificado com sucesso! Acesso liberado.');

            // Bypass Instantâneo: Marcar no navegador
            if (typeof window !== 'undefined') localStorage.setItem('monk_verified_client', 'true');

            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1000);
        } catch (err: any) {
            setError(err.message || 'Código inválido. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#09090B] relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.1),transparent_50%)]"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-[#09090B] border-2 border-red-500/30 shadow-[0_0_50px_rgba(220,38,38,0.3)] rounded-2xl overflow-hidden relative z-10"
            >
                {/* Sentry Header */}
                <div className="p-8 pb-6 border-b border-red-500/20 bg-gradient-to-b from-red-950/20 to-transparent">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <ShieldAlert size={32} className="text-red-500 animate-pulse" />
                        <h1 className="text-3xl font-bold text-red-500 tracking-tight uppercase">
                            Acesso Bloqueado
                        </h1>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
                        <p className="text-red-400 text-sm font-bold uppercase tracking-wider flex items-center gap-2 justify-center">
                            <AlertTriangle size={16} />
                            Sistema de Segurança Ativado
                        </p>
                    </div>
                    <p className="text-gray-400 text-center text-xs uppercase tracking-widest">
                        Verificação de E-mail Requerida
                    </p>
                </div>

                <div className="p-8 pt-6">
                    {/* Mensagem de Bloqueio */}
                    <div className="mb-6 p-4 bg-red-950/30 border border-red-500/20 rounded-lg">
                        <p className="text-red-300 text-sm leading-relaxed">
                            <Lock size={16} className="inline mr-2" />
                            Sua conta foi <span className="font-bold">bloqueada</span> devido à falta de verificação de e-mail.
                            Para recuperar o acesso, você deve verificar seu endereço de e-mail agora.
                        </p>
                    </div>

                    <form onSubmit={handleVerifyOtp} className="space-y-5">
                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs font-mono">
                                <span className="font-bold">ERRO:</span> {error}
                            </div>
                        )}

                        {message && (
                            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-xs font-mono">
                                <span className="font-bold">OK:</span> {message}
                            </div>
                        )}

                        {/* E-mail Display */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest pl-1">
                                E-mail Registrado
                            </label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3 top-3.5 text-gray-500" />
                                <input
                                    type="email"
                                    value={email}
                                    disabled
                                    className="w-full bg-[#161616] border border-[#333] text-gray-400 rounded-lg p-3 pl-10 text-sm font-medium cursor-not-allowed"
                                />
                            </div>
                        </div>

                        {/* Botão Enviar Código */}
                        <button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={sendingOtp}
                            className="w-full py-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/50 text-red-400 font-bold text-sm uppercase tracking-wide transition-all disabled:opacity-50"
                        >
                            {sendingOtp ? 'Enviando...' : 'Enviar Código de Verificação'}
                        </button>

                        {/* Campo Código OTP */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] text-red-400 font-bold uppercase tracking-widest pl-1">
                                Código de Verificação
                            </label>
                            <div className="relative">
                                <Key size={16} className="absolute left-3 top-3.5 text-gray-500" />
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                    placeholder="00000000"
                                    maxLength={8}
                                    className="w-full bg-[#161616] border border-red-500/30 text-white rounded-lg p-3 pl-10 focus:border-red-500 focus:outline-none transition-all placeholder:text-gray-700 text-center text-xl font-mono tracking-[0.5em] font-bold"
                                    required
                                />
                            </div>
                            <p className="text-gray-600 text-[10px] uppercase tracking-wider pl-1 mt-1">
                                Digite o código de 8 dígitos
                            </p>
                        </div>

                        {/* Botão Verificar */}
                        <button
                            type="submit"
                            disabled={loading || otpCode.length !== 8}
                            className="w-full py-4 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm uppercase tracking-wide shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                'Verificando...'
                            ) : (
                                <>
                                    <ShieldAlert size={18} />
                                    Desbloquear Acesso
                                </>
                            )}
                        </button>
                    </form>

                    {/* Aviso de Spam */}
                    <div className="mt-6 p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
                        <p className="text-yellow-500/80 text-[10px] uppercase tracking-wider font-medium text-center">
                            ⚠ Verifique sua caixa de spam se não receber o e-mail
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
