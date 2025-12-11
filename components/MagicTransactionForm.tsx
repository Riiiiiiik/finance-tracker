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

            <div className={`relative transition-all duration-500 ${showOverlay ? 'z-[70] scale-105' : 'z-10'}`}>
                {/* Hero Input Block - REFACTORED FOR MINIMALISM */}
                <div className="mb-2">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative"
                    >
                        <div className="relative group">
                            {/* Icon inside input */}
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                                <Sparkles className={`h-4 w-4 text-emerald-500/80 transition-opacity ${smartInput ? 'opacity-100' : 'opacity-50'}`} />
                            </div>

                            <input
                                type="text"
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
                                        if (window.innerWidth < 768) {
                                            (e.target as HTMLElement).blur();
                                        }
                                    }
                                }}
                                placeholder="Aguardando comando..."
                                className={`
                                    w-full pl-11 pr-4 py-3 text-sm font-mono tracking-wide rounded-xl
                                    bg-white/[0.03] border border-white/10 text-white
                                    focus:bg-white/[0.05] focus:border-emerald-500/30 focus:shadow-[0_0_20px_rgba(16,185,129,0.1)]
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
                                        <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
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
                                        className="bg-[#09090b] rounded-sm border border-[#27272a] overflow-hidden mt-2"
                                    >
                                        <div className="p-2 border-b border-[#27272a] text-center">
                                            <h4 className="text-[10px] font-mono tracking-[0.2em] text-zinc-500 uppercase">Método de Alocação</h4>
                                            <p className="text-[9px] text-zinc-600 font-serif italic">"A escolha define o compromisso."</p>
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
                                                    <span className="text-[8px] text-zinc-600 uppercase tracking-wide">Compromisso Futuro</span>
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
            </div>
        </>
    );
}
