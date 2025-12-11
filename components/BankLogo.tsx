import Image from 'next/image';
import { Building2 } from 'lucide-react';
import { useState } from 'react';

interface BankLogoProps {
    bankName: string;
    className?: string;
    unboxed?: boolean; // If true, removes background/border for use in colored containers
}

const BANK_DOMAINS: Record<string, string> = {
    'Nubank': 'nubank.com.br',
    'Itaú': 'itau.com.br',
    'Itau': 'itau.com.br',
    'Bradesco': 'bradesco.com.br',
    'Santander': 'santander.com.br',
    'Banco Inter': 'bancointer.com.br',
    'Inter': 'bancointer.com.br',
    'C6 Bank': 'c6bank.com.br',
    'C6': 'c6bank.com.br',
    'Banco do Brasil': 'bb.com.br',
    'BB': 'bb.com.br',
    'Caixa': 'caixa.gov.br',
    'Caixa Econômica': 'caixa.gov.br',
    'XP': 'xpi.com.br',
    'XP Investimentos': 'xpi.com.br',
    'BTG': 'btgpactual.com',
    'BTG Pactual': 'btgpactual.com',
    'Neon': 'neon.com.br',
    'Next': 'next.me',
    'Original': 'original.com.br',
    'Sicoob': 'sicoob.com.br',
    'Sicredi': 'sicredi.com.br',
    'PicPay': 'picpay.com',
    'Mercado Pago': 'mercadopago.com.br',
    'PagBank': 'pagseguro.uol.com.br',
    'Nomad': 'nomadglobal.com',
    'Wise': 'wise.com',
    'Revolut': 'revolut.com',
    'Avenue': 'avenue.us',
};

// Banks that have a good monochrome SVG on Simple Icons
const SIMPLE_ICONS: Record<string, string> = {
    'Nubank': 'nubank',
    'Itaú': 'itau',
    'Itau': 'itau',
    'Bradesco': 'bradesco',
    'Santander': 'santander',
    'Banco Inter': 'banco-inter',
    'Inter': 'banco-inter',
    'C6 Bank': 'c6-bank',
    'C6': 'c6-bank',
    'Banco do Brasil': 'banco-do-brasil',
    'Caixa': 'caixa-economica-federal',
    'XP': 'xp',
    'BTG': 'btg',
    'BTG Pactual': 'btg',
    'Neon': 'neon',
    'PicPay': 'picpay',
    'Mercado Pago': 'mercadopago',
    'Wise': 'wise',
    'Revolut': 'revolut',
};

export function BankLogo({ bankName, className = "w-6 h-6", unboxed = false }: BankLogoProps) {
    const [simpleIconError, setSimpleIconError] = useState(false);
    const [clearbitError, setClearbitError] = useState(false);

    const baseClasses = unboxed
        ? `flex items-center justify-center ${className}`
        : `relative flex items-center justify-center overflow-hidden rounded-full bg-zinc-900 border border-white/5 ${className}`;

    if (!bankName) {
        return (
            <div className={unboxed ? `flex items-center justify-center ${className}` : `flex items-center justify-center rounded-full bg-zinc-900 border border-white/5 ${className}`}>
                <Building2 className={unboxed ? "w-[60%] h-[60%] text-white" : "w-[50%] h-[50%] text-zinc-700"} />
            </div>
        );
    }

    const safeName = bankName.toLowerCase();
    const domain = BANK_DOMAINS[bankName] || BANK_DOMAINS[Object.keys(BANK_DOMAINS).find(k => safeName.includes(k.toLowerCase())) || ''];
    const simpleIconSlug = SIMPLE_ICONS[bankName] || SIMPLE_ICONS[Object.keys(SIMPLE_ICONS).find(k => safeName.includes(k.toLowerCase())) || ''];

    // 1. Try Simple Icons SVG (Original Brand Colors)
    if (simpleIconSlug && !simpleIconError) {
        return (
            <div className={baseClasses}>
                <img
                    src={`https://cdn.simpleicons.org/${simpleIconSlug}/${unboxed ? 'white' : ''}`}
                    alt={bankName}
                    className="w-[60%] h-[60%] object-contain"
                    onError={() => setSimpleIconError(true)}
                />
            </div>
        );
    }

    // 2. Try Clearbit Logo (Original Brand Colors)
    // Only try checks if domain exists AND we haven't failed Clearbit yet
    if (domain && !clearbitError) {
        return (
            <div className={unboxed ? `flex items-center justify-center ${className}` : `relative flex items-center justify-center overflow-hidden rounded-full bg-white border border-white/5 ${className}`}>
                <img
                    src={`https://logo.clearbit.com/${domain}`}
                    alt={bankName}
                    className="w-full h-full object-cover p-[10%] hover:scale-110 transition-transform duration-500"
                    onError={() => setClearbitError(true)}
                />
            </div>
        );
    }

    // 3. Fallback Generic Icon
    return (
        <div className={unboxed ? `flex items-center justify-center ${className}` : `flex items-center justify-center rounded-full bg-zinc-900 border border-white/5 ${className}`}>
            <span className={`font-mono font-bold select-none ${unboxed ? 'text-white text-xs' : 'text-[10px] text-zinc-500'}`}>
                {bankName.substring(0, 2).toUpperCase()}
            </span>
        </div>
    );
}

// Pre-load common bank logos to avoid flicker
const PRELOAD_BANKS = ['Nubank', 'Itaú', 'Bradesco', 'Santander', 'Inter', 'C6 Bank'];
