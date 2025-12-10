'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, BrainCircuit, ShieldAlert, Star, ArrowRight, Activity } from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans overflow-x-hidden selection:bg-[#10B981] selection:text-black">

            {/* --- BACKGROUND EFFECTS --- */}
            <div className="fixed inset-0 z-0">
                {/* Noise Texture Overlay */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-[1]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

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
                    <span className="text-white font-serif italic">Assuma o Comando.</span>
                </h1 >

                <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-200">
                    Arquitetura financeira para mentes estoicas. Uma inteligência coletiva projetada para blindar patrimônio e eliminar o ruído.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
                    <Link href="/register" className="group relative px-8 py-4 bg-[#10B981] text-black font-bold rounded-xl text-lg w-full md:w-auto overflow-hidden shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] transition-all">
                        <div className="absolute inset-0 w-full h-full bg-white/20 group-hover:translate-x-full transition-transform duration-500 skew-x-12 -ml-4"></div>
                        <span className="relative flex items-center justify-center gap-2">
                            Inicializar Protocolo <ArrowRight size={20} />
                        </span>
                    </Link>

                    <Link href="/about" className="text-gray-400 hover:text-white underline underline-offset-4 hover:decoration-[#10B981] transition-all text-sm uppercase tracking-widest font-mono">
                        Ler o Manifesto
                    </Link>
                </div>

            </main >

            {/* --- THE OPERATIVES (Grid de Features) --- */}
            < section className="relative z-10 px-6 pb-32 max-w-7xl mx-auto" >
                <div className="mb-12 flex items-end justify-between border-b border-[#222] pb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white font-serif">Os Operadores</h2>
                        <p className="text-gray-500 text-sm font-mono">Conheça as IAs que trabalharão para você.</p>
                    </div>
                    <Activity size={24} className="text-[#10B981]" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Card 1: Monk.Vault */}
                    <div className="group bg-[#0A0A0A] border border-[#222] p-8 rounded-3xl hover:border-[#10B981] hover:shadow-[0_0_30px_rgba(16,185,129,0.05)] transition-all duration-500 relative overflow-hidden md:col-span-2">
                        <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                            <ShieldCheck size={120} className="text-[#10B981]" />
                        </div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-[#10B981]/10 rounded-xl flex items-center justify-center mb-6 border border-[#10B981]/20 group-hover:scale-110 transition-transform">
                                <ShieldCheck size={24} className="text-[#10B981]" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2 font-mono">Monk.Vault_v1</h3>
                            <p className="text-gray-400 max-w-md text-sm">
                                O guardião central. Centralize todas as suas contas, cartões e patrimônio em uma fortaleza criptografada. O caos externo não entra aqui.
                            </p>
                        </div>
                    </div>

                    {/* Card 2: Monk.AI */}
                    <div className="group bg-[#0A0A0A] border border-[#222] p-8 rounded-3xl hover:border-[#8B5CF6] hover:shadow-[0_0_30px_rgba(139,92,246,0.05)] transition-all duration-500 relative overflow-hidden">
                        <div className="absolute -bottom-4 -right-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                            <BrainCircuit size={100} className="text-[#8B5CF6]" />
                        </div>
                        <div className="w-12 h-12 bg-[#8B5CF6]/10 rounded-xl flex items-center justify-center mb-6 border border-[#8B5CF6]/20">
                            <BrainCircuit size={24} className="text-[#8B5CF6]" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2 font-mono">Monk.AI_Core</h3>
                        <p className="text-gray-400 text-sm">
                            Inteligência tática. Analisa seus dados e sugere movimentos precisos para maximizar seus recursos.
                        </p>
                    </div>

                    {/* Card 3: Monk.Sentry */}
                    <div className="group bg-[#0A0A0A] border border-[#222] p-8 rounded-3xl hover:border-[#FF4B4B] hover:shadow-[0_0_30px_rgba(255,75,75,0.05)] transition-all duration-500 relative overflow-hidden">
                        <div className="absolute -bottom-4 -right-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                            <ShieldAlert size={100} className="text-[#FF4B4B]" />
                        </div>
                        <div className="w-12 h-12 bg-[#FF4B4B]/10 rounded-xl flex items-center justify-center mb-6 border border-[#FF4B4B]/20">
                            <ShieldAlert size={24} className="text-[#FF4B4B]" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2 font-mono">Monk.Sentry_Guard</h3>
                        <p className="text-gray-400 text-sm">
                            Vigilância ativa. Detecta drenagens financeiras e riscos ocultos antes que afetem sua integridade.
                        </p>
                    </div>

                    {/* Card 4: Monk.Vision (antigo Wish) */}
                    <div className="group bg-[#0A0A0A] border border-[#222] p-8 rounded-3xl hover:border-[#6CA8FF] hover:shadow-[0_0_30px_rgba(108,168,255,0.05)] transition-all duration-500 relative overflow-hidden md:col-span-2">
                        <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                            <Star size={120} className="text-[#6CA8FF]" />
                        </div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-[#6CA8FF]/10 rounded-xl flex items-center justify-center mb-6 border border-[#6CA8FF]/20 group-hover:scale-110 transition-transform">
                                <Star size={24} className="text-[#6CA8FF]" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2 font-mono">Monk.Vision_Target</h3>
                            <p className="text-gray-400 max-w-md text-sm">
                                O visionário. Transforma intenção em estratégia matemática. Materialize metas, não sonhos.
                            </p>
                        </div>
                    </div>

                </div>
            </section >

            {/* --- THE ACCESS PASS (PREÇO - Keycard Design) --- */}
            < section className="relative z-10 py-32 px-6" >
                <div className="max-w-4xl mx-auto bg-[#0A0A0A] border border-[#222] rounded-xl p-0 relative overflow-hidden group hover:border-[#10B981] transition-all duration-500 flex flex-col md:flex-row shadow-2xl">

                    {/* Left: Identification Visuals */}
                    <div className="bg-[#0F0F0F] p-8 border-r border-[#222] w-full md:w-1/3 flex flex-col justify-between relative overflow-hidden">
                        <div className="z-10">
                            <div className="text-[#10B981] font-mono text-xs uppercase tracking-[0.3em] mb-4 opacity-70">
                                Access_Level: Initiate
                            </div>
                            <Image src="/logo.png" alt="O." width={64} height={64} className="mb-4 opacity-50 grayscale group-hover:grayscale-0 transition-all duration-500" />
                        </div>

                        {/* Fake Barcode */}
                        <div className="z-10 mt-12 opacity-30">
                            <div className="flex gap-1 h-8 items-end">
                                <div className="w-1 bg-white h-full"></div>
                                <div className="w-2 bg-white h-2/3"></div>
                                <div className="w-1 bg-white h-full"></div>
                                <div className="w-3 bg-white h-1/2"></div>
                                <div className="w-1 bg-white h-full"></div>
                                <div className="w-4 bg-white h-3/4"></div>
                                <div className="w-1 bg-white h-full"></div>
                            </div>
                            <p className="font-mono text-[10px] text-gray-500 mt-2">ID: #882-991-MNK</p>
                        </div>

                        {/* Background Pattern */}
                        <div className="absolute inset-0 bg-[linear-gradient(45deg,#111_25%,transparent_25%,transparent_75%,#111_75%,#111),linear-gradient(45deg,#111_25%,transparent_25%,transparent_75%,#111_75%,#111)] bg-[length:20px_20px] bg-[position:0_0,10px_10px] opacity-10"></div>
                    </div>

                    {/* Right: Content */}
                    <div className="p-12 w-full md:w-2/3 relative">
                        {/* Glow Effect */}
                        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#10B981] opacity-[0.05] blur-[100px] rounded-full pointer-events-none"></div>

                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tighter font-serif">
                                Protocolo de Iniciação.
                            </h2>

                            <div className="flex items-end gap-1 mb-6">
                                <span className="text-xl text-gray-500 font-medium relative top-[-6px]">R$</span>
                                <span className="text-6xl font-bold text-white tracking-tighter">0,99</span>
                                <span className="text-sm text-gray-500 mb-2 ml-2">/ mês</span>
                            </div>

                            <p className="text-gray-400 text-sm mb-8 font-mono border-l-2 border-[#10B981] pl-4">
                                Custo simbólico de validação. Apenas para separar curiosos de iniciados.
                            </p>

                            <Link href="/register" className="inline-flex items-center gap-3 px-8 py-3 bg-[#10B981] text-black font-bold rounded-lg text-sm uppercase tracking-widest hover:bg-[#0EA572] transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:translate-x-1">
                                Obter Acesso Agora <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>

                </div>
            </section >

            {/* --- FOOTER SIMPLES --- */}
            < footer className="border-t border-[#222] py-16 text-center relative z-10 bg-[#050505]" >
                <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">

                    <p className="text-gray-600 text-xs tracking-widest uppercase mb-4 font-mono">
                        Secured by Oracle Cloud Infrastructure
                    </p>

                    <h2 className="text-2xl font-bold text-white mb-8 font-serif italic text-[#10B981]/80">
                        "Amor Fati"
                    </h2>

                    <Link href="/register" className="text-gray-400 hover:text-white text-sm transition-colors">
                        Iniciar cadastro gratuito
                    </Link>

                    <p className="text-gray-700 text-[10px] mt-12 font-mono">
                        © 2025 The Order System. Todos os direitos reservados. Protocolo Seguro.
                    </p>
                </div>
            </footer >

        </div >
    );
}
