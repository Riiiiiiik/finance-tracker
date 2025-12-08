'use client';

import { useState, useRef } from 'react';
import { Account } from '@/lib/supabase';
import AccountCard from './AccountCard';
import { Plus, X, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

import Link from 'next/link';
import MonkIcon, { monkColors } from './MonkIcon';
import NewAccountModal from './NewAccountModal';

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
    const [isExpanded, setIsExpanded] = useState(false);

    const handleSaveAccount = async (newAccount: any) => {
        try {
            const { error } = await supabase
                .from('accounts')
                .insert([{
                    user_id: userId,
                    name: newAccount.name,
                    type: newAccount.type === 'investment' ? 'investment' :
                        newAccount.type === 'crypto' ? 'investment' : // Map crypto/investment to investment for DB if needed, or update DB enum
                            newAccount.type,
                    balance: 0,
                    color: newAccount.color,
                    limit: newAccount.limit,
                    closing_day: newAccount.closingDay,
                    due_day: newAccount.dueDay
                }]);

            if (error) throw error;

            onUpdate(); // Recarregar contas no pai
            setShowAddModal(false);
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

    // Calculate Invoice Balance (Credit Accounts + Hybrid with negative balance)
    const totalInvoice = accounts
        .filter(a => a.type === 'credit' || a.balance < 0)  // Include hybrid cards with debt
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

            {/* New Account Modal (Monk.Vault Style) */}
            <NewAccountModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSave={handleSaveAccount}
            />
        </div>
    );
}
