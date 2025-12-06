'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, CreditCard, ArrowRight, Wallet } from 'lucide-react';
import { supabase, Account } from '@/lib/supabase';

interface PayInvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    accounts: Account[];
    onPaymentComplete: () => void;
}

export default function PayInvoiceModal({
    isOpen,
    onClose,
    userId,
    accounts,
    onPaymentComplete
}: PayInvoiceModalProps) {
    const [selectedCreditAccount, setSelectedCreditAccount] = useState<string>('');
    const [selectedSourceAccount, setSelectedSourceAccount] = useState<string>('');
    const [amount, setAmount] = useState<string>('');
    const [loading, setLoading] = useState(false);

    // Filter accounts
    const creditAccounts = accounts.filter(a => a.type === 'credit');
    const sourceAccounts = accounts.filter(a => a.type !== 'credit');

    useEffect(() => {
        if (isOpen && creditAccounts.length > 0) {
            setSelectedCreditAccount(creditAccounts[0].id);
        }
    }, [isOpen, accounts]);

    useEffect(() => {
        async function fetchInvoiceAmount() {
            if (selectedCreditAccount) {
                const acc = accounts.find(a => a.id === selectedCreditAccount);
                if (acc) {
                    setLoading(true);
                    try {
                        const today = new Date();
                        const closingDay = acc.closing_day || 1;
                        const invoiceDate = new Date(today);

                        if (today.getDate() >= closingDay) {
                            invoiceDate.setMonth(invoiceDate.getMonth() + 1);
                        }
                        invoiceDate.setDate(1);
                        const currentInvoiceMonth = invoiceDate.toISOString().split('T')[0];

                        const { data: transactions, error } = await supabase
                            .from('transactions')
                            .select('amount, type')
                            .eq('account_id', selectedCreditAccount)
                            .eq('status', 'pending')
                            .lte('invoice_month', currentInvoiceMonth);

                        if (error) throw error;

                        if (transactions) {
                            const total = transactions.reduce((acc, t) => {
                                return t.type === 'expense' ? acc + t.amount : acc - t.amount;
                            }, 0);
                            setAmount(Math.max(0, total).toFixed(2));
                        }
                    } catch (error) {
                        console.error('Erro ao calcular fatura:', error);
                    } finally {
                        setLoading(false);
                    }
                }
            }
        }

        fetchInvoiceAmount();
    }, [selectedCreditAccount, accounts]);

    const handlePayment = async () => {
        if (!selectedCreditAccount || !selectedSourceAccount || !amount) return;

        setLoading(true);
        try {
            const payAmount = parseFloat(amount);

            // 1. Create Expense Transaction on Source Account (Only if not external)
            if (selectedSourceAccount !== 'external') {
                const { error: expenseError } = await supabase
                    .from('transactions')
                    .insert([{
                        user_id: userId,
                        account_id: selectedSourceAccount,
                        amount: payAmount,
                        description: `Pagamento de Fatura`,
                        type: 'expense',
                        category: 'Pagamentos',
                        date: new Date().toISOString().split('T')[0],
                        status: 'posted' // Payment from checking is posted immediately
                    }]);

                if (expenseError) throw expenseError;

                // 2. Update Source Account Balance
                const sourceAcc = accounts.find(a => a.id === selectedSourceAccount)!;
                await supabase.from('accounts').update({ balance: sourceAcc.balance - payAmount }).eq('id', selectedSourceAccount);
            }

            // 3. Create "Payment Received" Transaction on Credit Account
            await supabase
                .from('transactions')
                .insert([{
                    user_id: userId,
                    account_id: selectedCreditAccount,
                    amount: payAmount,
                    description: `Pagamento de Fatura`,
                    type: 'income',
                    category: 'Pagamentos',
                    date: new Date().toISOString().split('T')[0],
                    status: 'paid' // Payment received is considered paid/settled
                }]);

            // 4. Update Credit Account Balance
            const creditAcc = accounts.find(a => a.id === selectedCreditAccount)!;
            await supabase.from('accounts').update({ balance: creditAcc.balance + payAmount }).eq('id', selectedCreditAccount);

            // 5. Update Transactions Status (Mark as Paid)
            const today = new Date();
            const closingDay = creditAcc.closing_day || 1;
            const invoiceDate = new Date(today);
            if (today.getDate() >= closingDay) {
                invoiceDate.setMonth(invoiceDate.getMonth() + 1);
            }
            invoiceDate.setDate(1);
            const currentInvoiceMonth = invoiceDate.toISOString().split('T')[0];

            await supabase
                .from('transactions')
                .update({ status: 'paid' })
                .eq('account_id', selectedCreditAccount)
                .eq('status', 'pending')
                .lte('invoice_month', currentInvoiceMonth);

            onPaymentComplete();
            onClose();
        } catch (error) {
            console.error('Erro ao pagar fatura:', error);
            alert('Erro ao processar pagamento.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-card border border-border w-full max-w-md rounded-2xl p-6 shadow-xl"
            >
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-primary" />
                        Pagar Fatura
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Credit Account Selection */}
                    <div>
                        <label className="block text-sm font-medium mb-2 text-muted-foreground">Fatura do Cartão</label>
                        <div className="relative">
                            <select
                                value={selectedCreditAccount}
                                onChange={(e) => setSelectedCreditAccount(e.target.value)}
                                className="w-full p-3 pl-10 rounded-xl bg-secondary/50 border border-transparent focus:border-primary outline-none appearance-none cursor-pointer"
                            >
                                {creditAccounts.map(acc => (
                                    <option key={acc.id} value={acc.id}>
                                        {acc.name} (R$ {Math.abs(acc.balance).toFixed(2)})
                                    </option>
                                ))}
                                {creditAccounts.length === 0 && <option disabled>Sem faturas pendentes</option>}
                            </select>
                            <CreditCard className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
                        </div>
                    </div>

                    {/* Amount Input */}
                    <div>
                        <label className="block text-sm font-medium mb-2 text-muted-foreground">Valor do Pagamento</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full p-3 pl-10 rounded-xl bg-secondary/50 border border-transparent focus:border-primary outline-none font-bold text-xl"
                            />
                            <div className="absolute left-3 top-3.5 text-muted-foreground font-bold">R$</div>
                        </div>
                    </div>

                    {/* Source Account Selection */}
                    <div>
                        <label className="block text-sm font-medium mb-2 text-muted-foreground">Pagar com</label>
                        <div className="relative">
                            <select
                                value={selectedSourceAccount}
                                onChange={(e) => setSelectedSourceAccount(e.target.value)}
                                className="w-full p-3 pl-10 rounded-xl bg-secondary/50 border border-transparent focus:border-primary outline-none appearance-none cursor-pointer"
                            >
                                <option value="" disabled>Selecione...</option>
                                <option value="external">💸 Pagamento Externo / Dinheiro</option>
                                {sourceAccounts.map(acc => (
                                    <option key={acc.id} value={acc.id}>
                                        👛 {acc.name} (R$ {acc.balance.toFixed(2)})
                                    </option>
                                ))}
                            </select>
                            <Wallet className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
                        </div>
                    </div>

                    <button
                        onClick={handlePayment}
                        disabled={loading || !selectedCreditAccount || !selectedSourceAccount}
                        className="w-full bg-green-600 hover:bg-green-700 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? 'Processando...' : (
                            <>
                                <Check className="w-5 h-5" />
                                Confirmar Pagamento
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
