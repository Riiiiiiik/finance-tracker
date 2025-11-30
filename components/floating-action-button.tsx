'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FloatingActionButtonProps {
    onClick: () => void;
}

export function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
    return (
        <Button
            onClick={onClick}
            size="icon"
            className="fixed bottom-24 right-6 z-50 w-16 h-16 rounded-full shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:scale-110 transition-all"
        >
            <Plus className="w-8 h-8" />
        </Button>
    );
}
