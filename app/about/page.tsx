'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight, Shield } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#10B981] selection:text-black flex flex-col items-center justify-center p-6 relative overflow-hidden">

            {/* --- BACKGROUND --- */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#10B981] opacity-[0.03] blur-[150px] rounded-full pointer-events-none"></div>

            {/* --- CONTENT --- */}
            <main className="max-w-7xl mx-auto relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 w-full">

                {/* Header */}
                <div className="text-center mb-16">
                    <Link href="/" className="inline-flex items-center gap-2 text-xs text-gray-500 hover:text-[#10B981] transition-colors mb-8 uppercase tracking-widest font-mono">
                        <ArrowLeft size={14} /> Retornar à Base
                    </Link>

                    <div className="flex justify-center mb-6">
                        <Shield size={48} className="text-[#10B981] opacity-80" />
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-700 font-serif italic">
                        The Monk Code.
                    </h1>
                </div>

                {/* Three Columns Grid (The Path) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-6xl mx-auto">

                    {/* 01. O Ruído */}
                    <section className="group bg-[#0A0A0A]/80 backdrop-blur-md border border-[#222] p-8 rounded-2xl hover:border-red-500/50 transition-all duration-500 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity duration-500">
                            <span className="text-6xl font-bold text-red-500">01</span>
                        </div>
                        <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 font-serif text-white group-hover:animate-pulse">
                            <span className="text-red-500 text-sm font-mono tracking-widest uppercase block mb-1">Passo 01</span>
                            O Ruído
                        </h2>
                        <p className="text-gray-400 font-mono text-sm leading-relaxed">
                            O mundo moderno é desenhado para a distração. O mercado financeiro lucra com a sua ansiedade, vendendo complexidade e escondendo a verdade em letras miúdas. O caos não é um erro do sistema; é a ferramenta deles para manter você reativo, emocionado e dependente.
                        </p>
                    </section>

                    {/* 02. A Clareza */}
                    <section className="group bg-[#0A0A0A]/80 backdrop-blur-md border border-[#222] p-8 rounded-2xl hover:border-[#10B981]/50 transition-all duration-500 relative overflow-hidden transform md:-translate-y-4">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity duration-500">
                            <span className="text-6xl font-bold text-[#10B981]">02</span>
                        </div>
                        <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 font-serif text-white">
                            <span className="text-[#10B981] text-sm font-mono tracking-widest uppercase block mb-1">Passo 02</span>
                            A Clareza
                        </h2>
                        <p className="text-gray-400 font-mono text-sm leading-relaxed">
                            A riqueza exige silêncio. &quot;The Order&quot; rejeita a complexidade desnecessária. Nós aplicamos a filosofia monástica aos dados: eliminar o supérfluo para revelar o essencial. Nossos agentes (Monks) não buscam apenas lucro; buscam a verdade matemática por trás de cada centavo.

                        </p>
                    </section>

                    {/* 03. A Maestria */}
                    <section className="group bg-[#0A0A0A]/80 backdrop-blur-md border border-[#222] p-8 rounded-2xl hover:border-[#F59E0B]/50 transition-all duration-500 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity duration-500">
                            <span className="text-6xl font-bold text-[#F59E0B]">03</span>
                        </div>
                        <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 font-serif text-white group-hover:text-[#F59E0B] transition-colors">
                            <span className="text-[#F59E0B] text-sm font-mono tracking-widest uppercase block mb-1">Passo 03</span>
                            A Maestria
                        </h2>
                        <p className="text-gray-400 font-mono text-sm leading-relaxed">
                            O Protocolo não é uma muleta, é uma extensão da sua vontade. Ao ativá-lo, você deixa de ser um passageiro do sistema para se tornar o arquiteto do seu futuro. Automatize o trivial. Domine o vital. Nós fornecemos a estrutura; você fornece a disciplina.
                        </p>
                    </section>
                </div>

                {/* Footer / CTA */}
                <div className="mt-20 text-center border-t border-[#222] pt-12 max-w-2xl mx-auto">
                    <p className="text-sm text-gray-500 mb-8 uppercase tracking-widest font-mono">
                        Sua jornada começa agora.
                    </p>
                    <Link href="/register" className="inline-flex items-center gap-3 px-10 py-5 bg-[#10B981] text-black font-bold rounded-xl text-xl hover:bg-[#0EA572] transition-all shadow-[0_0_30px_rgba(16,185,129,0.2)] hover:scale-105 transform group font-serif">
                        Iniciar a Transição <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

            </main>

        </div>
    );
}
