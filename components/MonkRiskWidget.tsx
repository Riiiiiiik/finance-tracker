import React from 'react';
import { Shield, ChevronUp, Terminal, Activity } from 'lucide-react';
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
                    moduleName="SINTONIZANDO ORÁCULO..."
                    description="A Ordem está acessando os registros akáshicos financeiros."
                    fullScreen={false}
                />
            </div>
        );
    }

    const isCritical = riskLevel === 'CRÍTICO';
    const isModerate = riskLevel === 'MODERADO';
    const isSafe = riskLevel === 'SEGURO';

    // Paleta de Cores: Jade Profundo e Dourado Envelhecido
    const JADE = '#047857'; // Emerald 700
    const GOLD = '#D4AF37'; // Metallic Gold
    const DARK_BG = '#020604'; // Very dark green/black

    let colorClass, borderColorClass, bgColorClass, shadowClass;
    let icon, title, message;

    if (isCritical) {
        colorClass = 'text-red-500';
        borderColorClass = 'border-red-900';
        bgColorClass = 'bg-red-950/20';
        shadowClass = 'shadow-[0_0_30px_rgba(220,38,38,0.2)]';
        icon = <Activity size={32} />;
        title = "INTEGRIDADE COMPROMETIDA";
        message = "> Perturbação severa detectada. O Círculo de Proteção foi rompido.";
    } else if (isModerate) {
        colorClass = 'text-yellow-500'; // Gold/Amber
        borderColorClass = 'border-yellow-700';
        bgColorClass = 'bg-yellow-950/20';
        shadowClass = 'shadow-[0_0_30px_rgba(234,179,8,0.2)]';
        icon = <Shield size={32} />;
        title = "VIGÍLIA NECESSÁRIA";
        message = "> Oscilações no fluxo. Recomenda-se cautela nas próximas movimentações.";
    } else {
        // Safe -> Sereno (Jade)
        colorClass = 'text-[#10B981]'; // Keeping neon/jade mix for reliability
        borderColorClass = 'border-[#047857]';
        bgColorClass = 'bg-[#047857]/10';
        shadowClass = 'shadow-[0_0_30px_rgba(4,120,87,0.2)]';
        icon = <Shield size={32} />;
        title = "SERENO";
        message = "> O Fluxo permanece inalterado. Nenhuma perturbação no campo.";
    }

    return (
        <div className={`
            w-full rounded-xl border ${borderColorClass} ${bgColorClass} 
            p-6 relative overflow-hidden group
            transition-all duration-700
        `}>
            {/* Texture: Ancient Digital Paper */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}>
            </div>

            {/* Scanline subtle */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.2)_51%)] bg-[size:100%_4px] opacity-20 pointer-events-none"></div>

            <div className="relative z-10">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <h3 className={`font-mono text-xs tracking-[0.2em] uppercase opacity-70 flex items-center gap-2 ${colorClass}`}>
                        <Terminal size={12} />
                        {'>_ PROTOCOLO DE PRESCIÊNCIA'}
                    </h3>
                    <div className={`
                        px-3 py-1 text-[10px] font-bold border rounded-full uppercase tracking-widest
                        ${borderColorClass} ${colorClass} opacity-80
                    `}>
                        v.ALPHA_3
                    </div>
                </div>

                {/* Main Status */}
                <div className="flex items-center gap-6 mb-8">
                    <div className={`
                        p-4 rounded-full border border-current relative
                        ${colorClass} ${shadowClass}
                        animate-[pulse_4s_ease-in-out_infinite]
                    `}>
                        {icon}
                    </div>
                    <div>
                        <div className="text-[10px] text-[#D4AF37] uppercase tracking-[0.3em] font-serif mb-1 opacity-80">
                            Estado da Vigília
                        </div>
                        <div className={`text-3xl md:text-4xl font-serif font-bold tracking-tight ${colorClass}`}>
                            {title}
                        </div>
                    </div>
                </div>

                {/* Message Log */}
                <div className="border-l-2 border-[#333] pl-4 mb-6">
                    <p className="font-mono text-xs md:text-sm text-gray-400 leading-relaxed">
                        {message}
                    </p>
                    <p className="font-mono text-[10px] text-gray-600 mt-2">
                        {'> Última calibração: AGORA'}
                    </p>
                </div>

                {/* Action Button */}
                <button
                    onClick={onNavigate}
                    className={`
                        w-full py-3 rounded border border-[#333] 
                        hover:border-[#D4AF37] hover:text-[#D4AF37]
                        bg-black/40 hover:bg-[#D4AF37]/5
                        text-gray-400 text-xs uppercase tracking-[0.2em] font-serif
                        transition-all duration-500 flex items-center justify-center gap-2
                        group-hover:shadow-[0_0_20px_rgba(212,175,55,0.1)]
                    `}
                >
                    <span>[ CONSULTAR O CÓDICE ]</span>
                    <ChevronUp size={14} className="group-hover:-translate-y-1 transition-transform duration-300" />
                </button>
            </div>
        </div>
    );
}

