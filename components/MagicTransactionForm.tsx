'use client';

import { useState, useEffect } from 'react';
import { Wand2, Sparkles, Check, AlertCircle, Loader2 } from 'lucide-react';
import { parseSmartInput } from '@/lib/smartParser';
import { motion, AnimatePresence } from 'framer-motion';
import TransactionPreviewCard from './TransactionPreviewCard';
import { supabase, Account } from '@/lib/supabase';
import MonkIcon, { monkColors } from './MonkIcon';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

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
    installments?: number;
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

    const searchParams = useSearchParams();

    // Parse input MANUALMENTE ao pressionar Enter ou botão
    const handleParse = () => {
        if (!smartInput.trim()) return;

        setIsProcessing(true);
        // Simular um leve delay para sensação de processamento
        setTimeout(() => {
            const parsed = parseSmartInput(smartInput);
            setParsedData({
                amount: parsed.amount || '',
                description: parsed.description || smartInput,
                type: parsed.type || 'expense',
                category: parsed.category || '',
                tags: parsed.tags || [],
                date: new Date().toISOString().split('T')[0],
                installments: parsed.installments || 1
            });
            setIsProcessing(false);
            // Remover foco do teclado em mobile
            if (window.innerWidth < 768) {
                (document.activeElement as HTMLElement)?.blur();
            }
        }, 100);
    };

    // Inicializar via URL Params (OCR)
    useEffect(() => {
        if (searchParams && searchParams.get('action') === 'scan') {
            const amt = searchParams.get('amount') || '';
            const desc = searchParams.get('desc') || '';
            const date = searchParams.get('date') || '';
            const category = searchParams.get('category') || '';

            if (amt) {
                setSmartInput(`${desc} ${amt}`); // Preenche visualmente
                setParsedData({
                    amount: amt,
                    description: desc,
                    type: 'expense', // Default to expense for OCR
                    category: category,
                    tags: ['OCR'],
                    date: date || new Date().toISOString().split('T')[0],
                    installments: 1
                });
                // Limpar URL para não reprocessar no refresh
                window.history.replaceState({}, '', '/dashboard');
            } else {
                // Scan successful but no amount found
                setFeedback({ type: 'error', message: 'Não identificamos o valor na nota. Insira manualmente.' });
                if (desc) setSmartInput(desc);
                window.history.replaceState({}, '', '/dashboard');
            }
        }
    }, [searchParams]);

    // Efeito para limpar dados se o input for apagado totalmente
    useEffect(() => {
        if (smartInput.trim()) {
            // Keep data if manual input exists, do nothing
        } else {
            setParsedData(null);
        }
    }, [smartInput]);

    const [showMethodSelector, setShowMethodSelector] = useState(false);
    const [pendingAccount, setPendingAccount] = useState<any>(null);

    const handleConfirm = async () => {
        if (!parsedData || !parsedData.amount || !userId) return;

        // Lógica de seleção de conta
        let targetAccountId = selectedAccountId;

        // Se estiver em 'all' ou null, tenta encontrar uma conta padrão válida
        if (!targetAccountId || targetAccountId === 'all') {
            const realAccounts = accounts.filter(a => a.id !== 'all');
            if (realAccounts.length === 1) {
                targetAccountId = realAccounts[0].id;
            } else if (realAccounts.length > 0) {
                targetAccountId = realAccounts[0].id;
            } else {
                setFeedback({ type: 'error', message: 'Crie uma conta antes de adicionar transações!' });
                return;
            }
        }

        setIsSubmitting(true);
        setFeedback(null);

        try {
            // 1. Buscar detalhes da conta
            const { data: accountData, error: fetchError } = await supabase
                .from('accounts')
                .select('*')
                .eq('id', targetAccountId)
                .single();

            if (fetchError) throw fetchError;

            // VERIFICAÇÃO DE CARTÃO HÍBRIDO
            // Se for conta corrente (checking) E tiver limite definido E for despesa
            if (accountData.type === 'checking' && accountData.limit !== null && parsedData.type === 'expense') {
                setPendingAccount(accountData);
                setShowMethodSelector(true);
                setIsSubmitting(false); // Pausa o submit
                return; // Aguarda escolha do usuário
            }

            // Se não for híbrido, segue fluxo normal (assume débito para checking, crédito para credit)
            await finalizeTransaction(accountData, null);

        } catch (error) {
            console.error('Erro ao preparar transação:', error);
            setFeedback({ type: 'error', message: 'Erro ao processar. Tente novamente.' });
            setIsSubmitting(false);
        }
    };

    const finalizeTransaction = async (accountData: any, method: 'debit' | 'credit' | null) => {
        if (!parsedData || !userId) return;
        setIsSubmitting(true);
        setShowMethodSelector(false);

        try {
            const amount = parseFloat(parsedData.amount);
            const installments = parsedData.installments || 1;
            const isInstallment = installments > 1;

            // Gerar Group ID se for parcelado
            const groupId = isInstallment ? crypto.randomUUID() : null;

            let status = 'posted';
            let isCreditPurchase = false;

            // Determinar se é compra no crédito
            if (accountData.type === 'credit') {
                isCreditPurchase = true;
            } else if (accountData.type === 'checking' && method === 'credit') {
                isCreditPurchase = true;
            }

            // Loop para criar transações (1 ou N)
            const transactionsToInsert = [];
            const baseDate = new Date(parsedData.date || new Date());

            for (let i = 0; i < installments; i++) {
                let currentStatus = status;
                let currentInvoiceMonth = null;

                // Calcular data da parcela
                const transactionDate = new Date(baseDate);
                transactionDate.setMonth(baseDate.getMonth() + i);

                // Lógica de Crédito (Fatura)
                if (isCreditPurchase && parsedData.type === 'expense') {
                    currentStatus = 'pending';

                    // Calcular Mês da Fatura para ESTA parcela
                    const closingDay = accountData.closing_day || 1;
                    const invoiceDate = new Date(transactionDate);

                    if (invoiceDate.getDate() >= closingDay) {
                        invoiceDate.setMonth(invoiceDate.getMonth() + 1);
                    }

                    invoiceDate.setDate(1);
                    currentInvoiceMonth = invoiceDate.toISOString().split('T')[0];
                }

                // Descrição da parcela (ex: "TV 1/10")
                let description = parsedData.description;
                if (isInstallment) {
                    description = `${description} (${i + 1}/${installments})`;
                }

                // Valor da parcela
                // Assumindo que o valor digitado é o TOTAL da compra se tiver parcelas
                const installmentAmount = isInstallment ? (amount / installments) : amount;

                transactionsToInsert.push({
                    user_id: userId,
                    account_id: accountData.id,
                    amount: installmentAmount,
                    description: description,
                    type: parsedData.type,
                    category: parsedData.category,
                    date: transactionDate.toISOString().split('T')[0],
                    tags: parsedData.tags,
                    status: currentStatus,
                    invoice_month: currentInvoiceMonth,
                    installments_count: installments,
                    installment_number: i + 1,
                    group_id: groupId
                });
            }

            // 2. Inserir Transações
            const { error: transactionError } = await supabase
                .from('transactions')
                .insert(transactionsToInsert);

            if (transactionError) throw transactionError;

            // 3. Atualizar Saldo da Conta
            let shouldUpdateBalance = true;
            if (accountData.type === 'checking' && isCreditPurchase) {
                shouldUpdateBalance = false; // Não mexe no saldo da conta corrente
            }

            if (shouldUpdateBalance) {
                const totalAmount = amount; // Valor total da compra
                const balanceChange = parsedData.type === 'income' ? totalAmount : -totalAmount;

                const { error: updateError } = await supabase
                    .from('accounts')
                    .update({ balance: accountData.balance + balanceChange })
                    .eq('id', accountData.id);

                if (updateError) throw updateError;
            } else if (accountData.type === 'credit') {
                const totalAmount = amount;
                const balanceChange = -totalAmount;
                await supabase.from('accounts').update({ balance: accountData.balance + balanceChange }).eq('id', accountData.id);
            }

            // Sucesso!
            setFeedback({ type: 'success', message: isInstallment ? `Compra parcelada em ${installments}x criada!` : 'Transação adicionada com sucesso!' });
            setSmartInput('');
            setParsedData(null);
            setIsFocused(false);
            onTransactionAdded();
            setTimeout(() => setFeedback(null), 3000);

        } catch (error) {
            console.error('Erro ao salvar:', error);
            setFeedback({ type: 'error', message: 'Erro ao salvar transação.' });
        } finally {
            setIsSubmitting(false);
            setPendingAccount(null);
        }
    };

    const hasData = parsedData && parsedData.amount;
    const showOverlay = isFocused || smartInput.length > 0 || showMethodSelector;

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
                        onClick={() => {
                            if (!showMethodSelector) setIsFocused(false);
                        }}
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
                        <label className={`flex items-center gap-2 mb-3 text-sm font-bold tracking-wide ${monkColors.ai}`}>
                            <MonkIcon type="ai" className="w-5 h-5 animate-pulse" />
                            <span>MONK.AI</span>
                        </label>

                        {/* Hero Input */}
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                                <MonkIcon type="ai" className={`h-5 w-5 transition-colors ${smartInput ? 'opacity-100' : 'opacity-70'}`} />
                            </div>

                            <input
                                type="text"
                                value={smartInput}
                                onChange={(e) => setSmartInput(e.target.value)}
                                onFocus={() => setIsFocused(true)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !isSubmitting) {
                                        if (hasData) {
                                            handleConfirm();
                                        } else {
                                            handleParse();
                                        }
                                    }
                                }}
                                placeholder="✨ Monk.AI: 'Uber 25 transporte'..."
                                className={`
                                    w-full pl-12 pr-4 py-3 md:py-4 text-lg font-medium rounded-2xl 
                                    bg-card border-2 outline-none transition-all duration-300 
                                    placeholder:text-muted-foreground/70 shadow-lg 
                                    ${showOverlay
                                        ? 'border-purple-500 shadow-purple-500/20 shadow-2xl scale-[1.02]'
                                        : 'border-border hover:shadow-xl focus:border-purple-500/50'
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
                                        <span className="text-xs text-purple-400 font-medium">Processando...</span>
                                        <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
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
                            Eu organizo tudo para você. Apenas digite. 🧠
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
                                installments={parsedData.installments}
                                onUpdate={(updates) => {
                                    setParsedData(prev => prev ? { ...prev, ...updates } : null);
                                }}
                            >
                                {/* INLINE METHOD SELECTOR or CONFIRM BUTTON */}
                                {showMethodSelector ? (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="bg-background/20 rounded-xl border border-white/5 overflow-hidden"
                                    >
                                        <div className="p-3 bg-black/20 text-center">
                                            <h4 className="text-sm font-bold text-white">Como deseja pagar?</h4>
                                            <p className="text-[10px] text-muted-foreground">Esta conta é híbrida.</p>
                                        </div>

                                        <div className="p-3 grid grid-cols-2 gap-3">
                                            <button
                                                onClick={() => finalizeTransaction(pendingAccount, 'debit')}
                                                className="p-3 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-500 transition-colors flex flex-col items-center gap-1 group"
                                            >
                                                <span className="text-xl group-hover:scale-110 transition-transform">💸</span>
                                                <span className="font-bold text-sm">Débito</span>
                                                <span className="text-[10px] opacity-70">Sai na hora</span>
                                            </button>

                                            <button
                                                onClick={() => finalizeTransaction(pendingAccount, 'credit')}
                                                className="p-3 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-500 transition-colors flex flex-col items-center gap-1 group"
                                            >
                                                <span className="text-xl group-hover:scale-110 transition-transform">💳</span>
                                                <span className="font-bold text-sm">Crédito</span>
                                                <span className="text-[10px] opacity-70">Na fatura</span>
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => setShowMethodSelector(false)}
                                            className="w-full text-[10px] text-muted-foreground hover:text-white py-2 bg-black/20 hover:bg-black/40 transition-colors"
                                        >
                                            Cancelar Transação
                                        </button>
                                    </motion.div>
                                ) : (
                                    <motion.button
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleConfirm}
                                        disabled={isSubmitting}
                                        className={`
                                            w-full mt-2 py-3 rounded-xl font-bold text-base shadow-lg flex items-center justify-center gap-2 transition-all
                                            ${parsedData.type === 'income'
                                                ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-green-500/20'
                                                : 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-red-500/20'
                                            }
                                            ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}
                                        `}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Salvando...
                                            </>
                                        ) : (
                                            <>
                                                <Check className="w-4 h-4" />
                                                Confirmar
                                            </>
                                        )}
                                    </motion.button>
                                )}
                            </TransactionPreviewCard>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
}
