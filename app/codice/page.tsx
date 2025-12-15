'use client';
import React, { useEffect, useState } from 'react';
import MonkForge from '@/components/MonkForge';
import { useRouter } from 'next/navigation';
import { Activity, Shield, Terminal, ArrowLeft } from 'lucide-react';

export default function MonkCodicePage() {
    const router = useRouter();
    const [riskData, setRiskData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Import supabase client dynamically
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
            } catch (error) {
                console.error("Error loading risk data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#020604] flex items-center justify-center">
                <div className="text-[#047857] animate-pulse font-mono tracking-widest text-xs">
                    ACESSANDO REGISTROS AKÁSHICOS...
                </div>
            </div>
        );
    }

    if (!riskData) {
        return (
            <MonkForge
                fullScreen={true}
                moduleName="CÓDICE MONK"
                description="Nenhum relatório de risco encontrado nos arquivos da Ordem. Aguarde a próxima calibração."
                onClose={() => router.back()}
            />
        );
    }

    // Color Logic (Same as Widget but expanded)
    const riskLevel = riskData.matriz_liquidez?.nivel_risco || "MODERADO";
    const isCritical = riskLevel === 'Alto' || riskLevel === 'CRÍTICO';
    const isModerate = riskLevel === 'Médio' || riskLevel === 'MODERADO';

    let colorClass = isCritical ? 'text-red-500' : isModerate ? 'text-yellow-500' : 'text-[#10B981]';
    let borderColorClass = isCritical ? 'border-red-900' : isModerate ? 'border-yellow-700' : 'border-[#047857]';
    let bgColorClass = isCritical ? 'bg-red-950/20' : isModerate ? 'bg-yellow-950/20' : 'bg-[#047857]/10';

    return (
        <div className="min-h-screen bg-[#020604] text-gray-300 font-sans p-6 md:p-12">
            {/* Header */}
            <header className="max-w-4xl mx-auto mb-12 flex justify-between items-center border-b border-[#333] pb-6">
                <div>
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-xs text-gray-500 mb-4 hover:text-[#D4AF37] transition-colors uppercase tracking-widest"
                    >
                        <ArrowLeft size={12} />
                        <span>Voltar</span>
                    </button>
                    <h1 className={`text-2xl md:text-3xl font-serif font-bold tracking-tight mb-2 ${colorClass}`}>
                        Códice de Risco
                    </h1>
                    <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-widest font-mono">
                        <Terminal size={12} />
                        <span>Protocolo de Presciência v.ALPHA_3</span>
                    </div>
                </div>
                <div className={`
                    px-4 py-2 rounded border ${borderColorClass} ${bgColorClass} ${colorClass}
                    font-bold uppercase tracking-widest text-xs
                `}>
                    {riskLevel}
                </div>
            </header>

            {/* Grid */}
            <main className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* 1. Matriz de Liquidez */}
                <section className="bg-black/40 border border-[#333] rounded-xl p-6 relative overflow-hidden group hover:border-gray-700 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Activity size={40} />
                    </div>
                    <h2 className="text-sm font-bold text-[#D4AF37] uppercase tracking-widest mb-6 border-b border-[#333] pb-2 inline-block">
                        Matriz de Liquidez
                    </h2>

                    <div className="space-y-6">
                        <div>
                            <span className="text-[10px] text-gray-500 uppercase block mb-1">Risco Imediato</span>
                            <span className={`text-xl font-mono ${riskData.matriz_liquidez.nivel_risco === 'Alto' ? 'text-red-500' : 'text-green-500'}`}>
                                {riskData.matriz_liquidez.nivel_risco}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#111] p-3 rounded border border-[#222]">
                                <span className="text-[10px] text-gray-500 block mb-1">Prob. Insolvência</span>
                                <span className="text-white font-mono">{riskData.matriz_liquidez.probabilidade_insolvencia}/10</span>
                            </div>
                            <div className="bg-[#111] p-3 rounded border border-[#222]">
                                <span className="text-[10px] text-gray-500 block mb-1">Impacto Orç.</span>
                                <span className="text-white font-mono">{riskData.matriz_liquidez.impacto_orcamento}/10</span>
                            </div>
                        </div>

                        <p className="text-sm text-gray-400 leading-relaxed font-serif border-l-2 border-[#333] pl-4">
                            "{riskData.matriz_liquidez.analise_curta}"
                        </p>
                    </div>
                </section>

                {/* 2. Matriz Estrutural */}
                <section className="bg-black/40 border border-[#333] rounded-xl p-6 relative overflow-hidden group hover:border-gray-700 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Shield size={40} />
                    </div>
                    <h2 className="text-sm font-bold text-[#D4AF37] uppercase tracking-widest mb-6 border-b border-[#333] pb-2 inline-block">
                        Matriz Estrutural
                    </h2>

                    <div className="space-y-6">
                        <div>
                            <span className="text-[10px] text-gray-500 uppercase block mb-1">Tendência Patrimonial</span>
                            <span className="text-xl font-mono text-yellow-500">
                                {riskData.matriz_estrutural.tendencia_patrimonial}
                            </span>
                        </div>

                        <div className="bg-[#111] p-3 rounded border border-[#222]">
                            <span className="text-[10px] text-gray-500 block mb-1">Resiliência (Meses)</span>
                            <span className="text-white font-mono text-lg">{riskData.matriz_estrutural.resiliencia_meses} meses</span>
                        </div>

                        <p className="text-sm text-gray-400 leading-relaxed font-serif border-l-2 border-[#333] pl-4">
                            "{riskData.matriz_estrutural.analise_curta}"
                        </p>
                    </div>
                </section>

            </main>

            <footer className="max-w-4xl mx-auto mt-12 text-center border-t border-[#333] pt-8">
                <p className="text-[10px] text-gray-600 font-mono uppercase tracking-widest">
                    Monk Finance &bull; Sistema de Vigilância Ativo
                </p>
            </footer>
        </div>
    );
}
