'use client';

import React, { useEffect, useState } from 'react';
import { Terminal, Cpu, ShieldCheck } from 'lucide-react';

interface MonkForgeProps {
    moduleName?: string;
    description?: string;
    fullScreen?: boolean;
}

const LOG_MESSAGES = [
    "INICIANDO PROTOCOLO DE CONSTRUÇÃO...",
    "CARREGANDO MÓDULO DE SEGURANÇA [OK]",
    "ALOCANDO RECURSOS DE GPU...",
    "OTIMIZANDO BANCO DE DADOS ORACLE...",
    "DEFININDO VARIÁVEIS DE AMBIENTE...",
    "COMPILANDO INTERFACE VISUAL...",
    "CALIBRANDO ALGORITMOS...",
    "VERIFICANDO INTEGRIDADE DE DADOS...",
    "SINCRONIZANDO COM A REDE NEURAL...",
    "[STATUS: FORJANDO...]"
];

export default function MonkForge({
    moduleName = "MÓDULO DESCONHECIDO",
    description = "Este território está sendo mapeado.",
    fullScreen = false
}: MonkForgeProps) {
    const [logs, setLogs] = useState<string[]>([]);
    const [progress, setProgress] = useState(0);

    // Efeito de Logs (Terminal)
    useEffect(() => {
        let currentIndex = 0;
        const interval = setInterval(() => {
            if (currentIndex < LOG_MESSAGES.length) {
                setLogs(prev => [...prev, LOG_MESSAGES[currentIndex]]);
                currentIndex++;
            } else {
                // Loop dos últimos 3 logs para parecer ativo
                const randomMsg = ["OTIMIZANDO...", "CALCULANDO...", "POLINDO PIXELS..."][Math.floor(Math.random() * 3)];
                setLogs(prev => [...prev.slice(1), randomMsg]);
            }
        }, 800);

        return () => clearInterval(interval);
    }, []);

    // Efeito de Progresso
    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => (prev < 99 ? prev + 1 : prev));
        }, 300);
        return () => clearInterval(interval);
    }, []);

    const containerClasses = fullScreen
        ? "fixed inset-0 z-50 bg-[#050505]"
        : "w-full h-full min-h-[400px] bg-[#050505] rounded-xl border border-[#333] relative overflow-hidden";

    return (
        <div className={`${containerClasses} flex flex-col items-center justify-center text-white font-mono p-6`}>
            {/* Scanline Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.5)_51%)] bg-[size:100%_4px] z-10"></div>
            <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_center,transparent_0%,#000_100%)] z-10"></div>

            {/* Conteúdo Central */}
            <div className="w-full max-w-lg relative z-20">

                {/* Cabeçalho */}
                <div className="flex items-center gap-2 mb-8 text-[#10B981] animate-pulse">
                    <Terminal size={24} />
                    <span className="text-xl font-bold tracking-widest">MONK.FORGE_v1.0</span>
                </div>

                {/* Área de Log (Terminal) */}
                <div className="bg-black/50 border border-[#10B981]/30 rounded-lg p-4 h-48 overflow-hidden mb-6 relative">
                    <div className="absolute top-2 right-2 flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    </div>
                    <div className="flex flex-col justify-end h-full">
                        {logs.slice(-6).map((log, i) => (
                            <div key={i} className="text-xs text-[#10B981]/80 mb-1">
                                {`> ${log}`}
                            </div>
                        ))}
                        <div className="h-4 w-2 bg-[#10B981] animate-blink mt-1"></div>
                    </div>
                </div>

                {/* Status Principal */}
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">{moduleName}</h2>
                    <p className="text-gray-400 text-sm">{description}</p>
                </div>

                {/* Barra de Progresso Infinita */}
                <div className="w-full h-1 bg-[#333] rounded-full overflow-hidden relative">
                    <div
                        className="h-full bg-[#10B981] shadow-[0_0_10px_#10B981]"
                        style={{ width: `${progress}%`, transition: 'width 0.3s ease' }}
                    ></div>
                </div>
                <div className="flex justify-between text-[10px] text-gray-500 mt-2 uppercase tracking-wider">
                    <span>Status: OPERACIONAL</span>
                    <span>{progress}%</span>
                </div>

            </div>

            {/* Footer */}
            <div className="absolute bottom-6 text-[10px] text-gray-600 tracking-[0.3em]">
                SECURED BY THE ORDER PROTOCOL
            </div>
        </div>
    );
}
