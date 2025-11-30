import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Wallet, TrendingUp, PieChart, Shield, Smartphone, Zap } from 'lucide-react';

export default function Home() {
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
                            Controle completo de gastos pessoais com categorização inteligente
                        </p>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-[slideUp_0.7s_ease-out]">
                        <Link href="/register">
                            <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6">
                                Começar Agora
                            </Button>
                        </Link>
                        <Link href="/login">
                            <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 py-6">
                                Fazer Login
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-3 gap-6 mt-24 max-w-5xl mx-auto">
                    <div className="p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 animate-[slideUp_0.8s_ease-out]">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                            <TrendingUp className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Análise Inteligente</h3>
                        <p className="text-muted-foreground">
                            Visualize seus gastos com gráficos e relatórios detalhados
                        </p>
                    </div>

                    <div className="p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 animate-[slideUp_0.9s_ease-out]">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                            <PieChart className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Categorização</h3>
                        <p className="text-muted-foreground">
                            Organize suas transações por categorias personalizadas
                        </p>
                    </div>

                    <div className="p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 animate-[slideUp_1s_ease-out]">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                            <Shield className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Seguro</h3>
                        <p className="text-muted-foreground">
                            Seus dados protegidos com autenticação Supabase
                        </p>
                    </div>

                    <div className="p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 animate-[slideUp_1.1s_ease-out]">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                            <Smartphone className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">PWA Mobile</h3>
                        <p className="text-muted-foreground">
                            Instale como app no seu celular e use offline
                        </p>
                    </div>

                    <div className="p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 animate-[slideUp_1.2s_ease-out]">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                            <Zap className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Rápido</h3>
                        <p className="text-muted-foreground">
                            Interface moderna e responsiva construída com Next.js
                        </p>
                    </div>

                    <div className="p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 animate-[slideUp_1.3s_ease-out]">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                            <Wallet className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Gratuito</h3>
                        <p className="text-muted-foreground">
                            100% gratuito e open source para sempre
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-24 text-sm text-muted-foreground">
                    <p>Desenvolvido com Next.js, Supabase e Tailwind CSS</p>
                </div>
            </div>
        </div>
    );
}
