"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Wallet,
    TrendingUp,
    Shield,
    Smartphone,
    BarChart3,
    Clock,
    CheckCircle2,
    ArrowRight,
    ChevronRight,
} from "lucide-react";
import { AuthModal } from "@/components/auth-modal";

export function LandingPage() {
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState<"login" | "signup">("login");

    const openAuthModal = (mode: "login" | "signup") => {
        setAuthMode(mode);
        setAuthModalOpen(true);
    };

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    const features = [
        {
            id: "controle-total",
            icon: Wallet,
            title: "Controle Total",
            description: "Gerencie todas as suas receitas e despesas em um só lugar",
            details: {
                subtitle: "Centralize suas finanças",
                benefits: [
                    "Adicione receitas e despesas em segundos",
                    "Categorize automaticamente suas transações",
                    "Veja o saldo atualizado em tempo real",
                    "Organize por data, categoria ou valor",
                ],
                why: "Ter todas as informações financeiras em um único lugar economiza tempo e evita erros. Você sempre saberá exatamente quanto tem e para onde seu dinheiro está indo.",
            },
        },
        {
            id: "relatorios-inteligentes",
            icon: BarChart3,
            title: "Relatórios Inteligentes",
            description: "Visualize seus gastos por categoria e período",
            details: {
                subtitle: "Entenda seus padrões de gastos",
                benefits: [
                    "Gráficos visuais de receitas vs despesas",
                    "Análise por categoria (alimentação, transporte, etc)",
                    "Comparação mensal e anual",
                    "Identifique onde você pode economizar",
                ],
                why: "Visualizar seus dados de forma clara ajuda a tomar decisões financeiras mais inteligentes. Você descobre rapidamente onde está gastando demais e pode ajustar seu comportamento.",
            },
        },
        {
            id: "seguro-privado",
            icon: Shield,
            title: "Seguro e Privado",
            description: "Seus dados são criptografados e protegidos",
            details: {
                subtitle: "Segurança de nível bancário",
                benefits: [
                    "Criptografia end-to-end de todos os dados",
                    "Row Level Security (RLS) no banco de dados",
                    "Autenticação segura via Supabase",
                    "Cada usuário vê apenas seus próprios dados",
                ],
                why: "Seus dados financeiros são sensíveis e merecem proteção máxima. Usamos as mesmas tecnologias de segurança que bancos utilizam para garantir que suas informações estejam sempre protegidas.",
            },
        },
        {
            id: "acesso-mobile",
            icon: Smartphone,
            title: "Acesso Mobile",
            description: "Instale como app no seu celular para acesso rápido",
            details: {
                subtitle: "Suas finanças sempre à mão",
                benefits: [
                    "Instale como app nativo no iPhone ou Android",
                    "Interface otimizada para toque e mobile",
                    "Acesso rápido direto da tela inicial",
                    "Experiência de app sem ocupar espaço da App Store",
                ],
                why: "Com o app instalado no celular, você registra suas transações na hora, onde quer que esteja. Basta abrir e adicionar - simples e rápido como um app nativo.",
            },
        },
        {
            id: "metas-financeiras",
            icon: TrendingUp,
            title: "Metas Financeiras",
            description: "Defina e acompanhe suas metas de economia",
            details: {
                subtitle: "Alcance seus objetivos",
                benefits: [
                    "Defina metas de economia mensais",
                    "Acompanhe progresso em tempo real",
                    "Receba alertas quando se aproximar do limite",
                    "Visualize quanto falta para atingir sua meta",
                ],
                why: "Ter metas claras aumenta em 42% a chance de você economizar dinheiro. O app te mantém focado e motivado a alcançar seus objetivos financeiros.",
            },
        },
        {
            id: "historico-completo",
            icon: Clock,
            title: "Histórico Completo",
            description: "Acesse todo o histórico das suas transações",
            details: {
                subtitle: "Nunca perca o controle",
                benefits: [
                    "Busque transações por data, valor ou descrição",
                    "Exporte relatórios em PDF ou Excel",
                    "Backup automático na nuvem",
                    "Histórico ilimitado - nunca expira",
                ],
                why: "Ter acesso ao histórico completo permite análises de longo prazo e ajuda no planejamento financeiro. Você pode identificar tendências e fazer projeções mais precisas.",
            },
        },
    ];

    const benefits = [
        "Interface moderna e intuitiva",
        "Categorização automática",
        "Gráficos e relatórios visuais",
        "Sincronização em tempo real",
        "Sem anúncios ou taxas escondidas",
        "Suporte dedicado",
    ];

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative overflow-hidden">
                {/* Background Effects */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

                <div className="relative max-w-6xl mx-auto px-4 py-20 sm:py-32">
                    <div className="text-center space-y-8 animate-fade-in">
                        {/* Logo/Brand */}
                        <div className="flex items-center justify-center gap-3 mb-8">
                            <div className="p-3 bg-primary/20 rounded-2xl">
                                <Wallet className="h-12 w-12 text-primary" />
                            </div>
                        </div>

                        {/* Headline */}
                        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight">
                            Controle Financeiro
                            <br />
                            <span className="text-gradient">Simples e Eficiente</span>
                        </h1>

                        {/* Subheadline */}
                        <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto">
                            Organize suas finanças pessoais, acompanhe gastos e alcance suas
                            metas financeiras com facilidade
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
                            <Button
                                size="lg"
                                className="gradient-primary text-lg px-8 py-6 hover:scale-105 transition-transform shadow-2xl hover:shadow-primary/50"
                                onClick={() => openAuthModal("signup")}
                            >
                                Começar Gratuitamente
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="text-lg px-8 py-6 hover:scale-105 transition-transform border-white/20"
                                onClick={() => openAuthModal("login")}
                            >
                                Já tenho conta
                            </Button>
                        </div>

                        {/* Social Proof */}
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-4">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            <span>Gratuito • Sem cartão de crédito • Cancele quando quiser</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section - Cards Clicáveis */}
            <section className="py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16 animate-slide-up">
                        <h2 className="text-4xl font-bold mb-4">
                            Tudo que você precisa para
                            <span className="text-gradient"> gerenciar seu dinheiro</span>
                        </h2>
                        <p className="text-xl text-muted-foreground">
                            Clique em cada recurso para saber mais
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, index) => (
                            <button
                                key={index}
                                onClick={() => scrollToSection(feature.id)}
                                className="text-left w-full"
                            >
                                <Card
                                    className="glass-effect border-white/10 hover-lift hover-glow group cursor-pointer h-full transition-all duration-300"
                                    style={{
                                        animationDelay: `${index * 0.1}s`,
                                        animation: "slideUp 0.5s ease-out backwards",
                                    }}
                                >
                                    <CardContent className="p-6">
                                        <div className="p-3 bg-primary/10 rounded-xl w-fit mb-4 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                                            <feature.icon className="h-6 w-6 text-primary" />
                                        </div>
                                        <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                                            {feature.title}
                                        </h3>
                                        <p className="text-muted-foreground mb-3">{feature.description}</p>
                                        <div className="flex items-center gap-1 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                            Saiba mais
                                            <ChevronRight className="h-4 w-4" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Detailed Features Sections */}
            {features.map((feature, index) => (
                <section
                    key={feature.id}
                    id={feature.id}
                    className={`py-20 px-4 ${index % 2 === 0 ? "bg-gradient-to-b from-transparent to-primary/5" : ""
                        }`}
                >
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-4 bg-primary/10 rounded-2xl">
                                <feature.icon className="h-8 w-8 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-4xl font-bold">{feature.title}</h2>
                                <p className="text-xl text-muted-foreground mt-2">
                                    {feature.details.subtitle}
                                </p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Benefits List */}
                            <div className="space-y-4">
                                <h3 className="text-2xl font-semibold mb-4">O que você ganha:</h3>
                                {feature.details.benefits.map((benefit, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-start gap-3 p-4 glass-effect rounded-lg border border-white/10 hover-lift"
                                    >
                                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                                        <span>{benefit}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Why it matters */}
                            <div className="glass-effect border border-primary/20 rounded-xl p-6">
                                <h3 className="text-2xl font-semibold mb-4 text-primary">
                                    Por que isso importa?
                                </h3>
                                <p className="text-lg text-muted-foreground leading-relaxed">
                                    {feature.details.why}
                                </p>
                            </div>
                        </div>

                        {/* CTA Button */}
                        <div className="text-center mt-8">
                            <Button
                                size="lg"
                                className="gradient-primary"
                                onClick={() => openAuthModal("signup")}
                            >
                                Experimentar Agora
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </section>
            ))}

            {/* Benefits Section */}
            <section className="py-20 px-4 bg-gradient-to-b from-transparent to-primary/5">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold mb-4">
                            Por que escolher o <span className="text-gradient">Finance Tracker</span>?
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {benefits.map((benefit, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-3 p-4 glass-effect rounded-lg border border-white/10 hover-lift"
                                style={{
                                    animationDelay: `${index * 0.1}s`,
                                    animation: "slideUp 0.5s ease-out backwards",
                                }}
                            >
                                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                                <span className="text-lg">{benefit}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <Card className="gradient-card border-primary/30 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>

                        <CardContent className="p-12 relative z-10">
                            <h2 className="text-4xl font-bold mb-4">
                                Pronto para organizar suas finanças?
                            </h2>
                            <p className="text-xl text-muted-foreground mb-8">
                                Comece agora mesmo, é grátis e leva menos de 1 minuto
                            </p>
                            <Button
                                size="lg"
                                className="gradient-primary text-lg px-8 py-6 hover:scale-105 transition-transform shadow-2xl"
                                onClick={() => openAuthModal("signup")}
                            >
                                Criar Minha Conta Grátis
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/10 py-8 px-4">
                <div className="max-w-6xl mx-auto text-center text-muted-foreground">
                    <p>© 2024 Finance Tracker. Todos os direitos reservados.</p>
                </div>
            </footer>

            {/* Auth Modal */}
            <AuthModal
                open={authModalOpen}
                onOpenChange={setAuthModalOpen}
                mode={authMode}
                onSuccess={() => {
                    setAuthModalOpen(false);
                    window.location.reload();
                }}
                onSwitchMode={() => {
                    setAuthMode(authMode === "login" ? "signup" : "login");
                }}
            />
        </div>
    );
}
