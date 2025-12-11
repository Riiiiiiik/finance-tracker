'use client';

import { Wallet, Zap, Check, Building2, CreditCard } from 'lucide-react';
import { useState } from 'react';
import { BankLogo } from '@/components/BankLogo';

export default function PocketSourcesStep() {
    const [selectedSources, setSelectedSources] = useState<string[]>([]);

    // Fontes de Recurso (Bancos)
    const sources = [
        { id: 'nubank', name: 'Nubank', color: '#820AD1' },
        { id: 'inter', name: 'Inter', color: '#FF7A00' },
        { id: 'itau', name: 'Itaú', color: '#EC7000' },
        { id: 'bradesco', name: 'Bradesco', color: '#CC092F' },
        { id: 'santander', name: 'Santander', color: '#CC0000' },
        { id: 'caixa', name: 'Caixa', color: '#005CA9' },
        { id: 'bb', name: 'Banco do Brasil', color: '#F8D117' },
        { id: 'manual', name: 'Dinheiro Vivo', color: '#10B981' }, // Carteira Física
        { id: 'c6', name: 'C6 Bank', color: '#222222' },
        { id: 'xp', name: 'XP', color: '#000000' },
        { id: 'btg', name: 'BTG', color: '#003664' },
        { id: 'ticket', name: 'Vale Refeição', color: '#D62F4A' }, // Adicionado pois é Pocket
    ];

    const toggleSource = (id: string) => {
        if (selectedSources.includes(id)) {
            setSelectedSources(selectedSources.filter(s => s !== id));
        } else {
            setSelectedSources([...selectedSources, id]);
        }
    };

    return (
        <div className="bg-[#09090B] min-h-screen flex flex-col items-center justify-center p-6 font-sans">

            {/* HEADER DO POCKET */}
            <div className="text-center mb-10 max-w-lg animate-in slide-in-from-bottom-5 duration-500">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-[#FFD659]/10 border border-[#FFD659]/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(255,214,89,0.1)] rotate-3">
                    <Wallet size={32} className="text-[#FFD659]" />
                </div>

                <div className="flex items-center justify-center gap-2 mb-2">
                    <Zap size={16} className="text-[#FFD659]" fill="#FFD659" />
                    <span className="text-[#FFD659] font-bold text-xs uppercase tracking-widest">Monk.Pockets</span>
                </div>

                <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">
                    Fontes de Recurso
                </h1>
                <p className="text-gray-400 text-sm leading-relaxed">
                    Para gerenciar seu fluxo diário, preciso saber onde o dinheiro está.
                    <br />Selecione as contas que vão abastecer seus Pockets.
                </p>
            </div>

            {/* GRID DE FONTES (Estilo Tático) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-2xl mb-10">
                {sources.map((source) => {
                    const isSelected = selectedSources.includes(source.id);

                    return (
                        <button
                            key={source.id}
                            onClick={() => toggleSource(source.id)}
                            className={`
                relative p-4 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all duration-200 group overflow-hidden
                ${isSelected
                                    ? 'bg-[#FFD659] border-[#FFD659] text-black shadow-[0_5px_20px_rgba(255,214,89,0.3)] transform scale-[1.02]'
                                    : 'bg-[#161616] border-[#333] text-gray-500 hover:border-gray-500 hover:text-gray-300'}
              `}
                        >
                            {/* Ícone de Check Tático */}
                            {isSelected && (
                                <div className="absolute top-2 right-2 bg-black/20 rounded-full p-0.5 animate-in zoom-in">
                                    <Check size={10} strokeWidth={4} />
                                </div>
                            )}

                            {/* Logo do Banco (BankLogo Component) */}
                            <div className={`transition-all duration-300 ${isSelected ? 'scale-110' : 'grayscale opacity-70 group-hover:opacity-100'}`}>
                                <BankLogo
                                    bankName={source.name}
                                    className="w-10 h-10 md:w-12 md:h-12"
                                />
                            </div>

                            <span className="text-xs font-bold uppercase tracking-wide">
                                {source.name}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* BOTÃO DE AÇÃO */}
            <div className="w-full max-w-sm">
                <button
                    className={`
            w-full py-4 rounded-xl font-extrabold text-lg transition-all flex items-center justify-center gap-2
            ${selectedSources.length > 0
                            ? 'bg-[#FFD659] hover:bg-[#EBC045] text-black shadow-[0_0_30px_rgba(255,214,89,0.2)] translate-y-0 opacity-100'
                            : 'bg-[#222] text-gray-600 cursor-not-allowed translate-y-2 opacity-50'}
          `}
                    disabled={selectedSources.length === 0}
                >
                    {selectedSources.length > 0
                        ? `Conectar ${selectedSources.length} Fontes`
                        : 'Selecione uma Fonte'}
                    <Zap size={20} className={selectedSources.length > 0 ? 'fill-black' : ''} />
                </button>
            </div>

        </div>
    );
}
