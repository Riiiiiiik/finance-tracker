import React from 'react';
import { Shield, ChevronUp, Terminal, Activity } from 'lucide-react';
import MonkForge from './MonkForge';

interface MonkRiskWidgetProps {
    riskLevel: string; // "SEGURO", "MODERADO", "CRÍTICO"
    onNavigate: () => void;
    isLoading?: boolean;
}

export default function MonkRiskWidget({ riskLevel, onNavigate, isLoading = false }: MonkRiskWidgetProps) {
    const [isExpanded, setIsExpanded] = React.useState(false);
    const [riskData, setRiskData] = React.useState<any>(null);
    const [isLoadingData, setIsLoadingData] = React.useState(false);

    const handleConsult = async () => {
        if (isExpanded) {
            setIsExpanded(false);
            return;
        }

        setIsExpanded(true);
        if (!riskData) {
            setIsLoadingData(true);
            try {
                // Import supabase client dynamically or expect it from context/props if safe
                // Assuming client-side supabase access (RLS protected)
                const { createClientComponentClient } = require('@supabase/auth-helpers-nextjs');
                const supabase = createClientComponentClient();

                const { data, error } = await supabase
                    .from('risk_profiles')
                    .select('report_json')
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                if (data) {
                    setRiskData(data.report_json);
                }
            } catch (e) {
                console.error("Error fetching risk profile", e);
            } finally {
                setIsLoadingData(false);
            }
        }
    };

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

                {/* Content Area - Collapsible */}
                {isExpanded ? (
                    <div className="mb-6 animate-in slide-in-from-bottom-2 duration-500">
                        {isLoadingData ? (
                            <div className="p-4 border border-dashed border-[#333] rounded text-center">
                                <span className={`text-xs font-mono animate-pulse ${colorClass}`}>DECIFRANDO CÓDICE...</span>
                            </div>
                        ) : riskData ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Matriz de Liquidez */}
                                <div className="bg-black/40 border border-[#333] p-3 rounded">
                                    <h4 className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Liquidez</h4>
                                    <div className="text-sm text-gray-300 font-serif mb-1">
                                        Risco: <span className={riskData.matriz_liquidez.nivel_risco === 'Alto' ? 'text-red-500' : 'text-green-500'}>{riskData.matriz_liquidez.nivel_risco}</span>
                                    </div>
                                    <p className="text-[10px] text-gray-500 leading-relaxed">
                                        {riskData.matriz_liquidez.analise_curta}
                                    </p>
                                </div>
                                {/* Matriz Estrutural */}
                                <div className="bg-black/40 border border-[#333] p-3 rounded">
                                    <h4 className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Estrutura</h4>
                                    <div className="text-sm text-gray-300 font-serif mb-1">
                                        Tendência: <span className="text-yellow-500">{riskData.matriz_estrutural.tendencia_patrimonial}</span>
                                    </div>
                                    <p className="text-[10px] text-gray-500 leading-relaxed">
                                        {riskData.matriz_estrutural.analise_curta}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 border border-dashed border-[#333] rounded text-center text-gray-500 text-xs">
                                NENHUM DADO NOS REGISTROS
                            </div>
                        )}
                    </div>
                ) : (
                    /* Default Message Log */
                    <div className="border-l-2 border-[#333] pl-4 mb-6">
                        <p className="font-mono text-xs md:text-sm text-gray-400 leading-relaxed">
                            {message}
                        </p>
                        <p className="font-mono text-[10px] text-gray-600 mt-2">
                            {'> Última calibração: AGORA'}
                        </p>
                    </div>
                )}


                {/* Action Button */}
                <button
                    onClick={handleConsult}
                    className={`
                        w-full py-3 rounded border border-[#333] 
                        hover:border-[#D4AF37] hover:text-[#D4AF37]
                        bg-black/40 hover:bg-[#D4AF37]/5
                        text-gray-400 text-xs uppercase tracking-[0.2em] font-serif
                        transition-all duration-500 flex items-center justify-center gap-2
                        group-hover:shadow-[0_0_20px_rgba(212,175,55,0.1)]
                    `}
                >
                    <span>{isExpanded ? '[ FECHAR CÓDICE ]' : '[ CONSULTAR O CÓDICE ]'}</span>
                    <ChevronUp size={14} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'group-hover:-translate-y-1'}`} />
                </button>
            </div>
        </div>
    );
}

