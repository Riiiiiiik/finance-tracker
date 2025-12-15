'use client';
import React, { useEffect, useState } from 'react';
import MonkForge from '@/components/MonkForge';
import { useRouter } from 'next/navigation';
import { Activity, Shield, Terminal, ArrowLeft, Hexagon, Database, ScanLine } from 'lucide-react';

export default function MonkCodicePage() {
    const router = useRouter();
    const [riskData, setRiskData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { createClientComponentClient } = require('@supabase/auth-helpers-nextjs');
                const supabase = createClientComponentClient();

                const { data } = await supabase
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
            <div className="min-h-screen bg-[#020604] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#047857]/20 via-black to-black animate-pulse"></div>
                <div className="z-10 flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-2 border-[#D4AF37]/50 border-t-[#D4AF37] rounded-full animate-spin"></div>
                    <div className="text-[#D4AF37] font-serif tracking-[0.3em] text-xs uppercase">
                        Sincronizando Códice...
                    </div>
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

    // Logic
    const riskLevel = riskData.matriz_liquidez?.nivel_risco || "MODERADO";
    const isCritical = riskLevel === 'Alto' || riskLevel === 'CRÍTICO';
    const isModerate = riskLevel === 'Médio' || riskLevel === 'MODERADO';

    const accentColor = isCritical ? 'red' : isModerate ? 'yellow' : 'emerald';
    const glowColor = isCritical ? 'rgba(220,38,38,0.3)' : isModerate ? 'rgba(234,179,8,0.3)' : 'rgba(16,185,129,0.3)';

    return (
        <div className="min-h-screen bg-[#050505] text-gray-200 font-sans relative overflow-hidden selection:bg-[#D4AF37]/30">

            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#047857]/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#D4AF37]/5 rounded-full blur-[100px]"></div>
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03]"></div>
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.8)_100%)]"></div>
            </div>

            {/* Navbar */}
            <nav className="relative z-50 px-6 py-6 flex justify-between items-center max-w-7xl mx-auto">
                <button
                    onClick={() => router.back()}
                    className="group flex items-center gap-3 text-xs md:text-sm font-medium text-gray-500 hover:text-[#D4AF37] transition-all duration-300"
                >
                    <div className="w-8 h-8 rounded-full border border-current flex items-center justify-center group-hover:bg-[#D4AF37]/10 transition-colors">
                        <ArrowLeft size={14} />
                    </div>
                    <span className="tracking-widest uppercase opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                        Retornar ao Templo
                    </span>
                </button>

                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                    <div className={`w-2 h-2 rounded-full ${isCritical ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                    <span className="text-[10px] font-mono tracking-widest text-gray-400">SISTEMA ONLINE</span>
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative z-10 max-w-5xl mx-auto px-6 pb-20 pt-8">

                {/* Header Title */}
                <header className="mb-16 text-center">
                    <div className="inline-flex flex-col items-center gap-2 mb-6">
                        <div className="w-px h-16 bg-gradient-to-b from-transparent via-[#D4AF37] to-transparent"></div>
                        <Hexagon size={24} className="text-[#D4AF37]" strokeWidth={1} />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-serif font-medium tracking-tight text-white mb-4">
                        Códice de <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#FCD34D]">Presciência</span>
                    </h1>
                    <p className="text-sm md:text-base text-gray-400 font-light max-w-xl mx-auto leading-relaxed">
                        Análise algorítmica de vulnerabilidades financeiras e projeção de estabilidade estrutural.
                    </p>
                </header>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* CARD 1: LIQUIDEZ */}
                    <div className="group relative">
                        <div className={`absolute -inset-0.5 rounded-2xl bg-gradient-to-br ${isCritical ? 'from-red-900 to-black' : 'from-emerald-900 to-black'} opacity-30 blur-lg group-hover:opacity-50 transition duration-1000`}></div>
                        <div className="relative h-full bg-[#0A0A0A] rounded-2xl border border-white/10 p-8 hover:border-white/20 transition-colors duration-500 overflow-hidden">

                            {/* Header Card */}
                            <div className="flex justify-between items-start mb-8">
                                <div className="flex items-center gap-3">
                                    <div className={`p-3 rounded-lg bg-${accentColor}-900/20 text-${accentColor}-500`}>
                                        <Activity size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-serif text-gray-200">Matriz de Liquidez</h3>
                                        <div className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Curto Prazo</div>
                                    </div>
                                </div>
                                <div className={`px-3 py-1 bg-${accentColor}-900/10 border border-${accentColor}-500/20 text-${accentColor}-400 text-xs font-bold uppercase tracking-wider rounded`}>
                                    {riskData.matriz_liquidez.nivel_risco}
                                </div>
                            </div>

                            {/* Metrics */}
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="bg-white/5 rounded-lg p-4 backdrop-blur-sm">
                                    <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Prob. Insolvência</div>
                                    <div className="text-2xl font-mono text-white flex items-baseline gap-1">
                                        {riskData.matriz_liquidez.probabilidade_insolvencia}<span className="text-sm text-gray-600">/10</span>
                                    </div>
                                    <div className="w-full h-1 bg-gray-800 mt-2 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-emerald-500 to-red-500" style={{ width: `${(riskData.matriz_liquidez.probabilidade_insolvencia * 10)}%` }}></div>
                                    </div>
                                </div>
                                <div className="bg-white/5 rounded-lg p-4 backdrop-blur-sm">
                                    <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Impacto Orç.</div>
                                    <div className="text-2xl font-mono text-white flex items-baseline gap-1">
                                        {riskData.matriz_liquidez.impacto_orcamento}<span className="text-sm text-gray-600">/10</span>
                                    </div>
                                    <div className="w-full h-1 bg-gray-800 mt-2 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-emerald-500 to-red-500" style={{ width: `${(riskData.matriz_liquidez.impacto_orcamento * 10)}%` }}></div>
                                    </div>
                                </div>
                            </div>

                            {/* Analysis Text */}
                            <div className="relative pl-6 border-l border-white/10">
                                <div className="absolute left-[-1px] top-0 h-8 w-[2px] bg-[#D4AF37]"></div>
                                <p className="text-sm text-gray-400 leading-7 font-light italic">
                                    "{riskData.matriz_liquidez.analise_curta}"
                                </p>
                            </div>

                        </div>
                    </div>

                    {/* CARD 2: ESTRUTURAL */}
                    <div className="group relative">
                        <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-black opacity-10 blur-lg group-hover:opacity-30 transition duration-1000"></div>
                        <div className="relative h-full bg-[#0A0A0A] rounded-2xl border border-white/10 p-8 hover:border-white/20 transition-colors duration-500 overflow-hidden">

                            {/* Header Card */}
                            <div className="flex justify-between items-start mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 rounded-lg bg-yellow-900/20 text-yellow-500">
                                        <Shield size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-serif text-gray-200">Matriz Estrutural</h3>
                                        <div className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Longo Prazo</div>
                                    </div>
                                </div>
                                <div className="px-3 py-1 bg-yellow-900/10 border border-yellow-500/20 text-yellow-500 text-xs font-bold uppercase tracking-wider rounded">
                                    {riskData.matriz_estrutural.tendencia_patrimonial}
                                </div>
                            </div>

                            {/* Main Graph/Metric */}
                            <div className="bg-white/5 rounded-lg p-6 mb-8 backdrop-blur-sm flex items-center justify-between">
                                <div>
                                    <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Resiliência Estimada</div>
                                    <div className="text-3xl font-mono text-white">
                                        {riskData.matriz_estrutural.resiliencia_meses} <span className="text-sm text-gray-500 font-sans">Meses</span>
                                    </div>
                                </div>
                                <div className="h-10 w-10 md:h-12 md:w-12 rounded-full border-2 border-dashed border-gray-600 animate-[spin_10s_linear_infinite] flex items-center justify-center">
                                    <div className="w-2 h-2 bg-[#D4AF37] rounded-full"></div>
                                </div>
                            </div>

                            {/* Analysis Text */}
                            <div className="relative pl-6 border-l border-white/10">
                                <div className="absolute left-[-1px] top-0 h-8 w-[2px] bg-white/50"></div>
                                <p className="text-sm text-gray-400 leading-7 font-light italic">
                                    "{riskData.matriz_estrutural.analise_curta}"
                                </p>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Footer Status */}
                <div className="mt-12 flex justify-center opacity-40 hover:opacity-100 transition-opacity duration-500">
                    <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.2em] font-mono text-gray-500">
                        <ScanLine size={14} />
                        <span>Dados Criptografados</span>
                        <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                        <span>Verificado por Oracle Bot</span>
                    </div>
                </div>

            </main>
        </div>
    );
}
