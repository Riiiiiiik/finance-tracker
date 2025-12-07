'use client';

import { Home, ShieldAlert, Plus, Star, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import MonkVision from './MonkVision';

export default function MonkDock() {
    const pathname = usePathname();
    const [optimisticPath, setOptimisticPath] = useState(pathname);
    const [showVision, setShowVision] = useState(false);

    // Sincronizar quando a rota muda de fato (para back/forward do navegador)
    useEffect(() => {
        setOptimisticPath(pathname);
    }, [pathname]);

    // Configuração das Abas
    const tabs = [
        { id: 'home', label: 'Início', icon: <Home size={22} />, color: '#10B981', href: '/dashboard' },       // Monk.Vault
        { id: 'sentry', label: 'Sentry', icon: <ShieldAlert size={22} />, color: '#FF4B4B', href: '/analytics' }, // Monk.Sentry
        { id: 'add', label: 'Novo', icon: <Plus size={28} />, color: '#FFD659', isFab: true }, // Botão Central
        { id: 'wish', label: 'Wish', icon: <Star size={22} />, color: '#6CA8FF', href: '/wishlist' },         // Monk.Wish
        { id: 'nexus', label: 'Nexus', icon: <Users size={22} />, color: '#8B5CF6', href: '/community' },      // Community
    ];

    const handleAddClick = () => {
        setShowVision(true);
    };

    // Não mostrar na tela de login, registro ou onboarding
    if (['/login', '/register', '/onboarding', '/', '/about'].includes(pathname)) {
        return null;
    }

    return (
        <>
            <MonkVision isOpen={showVision} onClose={() => setShowVision(false)} />

            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4">
                {/* O DOCK FLUTUANTE */}
                <nav className="bg-[#121212]/80 backdrop-blur-md border border-[#333] rounded-full p-2 shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex justify-between items-center relative transition-all duration-300">

                    {tabs.map((tab) => {
                        // Lógica de Ativo baseada no estado otimista
                        const isActive = tab.href ? optimisticPath === tab.href : false;

                        // Renderização Especial para o Botão Central (FAB)
                        if (tab.isFab) {
                            return (
                                <button
                                    key={tab.id}
                                    onClick={handleAddClick}
                                    className="bg-[#FFD659] text-black w-12 h-12 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,214,89,0.4)] transform hover:scale-110 active:scale-95 transition-all -mt-8 border-4 border-[#09090B]"
                                >
                                    {tab.icon}
                                </button>
                            );
                        }

                        // Renderização das Abas Normais (Links)
                        return (
                            <Link
                                key={tab.id}
                                href={tab.href || '#'}
                                prefetch={true}
                                onClick={() => tab.href && setOptimisticPath(tab.href)}
                                className="relative flex flex-col items-center justify-center w-14 h-12 transition-all duration-300"
                            >
                                {/* Ícone com Efeito de Glow quando ativo */}
                                <div
                                    className={`transition-all duration-300 ${isActive ? '-translate-y-1' : ''}`}
                                    style={{
                                        color: isActive ? tab.color : '#666',
                                        filter: isActive ? `drop-shadow(0 0 8px ${tab.color})` : 'none'
                                    }}
                                >
                                    {tab.icon}
                                </div>

                                {/* Ponto Indicador (Abaixo do ícone) */}
                                <span
                                    className={`absolute bottom-1 w-1 h-1 rounded-full transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`}
                                    style={{ backgroundColor: tab.color }}
                                ></span>
                            </Link>
                        );
                    })}
                </nav>

            </div>
        </>
    );
}
