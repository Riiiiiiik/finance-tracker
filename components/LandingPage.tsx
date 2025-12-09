'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, BrainCircuit, ShieldAlert, Star, ArrowRight, Activity } from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans overflow-x-hidden selection:bg-[#10B981] selection:text-black">

            {/* --- BACKGROUND EFFECTS --- */}
            <div className="fixed inset-0 z-0">
                {/* Grid Tático */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]"></div>
                {/* Spotlights */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#10B981] opacity-5 blur-[120px] rounded-full pointer-events-none"></div>
                <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#8B5CF6] opacity-5 blur-[150px] rounded-full pointer-events-none"></div>
            </div>

            {/* --- NAVBAR --- */}
            <nav className="relative z-50 flex justify-between items-center px-6 py-6 max-w-7xl mx-auto">
                <div className="flex items-center gap-2">
                    <Image src="/logo.png" alt="O." width={32} height={32} className="rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.4)]" />
                    <span className="font-bold tracking-tight text-lg">The Order</span>
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors font-medium">
                        Acessar Terminal
                    </Link>
                    <Link href="/register" className="bg-[#161616] border border-[#333] hover:border-[#10B981] hover:text-[#10B981] text-white px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300">
                        Solicitar Acesso
                    </Link>
                </div>
            </nav >

            {/* --- HERO SECTION --- */}
            < main className="relative z-10 pt-20 pb-32 px-6 max-w-7xl mx-auto text-center" >



                {/* Headline */}
                < h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-600 animate-in fade-in slide-in-from-bottom-8 duration-1000" >
                    Domine o Caos.< br />
                    <span className="text-white">Assuma o Comando.</span>
                </h1 >

                <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-200">
                    Não é apenas um banco. É uma inteligência coletiva de agentes (Monks) projetada para blindar seu patrimônio e materializar seu futuro.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
                    <Link href="/register" className="group relative px-8 py-4 bg-[#10B981] text-black font-bold rounded-xl text-lg w-full md:w-auto overflow-hidden">
                        <div className="absolute inset-0 w-full h-full bg-white/20 group-hover:translate-x-full transition-transform duration-500 skew-x-12 -ml-4"></div>
                        <span className="relative flex items-center justify-center gap-2">
                            Inicializar Protocolo <ArrowRight size={20} />
                        </span>
                    </Link>

                    <Link href="/about" className="px-8 py-4 bg-transparent border border-[#333] hover:bg-[#161616] hover:border-gray-500 text-white font-medium rounded-xl text-lg w-full md:w-auto transition-all flex items-center justify-center gap-2">
                        Ler o Manifesto
                    </Link>
                </div>

            </main >

            {/* --- THE OPERATIVES (Grid de Features) --- */}
            < section className="relative z-10 px-6 pb-32 max-w-7xl mx-auto" >
                <div className="mb-12 flex items-end justify-between border-b border-[#222] pb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Os Operadores</h2>
                        <p className="text-gray-500 text-sm">Conheça as IAs que trabalharão para você.</p>
                    </div>
                    <Activity size={24} className="text-[#10B981]" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Card 1: Monk.Vault */}
                    <div className="group bg-[#0A0A0A] border border-[#222] p-8 rounded-3xl hover:border-[#10B981] transition-all duration-500 relative overflow-hidden md:col-span-2">
                        <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                            <ShieldCheck size={120} className="text-[#10B981]" />
                        </div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-[#10B981]/10 rounded-xl flex items-center justify-center mb-6 border border-[#10B981]/20 group-hover:scale-110 transition-transform">
                                <ShieldCheck size={24} className="text-[#10B981]" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Monk.Vault</h3>
                            <p className="text-gray-400 max-w-md">
                                O guardião central. Centralize todas as suas contas, cartões e patrimônio em uma fortaleza criptografada. O caos externo não entra aqui.
                            </p>
                        </div>
                    </div>

                    {/* Card 2: Monk.AI */}
                    <div className="group bg-[#0A0A0A] border border-[#222] p-8 rounded-3xl hover:border-[#8B5CF6] transition-all duration-500 relative overflow-hidden">
                        <div className="absolute -bottom-4 -right-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                            <BrainCircuit size={100} className="text-[#8B5CF6]" />
                        </div>
                        <div className="w-12 h-12 bg-[#8B5CF6]/10 rounded-xl flex items-center justify-center mb-6 border border-[#8B5CF6]/20">
                            <BrainCircuit size={24} className="text-[#8B5CF6]" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Monk.AI</h3>
                        <p className="text-gray-400 text-sm">
                            Inteligência tática. Analisa seus dados e sugere movimentos precisos para maximizar seus recursos.
                        </p>
                    </div>

                    {/* Card 3: Monk.Sentry */}
                    <div className="group bg-[#0A0A0A] border border-[#222] p-8 rounded-3xl hover:border-[#FF4B4B] transition-all duration-500 relative overflow-hidden">
                        <div className="absolute -bottom-4 -right-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                            <ShieldAlert size={100} className="text-[#FF4B4B]" />
                        </div>
                        <div className="w-12 h-12 bg-[#FF4B4B]/10 rounded-xl flex items-center justify-center mb-6 border border-[#FF4B4B]/20">
                            <ShieldAlert size={24} className="text-[#FF4B4B]" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Monk.Sentry</h3>
                        <p className="text-gray-400 text-sm">
                            Vigilância ativa. Detecta drenagens financeiras e riscos ocultos antes que afetem sua integridade.
                        </p>
                    </div>

                    {/* Card 4: Monk.Wish */}
                    <div className="group bg-[#0A0A0A] border border-[#222] p-8 rounded-3xl hover:border-[#6CA8FF] transition-all duration-500 relative overflow-hidden md:col-span-2">
                        <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                            <Star size={120} className="text-[#6CA8FF]" />
                        </div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-[#6CA8FF]/10 rounded-xl flex items-center justify-center mb-6 border border-[#6CA8FF]/20 group-hover:scale-110 transition-transform">
                                <Star size={24} className="text-[#6CA8FF]" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Monk.Wish</h3>
                            <p className="text-gray-400 max-w-md">
                                O visionário. Transforme impulsos momentâneos em planos de conquista sólidos. Materialize seus sonhos com estratégia, não sorte.
                            </p>
                        </div>
                    </div>

                </div>
            </section >

            {/* --- THE ACCESS PASS (PREÇO) --- */}
            < section className="relative z-10 py-32 px-6" >
                <div className="max-w-4xl mx-auto bg-[#0A0A0A] border border-[#222] rounded-3xl p-12 relative overflow-hidden text-center group hover:border-[#10B981] transition-all duration-500">

                    {/* Glow Effect */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-[#10B981]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    <div className="relative z-10">
                        <div className="inline-block px-4 py-1 rounded-full bg-[#10B981]/10 text-[#10B981] text-xs font-bold uppercase tracking-widest mb-6 border border-[#10B981]/20">
                            Oferta de Lançamento
                        </div>

                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tighter">
                            The Access Pass.
                        </h2>

                        <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10">
                            Garanta seu lugar na Ordem. Acesso ao protocolo inicial e todas as atualizações futuras da v1.0.
                        </p>

                        <div className="flex items-center justify-center gap-1 mb-10">
                            <span className="text-2xl text-gray-500 font-medium relative top-[-8px]">R$</span>
                            <span className="text-7xl md:text-8xl font-bold text-white tracking-tighter">0,99</span>
                            <span className="text-xl text-gray-500 self-end mb-4 ml-2">/ mês</span>
                        </div>

                        <Link href="/register" className="inline-flex items-center gap-3 px-10 py-5 bg-[#10B981] text-black font-bold rounded-xl text-xl hover:bg-[#0EA572] transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:scale-105 transform">
                            Obter Acesso Agora <ArrowRight size={24} />
                        </Link>

                        <p className="text-gray-600 text-xs mt-6 uppercase tracking-wider">
                            Assinatura recorrente. Cancele quando quiser.
                        </p>
                    </div>
                </div>
            </section >

            {/* --- FOOTER SIMPLES --- */}
            < footer className="border-t border-[#222] py-12 text-center relative z-10 bg-[#050505]" >
                <p className="text-[#10B981] font-mono text-xs tracking-[0.3em] uppercase mb-4">
                    Trusted by the Elite
                </p>
                <h2 className="text-3xl font-bold text-white mb-8">
                    Junte-se à Ordem hoje.
                </h2>
                <Link href="/register" className="text-gray-400 hover:text-white underline text-sm">
                    Iniciar cadastro gratuito
                </Link>
                <p className="text-gray-600 text-[10px] mt-12">
                    © 2025 The Order System. Todos os direitos reservados. Protocolo Seguro.
                </p>
            </footer >

        </div >
    );
}
