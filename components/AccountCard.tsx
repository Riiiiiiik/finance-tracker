'use client';

import { useState, useEffect } from 'react';
import { Account } from '@/lib/supabase';
import { Pencil, Check, X, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { BankLogo } from './BankLogo';

interface AccountCardProps {
    account: Account;
    onUpdate: () => void;
    availableBalance?: number;
    invoiceBalance?: number;
    onPayInvoice?: () => void;
}

import { usePrivacy } from '@/lib/privacy-context';

export default function AccountCard({ account, onUpdate, availableBalance, invoiceBalance, onPayInvoice }: AccountCardProps) {
    const { isPrivacyMode } = usePrivacy();
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(account.name);
    const [color, setColor] = useState(account.color);
    const [loading, setLoading] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    useEffect(() => {
        if (confirmDelete) {
            const timer = setTimeout(() => setConfirmDelete(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [confirmDelete]);

    const handleSave = async () => {
        setLoading(true);
        try {
            const { error } = await supabase
                .from('accounts')
                .update({ name, color })
                .eq('id', account.id);

            if (error) throw error;
            setIsEditing(false);
            onUpdate();
        } catch (error) {
            console.error('Erro ao atualizar conta:', error);
            alert('Erro ao atualizar conta');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirmDelete) {
            setConfirmDelete(true);
            return;
        }

        setLoading(true);
        try {
            // Primeiro deletar transações (ou deixar o cascade do banco cuidar disso, mas por segurança...)
            const { error: transError } = await supabase
                .from('transactions')
                .delete()
                .eq('account_id', account.id);

            if (transError) throw transError;

            const { error } = await supabase
                .from('accounts')
                .delete()
                .eq('id', account.id);

            if (error) throw error;
            onUpdate();
        } catch (error) {
            console.error('Erro ao excluir conta:', error);
            alert('Erro ao excluir conta');
        } finally {
            setLoading(false);
        }
    };

    // Monk Aesthetic for "Patrimônio da Ordem" (id === 'all')
    if (account.id === 'all') {
        return (
            <div
                className="relative w-full min-h-32 h-auto rounded-lg p-5 flex flex-col justify-between shadow-2xl transition-all duration-500 hover:scale-[1.01] border border-emerald-900/30 group"
                style={{
                    background: `
                        linear-gradient(to bottom, rgba(10, 10, 12, 0.95), rgba(5, 5, 7, 0.98)),
                        radial-gradient(circle at 50% 0%, rgba(52, 211, 153, 0.05), transparent 70%)
                    `,
                    boxShadow: '0 20px 40px -10px rgba(0,0,0,0.8), 0 0 20px -10px rgba(16, 185, 129, 0.1)',
                }}
            >
                {/* Texture Overlay */}
                <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                    }}
                ></div>

                {/* Content */}
                <div className="relative z-10 flex flex-col h-full justify-between">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            {/* Monk Icon / Glyph */}
                            <div className="w-8 h-8 rounded-md bg-emerald-950/30 border border-emerald-500/20 flex items-center justify-center">
                                <span className="text-emerald-500/80 text-xs font-serif">M</span>
                            </div>
                            <div>
                                <span className="block text-emerald-500/60 text-[10px] uppercase tracking-[0.2em] mb-0.5 font-sans">Total Assets</span>
                                <h3 className="text-gray-200 font-heading text-lg tracking-wide leading-none">{account.name}</h3>
                            </div>
                        </div>
                    </div>

                    {/* Main Value */}
                    <div className="mt-6 mb-4">
                        <div className="flex items-baseline gap-1">
                            <span className="text-emerald-600/60 font-mono text-lg">R$</span>
                            <span className={`text-4xl font-mono-code font-medium text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 to-emerald-400 ${isPrivacyMode ? 'blur-lg' : ''}`}>
                                {typeof availableBalance !== 'undefined' ? availableBalance.toFixed(2) : Math.abs(account.balance).toFixed(2)}
                            </span>
                        </div>
                        <p className="text-emerald-500/40 text-[10px] font-mono mt-1 pl-1">
                             // FUNDS_AVAILABLE
                        </p>
                    </div>

                    {/* Footer / Breakdown */}
                    {(typeof availableBalance !== 'undefined' && invoiceBalance !== 0) && (
                        <div className="border-t border-dashed border-emerald-500/20 pt-3 mt-1 grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-gray-500 text-[9px] uppercase tracking-wider mb-1">Forecast (Free)</p>
                                <p className={`text-gray-300 font-mono text-sm ${isPrivacyMode ? 'blur-sm' : ''}`}>
                                    R$ {(availableBalance + (invoiceBalance || 0)).toFixed(2)}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-red-900/60 text-[9px] uppercase tracking-wider mb-1">Invoice Debt</p>
                                <p className={`text-red-400/80 font-mono text-sm ${isPrivacyMode ? 'blur-sm' : ''}`}>
                                    R$ {Math.abs(invoiceBalance || 0).toFixed(2)}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div
            className="account-card-stacked relative w-full min-h-32 h-auto rounded-2xl p-4 flex flex-col justify-between shadow-lg transition-all duration-500 hover:scale-[1.02]"
            style={{
                background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
                boxShadow: `0 8px 20px -6px ${color}80`,
                '--card-color': color,
            } as React.CSSProperties & { '--card-color': string }}
        >
            {isEditing ? (
                <div className="flex flex-col h-full gap-2 relative z-10">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-white/20 text-white placeholder-white/70 rounded px-2 py-1 text-sm font-bold outline-none border border-white/30 focus:border-white"
                        placeholder="Nome da Conta"
                    />
                    <div className="flex items-center gap-2">
                        <input
                            type="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            className="w-8 h-8 rounded cursor-pointer bg-transparent border-none"
                        />
                        <div className="flex gap-1 ml-auto">
                            <button
                                onClick={handleDelete}
                                disabled={loading}
                                className={`p-1.5 rounded-full transition-all mr-1 flex items-center gap-1 ${confirmDelete
                                    ? 'bg-red-600 text-white w-auto px-3'
                                    : 'bg-red-500/20 text-red-200 hover:bg-red-500 hover:text-white'
                                    }`}
                                title="Excluir Conta"
                            >
                                <Trash2 className="w-4 h-4" />
                                {confirmDelete && <span className="text-xs font-bold">Confirmar?</span>}
                            </button>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="p-1.5 bg-white/20 rounded-full hover:bg-white/30 text-white"
                            >
                                <X className="w-4 h-4" />
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="p-1.5 bg-white text-black rounded-full hover:bg-white/90"
                            >
                                <Check className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <div className="flex justify-between items-start relative z-10">
                        <div className="flex items-center gap-2">
                            <BankLogo bankName={account.name} className="w-5 h-5 opacity-80" />
                            <span className="text-white/90 font-medium text-sm">{account.name}</span>
                        </div>
                        {account.id !== 'all' && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="text-white/60 hover:text-white transition-colors p-1"
                            >
                                <Pencil className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    <div className="relative z-10">
                        {/* Default rendering for regular accounts */}

                        <>
                            <p className="text-white/80 text-xs mb-0.5">
                                {account.type === 'credit' || account.balance < 0 ? 'Fatura Atual' : 'Saldo Atual'}
                            </p>
                            <p className={`text-white font-bold text-2xl ${(account.type === 'credit' || account.balance < 0) && account.balance < 0 ? 'text-red-200' : ''} ${isPrivacyMode ? 'blur-md' : ''}`}>
                                R$ {Math.abs(account.balance).toFixed(2)}
                            </p>
                        </>
                    </div>
                </>
            )}

            <style jsx>{`
                .account-card-stacked::before,
                .account-card-stacked::after {
                    content: '';
                    position: absolute;
                    left: 0;
                    right: 0;
                    height: 100%;
                    border-radius: 1rem;
                    background: linear-gradient(135deg, var(--card-color) 0%, color-mix(in srgb, var(--card-color) 90%, black) 100%);
                    transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
                    z-index: -1;
                }

                .account-card-stacked::before {
                    top: 6px;
                    transform: scale(0.95);
                    opacity: 0.6;
                }

                .account-card-stacked::after {
                    top: 12px;
                    transform: scale(0.90);
                    opacity: 0.3;
                }

                .account-card-stacked:hover::before {
                    top: 8px;
                    transform: scale(0.96);
                    opacity: 0.7;
                }

                .account-card-stacked:hover::after {
                    top: 16px;
                    transform: scale(0.92);
                    opacity: 0.4;
                }
            `}</style>
        </div>
    );
}
