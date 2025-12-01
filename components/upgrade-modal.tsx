'use client';

import { useState, useEffect } from 'react';
import { X, Check, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAvailablePlans, getUserSubscription, FEATURE_NAMES, FEATURE_DESCRIPTIONS, type SubscriptionPlan } from '@/lib/subscription';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    featureName?: string;
}

export function UpgradeModal({ isOpen, onClose, featureName }: UpgradeModalProps) {
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [currentPlan, setCurrentPlan] = useState<string>('free');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            const [availablePlans, subscription] = await Promise.all([
                getAvailablePlans(),
                getUserSubscription()
            ]);
            setPlans(availablePlans);
            setCurrentPlan(subscription?.plan_slug || 'free');
            setLoading(false);
        }
        if (isOpen) {
            loadData();
        }
    }, [isOpen]);

    const handleUpgrade = async (planSlug: string) => {
        // TODO: Integrar com gateway de pagamento
        alert(`Upgrade para ${planSlug} - Integração com pagamento em desenvolvimento`);
    };

    if (!isOpen) return null;

    const premiumPlan = plans.find(p => p.slug === 'premium');
    const freePlan = plans.find(p => p.slug === 'free');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-card via-card to-primary/5 border border-border rounded-3xl shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b border-border p-6">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 hover:bg-accent rounded-full transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20 mb-4">
                            <Sparkles className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold mb-2">
                            Desbloqueie Todo o Potencial
                        </h2>
                        {featureName && (
                            <p className="text-muted-foreground">
                                A funcionalidade <span className="text-primary font-semibold">{featureName}</span> está disponível apenas no plano Premium
                            </p>
                        )}
                    </div>
                </div>

                {/* Plans Comparison */}
                <div className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Free Plan */}
                        <Card className={`relative ${currentPlan === 'free' ? 'ring-2 ring-primary' : ''}`}>
                            <CardHeader>
                                <CardTitle className="text-2xl">Gratuito</CardTitle>
                                <CardDescription>Para começar</CardDescription>
                                <div className="mt-4">
                                    <span className="text-4xl font-bold">R$ 0</span>
                                    <span className="text-muted-foreground">/mês</span>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                                        <span className="text-sm">Até 50 transações/mês</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                                        <span className="text-sm">Analytics básico</span>
                                    </li>
                                    <li className="flex items-start gap-2 opacity-50">
                                        <X className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                                        <span className="text-sm">Calendário de Calor</span>
                                    </li>
                                    <li className="flex items-start gap-2 opacity-50">
                                        <X className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                                        <span className="text-sm">Modo Privacidade</span>
                                    </li>
                                    <li className="flex items-start gap-2 opacity-50">
                                        <X className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                                        <span className="text-sm">Análise de Runway</span>
                                    </li>
                                </ul>
                                {currentPlan === 'free' && (
                                    <div className="pt-4">
                                        <div className="px-4 py-2 bg-primary/10 text-primary text-sm font-medium rounded-lg text-center">
                                            Plano Atual
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Premium Plan */}
                        <Card className="relative border-primary shadow-lg shadow-primary/20">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-primary to-primary/80 text-white text-sm font-semibold rounded-full shadow-lg">
                                <Zap className="w-4 h-4 inline mr-1" />
                                Mais Popular
                            </div>
                            <CardHeader>
                                <CardTitle className="text-2xl">Premium</CardTitle>
                                <CardDescription>Recursos ilimitados</CardDescription>
                                <div className="mt-4">
                                    <span className="text-4xl font-bold">R$ 0,99</span>
                                    <span className="text-muted-foreground">/mês</span>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                                        <span className="text-sm font-semibold">Transações ilimitadas</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                                        <span className="text-sm">Calendário de Calor</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                                        <span className="text-sm">Modo Privacidade</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                                        <span className="text-sm">Inflação Pessoal</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                                        <span className="text-sm">Análise de Runway</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                                        <span className="text-sm">Tags Transversais</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                                        <span className="text-sm">Auditor de Assinaturas</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                                        <span className="text-sm">Avaliação R.O.F.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                                        <span className="text-sm">Botão do Arrependimento</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                                        <span className="text-sm">Otimizador de Cartão</span>
                                    </li>
                                </ul>
                                <div className="pt-4">
                                    {currentPlan === 'premium' ? (
                                        <div className="px-4 py-2 bg-primary/10 text-primary text-sm font-medium rounded-lg text-center">
                                            Plano Atual
                                        </div>
                                    ) : (
                                        <Button
                                            onClick={() => handleUpgrade('premium')}
                                            className="w-full"
                                            size="lg"
                                        >
                                            <Sparkles className="w-5 h-5 mr-2" />
                                            Assinar Premium
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Features Detail */}
                    <div className="mt-8 p-6 bg-muted/50 rounded-2xl">
                        <h3 className="text-lg font-semibold mb-4">O que você ganha com Premium:</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            {Object.entries(FEATURE_DESCRIPTIONS).map(([key, description]) => {
                                if (key === 'basic_analytics' || key === 'max_transactions_per_month') return null;
                                return (
                                    <div key={key} className="flex gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <Check className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{FEATURE_NAMES[key as keyof typeof FEATURE_NAMES]}</p>
                                            <p className="text-xs text-muted-foreground">{description}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Guarantee */}
                    <div className="mt-6 text-center text-sm text-muted-foreground">
                        <p>💳 Pagamento seguro • 🔒 Cancele quando quiser • ✨ Sem taxas ocultas</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
