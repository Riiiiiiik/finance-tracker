'use client';

import React, { useEffect, useMemo } from 'react';
import { usePrivacy } from '@/lib/privacy-context';

interface TimelineLogProps {
    transactions: any[];
    total: number;
    cardName: string;
    closingDay?: number;
    onClose: (e?: any) => void;
}

export const TimelineLog = ({ transactions, total, cardName, closingDay, onClose }: TimelineLogProps) => {
    const { isPrivacyMode } = usePrivacy();

    useEffect(() => {
        // Prevent background scrolling and HIDE DOCK
        document.body.style.overflow = 'hidden';
        const dock = document.getElementById('monk-dock-container');
        if (dock) dock.style.display = 'none';

        return () => {
            document.body.style.overflow = 'auto';
            if (dock) dock.style.display = 'block';
        };
    }, []);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).toUpperCase().replace('.', '');
    };

    // Formatting the name: Remove underscores, capitalize human-like
    const formatName = (name: string) => {
        if (!name) return 'UNNAMED_ENTRY';
        // Handle closing event specifically
        if (name === 'FECHAMENTO DE FATURA') return name;

        return name.replace(/_/g, ' ').replace(/\.EXE$/i, '').toLowerCase().replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
    };

    // PROCESS THE TIMELINE ITEMS
    const timelineItems = useMemo(() => {
        let items = [...transactions];

        // 1. Inject Closing Date if available
        if (closingDay) {
            const today = new Date();
            // Determine the closing date for the current view. 
            // Assuming transactions are recent, we try to place the closing date of the *current month*.
            // Or roughly the month of the transactions.
            // Let's use the current month for calculation as "Audit Cycle".
            const closeDate = new Date(today.getFullYear(), today.getMonth(), closingDay);
            // Make sure we are not creating weird future/past dates if today is far off? 
            // Actually, the user context is usually 'current month' view.

            // Correction: If today is Dec 17, and closing is Dec 15, the invoice for Jan is OPEN.
            // The transactions AFTER Dec 15 are for Jan. The transactions BEFORE are for Dec (closed?).
            // But the timeline shows "Recent Transactions".
            // We just want to see where the line *is*.

            // Let's ensure the closing date has a valid timestamp for sorting (e.g., end of day)
            closeDate.setHours(23, 59, 59, 999);

            items.push({
                isClosing: true,
                date: closeDate.toISOString(),
                description: 'FECHAMENTO DE FATURA',
                amount: 0,
                category: 'SYSTEM_EVENT'
            });
        }

        // 2. Sort Descending (Newest First)
        items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return items;
    }, [transactions, closingDay]);

    return (
        <div className="monk-overlay" onClick={onClose}>
            <div className="audit-report-window" onClick={(e) => e.stopPropagation()}>

                {/* HEADER: DOSSIER STYLE */}
                <div className="report-header">
                    <div>
                        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: '#fff', marginBottom: '4px' }}>
                            Dossiê: <span style={{ color: '#fff' }}>{formatName(cardName)}</span>
                        </h2>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#666', letterSpacing: '1px' }}>
                            CICLO: ATUAL | <span style={{ color: '#d4af37' }}>STATUS: EM ANÁLISE</span>
                        </div>
                    </div>
                    <button className="btn-close-monk" onClick={onClose} style={{ whiteSpace: 'nowrap', minWidth: '100px' }}>
                        [ ARQUIVAR ]
                    </button>
                </div>

                <div className="ramified-timeline">

                    {timelineItems.length > 0 ? (
                        timelineItems.map((item, i) => {
                            if (item.isClosing) {
                                return (
                                    <div key={`close-${i}`} className="tree-node future">
                                        <div className="node-content">
                                            <span className="node-time">--------------------------</span>
                                            <span className="cmd-line" style={{ color: '#666', fontSize: '12px' }}>FECHAMENTO DE FATURA</span>
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div key={i} className={`tree-node ${item.amount < 0 ? 'confirmed' : 'future'}`}>
                                    <div className="node-content">
                                        <div className="node-details">
                                            <span className="node-time">{formatDate(item.date)} • {new Date(item.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>

                                        <span className="cmd-line">{formatName(item.description || item.name)}</span>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                                            <div>
                                                {item.category && (
                                                    <span className="node-tag">{item.category}</span>
                                                )}
                                            </div>
                                            <span className={`value ${isPrivacyMode ? 'blur-sm select-none' : ''} ${item.amount < 0 ? 'debt' : 'success'}`}>
                                                {formatCurrency(item.amount)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="p-4 text-center text-[#666] italic text-xs">
                            Nenhum registro encontrado.
                        </div>
                    )}

                </div>

                <div className="report-footer">
                    TOTAL DO DOSSIÊ: <strong className={isPrivacyMode ? 'blur-sm select-none' : ''} style={{ color: '#fff', fontSize: '14px' }}>{formatCurrency(total)}</strong>
                </div>
            </div>
        </div>
    );
};
