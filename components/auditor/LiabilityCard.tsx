import React, { useState } from 'react';
import { usePrivacy } from '@/lib/privacy-context';
import { TimelineLog } from './TimelineLog';

interface LiabilityCardProps {
    type: 'credit' | 'fixed';
    name: string;
    value: number; // Consumed / Expense Amount
    total?: number; // Total Limit (for credit)
    info: string;
    status?: string;
    transactions?: any[]; // For the timeline
    closingDay?: number;
}

export const LiabilityCard = ({ type, name, value, total, info, status, transactions = [], closingDay }: LiabilityCardProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const { isPrivacyMode } = usePrivacy();

    // RENDER: FIXED EXPENSE (STRUCTURAL / SLATE)
    if (type === 'fixed') {
        const isIncome = status === 'ENTRADA' || status === 'PREVISTO';
        // Note: For income we might stick to green, but user focused on Fixed Expense (Aluguel/Netflix).
        // Let's assume this specific design is for Expenses. If it's income, we use a slight variation or keep old green if preferred.
        // For now, adhering to the "Slate" request for Fixed Expenses. If it's Income, I'll allow a override check.

        if (isIncome) {
            return (
                <div className="monk-card" style={{ borderLeftColor: '#10B981' }}>
                    <div className="card-header">
                        <div className="target-info" style={{ color: '#10B981' }}>
                            <span>+</span>
                            <span className="target-label">&gt; FONTE: <strong className="text-white">{name.toUpperCase()}</strong></span>
                        </div>
                        <span className="badge-fixed" style={{ borderColor: '#10B981', color: '#10B981', background: 'rgba(16, 185, 129, 0.1)' }}>
                            {status || 'ENTRADA'}
                        </span>
                    </div>
                    <div className="card-body">
                        <div className="data-group">
                            <small className="label-muted">VALOR RECEBIDO</small>
                            <div className={`value-mono transition-all duration-300 ${isPrivacyMode ? 'blur-sm select-none' : ''}`} style={{ color: '#10B981' }}>
                                R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                        </div>
                    </div>
                    <div className="card-footer">
                        <span className="footer-info text-[#10B981]">{info}</span>
                    </div>
                </div>
            );
        }

        return (
            <div className="monk-card fixed-expense">
                <div className="card-header">
                    <div className="target-info">
                        <span>🔒</span>
                        <span className="target-label">&gt; ALVO: <strong className="text-white">{name.toUpperCase()}</strong></span>
                    </div>
                    <span className="badge-fixed">
                        ESTRUTURAL
                    </span>
                </div>

                <div className="card-body">
                    <div className="data-group">
                        <small className="label-muted">VALOR COMPROMETIDO</small>
                        <div className={`value-mono transition-all duration-300 ${isPrivacyMode ? 'blur-sm select-none' : ''}`}>
                            R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                    </div>
                </div>

                <div className="card-footer">
                    <span className="footer-info">{info}</span>
                    <div className="progress-track">
                        <div className="progress-fill" style={{ width: '100%' }}></div>
                    </div>
                </div>
            </div>
        );
    }

    // RENDER: CREDIT CARD (DANGER / RED)
    // Using the previous design but wrapped/integrated cleanly 
    return (
        <div className="mb-3">
            <div
                onClick={() => setIsOpen(true)}
                className={`
                    bg-[#0a0a0a] 
                    border-l-[3px] border-l-[#FF3333]
                    border-r border-t border-b border-[#222]
                    p-0 flex flex-col 
                    font-mono transition-all hover:bg-[#111] hover:border-[#333]
                    rounded-sm group relative overflow-hidden cursor-pointer
                `}
            >
                {/* Header Strip */}
                <div className="px-4 py-3 flex justify-between items-center border-b border-[#222]">
                    <div className="flex items-center gap-2">
                        <span className="text-[12px] font-bold text-[#FF3333] flex items-center gap-1">
                            &gt;
                            <span className="text-[10px] tracking-widest uppercase opacity-80">ALVO:</span>
                        </span>
                        <span className="text-sm font-bold text-white tracking-wider">{name.toUpperCase()}</span>
                    </div>
                    {status && (
                        <div className="border border-[#333] px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-[#666] bg-black font-bold">
                            {status}
                        </div>
                    )}
                </div>

                {/* Data Grid */}
                <div className="p-4 grid grid-cols-2 gap-4">
                    <div>
                        <span className="text-[9px] uppercase tracking-wider block mb-1 text-[#FF3333] opacity-80">
                            CONSUMIDO
                        </span>
                        <span className={`text-sm font-bold text-[#FF3333] transition-all duration-300 ${isPrivacyMode ? 'blur-sm select-none' : ''}`}>
                            R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                    </div>

                    {total && (
                        <div>
                            <span className="text-[9px] text-[#666] uppercase tracking-wider block mb-1">
                                RESTANTE
                            </span>
                            <span className={`text-sm font-bold text-[#88ccff] transition-all duration-300 ${isPrivacyMode ? 'blur-sm select-none' : ''}`}>
                                R$ {(total - value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    )}

                    <div className="col-span-2 pt-2 border-t border-[#222] mt-1 flex justify-between items-center">
                        <span className="text-[9px] text-[#555] uppercase tracking-widest font-bold">
                            {info}
                        </span>
                        {transactions.length > 0 && (
                            <span className="text-[9px] text-[#666] group-hover:text-[#FF3333] transition-colors uppercase tracking-widest font-bold">
                                [+] INSPECIONAR LOG
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* TIMELINE MODAL */}
            {isOpen && (
                <TimelineLog
                    transactions={transactions}
                    total={value}
                    cardName={name}
                    closingDay={closingDay}
                    onClose={(e: any) => {
                        if (e) e.stopPropagation();
                        setIsOpen(false);
                    }}
                />
            )}
        </div>
    );
};
