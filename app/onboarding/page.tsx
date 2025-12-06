'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, ArrowRight, Fingerprint, ScanEye, BrainCircuit, Link, ShieldAlert, Cpu } from 'lucide-react';

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
        if (step === 1) return formData.current_method;
        if (step === 2) return formData.primary_goal;
        if (step === 3) return formData.join_reason;
        if (step === 4) return selectedBanks.length > 0;
        return false;
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 max-w-md mx-auto">

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

                {/* ETAPA 1 - AUDITOR */}
                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="w-full space-y-6"
                    >
                        <div className="text-center mb-6">
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3F68FF]/10 text-[#3F68FF] text-xs font-bold uppercase tracking-wider mb-3">
                                <ScanEye size={14} />
                                Monk.Auditor
                            </span>
                            <h1 className="text-2xl font-bold mb-2 text-[#3F68FF]">Análise de Precedentes</h1>
                            <p className="text-muted-foreground text-sm">Sou o Monk.Auditor. Para rastrear a verdade, preciso saber como você documentava sua história até hoje.</p>
                        </div>

                        <div className="space-y-4">
                            <p className="font-medium flex items-center gap-2 text-sm text-gray-400">
                                <Fingerprint size={16} className="text-[#3F68FF]" />
                                Qual a integridade dos seus registros atuais?
                            </p>
                            <div className="grid gap-3">
                                {[
                                    { label: 'Planilhas Manuais', desc: 'Dados estruturados, mas estáticos.', value: 'Planilhas (Excel/Sheets)' },
                                    { label: 'Registros Analógicos', desc: 'Risco de perda física e erro humano.', value: 'Caderninho' },
                                    { label: 'Memória (Não Confiável)', desc: 'Alta volatilidade. Sem rastro auditável.', value: 'De cabeça' },
                                    { label: 'Caos Não-Documentado', desc: 'Nenhum histórico. Começaremos do zero.', value: 'Não controlo nada' }
                                ].map((item) => (
                                    <button
                                        key={item.label}
                                        onClick={() => handleSelect('current_method', item.value)}
                                        className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden group ${formData.current_method === item.value
                                            ? 'border-[#3F68FF] bg-[#3F68FF]/10 ring-1 ring-[#3F68FF]'
                                            : 'border-white/10 hover:border-[#3F68FF]/50 hover:bg-[#3F68FF]/5'
                                            }`}
                                    >
                                        <div className="relative z-10">
                                            <span className="font-bold block text-white">{item.label}</span>
                                            <span className="text-xs text-gray-400">{item.desc}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ETAPA 2 - MONK.AI */}
                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="w-full space-y-6"
                    >
                        <div className="text-center mb-6">
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-[#10B981]/20 to-[#8b5cf6]/20 border border-[#10B981]/30 text-[#10B981] text-xs font-bold uppercase tracking-wider mb-3">
                                <Cpu size={14} className="text-[#10B981]" />
                                Monk.AI
                            </span>
                            <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-[#10B981] to-[#8b5cf6] bg-clip-text text-transparent">Sincronização Neural</h1>
                            <p className="text-muted-foreground text-sm">Aqui é a Monk.AI. Estou configurando seus algoritmos. Qual é a missão principal deste ciclo?</p>
                        </div>

                        <div className="space-y-4">
                            <p className="font-medium flex items-center gap-2 text-sm text-gray-400">
                                <BrainCircuit size={16} className="text-[#8b5cf6]" />
                                Qual vetor estratégico devo priorizar?
                            </p>
                            <div className="grid gap-3">
                                {[
                                    { label: 'Neutralizar Dívidas', desc: 'Foco: Estancar sangramentos críticos.', value: 'Sair do vermelho / Quitar dívidas' },
                                    { label: 'Construir Escudo', desc: 'Foco: Segurança e Liquidez.', value: 'Montar minha reserva de emergência' },
                                    { label: 'Expansão de Patrimônio', desc: 'Foco: Multiplicação de ativos (Vault).', value: 'Começar a investir' },
                                    { label: 'Materialização de Visão', desc: 'Foco: Acelerar conquistas do Monk.Wish.', value: 'Planejar uma grande compra' }
                                ].map((item) => (
                                    <button
                                        key={item.label}
                                        onClick={() => handleSelect('primary_goal', item.value)}
                                        className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden group ${formData.primary_goal === item.value
                                            ? 'border-[#10B981] bg-[#10B981]/10 ring-1 ring-[#10B981]'
                                            : 'border-white/10 hover:border-[#10B981]/50 hover:bg-[#10B981]/5'
                                            }`}
                                    >
                                        <div className="relative z-10">
                                            <span className="font-bold block text-white">{item.label}</span>
                                            <span className="text-xs text-gray-400">{item.desc}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ETAPA 3 - MONK.SENTRY */}
                {step === 3 && (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="w-full space-y-6"
                    >
                        <div className="text-center mb-6">
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF4B4B]/10 text-[#FF4B4B] text-xs font-bold uppercase tracking-wider mb-3">
                                <ShieldAlert size={14} />
                                Monk.Sentry
                            </span>
                            <h1 className="text-2xl font-bold mb-2 text-[#FF4B4B]">Escaneamento de Ameaças</h1>
                            <p className="text-muted-foreground text-sm">Monk.Sentry na escuta. Detectei sua chegada. Qual foi o evento gerador da busca por proteção?</p>
                        </div>

                        <div className="space-y-4">
                            <p className="font-medium flex items-center gap-2 text-sm text-gray-400">
                                <ScanEye size={16} className="text-[#FF4B4B]" />
                                Que tipo de alerta foi disparado?
                            </p>
                            <div className="grid gap-3">
                                {[
                                    { label: 'Choque de Liquidez', desc: 'Gastos excederam a capacidade de defesa.', value: 'Levei um susto com a fatura do cartão' },
                                    { label: 'Drenagem Invisível', desc: 'Recursos vazando sem identificação.', value: 'Sinto que estou perdendo dinheiro com taxas' },
                                    { label: 'Maturação de Meta', desc: 'Necessidade de disciplina tática.', value: 'Quero começar a juntar dinheiro para uma meta' },
                                    { label: 'Recrutamento Externo', desc: 'Convocado por outro membro da Ordem.', value: 'Indicação de amigo/influenciador' },
                                    { label: 'Curiosidade Tática', desc: 'Exploração de novos sistemas.', value: 'Só curiosidade para testar a IA' }
                                ].map((item) => (
                                    <button
                                        key={item.label}
                                        onClick={() => handleSelect('join_reason', item.value)}
                                        className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden group ${formData.join_reason === item.value
                                            ? 'border-[#FF4B4B] bg-[#FF4B4B]/10 ring-1 ring-[#FF4B4B]'
                                            : 'border-white/10 hover:border-[#FF4B4B]/50 hover:bg-[#FF4B4B]/5'
                                            }`}
                                    >
                                        <div className="relative z-10">
                                            <span className="font-bold block text-white">{item.label}</span>
                                            <span className="text-xs text-gray-400">{item.desc}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ETAPA 4 - CONEXÃO AO THE ORDER */}
                {step === 4 && (
                    <motion.div
                        key="step4"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="w-full space-y-6"
                    >
                        <div className="text-center mb-6">
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFD659]/10 text-[#FFD659] text-xs font-bold uppercase tracking-wider mb-3">
                                <Link size={14} />
                                Conexão Externa
                            </span>
                            <h1 className="text-2xl font-bold mb-2 text-white">Conexão ao The Order</h1>
                            <p className="text-muted-foreground text-sm">Centralizando o Monk.Vault. Selecione quais terminais bancários serão conectados à rede.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {POPULAR_BANKS.map((bank) => (
                                <button
                                    key={bank.name}
                                    onClick={() => toggleBank(bank.name)}
                                    className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden group ${selectedBanks.includes(bank.name)
                                        ? 'border-[#FFD659] ring-1 ring-[#FFD659]'
                                        : 'border-white/10 hover:border-[#FFD659]/50'
                                        }`}
                                >
                                    <div
                                        className={`absolute inset-0 opacity-10 transition-colors ${selectedBanks.includes(bank.name) ? 'bg-[#FFD659]' : 'group-hover:bg-[#FFD659]/5'}`}
                                    />
                                    <div className="relative z-10 flex items-center justify-between">
                                        <span className="font-bold text-sm text-white">{bank.name}</span>
                                        {selectedBanks.includes(bank.name) && (
                                            <div className="flex items-center gap-1 text-[10px] text-[#FFD659] font-bold uppercase tracking-wide bg-[#FFD659]/10 px-2 py-0.5 rounded-full border border-[#FFD659]/20">
                                                Link Ativo <Link size={10} />
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
