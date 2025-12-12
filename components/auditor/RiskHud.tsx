import React from 'react';
import { usePrivacy } from '@/lib/privacy-context';

interface RiskHudProps {
    totalCommitted?: number;
    income?: number;
    cardsTotal?: number; // Debt
    cardsLimit?: number; // Total Limit
}

export const RiskHud = ({ totalCommitted = 0, income = 0, cardsTotal = 0, cardsLimit = 0 }: RiskHudProps) => {
    const { isPrivacyMode } = usePrivacy();
    const riskPercentage = income > 0 ? (totalCommitted / income) * 100 : 0;

    // Segmented Bar Logic
    const totalSegments = 20;
    const filledSegments = Math.ceil((riskPercentage / 100) * totalSegments);

    const getSegmentColor = (index: number) => {
        if (index >= filledSegments) return 'bg-[#1a1a1a]'; // Empty
        const percent = (index / totalSegments) * 100;
        if (percent < 50) return 'bg-emerald-500 shadow-[0_0_5px_#10b981]';
        if (percent < 75) return 'bg-yellow-500 shadow-[0_0_5px_#eab308]';
        return 'bg-red-600 shadow-[0_0_5px_#dc2626]';
    };

    const isCritical = riskPercentage > 65;

    return (
        <div className="mb-8 font-mono">
            {/* PASSIVE WEALTH CARD (Limit vs Debt) */}
            <div className="mb-6 bg-[#0a0a0a] border border-white/10 chamfered relative overflow-hidden">
                <div className="absolute top-0 right-0 p-1">
                    <div className="w-2 h-2 bg-red-600 animate-pulse"></div>
                </div>

                <div className="grid grid-cols-2 divide-x divide-white/10">
                    {/* Total Limit (Available Potential) */}
                    <div className="p-4">
                        <h3 className="text-[9px] text-neutral-500 tracking-[0.2em] uppercase mb-1">
                            POTENCIAL DO SISTEMA
                        </h3>
                        <div className={`text-xl font-bold text-neutral-300 tracking-wider transition-all duration-300 ${isPrivacyMode ? 'blur-sm select-none' : ''}`}>
                            R$ {cardsLimit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        <span className="text-[8px] text-neutral-600 uppercase tracking-wider block mt-1">
                            LIMITE TOTAL APROVADO
                        </span>
                    </div>

                    {/* Total Debt (Used) */}
                    <div className="p-4 bg-red-900/[0.05]">
                        <h3 className="text-[9px] text-red-500/70 tracking-[0.2em] uppercase mb-1">
                            CARGA ATIVA (DÍVIDA)
                        </h3>
                        <div className={`text-xl font-bold text-white tracking-wider transition-all duration-300 ${isPrivacyMode ? 'blur-sm select-none' : ''}`}>
                            R$ {cardsTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        <span className="text-[8px] text-red-400/50 uppercase tracking-wider block mt-1">
                            {(cardsLimit > 0 ? (cardsTotal / cardsLimit * 100).toFixed(1) : '0.0')}% UTILIZADO
                        </span>
                    </div>
                </div>
            </div>

            {/* SYSTEM LOAD HUD */}
            <div className="border border-white/10 bg-[#050505] p-5 chamfered relative overflow-hidden">

                {/* Header */}
                <div className="flex justify-between items-end mb-4">
                    <span className="text-[10px] text-neutral-500 tracking-[0.2em] uppercase">CARGA DO SISTEMA</span>
                    <span className={`text-xl font-bold text-white tracking-widest transition-all duration-300 ${isPrivacyMode ? 'blur-sm select-none' : ''}`}>
                        R$ {totalCommitted.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                </div>

                {/* Segmented Bar */}
                <div className="flex gap-1 h-3 mb-4">
                    {Array.from({ length: totalSegments }).map((_, i) => (
                        <div
                            key={i}
                            className={`flex-1 transition-all duration-300 ${getSegmentColor(i)}`}
                        />
                    ))}
                </div>

                {/* Footer Alert */}
                <div className="flex justify-between items-center text-[10px] uppercase tracking-widest">
                    {isCritical ? (
                        <span className="text-red-500 animate-pulse font-bold">
                            &gt;_ AVISO: LIMITE DE SEGURANÇA COMPROMETIDO ({riskPercentage.toFixed(0)}%)
                        </span>
                    ) : (
                        <span className="text-emerald-500">
                            &gt;_ SISTEMA ESTÁVEL ({riskPercentage.toFixed(0)}%)
                        </span>
                    )}
                    <span className="text-neutral-600">CAPACIDADE: <span className={isPrivacyMode ? 'blur-sm select-none' : ''}>{income.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></span>
                </div>
            </div>
        </div>
    );
};
