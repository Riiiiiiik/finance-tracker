'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { User, CreditCard, Cpu, Settings, LogOut, Trash2, Shield, Zap, BrainCircuit, Mail, CheckCircle, Clock, AlertCircle, Key } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function MemberProfile() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [calibrating, setCalibrating] = useState(false);

    // Dados do Usuário
    const [profile, setProfile] = useState<any>(null);
    const [userId, setUserId] = useState<string | null>(null);

    // Estados do Formulário Financeiro
    const [income, setIncome] = useState('');
    const [payday, setPayday] = useState('');
    const [riskProfile, setRiskProfile] = useState<'conservative' | 'moderate' | 'bold'>('moderate');

    // Estado de Edição de Identidade
    const [isEditingIdentity, setIsEditingIdentity] = useState(false);
    const [tempName, setTempName] = useState('');
    const [tempAvatar, setTempAvatar] = useState('');

    // Estados de Verificação de E-mail
    const [userEmail, setUserEmail] = useState('');
    const [emailVerified, setEmailVerified] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [sendingOtp, setSendingOtp] = useState(false);
    const [verifyingOtp, setVerifyingOtp] = useState(false);
    const [otpMessage, setOtpMessage] = useState('');
    const [otpError, setOtpError] = useState('');
    const [accountCreatedAt, setAccountCreatedAt] = useState<Date | null>(null);
    const [timeRemaining, setTimeRemaining] = useState<{ days: number; hours: number; minutes: number } | null>(null);
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        if (profile) {
            setTempName(profile.full_name || '');
            setTempAvatar(profile.avatar_url || '');
        }
    }, [profile]);

    useEffect(() => {
        checkUser();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps


    const checkUser = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
                return;
            }
            setUserId(session.user.id);
            loadProfile(session.user.id);
        } catch (error) {
            console.error('Erro de sessão:', error);
            router.push('/login');
        }
    };

    const loadProfile = async (uid: string) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();

            if (session?.user) {
                setUserEmail(session.user.email || '');
                setAccountCreatedAt(new Date(session.user.created_at));
            }

            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', uid)
                .single();

            if (data) {
                setProfile(data);
                // Verificação Robusta (Mesma lógica do EmailGuard)
                const isMetaVerified = session.user.user_metadata?.monk_verified === true;
                const isAuthVerified = !!session.user.email_confirmed_at;
                const isLocalVerified = typeof window !== 'undefined' && localStorage.getItem('monk_verified_client') === 'true';

                setEmailVerified(data.email_verified || isMetaVerified || isAuthVerified || isLocalVerified);

                // Formatar Renda
                if (data.monthly_income) {
                    const formatted = new Intl.NumberFormat('pt-BR', {
                        minimumFractionDigits: 2
                    }).format(data.monthly_income);
                    setIncome(formatted);
                }

                if (data.payday) setPayday(data.payday.toString().padStart(2, '0'));
                if (data.investor_profile) setRiskProfile(data.investor_profile);
            }
        } catch (error) {
            console.error('Erro ao carregar perfil:', error);
        } finally {
            setLoading(false);
        }
    };

    // Timer de 7 dias para verificação de e-mail
    useEffect(() => {
        if (!accountCreatedAt || emailVerified) return;

        const updateTimer = () => {
            const now = new Date();
            const deadline = new Date(accountCreatedAt);
            deadline.setDate(deadline.getDate() + 7); // 7 dias

            const diff = deadline.getTime() - now.getTime();

            if (diff <= 0) {
                setIsExpired(true);
                setTimeRemaining({ days: 0, hours: 0, minutes: 0 });
                // Redirecionar para página de bloqueio
                // REMOVIDO: Deixar o EmailGuard lidar com o bloqueio globalmente para evitar loops.
                // router.push('/blocked');
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            setTimeRemaining({ days, hours, minutes });
            setIsExpired(false);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 60000); // Atualizar a cada minuto

        return () => clearInterval(interval);
    }, [accountCreatedAt, emailVerified]);

    const handleSendOtp = async () => {
        setSendingOtp(true);
        setOtpError('');
        setOtpMessage('');

        try {
            const { error } = await supabase.auth.signInWithOtp({
                email: userEmail,
                options: {
                    shouldCreateUser: false,
                },
            });

            if (error) throw error;

            setOtpMessage('Código enviado! Verifique seu e-mail (e spam).');
        } catch (err: any) {
            setOtpError(err.message || 'Erro ao enviar código.');
        } finally {
            setSendingOtp(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otpCode || otpCode.length !== 8) {
            setOtpError('Código deve ter 8 dígitos.');
            return;
        }

        setVerifyingOtp(true);
        setOtpError('');
        setOtpMessage('');

        try {
            const { error } = await supabase.auth.verifyOtp({
                email: userEmail,
                token: otpCode,
                type: 'email',
            });

            if (error) throw error;

            // Atualizar flag no perfil
            if (userId) {
                await supabase
                    .from('profiles')
                    .update({ email_verified: true })
                    .eq('id', userId);
            }

            setEmailVerified(true);
            setOtpMessage('✓ E-mail verificado com sucesso!');
            setOtpCode('');
        } catch (err: any) {
            setOtpError(err.message || 'Código inválido. Tente novamente.');
        } finally {
            setVerifyingOtp(false);
        }
    };

    const handleSaveIdentity = async () => {
        if (!userId) return;
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: tempName,
                    avatar_url: tempAvatar
                })
                .eq('id', userId);

            if (error) throw error;

            setProfile({ ...profile, full_name: tempName, avatar_url: tempAvatar });
            setIsEditingIdentity(false);
            // alert('Identidade atualizada.'); // Removed for cleaner UX or replace with toast
        } catch (error) {
            console.error('Erro ao salvar:', error);
            alert('Erro ao atualizar identidade.');
        }
    };

    const handleIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Permitir apenas números e vírgula/ponto
        const value = e.target.value.replace(/[^\d,]/g, '');
        setIncome(value);
    };

    const handleRecalibrate = async () => {
        setCalibrating(true);

        // Simular "Processamento AI"
        await new Promise(resolve => setTimeout(resolve, 1500));

        try {
            // Converter renda: "5.600,00" -> 5600.00
            // Remover pontos de milhar, substituir virgula decimal por ponto
            const rawValue = income.replace(/\./g, '').replace(',', '.');
            const numericIncome = parseFloat(rawValue);
            const numericPayday = parseInt(payday);

            if (isNaN(numericIncome)) {
                alert('Valor de renda inválido para processamento.');
                setCalibrating(false);
                return;
            }

            const { error } = await supabase
                .from('profiles')
                .update({
                    monthly_income: numericIncome,
                    payday: numericPayday || null
                })
                .eq('id', userId);

            if (error) throw error;

            // Visual feedback handled by state or toast eventually
        } catch (error) {
            console.error('Falha na recalibragem:', error);
            alert('Erro na sincronização com o núcleo.');
        } finally {
            setCalibrating(false);
        }
    };

    const handleUpdateRiskProfile = async (profileType: 'conservative' | 'moderate' | 'bold') => {
        setRiskProfile(profileType);
        try {
            // Tentar salvar no DB. Se a coluna não existir, vai falhar silenciosamente no catch
            const { error } = await supabase
                .from('profiles')
                .update({ investor_profile: profileType })
                .eq('id', userId);

            if (error) {
                console.warn('Campo investor_profile pode não existir:', error.message);
            }
        } catch (error) {
            console.error('Erro ao atualizar perfil de risco:', error);
        }
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    const handleDeleteAccount = async () => {
        if (!confirm('ATENÇÃO: Protocolo de Autodestruição. Confirmar exclusão permanente?')) return;

        try {
            // Limpeza em cascata (supondo policies ou manual)
            if (userId) {
                // 1. Dados Transacionais
                await supabase.from('transactions').delete().eq('user_id', userId);
                await supabase.from('accounts').delete().eq('user_id', userId); // Was missing!
                await supabase.from('categories').delete().eq('user_id', userId);
                await supabase.from('wishlist_items').delete().eq('user_id', userId);

                // 2. Perfil
                const { error: profileError } = await supabase.from('profiles').delete().eq('id', userId);
                if (profileError) console.warn('Erro ao deletar perfil (pode ser restrição de RLS):', profileError);

                // 3. Logout
                await supabase.auth.signOut();
                router.push('/login');
            }
        } catch (error) {
            console.error('Erro ao deletar:', error);
            alert('Falha no protocolo de exclusão.');
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
            <div className="text-[#10B981] animate-pulse font-mono tracking-widest">CARREGANDO DOSSIÊ...</div>
        </div>
    );

    return (
        <div className="bg-[#09090B] min-h-screen text-white p-6 font-sans pb-24 max-w-md mx-auto">

            {/* 1. CREDENCIAL DO MEMBRO (ID CARD) */}
            <div className="relative mb-8 group">
                <div className="absolute inset-0 bg-gradient-to-r from-[#10B981] to-blue-600 opacity-20 blur-xl rounded-2xl group-hover:opacity-30 transition-opacity"></div>
                <div className="bg-[#161616]/90 backdrop-blur-xl border border-[#333] p-6 rounded-2xl relative z-10 flex items-center gap-5 shadow-2xl">

                    {isEditingIdentity ? (
                        <div className="flex-1 space-y-4 animate-in fade-in">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
                                <p className="text-[#10B981] text-xs uppercase font-bold tracking-[0.15em]">Modo de Edição de Credencial</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-gray-500 font-bold uppercase">Codinome (Nome)</label>
                                <input
                                    value={tempName}
                                    onChange={(e) => setTempName(e.target.value)}
                                    className="w-full bg-[#09090B] border border-[#333] rounded-lg p-2 text-white outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]/50 text-sm font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-gray-500 font-bold uppercase">Holo-Avatar (URL)</label>
                                <input
                                    value={tempAvatar}
                                    onChange={(e) => setTempAvatar(e.target.value)}
                                    className="w-full bg-[#09090B] border border-[#333] rounded-lg p-2 text-xs text-gray-400 outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]/50 font-mono"
                                    placeholder="https://"
                                />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button onClick={() => setIsEditingIdentity(false)} className="flex-1 py-2 rounded-lg border border-[#333] hover:bg-[#222] text-xs font-bold text-gray-400 transition-colors">Cancelar</button>
                                <button onClick={handleSaveIdentity} className="flex-1 py-2 rounded-lg bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/50 hover:bg-[#10B981]/20 font-bold text-xs transition-colors shadow-[0_0_10px_rgba(16,185,129,0.2)]">Confirmar Alterações</button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="relative">
                                <div className="w-20 h-20 rounded-full bg-gray-700 overflow-hidden border-2 border-[#10B981] p-0.5 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.full_name || 'User'}`}
                                        alt="Avatar"
                                        className="w-full h-full rounded-full bg-[#222] object-cover"
                                    />


                                </div>
                                <div className="absolute bottom-0 right-0 bg-[#09090B] p-1 rounded-full border border-[#10B981]/30">
                                    <Shield size={16} className="text-[#10B981] fill-[#10B981]" />
                                </div>
                            </div>

                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-white tracking-tight">{profile?.full_name || 'Operador'}</h2>
                                <p className="text-[#10B981] text-xs uppercase font-bold tracking-[0.15em] mb-1">Membro Fundador</p>
                                <p className="text-gray-500 text-xs flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
                                    Acesso Nível 5 Concedido
                                </p>
                            </div>

                            <button
                                onClick={() => setIsEditingIdentity(true)}
                                className="bg-[#222] hover:bg-[#333] p-2 rounded-lg transition-colors border border-[#333] group"
                                title="Editar Identidade"
                            >
                                <Settings size={18} className="text-gray-400 group-hover:text-white group-hover:rotate-90 transition-all duration-300" />
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* 2. VERIFICAÇÃO DE E-MAIL COM TIMER */}
            {!emailVerified && timeRemaining && (
                <div className="mb-8">
                    {/* Banner de Alerta Progressivo */}
                    {(() => {
                        const { days, hours } = timeRemaining;
                        const totalHours = days * 24 + hours;

                        // Determinar cor e intensidade do alerta
                        let bgColor, borderColor, textColor, icon, message, pulseClass;

                        if (days >= 4) {
                            // Verde: Mais de 3 dias
                            bgColor = 'bg-[#10B981]/10';
                            borderColor = 'border-[#10B981]/30';
                            textColor = 'text-[#10B981]';
                            icon = <Mail size={16} />;
                            message = 'Sistema de Segurança: Verificação de E-mail Pendente';
                            pulseClass = '';
                        } else if (days >= 1) {
                            // Amarelo: Entre 1-3 dias
                            bgColor = 'bg-yellow-500/10';
                            borderColor = 'border-yellow-500/30';
                            textColor = 'text-yellow-500';
                            icon = <Clock size={16} />;
                            message = `ATENÇÃO: Protocolo de bloqueio será ativado em ${days} dia(s)`;
                            pulseClass = 'animate-pulse';
                        } else {
                            // Vermelho: Menos de 1 dia
                            bgColor = 'bg-red-500/10';
                            borderColor = 'border-red-500/30';
                            textColor = 'text-red-500';
                            icon = <AlertCircle size={16} />;
                            message = `ALERTA CRÍTICO: Sistema será bloqueado em ${hours}h ${timeRemaining.minutes}m`;
                            pulseClass = 'animate-pulse';
                        }

                        return (
                            <div className={`${bgColor} border ${borderColor} rounded-xl p-4 ${pulseClass}`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={textColor}>{icon}</span>
                                    <p className={`${textColor} text-xs font-bold uppercase tracking-wider`}>
                                        {message}
                                    </p>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-gray-500 text-xs">
                                        Tempo restante: <span className={`font-mono font-bold ${textColor}`}>
                                            {days}d {hours}h {timeRemaining.minutes}m
                                        </span>
                                    </p>
                                </div>
                            </div>
                        );
                    })()}

                    {/* Seção de Verificação */}
                    <div className="mt-4 bg-[#161616] border border-[#333] rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Mail size={18} className="text-[#10B981]" />
                            <h3 className="text-white font-bold uppercase tracking-wider text-sm">
                                Verificar E-mail
                            </h3>
                        </div>

                        <p className="text-gray-400 text-xs mb-4 leading-relaxed">
                            Verifique seu e-mail para manter acesso total ao sistema.
                            Você receberá um <span className="text-[#10B981] font-bold">código de 8 dígitos</span> e
                            um <span className="text-[#10B981] font-bold">link clicável</span> - use qualquer um.
                        </p>

                        {otpError && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs font-mono">
                                <span className="font-bold">ERRO:</span> {otpError}
                            </div>
                        )}

                        {otpMessage && (
                            <div className="mb-4 p-3 bg-[#10B981]/10 border border-[#10B981]/20 rounded-lg text-[#10B981] text-xs font-mono">
                                <span className="font-bold">OK:</span> {otpMessage}
                            </div>
                        )}

                        <div className="space-y-4">
                            {/* E-mail Display */}
                            <div className="space-y-2">
                                <label className="text-xs text-gray-500 font-bold uppercase">E-mail Registrado</label>
                                <div className="bg-[#09090B] border border-[#333] rounded-lg p-3">
                                    <p className="text-gray-400 text-sm font-mono">{userEmail}</p>
                                </div>
                            </div>

                            {/* Botão Enviar Código */}
                            <button
                                onClick={handleSendOtp}
                                disabled={sendingOtp}
                                className="w-full py-3 rounded-lg bg-[#10B981]/10 hover:bg-[#10B981]/20 border border-[#10B981]/50 text-[#10B981] font-bold text-sm uppercase tracking-wide transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                <Mail size={16} />
                                {sendingOtp ? 'Enviando...' : 'Enviar Código de Verificação'}
                            </button>

                            {/* Campo Código OTP */}
                            <div className="space-y-2">
                                <label className="text-xs text-[#10B981] font-bold uppercase">Código de 6 Dígitos</label>
                                <div className="relative">
                                    <Key size={16} className="absolute left-3 top-3.5 text-gray-500" />
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={otpCode}
                                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                        placeholder="00000000"
                                        maxLength={8}
                                        className="w-full bg-[#09090B] border border-[#333] text-white rounded-lg p-3 pl-10 focus:border-[#10B981] focus:outline-none transition-all placeholder:text-gray-700 text-center text-xl font-mono tracking-[0.5em] font-bold"
                                    />
                                </div>
                                <p className="text-gray-600 text-[10px] uppercase tracking-wider">
                                    Digite o código recebido por e-mail ou clique no link
                                </p>
                            </div>

                            {/* Botão Verificar */}
                            <button
                                onClick={handleVerifyOtp}
                                disabled={verifyingOtp || otpCode.length !== 6}
                                className="w-full py-3 rounded-lg bg-[#10B981] hover:bg-[#0fa372] text-[#09090B] font-bold text-sm uppercase tracking-wide shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {verifyingOtp ? (
                                    'Verificando...'
                                ) : (
                                    <>
                                        <CheckCircle size={16} />
                                        Verificar E-mail
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Email Verificado Badge */}
            {emailVerified && (
                <div className="mb-8 bg-[#10B981]/10 border border-[#10B981]/30 rounded-xl p-4 flex items-center gap-3">
                    <CheckCircle size={24} className="text-[#10B981]" />
                    <div>
                        <p className="text-[#10B981] font-bold text-sm uppercase tracking-wider">
                            E-mail Verificado
                        </p>
                        <p className="text-gray-500 text-xs">
                            Acesso total concedido • Segurança ativada
                        </p>
                    </div>
                </div>
            )}

            {/* 2. MOTOR FINANCEIRO (Onde a IA atua) */}
            <div className="mb-6">
                <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Zap size={14} className="text-yellow-500" />
                    Núcleo de Energia
                </h3>

                <div className="bg-[#161616] border border-[#333] rounded-xl p-6 relative overflow-hidden">
                    {/* Detalhe visual de circuito */}
                    <div className="absolute right-0 top-0 opacity-5 pointer-events-none">
                        <Cpu size={120} />
                    </div>

                    <div className="grid grid-cols-2 gap-6 relative z-10">
                        <div className="space-y-2">
                            <label className="text-xs text-gray-500 font-bold uppercase">Fluxo Mensal (Renda)</label>
                            <div className="flex items-center gap-2 text-white bg-[#09090B] border border-[#333] rounded-lg p-3 focus-within:border-[#10B981] transition-colors">
                                <span className="text-gray-500 text-sm">R$</span>
                                <input
                                    type="text"
                                    value={income}
                                    onChange={handleIncomeChange}
                                    className="bg-transparent outline-none w-full font-mono font-bold"
                                    placeholder="0,00"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-gray-500 font-bold uppercase">Ciclo de Recarga (Dia)</label>
                            <div className="flex items-center gap-2 text-white bg-[#09090B] border border-[#333] rounded-lg p-3 focus-within:border-[#10B981] transition-colors">
                                <span className="text-gray-500 text-sm">Dia</span>
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    value={payday}
                                    onChange={(e) => setPayday(e.target.value)}
                                    className="bg-transparent outline-none w-full font-mono font-bold"
                                    placeholder="DD"
                                    min="1" max="31"
                                />
                            </div>
                        </div>
                    </div>

                    {/* AÇÃO DA MONK.AI */}
                    <button
                        onClick={handleRecalibrate}
                        disabled={calibrating}
                        className="w-full mt-6 bg-[#10B981]/10 hover:bg-[#10B981]/20 border border-[#10B981]/50 text-[#10B981] font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all group disabled:opacity-50"
                    >
                        <Cpu size={18} className={calibrating ? "animate-spin" : "group-hover:animate-spin-slow"} />
                        {calibrating ? 'Sincronizando...' : 'Recalibrar Premissas com IA'}
                    </button>
                    <p className="text-center text-[10px] text-gray-600 mt-2">
                        * A Monk.AI usará estes dados para projetar seus limites do Vault.
                    </p>
                </div>
            </div>

            {/* 3. SINCRONIZAÇÃO NEURAL (Novo!) */}
            <div className="mb-8">
                <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                    <BrainCircuit size={14} className="text-[#6CA8FF]" />
                    Sincronização Neural
                </h3>

                <div className="bg-[#161616] border border-[#333] rounded-xl p-1 flex items-center justify-between">
                    {['conservative', 'moderate', 'bold'].map((type) => {
                        const isSelected = riskProfile === type;
                        const label = type === 'conservative' ? 'Conservador' : type === 'moderate' ? 'Moderado' : 'Arrojado';
                        const colorClass = type === 'bold' ? 'text-red-500' : type === 'moderate' ? 'text-[#6CA8FF]' : 'text-[#10B981]';
                        const bgClass = type === 'bold' ? 'bg-red-500/10 border-red-500/30' : type === 'moderate' ? 'bg-[#6CA8FF]/10 border-[#6CA8FF]/30' : 'bg-[#10B981]/10 border-[#10B981]/30';

                        return (
                            <button
                                key={type}
                                onClick={() => handleUpdateRiskProfile(type as any)}
                                className={`flex-1 py-3 text-xs font-bold transition-all rounded-lg 
                                    ${isSelected
                                        ? `${colorClass} ${bgClass} border shadow-[0_0_10px_rgba(0,0,0,0.5)]`
                                        : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>
                <div className="flex justify-between mt-2 ml-1 mr-1">
                    <p className="text-[10px] text-gray-500">
                        {riskProfile === 'conservative' && 'Prioriza segurança máxima. Alertas precoces.'}
                        {riskProfile === 'moderate' && 'Equilíbrio entre crescimento e proteção.'}
                        {riskProfile === 'bold' && 'Tolerância a alta volatilidade e gastos.'}
                    </p>
                </div>
            </div>

            {/* 4. ZONA DE PERIGO (Footer) */}
            <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-4 rounded-xl bg-[#161616] border border-[#333] text-gray-300 hover:bg-[#222] transition-colors cursor-not-allowed opacity-70">
                    <span className="flex items-center gap-3 font-medium">
                        <Settings size={18} /> Protocolos do Sistema
                    </span>
                    <span className="text-xs text-gray-500">v1.0.4</span>
                </button>

                <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 p-4 rounded-xl border border-[#333] text-gray-400 hover:text-white hover:bg-[#222] transition-colors"
                >
                    <LogOut size={18} /> Encerrar Sessão
                </button>

                <button
                    onClick={handleDeleteAccount}
                    className="w-full flex items-center gap-3 p-4 rounded-xl border border-red-900/20 text-red-500/70 hover:text-red-500 hover:bg-red-900/10 transition-colors text-sm"
                >
                    <Trash2 size={16} /> Deletar Credenciais
                </button>
            </div>

        </div>
    );
}
