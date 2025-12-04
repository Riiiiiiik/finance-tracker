'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, ArrowRight } from 'lucide-react';

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        current_method: '',
        financial_situation: '',
        join_reason: '',
        primary_goal: ''
    });
    const [selectedBanks, setSelectedBanks] = useState<string[]>([]);

    const POPULAR_BANKS = [
        { name: 'Nubank', color: '#820AD1' },
        { name: 'Inter', color: '#FF7A00' },
        { name: 'Itaú', color: '#EC7000' },
        { name: 'Bradesco', color: '#CC092F' },
        { name: 'Santander', color: '#EC0000' },
        { name: 'Caixa', color: '#005CA9' },
        { name: 'Banco do Brasil', color: '#0038A8' },
        { name: 'C6 Bank', color: '#242424' },
        { name: 'BTG Pactual', color: '#00294B' },
        { name: 'XP', color: '#000000' },
        { name: 'Carteira Física', color: '#10b981' }
    ];

    const totalSteps = 4;
    const progress = (step / totalSteps) * 100;

    const handleSelect = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleBank = (bankName: string) => {
        setSelectedBanks(prev =>
            prev.includes(bankName)
                ? prev.filter(b => b !== bankName)
                : [...prev, bankName]
        );
    };

    const handleNext = () => {
        if (step < totalSteps) {
            setStep(step + 1);
        } else {
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user');

            // 1. Salvar respostas
            const { error: responseError } = await supabase
                .from('onboarding_responses')
                .insert({
                    user_id: user.id,
                    ...formData
                });

            if (responseError) throw responseError;

            // 2. Criar contas selecionadas
            if (selectedBanks.length > 0) {
                const accountsToCreate = selectedBanks.map(bankName => {
                    const bankInfo = POPULAR_BANKS.find(b => b.name === bankName);
                    return {
                        user_id: user.id,
                        name: bankName,
                        type: 'checking',
                        balance: 0,
                        color: bankInfo?.color || '#6366f1',
                        is_default: false
                    };
                });

                const { error: accountsError } = await supabase
                    .from('accounts')
                    .insert(accountsToCreate);

                if (accountsError) throw accountsError;
            } else {
                // Se não selecionou nada, cria uma carteira padrão
                await supabase.from('accounts').insert({
                    user_id: user.id,
                    name: 'Carteira Principal',
                    type: 'checking',
                    balance: 0,
                    color: '#6366f1',
                    is_default: true
                });
            }

            // 3. Atualizar perfil
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ has_completed_onboarding: true })
                .eq('id', user.id);

            if (profileError) throw profileError;

            // 4. Redirecionar para o Dashboard
            router.push('/dashboard');
            router.refresh();

        } catch (error) {
            console.error('Erro ao salvar:', error);
            alert('Erro ao salvar suas respostas. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    // Validação para habilitar botão
    const isStepValid = () => {
        if (step === 1) return formData.current_method && formData.financial_situation;
        if (step === 2) return formData.join_reason;
        if (step === 3) return formData.primary_goal;
        if (step === 4) return selectedBanks.length > 0;
        return false;
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 max-w-lg mx-auto">

            {/* Barra de Progresso */}
            <div className="w-full h-2 bg-secondary rounded-full mb-8 overflow-hidden">
                <motion.div
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                />
            </div>

            <AnimatePresence mode="wait">

                {/* ETAPA 1 */}
                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="w-full space-y-6"
                    >
                        <div className="text-center mb-6">
                            <h1 className="text-2xl font-bold mb-2">Vamos conhecer você</h1>
                            <p className="text-muted-foreground">Para personalizar sua experiência, conte um pouco sobre suas finanças hoje.</p>
                        </div>

                        <div className="space-y-4">
                            <p className="font-medium">Como você controla suas finanças atualmente?</p>
                            <div className="grid gap-3">
                                {['Planilha (Excel/Sheets)', 'Caderninho / Agenda', 'De cabeça / Extrato do banco', 'Outro aplicativo', 'Não controlo nada'].map((opt) => (
                                    <button
                                        key={opt}
                                        onClick={() => handleSelect('current_method', opt)}
                                        className={`p-4 rounded-xl border text-left transition-all ${formData.current_method === opt
                                            ? 'border-primary bg-primary/10 ring-1 ring-primary'
                                            : 'border-border hover:border-primary/50'
                                            }`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <p className="font-medium">Como você descreveria sua situação atual?</p>
                            <div className="grid gap-3">
                                {[
                                    { label: '😅 Caótica', desc: 'Sem controle, muitas dívidas' },
                                    { label: '😐 Equilibrada', desc: 'Pago as contas, mas não sobra' },
                                    { label: '🙂 Confortável', desc: 'Sobra um pouco, começando a poupar' },
                                    { label: '🚀 Investidora', desc: 'Foco em multiplicar patrimônio' }
                                ].map((item) => (
                                    <button
                                        key={item.label}
                                        onClick={() => handleSelect('financial_situation', item.label)}
                                        className={`p-4 rounded-xl border text-left transition-all ${formData.financial_situation === item.label
                                            ? 'border-primary bg-primary/10 ring-1 ring-primary'
                                            : 'border-border hover:border-primary/50'
                                            }`}
                                    >
                                        <span className="font-bold block">{item.label}</span>
                                        <span className="text-sm text-muted-foreground">{item.desc}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ETAPA 2 */}
                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="w-full space-y-6"
                    >
                        <div className="text-center mb-6">
                            <h1 className="text-2xl font-bold mb-2">O que te trouxe aqui?</h1>
                            <p className="text-muted-foreground">Queremos focar no que é importante para você agora.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="grid gap-3">
                                {[
                                    'Levei um susto com a fatura do cartão',
                                    'Quero começar a juntar dinheiro para uma meta',
                                    'Indicação de amigo/influenciador',
                                    'Sinto que estou perdendo dinheiro com taxas',
                                    'Só curiosidade para testar a IA'
                                ].map((opt) => (
                                    <button
                                        key={opt}
                                        onClick={() => handleSelect('join_reason', opt)}
                                        className={`p-4 rounded-xl border text-left transition-all ${formData.join_reason === opt
                                            ? 'border-primary bg-primary/10 ring-1 ring-primary'
                                            : 'border-border hover:border-primary/50'
                                            }`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ETAPA 3 */}
                {step === 3 && (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="w-full space-y-6"
                    >
                        <div className="text-center mb-6">
                            <h1 className="text-2xl font-bold mb-2">Qual seu objetivo nº 1?</h1>
                            <p className="text-muted-foreground">Vamos te ajudar a chegar lá nos próximos 3 meses.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="grid gap-3">
                                {[
                                    'Sair do vermelho / Quitar dívidas',
                                    'Montar minha reserva de emergência',
                                    'Apenas ter clareza de para onde meu dinheiro vai',
                                    'Começar a investir',
                                    'Planejar uma grande compra'
                                ].map((opt) => (
                                    <button
                                        key={opt}
                                        onClick={() => handleSelect('primary_goal', opt)}
                                        className={`p-4 rounded-xl border text-left transition-all ${formData.primary_goal === opt
                                            ? 'border-primary bg-primary/10 ring-1 ring-primary'
                                            : 'border-border hover:border-primary/50'
                                            }`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ETAPA 4 - Seleção de Bancos */}
                {step === 4 && (
                    <motion.div
                        key="step4"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="w-full space-y-6"
                    >
                        <div className="text-center mb-6">
                            <h1 className="text-2xl font-bold mb-2">Onde está seu dinheiro?</h1>
                            <p className="text-muted-foreground">Selecione os bancos que você usa. Vamos criar suas contas automaticamente.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {POPULAR_BANKS.map((bank) => (
                                <button
                                    key={bank.name}
                                    onClick={() => toggleBank(bank.name)}
                                    className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden group ${selectedBanks.includes(bank.name)
                                        ? 'border-primary ring-1 ring-primary'
                                        : 'border-border hover:border-primary/50'
                                        }`}
                                >
                                    <div
                                        className={`absolute inset-0 opacity-10 transition-colors ${selectedBanks.includes(bank.name) ? 'bg-primary' : 'group-hover:bg-secondary'}`}
                                        style={{ backgroundColor: selectedBanks.includes(bank.name) ? bank.color : undefined }}
                                    />
                                    <div className="relative z-10 flex items-center justify-between">
                                        <span className="font-bold">{bank.name}</span>
                                        {selectedBanks.includes(bank.name) && (
                                            <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                                                <Check className="w-3 h-3" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="relative z-10 mt-2 w-8 h-1 rounded-full" style={{ backgroundColor: bank.color }} />
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

            </AnimatePresence>

            {/* Botão de Navegação */}
            <div className="w-full mt-8">
                <button
                    onClick={handleNext}
                    disabled={!isStepValid() || loading}
                    className="w-full bg-primary text-primary-foreground p-4 rounded-xl font-bold hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                    {loading ? 'Finalizando...' : step === totalSteps ? 'Começar Jornada' : 'Continuar'}
                    {!loading && (step === totalSteps ? <Check className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />)}
                </button>
            </div>

        </div>
    );
}
