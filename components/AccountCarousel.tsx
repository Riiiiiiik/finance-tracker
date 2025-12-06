'use client';

import { useState, useRef } from 'react';
import { Account } from '@/lib/supabase';
import AccountCard from './AccountCard';
import { Plus, X, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

import Link from 'next/link';
import MonkIcon, { monkColors } from './MonkIcon';

interface AccountCarouselProps {
    userId: string;
    accounts: Account[];
    onAccountSelect: (accountId: string) => void;
    selectedAccountId: string | null;
    onUpdate: () => void;
    onPayInvoice?: () => void;
}

export default function AccountCarousel({
    userId,
    accounts,
    onAccountSelect,
    selectedAccountId,
    onUpdate,
    onPayInvoice
}: AccountCarouselProps) {
    const [showAddModal, setShowAddModal] = useState(false);
    const [newAccountName, setNewAccountName] = useState('');
    const [newAccountColor, setNewAccountColor] = useState('#6366f1');
    const [newAccountType, setNewAccountType] = useState<'checking' | 'savings' | 'investment' | 'cash' | 'credit'>('checking');
    const [newAccountLimit, setNewAccountLimit] = useState('');
    const [newAccountClosingDay, setNewAccountClosingDay] = useState('');
    const [newAccountDueDay, setNewAccountDueDay] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);

    const handleAddAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAccountName) return;

        try {
            const { error } = await supabase
                .from('accounts')
                .insert([{
                    user_id: userId,
                    name: newAccountName,
                    type: newAccountType,
                    balance: 0,
                    color: newAccountColor,
                    limit: newAccountType === 'credit' ? Number(newAccountLimit) : null,
                    closing_day: newAccountType === 'credit' ? Number(newAccountClosingDay) : null,
                    due_day: newAccountType === 'credit' ? Number(newAccountDueDay) : null
                }]);

            if (error) throw error;

            onUpdate(); // Recarregar contas no pai
            setShowAddModal(false);
            setNewAccountName('');
            setNewAccountColor('#6366f1');
            setNewAccountType('checking');
            setNewAccountLimit('');
            setNewAccountClosingDay('');
            setNewAccountDueDay('');
        } catch (error) {
            console.error('Erro ao criar conta:', error);
            alert('Erro ao criar conta');
        }
    };

    // Calculate Total Balance
    const totalBalance = accounts.reduce((acc, account) => acc + account.balance, 0);

    // Calculate Available Balance (Non-Credit Accounts)
    const totalAvailable = accounts
        .filter(a => a.type !== 'credit')
        .reduce((acc, account) => acc + account.balance, 0);

    // Calculate Invoice Balance (Credit Accounts)
    const totalInvoice = accounts
        .filter(a => a.type === 'credit')
        .reduce((acc, account) => acc + account.balance, 0);
    const totalAccount: Account = {
        id: 'all',
        user_id: userId,
        name: 'Carteira Total',
        balance: totalAvailable, // Usar apenas saldo disponível (exclui crédito)
        type: 'checking',
        color: '#0f172a', // Slate 900 (Dark)
        is_default: false,
        created_at: new Date().toISOString()
    };

    const displayAccounts = [totalAccount, ...accounts];

    // ... (inside component return)

    return (
        <div className={`relative mb-8 transition-all ${isExpanded ? 'z-[60]' : 'z-10'}`}>
            {/* Header Identity */}
            <div className={`flex items-center gap-2 mb-4 px-1 opacity-80 ${monkColors.vault}`}>
                <MonkIcon type="vault" className="w-5 h-5" />
                <span className="text-xs font-bold tracking-widest uppercase">Monk.Vault</span>
            </div>

            {/* Overlay to close when clicking outside */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-background/95 backdrop-blur-xl z-40"
                        onClick={() => setIsExpanded(false)}
                    />
                )}
            </AnimatePresence>

            <div className={`relative transition-all duration-500 ease-spring ${isExpanded ? 'z-50' : ''}`}>
                <div className="flex items-start justify-center relative">

                    {/* Quick Select Sidebar - Absolute Positioned to avoid layout shift */}
                    <AnimatePresence>
                        {isExpanded && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="absolute left-0 top-0 -translate-x-full flex flex-col gap-3 pt-2 z-50 pr-4"
                                style={{ transform: 'translateX(-100%)' }}
                            >
                                {displayAccounts.map((account) => (
                                    <button
                                        key={`quick-${account.id}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onAccountSelect(account.id);
                                            setIsExpanded(false);
                                        }}
                                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg border-2 border-white/10 hover:scale-110 transition-transform relative group"
                                        style={{ backgroundColor: account.color }}
                                        title={account.name}
                                    >
                                        {account.name.substring(0, 2).toUpperCase()}

                                        {/* Tooltip for account name */}
                                        <span className="absolute left-full ml-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                            {account.name}
                                        </span>
                                    </button>
                                ))}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowAddModal(true);
                                    }}
                                    className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 text-white hover:bg-white/20 border-2 border-white/10 transition-all"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* The Stack/List - Now with full opacity */}
                    <div className="flex flex-col items-center w-full">
                        {/* Header Text (Optional) */}
                        <AnimatePresence>
                            {isExpanded && (
                                <motion.h2
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="text-white font-bold text-xl mb-6 scale-110"
                                >
                                    Selecione uma Conta
                                </motion.h2>
                            )}
                        </AnimatePresence>

                        <div className="relative w-full max-w-[340px]" style={{ height: isExpanded ? 'auto' : '240px' }}>
                            {displayAccounts.map((account, index) => {
                                const isSelected = selectedAccountId === account.id;

                                return (
                                    <motion.div
                                        key={account.id}
                                        layout
                                        initial={false}
                                        animate={{
                                            y: isExpanded
                                                ? index * 140
                                                : isSelected ? 0 : (index * 10 + 10),
                                            scale: isExpanded
                                                ? 1
                                                : isSelected ? 1 : 0.95 - (index * 0.02),
                                            zIndex: isExpanded
                                                ? displayAccounts.length - index
                                                : isSelected ? 50 : 40 - index,
                                            opacity: isExpanded ? 1 : (isSelected ? 1 : 0)
                                        }}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        onClick={() => {
                                            if (!isExpanded) {
                                                setIsExpanded(true);
                                            } else {
                                                onAccountSelect(account.id);
                                                setIsExpanded(false);
                                            }
                                        }}
                                        className="absolute top-0 left-0 right-0 w-full cursor-pointer origin-top"
                                        style={{
                                            position: isExpanded ? 'relative' : 'absolute',
                                            marginBottom: isExpanded ? '-80px' : '0'
                                        }}
                                    >
                                        <AccountCard
                                            account={account}
                                            onUpdate={onUpdate}
                                            availableBalance={account.id === 'all' ? totalAvailable : undefined}
                                            invoiceBalance={account.id === 'all' ? totalInvoice : undefined}
                                            onPayInvoice={onPayInvoice}
                                        />
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Account Modal (Bottom Sheet Style for Mobile) */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAddModal(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />

                        {/* Modal Content */}
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="bg-card border-t sm:border border-border w-full max-w-md sm:rounded-2xl rounded-t-3xl p-6 shadow-xl z-10 max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold">Nova Conta</h3>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="p-2 hover:bg-secondary rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleAddAccount} className="space-y-5">
                                {/* Nome da Conta */}
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Nome da Conta</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={newAccountName}
                                            onChange={(e) => setNewAccountName(e.target.value)}
                                            placeholder="Ex: Nubank, Inter, Cofre"
                                            className="w-full p-3 pl-10 rounded-xl bg-secondary/50 border border-transparent focus:border-primary outline-none transition-all font-medium"
                                            autoFocus
                                        />
                                        <div className="absolute left-3 top-3.5 text-muted-foreground">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" /><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" /></svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Tipo de Conta */}
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Tipo de Conta</label>
                                    <div className="relative">
                                        <select
                                            value={newAccountType}
                                            onChange={(e) => setNewAccountType(e.target.value as any)}
                                            className="w-full p-3 pl-10 rounded-xl bg-secondary/50 border border-transparent focus:border-primary outline-none transition-all font-medium appearance-none cursor-pointer"
                                        >
                                            <option value="checking">Conta Corrente / Débito</option>
                                            <option value="credit">Cartão de Crédito</option>
                                            <option value="cash">Dinheiro Físico</option>
                                        </select>
                                        <div className="absolute left-3 top-3.5 text-muted-foreground">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" /></svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Opção de Cartão Híbrido (Crédito em Conta Corrente) */}
                                {newAccountType === 'checking' && (
                                    <div className="flex items-center gap-2 p-3 bg-secondary/30 rounded-xl">
                                        <input
                                            type="checkbox"
                                            id="hasCredit"
                                            checked={newAccountLimit !== ''}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setNewAccountLimit('0');
                                                } else {
                                                    setNewAccountLimit('');
                                                    setNewAccountClosingDay('');
                                                    setNewAccountDueDay('');
                                                }
                                            }}
                                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <label htmlFor="hasCredit" className="text-sm cursor-pointer select-none font-medium">
                                            Possui função Crédito? (Híbrido)
                                        </label>
                                    </div>
                                )}

                                {/* Campos Condicionais de Crédito */}
                                <AnimatePresence>
                                    {(newAccountType === 'credit' || (newAccountType === 'checking' && newAccountLimit !== '')) && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="space-y-4 overflow-hidden"
                                        >
                                            <div>
                                                <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Limite do Cartão</label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        value={newAccountLimit === '0' ? '' : newAccountLimit}
                                                        onChange={(e) => setNewAccountLimit(e.target.value)}
                                                        placeholder="0,00"
                                                        className="w-full p-3 pl-10 rounded-xl bg-secondary/50 border border-transparent focus:border-primary outline-none transition-all font-medium"
                                                    />
                                                    <div className="absolute left-3 top-3.5 text-muted-foreground font-bold text-sm">R$</div>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Dia Fechamento</label>
                                                    <div className="relative">
                                                        <select
                                                            value={newAccountClosingDay}
                                                            onChange={(e) => setNewAccountClosingDay(e.target.value)}
                                                            className="w-full p-3 pl-9 rounded-xl bg-secondary/50 border border-transparent focus:border-primary outline-none transition-all font-medium appearance-none cursor-pointer"
                                                        >
                                                            <option value="" disabled>Dia</option>
                                                            {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                                                                <option key={day} value={day}>{day}</option>
                                                            ))}
                                                        </select>
                                                        <div className="absolute left-3 top-3.5 text-muted-foreground">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Dia Vencimento</label>
                                                    <div className="relative">
                                                        <select
                                                            value={newAccountDueDay}
                                                            onChange={(e) => setNewAccountDueDay(e.target.value)}
                                                            className="w-full p-3 pl-9 rounded-xl bg-secondary/50 border border-transparent focus:border-primary outline-none transition-all font-medium appearance-none cursor-pointer"
                                                        >
                                                            <option value="" disabled>Dia</option>
                                                            {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                                                                <option key={day} value={day}>{day}</option>
                                                            ))}
                                                        </select>
                                                        <div className="absolute left-3 top-3.5 text-muted-foreground">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Seletor de Cores */}
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-muted-foreground">Cor do Cartão</label>
                                    <div className="grid grid-cols-8 gap-2">
                                        {['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6', '#14b8a6'].map((c) => (
                                            <button
                                                key={c}
                                                type="button"
                                                onClick={() => setNewAccountColor(c)}
                                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${newAccountColor === c ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-background' : 'hover:scale-105 opacity-70 hover:opacity-100'}`}
                                                style={{ backgroundColor: c }}
                                            >
                                                {newAccountColor === c && <Check className="w-4 h-4 text-white" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={!newAccountName}
                                    className="w-full bg-primary text-primary-foreground p-4 rounded-xl font-bold flex items-center justify-center gap-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
                                >
                                    <Check className="w-5 h-5" />
                                    Criar {newAccountType === 'credit' ? 'Cartão' : 'Conta'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
