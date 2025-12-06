import { Brain, Star, CheckCircle, Eye, Shield, Sparkles, Lock } from 'lucide-react';

export type MonkType = 'ai' | 'vault' | 'wish' | 'auditor' | 'sentry' | 'pockets';

interface MonkIconProps {
    type: MonkType;
    className?: string;
}

export const monkColors = {
    ai: 'text-purple-500',
    vault: 'text-green-500',
    wish: 'text-blue-400',
    auditor: 'text-indigo-500',
    sentry: 'text-red-500',
    pockets: 'text-yellow-500',
};

export const monkBgColors = {
    ai: 'bg-purple-500/10',
    vault: 'bg-green-500/10',
    wish: 'bg-blue-400/10',
    auditor: 'bg-indigo-500/10',
    sentry: 'bg-red-500/10',
    pockets: 'bg-yellow-500/10',
};

export default function MonkIcon({ type, className = "w-6 h-6" }: MonkIconProps) {
    switch (type) {
        case 'ai':
            return <Sparkles className={`${monkColors.ai} ${className}`} />;
        case 'vault':
            return <Lock className={`${monkColors.vault} ${className}`} />;
        case 'wish':
            return <Star className={`${monkColors.wish} ${className}`} />;
        case 'auditor':
            return <CheckCircle className={`${monkColors.auditor} ${className}`} />;
        case 'sentry':
            return <Eye className={`${monkColors.sentry} ${className}`} />;
        case 'pockets':
            return <Shield className={`${monkColors.pockets} ${className}`} />;
        default:
            return <Brain className={`${monkColors.ai} ${className}`} />;
    }
}
