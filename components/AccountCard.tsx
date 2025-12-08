'use client';

import { useState, useEffect } from 'react';
import { Account } from '@/lib/supabase';
import { Pencil, Check, X, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

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
                        <span className="text-white/90 font-medium text-sm">{account.name}</span>
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
                        {account.id === 'all' && typeof availableBalance !== 'undefined' ? (
                            <div className="flex gap-4">
                                <div>
                                    <p className="text-white/80 text-[10px] mb-0.5">Saldo Disponível</p>
                                    <p className={`text-emerald-300 font-bold text-xl ${isPrivacyMode ? 'blur-md' : ''}`}>
                                        R$ {availableBalance.toFixed(2)}
                                    </p>
                                </div>
                                {invoiceBalance !== 0 && (
                                    <div className="border-l border-white/20 pl-4 flex flex-col justify-between">
                                        <div>
                                            <p className="text-white/80 text-[10px] mb-0.5">Fatura Atual</p>
                                            <p className={`text-red-300 font-bold text-xl ${isPrivacyMode ? 'blur-md' : ''}`}>
                                                R$ {Math.abs(invoiceBalance || 0).toFixed(2)}
                                            </p>
                                        </div>
                                        {onPayInvoice && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onPayInvoice();
                                                }}
                                                className="mt-1 text-[10px] bg-red-500/20 hover:bg-red-500/40 text-red-200 px-2 py-1 rounded transition-colors"
                                            >
                                                Pagar Fatura
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <p className="text-white/80 text-xs mb-0.5">
                                    {account.type === 'credit' || account.balance < 0 ? 'Fatura Atual' : 'Saldo Atual'}
                                </p>
                                <p className={`text-white font-bold text-2xl ${(account.type === 'credit' || account.balance < 0) && account.balance < 0 ? 'text-red-200' : ''} ${isPrivacyMode ? 'blur-md' : ''}`}>
                                    R$ {Math.abs(account.balance).toFixed(2)}
                                </p>
                            </>
                        )}

                        {/* Previsto (Saldo - Fatura) para o Total */}
                        {account.id === 'all' && typeof availableBalance !== 'undefined' && (
                            <div className="mt-2 pt-2 border-t border-white/10 flex justify-between items-center">
                                <span className="text-[10px] text-white/60">Previsto (Livre)</span>
                                <span className={`text-sm font-bold text-white ${isPrivacyMode ? 'blur-sm' : ''}`}>
                                    R$ {(availableBalance + (invoiceBalance || 0)).toFixed(2)}
                                </span>
                            </div>
                        )}
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
