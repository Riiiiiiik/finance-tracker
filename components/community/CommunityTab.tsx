'use client';

import { Users, Sparkles } from 'lucide-react';
import MonkRoster from '../MonkRoster';
import MonkLetter from '../MonkLetter';

export default function CommunityTab() {

    return (
        <div className="bg-[#09090B] min-h-screen text-white p-6 font-sans pb-24">

            {/* HEADER DA COMUNIDADE */}
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="bg-[#8B5CF6]/20 p-2 rounded-lg border border-[#8B5CF6]/40">
                            <Users size={20} className="text-[#8B5CF6]" />
                        </div>
                        <span className="text-[#8B5CF6] font-bold text-xs uppercase tracking-widest">The Nexus</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Community.Monk</h1>
                    <p className="text-gray-400 text-sm mt-1">O ponto de encontro da Ordem.</p>
                </div>
            </div>

            {/* 1. MONK ROSTER (Lore) */}
            <div className="mb-8">
                <MonkRoster />
            </div>

            {/* 2. MONK LETTER (Updates) */}
            <div className="mb-8">
                <MonkLetter />
            </div>

            {/* FAB (Floating Action Button) - Criar Novo Tópico */}
            <button className="fixed bottom-24 right-6 bg-[#8B5CF6] hover:bg-[#7c4dff] text-white p-4 rounded-full shadow-[0_0_30px_rgba(139,92,246,0.4)] transition-all active:scale-95 z-20">
                <Sparkles size={24} fill="white" />
            </button>

        </div>
    );
}
