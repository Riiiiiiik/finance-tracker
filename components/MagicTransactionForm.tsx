'use client';

import { useState, useEffect } from 'react';
import { Wand2, Sparkles, Check, AlertCircle, Loader2 } from 'lucide-react';
import { parseSmartInput } from '@/lib/smartParser';
import { motion, AnimatePresence } from 'framer-motion';
import TransactionPreviewCard from './TransactionPreviewCard';
import { supabase, Account } from '@/lib/supabase';

interface MagicTransactionFormProps {
    userId: string;
    selectedAccountId: string | null;
    accounts: Account[];
    onTransactionAdded: () => void;
}

interface ParsedData {
    amount: string;
    description: string;
    type: 'income' | 'expense';
    category: string;
    tags: string[];
    date?: string;
}

export default function MagicTransactionForm({
    userId,
    selectedAccountId,
    accounts,
    onTransactionAdded
}: MagicTransactionFormProps) {
    const [smartInput, setSmartInput] = useState('');
    const [parsedData, setParsedData] = useState<ParsedData | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [isFocused, setIsFocused] = useState(false);

    // Parse input em tempo real
    useEffect(() => {
        if (smartInput.trim()) {
            setIsProcessing(true);
            const timer = setTimeout(() => {
                const parsed = parseSmartInput(smartInput);
                setParsedData({
                    amount: parsed.amount || '',
                    description: parsed.description || smartInput,
                    type: parsed.type || 'expense',
                    category: parsed.category || '',
                    tags: parsed.tags || [],
                    date: new Date().toISOString().split('T')[0]
                });
                setIsProcessing(false);
            }, 300); // Debounce de 300ms

            return () => clearTimeout(timer);
        } else {
            setParsedData(null);
            setIsProcessing(false);
        }
    }, [smartInput]);



    const handleConfirm = async () => {
        if (!parsedData || !parsedData.amount || !userId) return;

        // Lógica de seleção de conta
        let targetAccountId = selectedAccountId;

        // Se estiver em 'all' ou null, tenta encontrar uma conta padrão válida
        if (!targetAccountId || targetAccountId === 'all') {
            // Filtra contas reais (excluindo a 'all' se ela vier na lista, embora geralmente não venha do DB)
            const realAccounts = accounts.filter(a => a.id !== 'all');

            if (realAccounts.length === 1) {
                // Se só tem uma conta, usa ela
                targetAccountId = realAccounts[0].id;
            } else if (realAccounts.length > 0) {
                // Se tem várias, pega a primeira (ou poderia pedir para selecionar)
                // Por enquanto, vamos pegar a primeira para não bloquear o fluxo, 
                // mas o ideal seria um seletor no card.
                targetAccountId = realAccounts[0].id;

                // Opcional: Avisar o usuário que foi para a conta X
                // setFeedback({ type: 'success', message: `Adicionado em ${realAccounts[0].name}` });
            } else {
                setFeedback({ type: 'error', message: 'Crie uma conta antes de adicionar transações!' });
                return;
            }
        }

        setIsSubmitting(true);
        setFeedback(null);

        try {
            const amount = parseFloat(parsedData.amount);

            // 1. Inserir Transação
            const { error: transactionError } = await supabase
                .from('transactions')
                .insert([{
                    user_id: userId,
                    account_id: targetAccountId,
                    amount: amount,
                    description: parsedData.description,
                    type: parsedData.type,
                    category: parsedData.category,
                    date: parsedData.date || new Date().toISOString().split('T')[0],
                    tags: parsedData.tags
                }]);

            if (transactionError) throw transactionError;

            // 2. Atualizar Saldo da Conta
            const balanceChange = parsedData.type === 'income' ? amount : -amount;

            const { data: accountData, error: fetchError } = await supabase
                .from('accounts')
                .select('balance')
                .eq('id', targetAccountId)
                .single();

            if (fetchError) throw fetchError;

            if (accountData) {
                const { error: updateError } = await supabase
                    .from('accounts')
                    .update({ balance: accountData.balance + balanceChange })
                    .eq('id', targetAccountId)
            }

            // Sucesso!
            // triggerConfetti(); // Removed as per user request
            setFeedback({ type: 'success', message: 'Transação adicionada com sucesso!' });
            setSmartInput('');
            setParsedData(null);
            setIsFocused(false);
            onTransactionAdded();

            setTimeout(() => setFeedback(null), 3000);

        } catch (error) {
            console.error('Erro ao salvar:', error);
            setFeedback({ type: 'error', message: 'Erro ao salvar transação. Tente novamente.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const hasData = parsedData && parsedData.amount;
    const showOverlay = isFocused || smartInput.length > 0;

    return (
        <>
            {/* Focus Overlay */}
            <AnimatePresence>
                {showOverlay && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-background/80 backdrop-blur-md z-40 transition-all duration-500"
                        onClick={() => setIsFocused(false)}
                    />
                )}
            </AnimatePresence>

            <div className={`relative transition-all duration-500 ${showOverlay ? 'z-50 scale-105' : 'z-0'}`}>
                {/* Hero Input Block */}
                <div className="mb-6">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative"
                    >
                        {/* Label */}
                        <label className="flex items-center gap-2 mb-3 text-sm font-bold text-primary tracking-wide">
                            <Sparkles className="w-4 h-4 animate-pulse" />
                            <span>MONK.AI</span>
                        </label>

                        {/* Hero Input */}
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                                <Wand2 className={`h-5 w-5 transition-colors ${smartInput ? 'text-primary' : 'text-muted-foreground'
                                    }`} />
                            </div>

                            <input
                                type="text"
                                value={smartInput}
                                onChange={(e) => setSmartInput(e.target.value)}
                                onFocus={() => setIsFocused(true)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && hasData && !isSubmitting) {
                                        handleConfirm();
                                    }
                                }}
                                placeholder="✨ Peça ao Monk.AI: 'Uber 25 transporte'..."
                                className={`
                                    w-full pl-12 pr-4 py-4 text-lg font-medium rounded-2xl 
                                    bg-card border-2 outline-none transition-all duration-300 
                                    placeholder:text-muted-foreground/70 shadow-lg 
                                    ${showOverlay
                                        ? 'border-primary shadow-primary/20 shadow-2xl scale-[1.02]'
                                        : 'border-border hover:shadow-xl focus:border-primary'
                                    }
                                `}
                                disabled={isSubmitting}
                            />

                            {/* Processing Indicator */}
                            <AnimatePresence>
                                {isProcessing && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center gap-2"
                                    >
                                        <span className="text-xs text-primary font-medium">Monk pensando...</span>
                                        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Hint Text */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: smartInput ? 0 : 1 }}
                            className="mt-2 text-xs text-muted-foreground text-center"
                        >
                            Eu organizo tudo para você. Apenas digite. 🐵
                        </motion.p>
                    </motion.div>
                </div>

                {/* Feedback Message */}
                <AnimatePresence>
                    {feedback && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className={`mb-4 p-3 rounded-xl flex items-center gap-2 text-sm font-medium ${feedback.type === 'success'
                                ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                                : 'bg-red-500/10 text-red-500 border border-red-500/20'
                                }`}
                        >
                            {feedback.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                            {feedback.message}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Preview Card */}
                <AnimatePresence>
                    {hasData && (
                        <div className="mb-6">
                            <TransactionPreviewCard
                                amount={parsedData.amount}
                                description={parsedData.description}
                                type={parsedData.type}
                                category={parsedData.category}
                                date={parsedData.date || new Date().toISOString().split('T')[0]}
                                onUpdate={(updates) => {
                                    setParsedData(prev => prev ? { ...prev, ...updates } : null);
                                }}
                            />

                            {/* Confirm Button */}
                            <motion.button
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleConfirm}
                                disabled={isSubmitting}
                                className={`
                                    w-full mt-4 py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all
                                    ${parsedData.type === 'income'
                                        ? 'bg-green-500 hover:bg-green-600 text-white shadow-green-500/20'
                                        : 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20'
                                    }
                                    ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}
                                `}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Salvando...
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-5 h-5" />
                                        Confirmar Transação
                                        <span className="ml-2 text-xs font-normal opacity-80 bg-black/20 px-2 py-0.5 rounded">
                                            Enter
                                        </span>
                                    </>
                                )}
                            </motion.button>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
}
