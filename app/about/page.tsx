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
            <main className="max-w-3xl mx-auto relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">

                {/* Header */}
                <div className="text-center mb-16">
                    <Link href="/" className="inline-flex items-center gap-2 text-xs text-gray-500 hover:text-[#10B981] transition-colors mb-8 uppercase tracking-widest">
                        <ArrowLeft size={14} /> Retornar à Base
                    </Link>

                    <div className="flex justify-center mb-6">
                        <Shield size={48} className="text-[#10B981] opacity-80" />
                    </div>

                    <h1 className="text-4xl md:text-6xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-700">
                        O Manifesto.
                    </h1>
                </div>

                {/* Text Body */}
                <div className="space-y-12 text-lg md:text-xl leading-relaxed text-gray-400 text-justify">

                    <section>
                        <h2 className="text-white text-2xl font-bold mb-4 flex items-center gap-3">
                            <span className="text-[#10B981]">01.</span> O Caos
                        </h2>
                        <p>
                            O sistema financeiro tradicional foi desenhado para ser confuso. Taxas ocultas, interfaces lentas, letras miúdas. Eles lucram com a sua desatenção. Eles dependem do seu caos pessoal para manter o controle. Enquanto você luta para organizar suas contas, eles constroem impérios com o seu dinheiro.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-white text-2xl font-bold mb-4 flex items-center gap-3">
                            <span className="text-[#10B981]">02.</span> A Ordem
                        </h2>
                        <p>
                            Acreditamos que o controle financeiro é a forma mais pura de liberdade. "The Order" não é apenas um app. É uma doutrina. É a retomada do controle. Nossos agentes (Monks) não dormem, não erram e não têm piedade com desperdícios. Nós trazemos clareza onde havia neblina.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-white text-2xl font-bold mb-4 flex items-center gap-3">
                            <span className="text-[#10B981]">03.</span> O Protocolo
                        </h2>
                        <p>
                            Ao entrar para a Ordem, você deixa de ser um passageiro e assume o comando. Centralize tudo. Automatize o chato. Visualize o futuro. Nós fornecemos as armas; você vence a guerra.
                        </p>
                    </section>

                </div>

                {/* Footer / CTA */}
                <div className="mt-20 text-center border-t border-[#222] pt-12">
                    <p className="text-sm text-gray-500 mb-6 uppercase tracking-widest">
                        Você está pronto para assumir o comando?
                    </p>
                    <Link href="/register" className="inline-flex items-center gap-3 px-8 py-4 bg-[#10B981] text-black font-bold rounded-xl text-lg hover:bg-[#0EA572] transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] group">
                        Inicializar Protocolo <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

            </main>

        </div>
    );
}
