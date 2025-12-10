import React from 'react';
import { ShieldAlert, ChevronUp, Terminal, Activity } from 'lucide-react';
import MonkForge from './MonkForge';

interface MonkRiskWidgetProps {
    riskLevel: string; // "SEGURO", "MODERADO", "CRÍTICO"
    onNavigate: () => void;
    isLoading?: boolean;
}

export default function MonkRiskWidget({ riskLevel, onNavigate, isLoading = false }: MonkRiskWidgetProps) {
    // Estado local para simular "Forja" se estiver carregando ou se o risco for indefinido
    const showForge = isLoading || !riskLevel;

    if (showForge) {
        return (
            <div className="w-full rounded-xl border border-[#333] bg-[#050505] relative overflow-hidden h-[300px]">
                <MonkForge
                    moduleName="ANALISANDO RISCO..."
                    description="O Oráculo está processando seus dados financeiros."
                    fullScreen={false}
                />
            </div>
        );
    }

    const isCritical = riskLevel === 'CRÍTICO';
    const isModerate = riskLevel === 'MODERADO';
    const isSafe = riskLevel === 'SEGURO';

    let colorClass = 'text-green-500';
    let borderColorClass = 'border-green-500';
    let bgColorClass = 'bg-green-500/10';
    let message = "Protocolo Estável. Nenhuma anomalia detectada.";

    if (isCritical) {
        colorClass = 'text-red-500';
        borderColorClass = 'border-red-500';
        bgColorClass = 'bg-red-500/10';
        message = "ALERTA: Integridade Financeira Comprometida. Ação Imediata Necessária.";
    } else if (isModerate) {
        colorClass = 'text-yellow-500';
        borderColorClass = 'border-yellow-500';
        bgColorClass = 'bg-yellow-500/10';
        message = "Atenção: Padrões de consumo variáveis. Recomenda-se cautela.";
    }

    return (
        <div className={`
            w-full rounded-xl border ${borderColorClass} ${bgColorClass} 
            p-6 relative overflow-hidden font-mono
            transition-all duration-500
        `}>
            {/* Background Grid Effect */}
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <h3 className={`font-bold flex items-center gap-2 text-sm tracking-wider ${colorClass}`}>
                        <Terminal size={16} />
                        MONK_RISK_ANALYSIS
                    </h3>
                    <div className={`px-2 py-0.5 text-[10px] font-bold border rounded uppercase ${colorClass} ${borderColorClass}`}>
                        v1.0.4
                    </div>
                </div>

                <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3 rounded-full border-2 ${borderColorClass} ${colorClass} relative`}>
                        <ShieldAlert size={32} />
                        {isCritical && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>}
                    </div>
                    <div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Status do Sistema</div>
                        <div className={`text-2xl font-bold tracking-tighter ${colorClass}`}>
                            {riskLevel}
                        </div>
                    </div>
                </div>

                <div className="text-xs text-gray-400 mb-6 border-l-2 border-gray-700 pl-3 leading-relaxed">
                    {`> `}{message}
                    <br />
                    {`> `}Cálculo baseado em projeção de 30 dias.
                </div>

                <button
                    onClick={onNavigate}
                    className={`
                        w-full group relative overflow-hidden
                        border ${borderColorClass} ${colorClass}
                        hover:bg-opacity-20 hover:${bgColorClass}
                        px-4 py-3 text-xs font-bold uppercase tracking-widest
                        transition-all flex items-center justify-center gap-2
                    `}
                >
                    <span className="relative z-10 flex items-center gap-2">
                        [ VER MATRIZ TÁTICA ]
                        <ChevronUp size={14} className="group-hover:-translate-y-1 transition-transform" />
                    </span>
                </button>
            </div>
        </div>
    );
}
