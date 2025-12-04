'use client';

import { useState, useRef } from 'react';
import { Account } from '@/lib/supabase';
import AccountCard from './AccountCard';
import { Plus, X, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

interface AccountCarouselProps {
    userId: string;
    accounts: Account[];
    onAccountSelect: (accountId: string) => void;
    selectedAccountId: string | null;
    onUpdate: () => void;
}

export default function AccountCarousel({
    userId,
    accounts,
    onAccountSelect,
    selectedAccountId,
    onUpdate
}: AccountCarouselProps) {
    const [showAddModal, setShowAddModal] = useState(false);
    const [newAccountName, setNewAccountName] = useState('');
    const [newAccountColor, setNewAccountColor] = useState('#6366f1');
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
                    type: 'checking',
                    balance: 0,
                    color: newAccountColor
                }]);

            if (error) throw error;

            onUpdate(); // Recarregar contas no pai
            setShowAddModal(false);
            setNewAccountName('');
            setNewAccountColor('#6366f1');
        } catch (error) {
            console.error('Erro ao criar conta:', error);
            alert('Erro ao criar conta');
        }
    };

    // Calculate Total Balance
    const totalBalance = accounts.reduce((acc, account) => acc + account.balance, 0);
    const totalAccount: Account = {
        id: 'all',
        user_id: userId,
        name: 'Carteira Total',
        balance: totalBalance,
        type: 'checking',
        color: '#0f172a', // Slate 900 (Dark)
        is_default: false,
        created_at: new Date().toISOString()
    };

    const displayAccounts = [totalAccount, ...accounts];

    return (
        <div className="relative mb-8 z-10">
            {/* Overlay to close when clicking outside */}
            {isExpanded && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
                    onClick={() => setIsExpanded(false)}
                />
            )}

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
                                    className="text-white font-bold text-xl mb-6"
                                >
                                    Selecione uma Conta
                                </motion.h2>
                            )}
                        </AnimatePresence>

                        <div className="relative w-full max-w-[340px]" style={{ height: isExpanded ? 'auto' : '140px' }}>
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
                                            opacity: 1
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
                                        />
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Account Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-card border border-border w-full max-w-sm rounded-2xl p-6 shadow-xl"
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

                            <form onSubmit={handleAddAccount} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Nome da Conta</label>
                                    <input
                                        type="text"
                                        value={newAccountName}
                                        onChange={(e) => setNewAccountName(e.target.value)}
                                        placeholder="Ex: Nubank, Inter, Cofre"
                                        className="w-full p-3 rounded-xl bg-secondary/50 border border-transparent focus:border-primary outline-none transition-all font-medium"
                                        autoFocus
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Cor do Cartão</label>
                                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                        {['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6', '#14b8a6'].map((c) => (
                                            <button
                                                key={c}
                                                type="button"
                                                onClick={() => setNewAccountColor(c)}
                                                className={`w-10 h-10 rounded-full shrink-0 border-2 transition-all ${newAccountColor === c ? 'border-white scale-110' : 'border-transparent hover:scale-105'}`}
                                                style={{ backgroundColor: c }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={!newAccountName}
                                    className="w-full bg-primary text-primary-foreground p-3 rounded-xl font-bold flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                                >
                                    <Check className="w-5 h-5" />
                                    Criar Conta
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
