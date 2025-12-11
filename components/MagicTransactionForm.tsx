'use client';

import { useState, useEffect } from 'react';
import { Wand2, Sparkles, Check, AlertCircle, Loader2 } from 'lucide-react';
import { parseSmartInput } from '@/lib/smartParser';
import { motion, AnimatePresence } from 'framer-motion';
import TransactionPreviewCard from './TransactionPreviewCard';
import { supabase, Account, Pocket } from '@/lib/supabase';
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

    // Recurrence State
    const [isRecurrenceMode, setIsRecurrenceMode] = useState(false);
    const [recurrenceFreq, setRecurrenceFreq] = useState<'monthly' | 'weekly'>('monthly');
    const [recurrenceLimit, setRecurrenceLimit] = useState<string>(''); // Empty = Infinite

    // Temp state for Method Selector (Installments)
    const [tempInstallments, setTempInstallments] = useState<number>(1);

    // Pockets State
    const [pockets, setPockets] = useState<Pocket[]>([]);
    const [selectedPocketId, setSelectedPocketId] = useState<string | null>(null);

    // Load Pockets
    useEffect(() => {
        if (!userId) return;
        const fetchPockets = async () => {
            const { data } = await supabase
                .from('pockets')
                .select('*')
                .eq('user_id', userId)
                .order('name');
            if (data) setPockets(data);
        };
        fetchPockets();
    }, [userId]);

    useEffect(() => {
        if (parsedData?.installments) {
            setTempInstallments(parsedData.installments);
        } else {
            setTempInstallments(1);
        }
    }, [parsedData]);

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
                setTempInstallments(parsedData.installments || 1);
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

            // Use tempInstallments if we are in the method selector flow (implied by method being set), otherwise parsedData
            const installments = method ? tempInstallments : (parsedData.installments || 1);
            const isInstallment = installments > 1;

            // Gerar Group ID se for parcelado
            const groupId = isInstallment ? crypto.randomUUID() : null;

            let recurrenceId = null;
            let scheduledDay = new Date().getDate();

            // 0. CRIAR REGRA DE RECORRÊNCIA (SE ATIVADO)
            if (isRecurrenceMode) {
                // Calcular dia de cobrança baseado na data da transação
                const transactionDateObj = new Date(parsedData.date || new Date());
                if (parsedData.date) {
                    const parts = parsedData.date.split('-');
                    if (parts.length === 3) scheduledDay = parseInt(parts[2]);
                } else {
                    scheduledDay = transactionDateObj.getDate();
                }

                // Parse limit
                const limitInt = recurrenceLimit ? parseInt(recurrenceLimit) : null;

                const { data: recurrenceData, error: recurrenceError } = await supabase
                    .from('recurrences')
                    .insert({
                        user_id: userId,
                        name: parsedData.description,
                        amount: amount, // Valor base da recorrência
                        type: parsedData.type,
                        category: parsedData.category,
                        frequency: recurrenceFreq,
                        due_day: scheduledDay,
                        total_occurrences: limitInt,
                        start_date: parsedData.date || new Date().toISOString().split('T')[0],
                        last_generated: parsedData.date || new Date().toISOString().split('T')[0], // Já marcamos como gerada hoje
                        active: true
                    })
                    .select('id')
                    .single();

                if (recurrenceError) throw recurrenceError;
                recurrenceId = recurrenceData.id;
            }

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
                    const closingDay = accountData.closing_day || 31; // Default para 31 para cair no mês atual se não configurado
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
                    group_id: groupId,
                    recurrence_id: recurrenceId, // Linkar à recorrência se houver
                    pocket_id: selectedPocketId // Linkar ao pocket se selecionado
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

            // 4. Update Pocket Balance (Subtract if Expense, Add if Income?)
            // Logic: Budget logic per user request. "Expense" subtracts "Available" (which is current_balance).
            // Actually, simply deducting the expense from current_balance works for budget logic.
            if (selectedPocketId && parsedData.type === 'expense') {
                // Fetch current pocket balance first to be safe or use what we have? 
                // Better to do a stored procedure or atomic update, but simple update is fine for MVP.
                // We need to fetch the LATEST pocket balance to avoid race conditions?
                // For now, simple decrement.
                const { data: pocketData } = await supabase.from('pockets').select('current_balance').eq('id', selectedPocketId).single();
                if (pocketData) {
                    await supabase.from('pockets').update({
                        current_balance: pocketData.current_balance - amount
                    }).eq('id', selectedPocketId);
                }
            }

            // Sucesso!
            const successMessage = isRecurrenceMode
                ? `Repetição definida para todo dia ${scheduledDay}!`
                : (isInstallment ? `Compra parcelada em ${installments}x criada!` : 'Transação adicionada com sucesso!');

            setFeedback({ type: 'success', message: successMessage });
            setSmartInput('');
            setParsedData(null);
            setIsFocused(false);
            setIsRecurrenceMode(false); // Reset recurrence toggle
            setRecurrenceLimit(''); // Reset limit
            setTempInstallments(1); // Reset installments
            setSelectedPocketId(null); // Reset pocket
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

    const [isOpen, setIsOpen] = useState(false);

    // Auto-open if OCR action
    useEffect(() => {
        if (searchParams && searchParams.get('action') === 'scan') {
            setIsOpen(true);
        }
    }, [searchParams]);

    // Close when clicking outside (using the overlay)
    const handleClose = () => {
        setIsOpen(false);
        setIsFocused(false);
    }

    const hasData = parsedData && parsedData.amount;
    const showOverlay = isOpen;

    return (
        <>
            {/* ASSISTIVE TOUCH BUTTON (Floating) - Visible only when CLOSED */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.1, opacity: 1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                            setIsOpen(true);
                            // Auto-focus logic can go here if needed, but better let user tap input to avoid jumping keyboard
                        }}
                        className="fixed bottom-24 right-6 z-[60] w-14 h-14 rounded-full bg-emerald-500/10 backdrop-blur-md border border-emerald-500/20 shadow-2xl flex items-center justify-center text-emerald-500 hover:bg-emerald-500/20 hover:border-emerald-500/40 transition-all group"
                    >
                        <Sparkles className="w-6 h-6 animate-pulse group-hover:animate-none" />
                        <div className="absolute inset-0 rounded-full bg-emerald-400/20 blur-xl opacity-0 group-hover:opacity-50 transition-opacity" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* FULL INTERFACE - Visible only when OPEN */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Overlay Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-background/90 backdrop-blur-lg z-50 transition-all duration-500"
                            onClick={handleClose}
                        />

                        {/* Centered Input Container */}
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 50, scale: 0.9 }}
                            className="fixed inset-x-4 top-24 md:top-32 md:max-w-xl md:mx-auto z-[60]"
                        >
                            {/* Close Button */}
                            <button
                                onClick={handleClose}
                                className="absolute -top-12 right-0 p-2 text-white/50 hover:text-white transition-colors"
                            >
                                <span className="sr-only">Fechar</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>

                            {/* Hero Input Block - REFACTORED FOR MINIMALISM */}
                            <div className="mb-2">
                                <div className="relative group">
                                    {/* Icon inside input */}
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                                        <Sparkles className={`h-4 w-4 text-emerald-500/80 transition-opacity ${smartInput ? 'opacity-100' : 'opacity-50'}`} />
                                    </div>

                                    <input
                                        type="text"
                                        autoFocus
                                        enterKeyHint="done"
                                        inputMode="text"
                                        autoComplete="off"
                                        autoCorrect="off"
                                        value={smartInput}
                                        onChange={(e) => setSmartInput(e.target.value)}
                                        onFocus={() => setIsFocused(true)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !isSubmitting) {
                                                e.preventDefault();
                                                if (hasData) {
                                                    handleConfirm();
                                                } else {
                                                    handleParse();
                                                }
                                                // No mobile blur check needed here as layout is fixed
                                            }
                                        }}
                                        placeholder="Digite o comando..."
                                        className={`
                                            w-full pl-11 pr-4 py-4 text-base md:text-lg font-mono tracking-wide rounded-2xl
                                            bg-black/50 border border-white/10 text-white shadow-2xl
                                            focus:bg-black/70 focus:border-emerald-500/50 focus:shadow-[0_0_30px_rgba(16,185,129,0.15)]
                                            placeholder:text-white/20 outline-none transition-all duration-300
                                        `}
                                        disabled={isSubmitting}
                                    />

                                    {/* Processing Indicator */}
                                    <AnimatePresence>
                                        {isProcessing && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="absolute inset-y-0 right-0 pr-4 flex items-center gap-2"
                                            >
                                                <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Feedback Message */}
                            <AnimatePresence>
                                {feedback && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className={`mb-3 p-2.5 rounded-xl flex items-center gap-2 text-xs md:text-sm font-medium ${feedback.type === 'success'
                                            ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                                            : 'bg-red-500/10 text-red-500 border border-red-500/20'
                                            }`}
                                    >
                                        {feedback.type === 'success' ? <Check className="w-3 h-3 md:w-4 md:h-4" /> : <AlertCircle className="w-3 h-3 md:w-4 md:h-4" />}
                                        {feedback.message}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Preview Card */}
                            <AnimatePresence>
                                {hasData && (
                                    <div className="mb-3">
                                        <TransactionPreviewCard
                                            amount={parsedData.amount}
                                            description={parsedData.description}
                                            type={parsedData.type}
                                            category={parsedData.category}
                                            date={parsedData.date || new Date().toISOString().split('T')[0]}
                                            installments={parsedData.installments}
                                            hideInstallments={isRecurrenceMode} // Hide installments if recurrence is active
                                            onUpdate={(updates) => {
                                                setParsedData(prev => {
                                                    if (!prev) return null;
                                                    // If setting installments > 1, turn off recurrence
                                                    if (updates.installments && updates.installments > 1 && isRecurrenceMode) {
                                                        setIsRecurrenceMode(false);
                                                    }
                                                    return { ...prev, ...updates };
                                                });
                                            }}
                                        >
                                            {/* POCKET SELECTOR (Optional) */}
                                            {!showMethodSelector && (
                                                <div className="mb-4 px-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Pocket (Opcional)</span>
                                                        {selectedPocketId && (
                                                            <button
                                                                onClick={() => setSelectedPocketId(null)}
                                                                className="text-[9px] text-zinc-600 hover:text-red-400 transition-colors"
                                                            >
                                                                (Remover)
                                                            </button>
                                                        )}
                                                    </div>

                                                    {pockets.length > 0 ? (
                                                        <div className="flex flex-wrap gap-2">
                                                            {pockets.map(pocket => (
                                                                <button
                                                                    key={pocket.id}
                                                                    onClick={() => setSelectedPocketId(pocket.id === selectedPocketId ? null : pocket.id)}
                                                                    className={`
                                                                        px-2.5 py-1.5 rounded-sm border text-[10px] uppercase tracking-wider font-mono transition-all
                                                                        ${selectedPocketId === pocket.id
                                                                            ? `border-${pocket.color || 'yellow'}-500/50 bg-${pocket.color || 'yellow'}-500/10 text-${pocket.color || 'yellow'}-500`
                                                                            : 'border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600'
                                                                        }
                                                                    `}
                                                                >
                                                                    {pocket.name}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-[10px] text-zinc-700 italic">Nenhum pocket disponível.</span>
                                                    )}
                                                </div>
                                            )}

                                            {/* RECURRENCE TOGGLE (Aesthetic Match) */}
                                            {/* Only show if parsedData has no installments (or is 1) and not in method selector */}
                                            {!showMethodSelector && (!parsedData.installments || parsedData.installments === 1) && (
                                                <div className="mb-4">
                                                    <button
                                                        onClick={() => {
                                                            const newMode = !isRecurrenceMode;
                                                            setIsRecurrenceMode(newMode);
                                                            // If turning on recurrence, reset installments to 1
                                                            if (newMode) {
                                                                setParsedData(prev => prev ? { ...prev, installments: 1 } : null);
                                                                setTempInstallments(1);
                                                            }
                                                        }}
                                                        className={`w-full flex items-center justify-between p-2 rounded-sm border transition-all duration-200 ${isRecurrenceMode ? 'bg-zinc-800/50 border-emerald-500/30 text-emerald-500' : 'bg-transparent border-transparent text-zinc-600 hover:text-zinc-400'}`}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-3 h-3 rounded flex items-center justify-center border ${isRecurrenceMode ? 'border-emerald-500 bg-emerald-500/20' : 'border-zinc-700'}`}>
                                                                {isRecurrenceMode && <Check className="w-2 h-2" />}
                                                            </div>
                                                            <span className="text-[10px] uppercase tracking-widest font-mono">Repetir Transação</span>
                                                        </div>
                                                        {isRecurrenceMode && <span className="text-[9px] font-serif italic text-emerald-400">Ativado</span>}
                                                    </button>

                                                    {/* Recurrence Options */}
                                                    <AnimatePresence>
                                                        {isRecurrenceMode && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                className="overflow-hidden"
                                                            >
                                                                <div className="pt-2 pl-6 pr-2">
                                                                    <div className="flex items-stretch gap-2 mb-1">
                                                                        {/* Frequency */}
                                                                        <div className="flex flex-1 gap-1">
                                                                            <button
                                                                                onClick={() => setRecurrenceFreq('monthly')}
                                                                                className={`flex-1 py-1.5 text-[9px] uppercase tracking-wider font-mono border rounded-sm transition-colors ${recurrenceFreq === 'monthly' ? 'bg-emerald-900/20 border-emerald-900/50 text-emerald-500' : 'border-zinc-800 text-zinc-600 hover:border-zinc-700'}`}
                                                                            >
                                                                                Mensal
                                                                            </button>
                                                                            <button
                                                                                onClick={() => setRecurrenceFreq('weekly')}
                                                                                className={`flex-1 py-1.5 text-[9px] uppercase tracking-wider font-mono border rounded-sm transition-colors ${recurrenceFreq === 'weekly' ? 'bg-emerald-900/20 border-emerald-900/50 text-emerald-500' : 'border-zinc-800 text-zinc-600 hover:border-zinc-700'}`}
                                                                            >
                                                                                Semanal
                                                                            </button>
                                                                        </div>

                                                                        {/* Recurrence Limit (Count) */}
                                                                        <div className="flex flex-[0.8] items-center gap-1 border border-zinc-800 rounded-sm px-2 bg-zinc-900/30">
                                                                            <span className="text-[9px] text-zinc-500 uppercase font-mono whitespace-nowrap">Vezes:</span>
                                                                            <input
                                                                                type="number"
                                                                                min="1"
                                                                                max="999"
                                                                                placeholder="∞"
                                                                                value={recurrenceLimit}
                                                                                onChange={(e) => setRecurrenceLimit(e.target.value)}
                                                                                className="w-full bg-transparent text-right text-xs font-mono text-zinc-300 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-zinc-600"
                                                                            />
                                                                            <span className="text-[9px] text-zinc-600 font-mono">x</span>
                                                                        </div>
                                                                    </div>
                                                                    <p className="text-[9px] text-zinc-500 font-mono text-center pt-0.5">
                                                                        {recurrenceFreq === 'monthly' ? (recurrenceLimit ? `Por ${recurrenceLimit} meses` : 'Todo mês (Indeterminado)') : (recurrenceLimit ? `Por ${recurrenceLimit} semanas` : 'Toda semana (Indeterminado)')}
                                                                    </p>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            )}

                                            {/* INLINE METHOD SELECTOR or CONFIRM BUTTON */}
                                            {showMethodSelector ? (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="bg-[#09090b] rounded-sm border border-[#27272a] overflow-hidden mt-2"
                                                >
                                                    <div className="p-2 border-b border-[#27272a] text-center">
                                                        <h4 className="text-[10px] font-mono tracking-[0.2em] text-zinc-500 uppercase">Método de Alocação</h4>
                                                    </div>

                                                    {/* Installments Input */}
                                                    <div className="px-3 pt-3 pb-1 flex items-center justify-between">
                                                        <span className="text-[10px] text-zinc-400 font-serif italic">Parcelar em:</span>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => setTempInstallments(Math.max(1, tempInstallments - 1))}
                                                                className="w-6 h-6 flex items-center justify-center rounded-sm border border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
                                                            >
                                                                -
                                                            </button>
                                                            <span className="text-xs font-mono text-emerald-500 w-8 text-center">{tempInstallments}x</span>
                                                            <button
                                                                onClick={() => setTempInstallments(Math.min(18, tempInstallments + 1))}
                                                                className="w-6 h-6 flex items-center justify-center rounded-sm border border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="p-1.5 grid grid-cols-2 gap-1.5">
                                                        <button
                                                            onClick={() => finalizeTransaction(pendingAccount, 'debit')}
                                                            className="group relative p-2.5 rounded-sm border border-emerald-900/30 hover:border-emerald-500/50 hover:bg-emerald-900/10 transition-all text-left overflow-hidden"
                                                        >
                                                            <div className="relative z-10 flex flex-col gap-0.5">
                                                                <span className="text-[9px] font-mono text-emerald-700 group-hover:text-emerald-500 transition-colors">Opção 01</span>
                                                                <span className="font-serif italic text-base md:text-lg text-emerald-600 group-hover:text-emerald-400">Débito</span>
                                                                <span className="text-[8px] text-zinc-600 uppercase tracking-wide">Liquidação Imediata</span>
                                                            </div>
                                                            {/* Decorative Corner */}
                                                            <div className="absolute top-0 right-0 p-0.5">
                                                                <div className="w-1 h-1 bg-emerald-900/40 rounded-full" />
                                                            </div>
                                                        </button>

                                                        <button
                                                            onClick={() => finalizeTransaction(pendingAccount, 'credit')}
                                                            className="group relative p-2.5 rounded-sm border border-[#451a1a] hover:border-[#7f2e2e] hover:bg-[#2a0f0f] transition-all text-left overflow-hidden"
                                                        >
                                                            <div className="relative z-10 flex flex-col gap-0.5">
                                                                <span className="text-[9px] font-mono text-[#5c2222] group-hover:text-[#7f2e2e] transition-colors">Opção 02</span>
                                                                <span className="font-serif italic text-base md:text-lg text-[#8b4343] group-hover:text-[#c24141]">Crédito</span>
                                                                <span className="text-[8px] text-zinc-600 uppercase tracking-wide">
                                                                    {tempInstallments > 1 ? `Compromisso em ${tempInstallments}x` : 'Compromisso Futuro'}
                                                                </span>
                                                            </div>
                                                            {/* Decorative Corner */}
                                                            <div className="absolute top-0 right-0 p-0.5">
                                                                <div className="w-1 h-1 bg-[#451a1a] rounded-full" />
                                                            </div>
                                                        </button>
                                                    </div>

                                                    <button
                                                        onClick={() => setShowMethodSelector(false)}
                                                        className="w-full text-[9px] font-mono text-zinc-600 hover:text-zinc-400 py-1.5 border-t border-[#27272a] hover:bg-[#27272a] transition-colors uppercase tracking-widest"
                                                    >
                                                        [ Cancelar ]
                                                    </button>
                                                </motion.div>
                                            ) : (
                                                <>
                                                    {/* STOIC REFLECTION HINT */}
                                                    {parsedData.type === 'expense' ? (
                                                        <p className="text-[10px] text-zinc-600 text-center mb-1.5 italic font-serif opacity-60">
                                                            Isso é essencial?
                                                        </p>
                                                    ) : (
                                                        <p className="text-[10px] text-zinc-600 text-center mb-1.5 italic font-serif opacity-60">
                                                            Recurso com propósito.
                                                        </p>
                                                    )}

                                                    <motion.button
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        whileHover={{ scale: 1.01 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={handleConfirm}
                                                        disabled={isSubmitting}
                                                        className={`
                                            w-full py-2.5 rounded-sm font-mono text-sm tracking-widest border transition-all duration-300
                                            ${parsedData.type === 'income'
                                                                ? 'border-emerald-900/50 text-emerald-600 hover:bg-emerald-900/10 hover:border-emerald-500/30'
                                                                : 'border-[#5c2222] text-[#c24141] hover:bg-[#2a0f0f] hover:border-[#7f2e2e]'
                                                            }
                                            ${isSubmitting ? 'opacity-50 cursor-wait' : ''}
                                        `}
                                                    >
                                                        {isSubmitting ? (
                                                            <span className="flex items-center justify-center gap-2">
                                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                                PROCESSANDO...
                                                            </span>
                                                        ) : (
                                                            <span>
                                                                [ {parsedData.type === 'income' ? 'VALIDAR RECEBIMENTO' : 'VALIDAR ALOCAÇÃO'} ]
                                                            </span>
                                                        )}
                                                    </motion.button>
                                                </>
                                            )}
                                        </TransactionPreviewCard>
                                    </div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
