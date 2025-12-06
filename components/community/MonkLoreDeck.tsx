'use client';

import { useState } from 'react';
import { ShieldCheck, BrainCircuit, ShieldAlert, Star, Wallet, FileSearch, Globe } from 'lucide-react';

export default function MonkLoreDeck() {
    const [activeId, setActiveId] = useState('order'); // Começa com a Ordem aberta

    const modules = [
        {
            id: 'order',
            name: 'The Order',
            role: 'O Ecossistema',
            lore: 'A conexão central. Onde o caos externo é convertido em ordem interna.',
            func: 'Integração de Contas e Bancos.',
            color: '#A1A1AA', // Cinza/Platina
            bg: 'bg-gray-500',
            icon: <Globe size={24} />
        },
        {
            id: 'vault',
            name: 'Monk.Vault',
            role: 'O Guardião',
            lore: 'A fortaleza inexpugnável. Protege a integridade do seu império.',
            func: 'Saldo Total, Cartões e Segurança.',
            color: '#10B981', // Verde
            bg: 'bg-emerald-500',
            icon: <ShieldCheck size={24} />
        },
        {
            id: 'ai',
            name: 'Monk.AI',
            role: 'O Estrategista',
            lore: 'A mente que nunca dorme. Processa dados para gerar sabedoria.',
            func: 'Chat Inteligente e Insights.',
            color: '#8B5CF6', // Roxo
            bg: 'bg-violet-500',
            icon: <BrainCircuit size={24} />
        },
        {
            id: 'sentry',
            name: 'Monk.Sentry',
            role: 'A Sentinela',
            lore: 'O olho na torre. Detecta drenagens e ameaças antes do impacto.',
            func: 'Alertas de Gastos e Risco.',
            color: '#FF4B4B', // Vermelho
            bg: 'bg-red-500',
            icon: <ShieldAlert size={24} />
        },
        {
            id: 'wish',
            name: 'Monk.Wish',
            role: 'O Visionário',
            lore: 'O arquiteto do amanhã. Transforma impulsos em conquistas reais.',
            func: 'Metas, Sonhos e Bloqueio de Impulso.',
            color: '#6CA8FF', // Azul
            bg: 'bg-blue-400',
            icon: <Star size={24} />
        },
        {
            id: 'pockets',
            name: 'Monk.Pockets',
            role: 'O Mestre do Fluxo',
            lore: 'Agilidade tática. Aloca recursos para as batalhas do dia a dia.',
            func: 'Orçamentos Rápidos (Uber, Lazer).',
            color: '#FFD659', // Amarelo
            bg: 'bg-yellow-400',
            icon: <Wallet size={24} />
        },
        {
            id: 'auditor',
            name: 'Monk.Auditor',
            role: 'O Escriba',
            lore: 'A memória perfeita. Nada é esquecido, tudo é registrado.',
            func: 'Extratos e Histórico Detalhado.',
            color: '#3F68FF', // Indigo
            bg: 'bg-indigo-500',
            icon: <FileSearch size={24} />
        },
    ];

    return (
        <div className="w-full mt-8 mb-12">
            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4 px-1">
                Arquivos da Ordem (Lore)
            </h3>

            {/* Container do Deck */}
            <div className="flex flex-col md:flex-row gap-2 h-[450px] md:h-[300px] w-full">

                {modules.map((monk) => {
                    const isActive = activeId === monk.id;

                    return (
                        <div
                            key={monk.id}
                            onClick={() => setActiveId(monk.id)}
                            onMouseEnter={() => setActiveId(monk.id)} // Opcional: Expandir ao passar o mouse (Desktop)
                            className={`
                relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 ease-in-out border border-[#333]
                ${isActive ? 'flex-[4] bg-[#161616]' : 'flex-[1] bg-[#09090B] hover:bg-[#111]'}
              `}
                            style={{
                                borderColor: isActive ? monk.color : '#333',
                                boxShadow: isActive ? `0 0 30px ${monk.color}15` : 'none'
                            }}
                        >
                            {/* Imagem de Fundo / Brilho (Ambiental) */}
                            <div
                                className={`absolute inset-0 opacity-10 transition-opacity duration-500 ${monk.bg}`}
                                style={{ filter: 'blur(40px)' }}
                            ></div>

                            {/* CONTEÚDO */}
                            <div className="absolute inset-0 flex flex-col justify-end p-5">

                                {/* Ícone e Nome (Sempre visível, mas muda de posição/tamanho) */}
                                <div className={`flex items-center gap-3 transition-all duration-300 ${isActive ? 'mb-4' : 'justify-center md:mb-0 mb-2'}`}>
                                    <div
                                        className={`p-2 rounded-lg transition-all duration-300 shadow-lg`}
                                        style={{
                                            backgroundColor: isActive ? `${monk.color}20` : 'transparent',
                                            color: isActive ? monk.color : '#666'
                                        }}
                                    >
                                        {monk.icon}
                                    </div>

                                    {/* Título Rotacionado quando fechado (Desktop) */}
                                    <h3
                                        className={`font-bold text-lg whitespace-nowrap transition-all duration-300
                      ${isActive ? 'text-white opacity-100 translate-x-0' : 'text-gray-600 opacity-0 md:opacity-100 md:-rotate-90 md:absolute md:bottom-24 md:left-1/2 md:-translate-x-1/2 origin-center'}
                    `}
                                    >
                                        {monk.name}
                                    </h3>
                                </div>

                                {/* Texto Descritivo (Só aparece quando ativo) */}
                                <div
                                    className={`
                    overflow-hidden transition-all duration-500
                    ${isActive ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}
                  `}
                                >
                                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: monk.color }}>
                                        {monk.role}
                                    </p>
                                    <p className="text-gray-300 text-sm leading-relaxed mb-3">
                                        &quot;{monk.lore}&quot;
                                    </p>
                                    <div className="border-t border-white/10 pt-2 mt-2">
                                        <p className="text-xs text-gray-500">
                                            <span className="text-white font-semibold">Função:</span> {monk.func}
                                        </p>
                                    </div>
                                </div>

                            </div>
                        </div>
                    );
                })}

            </div>
        </div>
    );
}
