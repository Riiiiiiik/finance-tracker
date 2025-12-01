import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
    Wallet, TrendingUp, PieChart, Shield, Smartphone, Zap,
    Calendar, Eye, Percent, Timer, CreditCard, Bell,
    Star, Clock, Tag, Users, Lock, Sparkles, Check, ArrowRight
} from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
            {/* Hero Section */}
            <div className="container mx-auto px-4 py-16">
                <div className="text-center space-y-8 max-w-4xl mx-auto">
                    {/* Logo */}
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-primary/80 shadow-2xl shadow-primary/20 animate-[fadeIn_0.5s_ease-in]">
                        <Wallet className="w-12 h-12 text-white" />
                    </div>

                    {/* Title */}
                    <div className="space-y-4 animate-[slideUp_0.6s_ease-out]">
                        <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                            Finance Tracker
                        </h1>
                        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
                            O app de finanças pessoais mais inteligente do Brasil
                        </p>
                        <p className="text-lg text-muted-foreground/80">
                            Zero atrito • Inteligência real • Mudança de hábitos
                        </p>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-[slideUp_0.7s_ease-out]">
                        <Link href="/register">
                            <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6 shadow-lg shadow-primary/20">
                                <Sparkles className="w-5 h-5 mr-2" />
                                Começar Grátis
                            </Button>
                        </Link>
                        <Link href="/login">
                            <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 py-6">
                                Fazer Login
                            </Button>
                        </Link>
                    </div>

                    {/* Social Proof */}
                    <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-primary text-primary" />
                            <Star className="w-4 h-4 fill-primary text-primary" />
                            <Star className="w-4 h-4 fill-primary text-primary" />
                            <Star className="w-4 h-4 fill-primary text-primary" />
                            <Star className="w-4 h-4 fill-primary text-primary" />
                        </div>
                        <span>Gratuito para sempre</span>
                        <span>•</span>
                        <span>Premium por R$ 0,99/mês</span>
                    </div>
                </div>

                {/* Features Grid - Pilar 1: Zero Atrito */}
                <div className="mt-24 max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-4">
                            <Zap className="w-4 h-4" />
                            PILAR 1: ZERO ATRITO
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">O Fim da Preguiça</h2>
                        <p className="text-muted-foreground text-lg">
                            Registre gastos em segundos, sem digitação manual
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <FeatureCard
                            icon={<Sparkles className="w-6 h-6" />}
                            title="Smart Input com IA"
                            description='Digite "Almoço 30 Nu" e pronto! O app categoriza automaticamente'
                            badge="EM BREVE"
                        />
                        <FeatureCard
                            icon={<Upload className="w-6 h-6" />}
                            title="Importador Universal"
                            description="Arraste e solte arquivos bancários (OFX, PDF) - zero digitação"
                            badge="EM BREVE"
                        />
                    </div>
                </div>

                {/* Pilar 2: Inteligência */}
                <div className="mt-24 max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-4">
                            <TrendingUp className="w-4 h-4" />
                            PILAR 2: INTELIGÊNCIA
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">O Fim das Surpresas</h2>
                        <p className="text-muted-foreground text-lg">
                            Insights automáticos que você nunca teve antes
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <FeatureCard
                            icon={<CreditCard className="w-6 h-6" />}
                            title="Visão de Renda Comprometida"
                            description="Veja seu saldo futuro real, já descontando parcelas do cartão"
                            badge="EM BREVE"
                        />
                        <FeatureCard
                            icon={<Calendar className="w-6 h-6" />}
                            title='Otimizador "Melhor Dia"'
                            description="Alertas do melhor dia para comprar baseado na fatura do cartão"
                            isPremium
                        />
                        <FeatureCard
                            icon={<Bell className="w-6 h-6" />}
                            title="Auditor de Assinaturas"
                            description="Isola e soma todos os custos fixos (streamings, academias)"
                            isPremium
                        />
                        <FeatureCard
                            icon={<TrendingUp className="w-6 h-6" />}
                            title="Comparador de Preços"
                            description="Alerta se você pagou muito acima da sua média histórica"
                            badge="EM BREVE"
                        />
                        <FeatureCard
                            icon={<Percent className="w-6 h-6" />}
                            title="Inflação Pessoal Real"
                            description="Quanto SEU custo de vida subiu vs. inflação oficial"
                            isPremium
                        />
                    </div>
                </div>

                {/* Pilar 3: Comportamento */}
                <div className="mt-24 max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-4">
                            <Star className="w-4 h-4" />
                            PILAR 3: COMPORTAMENTO
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Mudança de Hábitos</h2>
                        <p className="text-muted-foreground text-lg">
                            Ferramentas que realmente mudam como você gasta
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <FeatureCard
                            icon={<Star className="w-6 h-6" />}
                            title="R.O.F. (Return on Felicidade)"
                            description="Avalie se cada gasto realmente valeu a pena (1-5 estrelas)"
                            isPremium
                        />
                        <FeatureCard
                            icon={<Clock className="w-6 h-6" />}
                            title="Botão do Arrependimento"
                            description="Timer de 24h antes de registrar grandes compras por impulso"
                            isPremium
                        />
                        <FeatureCard
                            icon={<Calendar className="w-6 h-6" />}
                            title="Orçamento Semanal"
                            description="Metas semanais menores e mais gerenciáveis que mensais"
                            badge="EM BREVE"
                        />
                        <FeatureCard
                            icon={<PieChart className="w-6 h-6" />}
                            title='Gestão de "Potes"'
                            description="Separe seu saldo em envelopes virtuais (Viagem, Reserva...)"
                            badge="EM BREVE"
                        />
                        <FeatureCard
                            icon={<Calendar className="w-6 h-6" />}
                            title="Calendário de Calor"
                            description="Gamificação visual: dias zero gastos em verde, excessos em vermelho"
                            isPremium
                        />
                    </div>
                </div>

                {/* Pilar 4: Gestão Pro */}
                <div className="mt-24 max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-4">
                            <Shield className="w-4 h-4" />
                            PILAR 4: GESTÃO PRO
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Visão de Longo Prazo</h2>
                        <p className="text-muted-foreground text-lg">
                            Ferramentas profissionais para decisões inteligentes
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <FeatureCard
                            icon={<Timer className="w-6 h-6" />}
                            title='Análise de "Runway"'
                            description="Quantos meses você sobrevive se perder toda a renda hoje?"
                            isPremium
                        />
                        <FeatureCard
                            icon={<TrendingUp className="w-6 h-6" />}
                            title='Simulador "E Se?"'
                            description="Teste cenários: e se eu assumir uma parcela de R$500 agora?"
                            badge="EM BREVE"
                        />
                        <FeatureCard
                            icon={<Users className="w-6 h-6" />}
                            title="Divisão de Contas"
                            description="Gerencie quem pagou o quê em contas divididas"
                            badge="EM BREVE"
                        />
                        <FeatureCard
                            icon={<Tag className="w-6 h-6" />}
                            title="Tags Transversais"
                            description="Use #ReformaCasa para agrupar gastos de várias categorias"
                            isPremium
                        />
                        <FeatureCard
                            icon={<Eye className="w-6 h-6" />}
                            title="Modo Privacidade"
                            description="Borra valores na tela para uso seguro em público"
                            isPremium
                        />
                    </div>
                </div>

                {/* Pricing Section */}
                <div className="mt-24 max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Preço Justo, Valor Infinito</h2>
                        <p className="text-muted-foreground text-lg">
                            Comece grátis, evolua quando quiser
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Free Plan */}
                        <div className="p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all">
                            <h3 className="text-2xl font-bold mb-2">Gratuito</h3>
                            <p className="text-muted-foreground mb-6">Para sempre</p>
                            <div className="mb-6">
                                <span className="text-4xl font-bold">R$ 0</span>
                                <span className="text-muted-foreground">/mês</span>
                            </div>
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center gap-2">
                                    <Check className="w-5 h-5 text-primary" />
                                    <span>Até 50 transações/mês</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-5 h-5 text-primary" />
                                    <span>Analytics básico</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-5 h-5 text-primary" />
                                    <span>Categorização automática</span>
                                </li>
                            </ul>
                            <Link href="/register">
                                <Button variant="outline" className="w-full" size="lg">
                                    Começar Grátis
                                </Button>
                            </Link>
                        </div>

                        {/* Premium Plan */}
                        <div className="p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary shadow-lg shadow-primary/20 relative">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-white text-sm font-semibold rounded-full">
                                Mais Popular
                            </div>
                            <h3 className="text-2xl font-bold mb-2">Premium</h3>
                            <p className="text-muted-foreground mb-6">Recursos ilimitados</p>
                            <div className="mb-6">
                                <span className="text-4xl font-bold">R$ 0,99</span>
                                <span className="text-muted-foreground">/mês</span>
                            </div>
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center gap-2">
                                    <Check className="w-5 h-5 text-primary" />
                                    <span className="font-semibold">Transações ilimitadas</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-5 h-5 text-primary" />
                                    <span>Todas as 10+ features premium</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-5 h-5 text-primary" />
                                    <span>Suporte prioritário</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-5 h-5 text-primary" />
                                    <span>Cancele quando quiser</span>
                                </li>
                            </ul>
                            <Link href="/register">
                                <Button className="w-full" size="lg">
                                    <Sparkles className="w-5 h-5 mr-2" />
                                    Começar Premium
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Final CTA */}
                <div className="mt-24 text-center max-w-3xl mx-auto p-12 rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Pronto para transformar suas finanças?
                    </h2>
                    <p className="text-lg text-muted-foreground mb-8">
                        Junte-se a milhares de pessoas que já tomaram controle do seu dinheiro
                    </p>
                    <Link href="/register">
                        <Button size="lg" className="text-lg px-8 py-6 shadow-lg shadow-primary/20">
                            Criar Conta Grátis
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </Link>
                </div>

                {/* Footer */}
                <div className="text-center mt-24 text-sm text-muted-foreground space-y-2">
                    <p>Desenvolvido com Next.js, Supabase e Tailwind CSS</p>
                    <p>🔒 Seus dados são 100% privados e seguros</p>
                </div>
            </div>
        </div>
    );
}

// Feature Card Component
function FeatureCard({
    icon,
    title,
    description,
    isPremium,
    badge
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    isPremium?: boolean;
    badge?: string;
}) {
    return (
        <div className="p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 relative group">
            {(isPremium || badge) && (
                <div className="absolute -top-2 -right-2 px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full shadow-lg">
                    {isPremium ? '⭐ Premium' : badge}
                </div>
            )}
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    );
}

// Upload icon (missing from lucide-react in the imports)
function Upload({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
    );
}
