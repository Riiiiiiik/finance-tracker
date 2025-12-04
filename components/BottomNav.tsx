'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PieChart, User, Gift } from 'lucide-react';

export default function BottomNav() {
    const pathname = usePathname();

    // Não mostrar na tela de login, registro ou onboarding
    if (['/login', '/register', '/onboarding', '/'].includes(pathname)) {
        return null;
    }

    const navItems = [
        { href: '/dashboard', label: 'Início', icon: Home },
        { href: '/analytics', label: 'Analytics', icon: PieChart },
        { href: '/wishlist', label: 'Desejos', icon: Gift },
    ];

    return (
        <div
            className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t border-border z-50"
            style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0px)' }}
        >
            <div className="flex justify-around items-center h-16 max-w-md mx-auto">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center justify-center w-full h-full transition-colors active:scale-95 ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary/70'
                                }`}
                        >
                            <Icon className={`w-6 h-6 mb-1 ${isActive ? 'fill-current' : ''}`} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
