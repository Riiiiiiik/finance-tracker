'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Settings, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BottomNav() {
    const pathname = usePathname();

    const links = [
        { href: '/dashboard', icon: Home, label: 'Início' },
        { href: '/analytics', icon: BarChart3, label: 'Análise' },
        { href: '/settings', icon: Settings, label: 'Configurações' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border safe-area-bottom">
            <div className="flex items-center justify-around h-20 px-4">
                {links.map((link) => {
                    const isActive = pathname === link.href;
                    const Icon = link.icon;

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors relative",
                                isActive ? "text-primary" : "text-muted-foreground"
                            )}
                        >
                            {/* Active Indicator */}
                            {isActive && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-full" />
                            )}

                            <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                                isActive && "bg-primary/10"
                            )}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-medium">{link.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
