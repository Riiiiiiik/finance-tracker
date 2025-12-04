'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { User, LogOut, Moon, Sun, Trash2, Save, Target, Wallet, Edit2, X, Check } from 'lucide-react';
import { useTheme } from 'next-themes';

const AVATARS = [
    'https://api.dicebear.com/9.x/avataaars/svg?seed=Felix&backgroundColor=ffdfbf',
    'https://api.dicebear.com/9.x/avataaars/svg?seed=Aneka&backgroundColor=b6e3f4',
    'https://api.dicebear.com/9.x/avataaars/svg?seed=Zoe&backgroundColor=c0aede',
    'https://api.dicebear.com/9.x/avataaars/svg?seed=Jack&backgroundColor=ffd5dc',
    'https://api.dicebear.com/9.x/avataaars/svg?seed=Bubba&backgroundColor=d1f4dd',
    'https://api.dicebear.com/9.x/avataaars/svg?seed=Baby&backgroundColor=ffeaa7',
];

export default function ProfilePage() {
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Dados do Usuário
    const [profile, setProfile] = useState<any>(null);
    const [onboarding, setOnboarding] = useState<any>(null);

    // Edição de Perfil
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [newName, setNewName] = useState('');
    const [newAvatar, setNewAvatar] = useState('');

    // Formulário Financeiro
    const [income, setIncome] = useState('');
    const [payday, setPayday] = useState('');
    const [currency, setCurrency] = useState('BRL');

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
                return;
            }

            // 1. Carregar Perfil
            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (profileData) {
                setProfile(profileData);
                setNewName(profileData.full_name || '');
                setNewAvatar(profileData.avatar_url || '');

                // Formatar renda inicial
                if (profileData.monthly_income) {
                    const formatted = new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                    }).format(profileData.monthly_income);
                    setIncome(formatted);
                }

                setPayday(profileData.payday?.toString() || '');
            }

            // 2. Carregar Onboarding
            const { data: onboardingData } = await supabase
                .from('onboarding_responses')
                .select('*')
                .eq('user_id', session.user.id)
                .single();

            if (onboardingData) {
                setOnboarding(onboardingData);
            }

        } catch (error) {
            console.error('Erro ao carregar perfil:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '');
        const numberValue = Number(value) / 100;
        const formatted = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: currency,
        }).format(numberValue);
        setIncome(formatted);
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: newName,
                    avatar_url: newAvatar
                })
                .eq('id', profile.id);

            if (error) throw error;

            setProfile({ ...profile, full_name: newName, avatar_url: newAvatar });
            setIsEditingProfile(false);
            alert('Perfil atualizado!');
        } catch (error) {
            console.error('Erro ao salvar perfil:', error);
            alert('Erro ao salvar perfil.');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveFinancial = async () => {
        setSaving(true);
        try {
            // Converter string formatada (R$ 1.000,00) para número (1000.00)
            const numericIncome = parseFloat(income.replace(/[^\d,]/g, '').replace(',', '.'));

            const { error } = await supabase
                .from('profiles')
                .update({
                    monthly_income: numericIncome,
                    payday: parseInt(payday)
                })
                .eq('id', profile.id);

            if (error) throw error;
            alert('Dados financeiros atualizados!');
        } catch (error) {
            console.error('Erro ao salvar:', error);
            alert('Erro ao salvar dados.');
        } finally {
            setSaving(false);
        }
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    const handleDeleteAccount = async () => {
        const confirm = window.confirm('TEM CERTEZA? Isso apagará TODOS os seus dados permanentemente. Essa ação não pode ser desfeita.');
        if (!confirm) return;

        try {
            await supabase.from('transactions').delete().eq('user_id', profile.id);
            await supabase.from('categories').delete().eq('user_id', profile.id);
            await supabase.from('onboarding_responses').delete().eq('user_id', profile.id);
            await supabase.from('profiles').delete().eq('id', profile.id);

            await supabase.auth.signOut();
            router.push('/login');
        } catch (error) {
            console.error('Erro ao deletar conta:', error);
            alert('Erro ao deletar dados. Entre em contato com o suporte.');
        }
    };

    if (loading) return <div className="p-8 text-center">Carregando perfil...</div>;

    return (
        <div className="min-h-screen p-4 pb-24 max-w-md mx-auto space-y-6">
            <h1 className="text-2xl font-bold mb-6">Meu Perfil</h1>

            {/* A. Cabeçalho / Edição */}
            <div className="bg-card border p-4 rounded-xl relative">
                {!isEditingProfile ? (
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-secondary flex items-center justify-center border-2 border-primary">
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-8 h-8 text-muted-foreground" />
                            )}
                        </div>
                        <div>
                            <h2 className="font-bold text-lg">{profile?.full_name || 'Usuário'}</h2>
                            <p className="text-sm text-muted-foreground">Membro desde {new Date(profile?.created_at || Date.now()).getFullYear()}</p>
                        </div>
                        <button
                            onClick={() => setIsEditingProfile(true)}
                            className="absolute top-4 right-4 p-2 hover:bg-secondary rounded-full text-muted-foreground"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-bold">Editar Perfil</h3>
                            <button onClick={() => setIsEditingProfile(false)} className="p-1 hover:bg-secondary rounded">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Seleção de Avatar */}
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {AVATARS.map((url, index) => (
                                <button
                                    key={index}
                                    onClick={() => setNewAvatar(url)}
                                    className={`relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 transition-all ${newAvatar === url ? 'border-primary ring-2 ring-primary ring-offset-2' : 'border-transparent opacity-70 hover:opacity-100'
                                        }`}
                                >
                                    <img src={url} alt={`Monkey ${index + 1}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>

                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Seu Nome"
                            className="w-full p-2 rounded-md bg-secondary border border-input"
                        />

                        <button
                            onClick={handleSaveProfile}
                            disabled={saving}
                            className="w-full bg-primary text-primary-foreground p-2 rounded-md font-medium text-sm flex items-center justify-center gap-2"
                        >
                            <Check className="w-4 h-4" />
                            Salvar Alterações
                        </button>
                    </div>
                )}
            </div>

            {/* B. Motor Financeiro */}
            <div className="bg-card border p-4 rounded-xl space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <Wallet className="w-5 h-5 text-primary" />
                    <h3 className="font-bold">Motor Financeiro</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">Renda Mensal</label>
                        <input
                            type="text"
                            value={income}
                            onChange={handleIncomeChange}
                            className="w-full p-2 rounded-md bg-secondary border border-input"
                            placeholder="R$ 0,00"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">Dia do Pagamento</label>
                        <input
                            type="number"
                            value={payday}
                            onChange={(e) => setPayday(e.target.value)}
                            min="1"
                            max="31"
                            className="w-full p-2 rounded-md bg-secondary border border-input [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                    </div>
                </div>

                <button
                    onClick={handleSaveFinancial}
                    disabled={saving}
                    className="w-full bg-primary text-primary-foreground p-2 rounded-md font-medium text-sm flex items-center justify-center gap-2"
                >
                    <Save className="w-4 h-4" />
                    {saving ? 'Salvando...' : 'Atualizar Premissas'}
                </button>
            </div>

            {/* C. Espelho do Onboarding */}
            {onboarding && (
                <div className="bg-card border p-4 rounded-xl space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                        <Target className="w-5 h-5 text-blue-500" />
                        <h3 className="font-bold">Seu Foco</h3>
                    </div>

                    <div className="bg-secondary/50 p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Objetivo Principal</p>
                        <p className="font-medium text-sm">{onboarding.primary_goal}</p>
                    </div>

                    <div className="bg-secondary/50 p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Situação Atual</p>
                        <p className="font-medium text-sm">{onboarding.financial_situation}</p>
                    </div>
                </div>
            )}

            {/* D. Preferências */}
            <div className="bg-card border p-4 rounded-xl space-y-4">
                <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Preferências</h3>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                        <span className="text-sm">Tema do App</span>
                    </div>
                    <div className="flex bg-secondary rounded-lg p-1">
                        <button
                            onClick={() => setTheme('light')}
                            className={`p-1.5 rounded-md transition-all ${theme === 'light' ? 'bg-background shadow' : 'text-muted-foreground'}`}
                        >
                            <Sun className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setTheme('dark')}
                            className={`p-1.5 rounded-md transition-all ${theme === 'dark' ? 'bg-background shadow' : 'text-muted-foreground'}`}
                        >
                            <Moon className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-sm">Moeda Principal</span>
                    <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="text-sm font-bold bg-secondary px-2 py-1 rounded border-none focus:ring-1 focus:ring-primary outline-none cursor-pointer"
                    >
                        <option value="BRL">BRL (R$)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                    </select>
                </div>
            </div>

            {/* E. Zona de Perigo */}
            <div className="space-y-3 pt-4">
                <button
                    onClick={handleSignOut}
                    className="w-full p-3 rounded-xl border border-border hover:bg-secondary flex items-center justify-center gap-2 text-muted-foreground transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    Sair da Conta
                </button>

                <button
                    onClick={handleDeleteAccount}
                    className="w-full p-3 rounded-xl border border-red-500/20 hover:bg-red-500/10 flex items-center justify-center gap-2 text-red-500 transition-colors"
                >
                    <Trash2 className="w-4 h-4" />
                    Excluir Conta e Dados
                </button>
                <p className="text-[10px] text-center text-muted-foreground">
                    Versão 1.0.0 • Build 2024
                </p>
            </div>
        </div>
    );
}
