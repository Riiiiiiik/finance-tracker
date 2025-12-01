import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
    Wallet, TrendingUp, Shield, Sparkles, Check, ArrowRight,
    Calendar, Eye, Percent, Timer, CreditCard, Bell,
    Star, Clock, Tag, Users, Zap, Upload, PieChart,
    BarChart3, Smartphone, Lock, Globe
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
                        <div className="flex items-center justify-center gap-4 flex-wrap">
                            <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                                <Check className="w-4 h-4" />
                                100% Gratuito
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                                <Sparkles className="w-4 h-4" />
                                Premium R$ 0,99/mês
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                                <Shield className="w-4 h-4" />
                                Dados Seguros
                            </div>
                        </div>
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
                </div>

                {/* Core Features - Already Implemented */}
                <div className="mt-24 max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-sm font-semibold mb-4">
                            <Check className="w-4 h-4" />
                            JÁ DISPONÍVEL
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Recursos Implementados</h2>
                        <p className="text-muted-foreground text-lg">
                            Funcionalidades prontas para você usar agora
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <ImplementedFeature
                            icon={<PieChart className="w-6 h-6" />}
                            title="Categorização Inteligente"
                            description="Organize automaticamente cada gasto em categorias como Alimentação, Transporte, Saúde. Entenda para onde seu dinheiro realmente vai sem esforço manual."
                            benefit="Economize 10 minutos por dia que você gastaria categorizando manualmente"
                        />
                        <ImplementedFeature
                            icon={<BarChart3 className="w-6 h-6" />}
                            title="Analytics em Tempo Real"
                            description="Veja instantaneamente quanto você gastou este mês, qual categoria consome mais e como seus hábitos evoluem ao longo do tempo com gráficos interativos."
                            benefit="Identifique vazamentos financeiros em segundos, não em horas de planilha"
                        />
                        <ImplementedFeature
                            icon={<TrendingUp className="w-6 h-6" />}
                            title="Controle de Saldo Dinâmico"
                            description="Seu saldo atualiza automaticamente a cada transação. Saiba exatamente quanto você tem disponível agora, não quanto tinha ontem."
                            benefit="Nunca mais fique no vermelho por esquecer de uma conta pendente"
                        />
                        <ImplementedFeature
                            icon={<Shield className="w-6 h-6" />}
                            title="Segurança Bancária"
                            description="Seus dados financeiros protegidos com a mesma tecnologia usada por bancos: criptografia AES-256, autenticação de dois fatores e servidores certificados."
                            benefit="Durma tranquilo sabendo que seus dados estão mais seguros que em uma planilha"
                        />
                        <ImplementedFeature
                            icon={<Smartphone className="w-6 h-6" />}
                            title="App Instalável (PWA)"
                            description="Instale em 1 clique no seu celular e use como app nativo. Ícone na tela inicial, tela cheia sem navegador. Experiência 100% mobile."
                            benefit="Acesso rápido direto da tela inicial, sem abrir o navegador"
                        />
                        <ImplementedFeature
                            icon={<Globe className="w-6 h-6" />}
                            title="Sincronização em Nuvem"
                            description="Comece no celular, continue no computador. Seus dados acompanham você em qualquer dispositivo, sempre atualizados e acessíveis."
                            benefit="Acesse de qualquer lugar, a qualquer hora, sem perder nenhuma informação"
                        />
                    </div>
                </div>

                {/* Premium Features - Coming Soon */}
                <div className="mt-24 max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-4">
                            <Sparkles className="w-4 h-4" />
                            RECURSOS PREMIUM
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Em Desenvolvimento</h2>
                        <p className="text-muted-foreground text-lg">
                            Funcionalidades avançadas que chegarão em breve
                        </p>
                    </div>

                    {/* Pilar 1 */}
                    <div className="mb-16">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Zap className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="text-2xl font-bold">Zero Atrito</h3>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <ComingSoonFeature
                                icon={<Sparkles className="w-6 h-6" />}
                                title="Smart Input com IA"
                                description='Esqueça formulários complexos. Digite naturalmente "Almoço 30 Nu" e a IA entende que foi R$30 em Nubank, categoria Alimentação. Funciona com voz também!'
                                eta="Q1 2026"
                                benefit="Registre gastos 10x mais rápido que qualquer app tradicional"
                            />
                            <ComingSoonFeature
                                icon={<Upload className="w-6 h-6" />}
                                title="Importador Universal"
                                description="Arraste o extrato do banco (OFX, PDF, CSV) e todas as transações são importadas automaticamente. Compatível com Nubank, Inter, Itaú, Bradesco e mais."
                                eta="Q1 2026"
                                benefit="Importe 100 transações em 5 segundos ao invés de 30 minutos digitando"
                            />
                        </div>
                    </div>

                    {/* Pilar 2 */}
                    <div className="mb-16">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="text-2xl font-bold">Inteligência</h3>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            <PremiumFeature
                                icon={<Calendar className="w-6 h-6" />}
                                title="Calendário de Calor"
                                description="Veja seus gastos em um calendário visual: dias verdes = zero gastos, dias vermelhos = gastou demais. Identifique padrões como 'sempre gasto mais nas sextas' instantaneamente."
                                benefit="Descubra seus gatilhos de gasto e economize até 20% ao mês"
                            />
                            <PremiumFeature
                                icon={<Eye className="w-6 h-6" />}
                                title="Modo Privacidade"
                                description="Um botão que borra todos os valores na tela. Perfeito para usar no metrô, ônibus ou quando alguém olha por cima do seu ombro. Seus dados financeiros são só seus."
                                benefit="Use seu app de finanças em qualquer lugar sem constrangimento"
                            />
                            <PremiumFeature
                                icon={<Percent className="w-6 h-6" />}
                                title="Inflação Pessoal Real"
                                description="O governo diz que a inflação foi 4%, mas VOCÊ sentiu 15%? Calculamos quanto os itens que VOCÊ compra realmente subiram de preço, não a média nacional."
                                benefit="Negocie aumentos salariais com dados reais, não estimativas"
                            />
                            <PremiumFeature
                                icon={<Timer className="w-6 h-6" />}
                                title="Análise de Runway"
                                description="Se você perder o emprego hoje, por quantos meses consegue pagar as contas? Cálculo baseado na sua média real de gastos e reserva de emergência atual."
                                benefit="Durma tranquilo sabendo exatamente qual sua margem de segurança"
                            />
                            <PremiumFeature
                                icon={<Bell className="w-6 h-6" />}
                                title="Auditor de Assinaturas"
                                description="Isola automaticamente Netflix, Spotify, academia, etc. Mostra quanto você gasta por mês em assinaturas e alerta se alguma subir de preço sem você perceber."
                                benefit="Cancele assinaturas esquecidas e economize R$50-200/mês"
                            />
                            <PremiumFeature
                                icon={<CreditCard className="w-6 h-6" />}
                                title="Otimizador de Cartão"
                                description="Baseado na data de fechamento do seu cartão, o app sugere o melhor dia para fazer compras grandes e ganhar até 40 dias para pagar sem juros."
                                benefit="Maximize seu prazo de pagamento e melhore seu fluxo de caixa"
                            />
                        </div>
                    </div>

                    {/* Pilar 3 */}
                    <div className="mb-16">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Star className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="text-2xl font-bold">Mudança de Hábitos</h3>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            <PremiumFeature
                                icon={<Star className="w-6 h-6" />}
                                title="R.O.F. (Return on Felicidade)"
                                description="Depois de cada gasto, avalie de 1-5 estrelas se valeu a pena. Com o tempo, você descobre que aquele almoço de R$80 te deixa mais feliz que compras de R$300."
                                benefit="Gaste menos e seja mais feliz ao focar no que realmente importa"
                            />
                            <PremiumFeature
                                icon={<Clock className="w-6 h-6" />}
                                title="Botão do Arrependimento"
                                description="Quer comprar algo caro? Adicione na wishlist e o app bloqueia a compra por 24-48h. Se ainda quiser depois, pode comprar. 70% das pessoas desistem."
                                benefit="Evite 7 em cada 10 compras por impulso e economize milhares por ano"
                            />
                            <PremiumFeature
                                icon={<Tag className="w-6 h-6" />}
                                title="Tags Transversais"
                                description="Use #ReformaCasa para agrupar gastos de Construção, Decoração e Móveis em um único projeto. Ou #Férias2025 para somar passagens, hotel e passeios."
                                benefit="Controle projetos complexos sem perder a visão do todo"
                            />
                        </div>
                    </div>

                    {/* Pilar 4 */}
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Shield className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="text-2xl font-bold">Gestão Profissional</h3>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <ComingSoonFeature
                                icon={<TrendingUp className="w-6 h-6" />}
                                title='Simulador "E Se?"'
                                description="E se eu comprar um carro parcelado em 60x? E se eu mudar de apartamento? Simule cenários futuros e veja o impacto real no seu orçamento antes de decidir."
                                eta="Q2 2026"
                                benefit="Tome decisões financeiras grandes com confiança e dados"
                            />
                            <ComingSoonFeature
                                icon={<Users className="w-6 h-6" />}
                                title="Divisão de Contas"
                                description="Dividiu o jantar com amigos? Pagou a conta do Airbnb? Registre quem deve quanto e receba lembretes automáticos. Nunca mais esqueça de cobrar."
                                eta="Q2 2026"
                                benefit="Pare de perder dinheiro esquecendo quem te deve"
                            />
                        </div>
                    </div>
                </div>

                {/* Pricing */}
                <div className="mt-24 max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Preço Justo, Valor Infinito</h2>
                        <p className="text-muted-foreground text-lg">
                            Comece grátis, evolua quando quiser
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Free */}
                        <div className="p-8 rounded-2xl bg-card border-2 border-border hover:border-primary/50 transition-all">
                            <h3 className="text-2xl font-bold mb-2">Gratuito</h3>
                            <p className="text-muted-foreground mb-6">Para sempre</p>
                            <div className="mb-6">
                                <span className="text-5xl font-bold">R$ 0</span>
                            </div>
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center gap-2">
                                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                                    <span>Até 50 transações/mês</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                                    <span>Categorização automática</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                                    <span>Analytics básico</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                                    <span>Multi-dispositivo</span>
                                </li>
                            </ul>
                            <Link href="/register">
                                <Button variant="outline" className="w-full" size="lg">
                                    Começar Grátis
                                </Button>
                            </Link>
                        </div>

                        {/* Premium */}
                        <div className="p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary shadow-xl shadow-primary/20 relative">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-white text-sm font-semibold rounded-full">
                                ⭐ Mais Popular
                            </div>
                            <h3 className="text-2xl font-bold mb-2">Premium</h3>
                            <p className="text-muted-foreground mb-6">Recursos ilimitados</p>
                            <div className="mb-6">
                                <span className="text-5xl font-bold">R$ 0,99</span>
                                <span className="text-muted-foreground">/mês</span>
                            </div>
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center gap-2">
                                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                                    <span className="font-semibold">Transações ilimitadas</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                                    <span>Todas as 10+ features premium</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                                    <span>Acesso antecipado a novidades</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                                    <span>Suporte prioritário</span>
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
                        Comece grátis agora e descubra o poder de ter controle total do seu dinheiro
                    </p>
                    <Link href="/register">
                        <Button size="lg" className="text-lg px-8 py-6 shadow-lg shadow-primary/20">
                            Criar Conta Grátis
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </Link>
                    <p className="text-sm text-muted-foreground mt-4">
                        Sem cartão de crédito • Cancele quando quiser
                    </p>
                </div>

                {/* Footer */}
                <div className="text-center mt-24 text-sm text-muted-foreground space-y-2">
                    <p>Desenvolvido com ❤️ por <span className="font-semibold text-primary">Rikelme Santos</span></p>
                    <p>🔒 Seus dados são 100% privados e criptografados</p>
                </div>
            </div>
        </div>
    );
}

// Implemented Feature Card
function ImplementedFeature({ icon, title, description, benefit }: { icon: React.ReactNode; title: string; description: string; benefit: string }) {
    return (
        <div className="p-6 rounded-2xl bg-green-500/5 border-2 border-green-500/20 hover:border-green-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-4 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold">{title}</h3>
                <div className="px-2 py-0.5 bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-semibold rounded-full">
                    ✓ Ativo
                </div>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{description}</p>
            <div className="flex items-start gap-2 p-3 bg-green-500/5 rounded-lg border border-green-500/10">
                <Zap className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-green-700 dark:text-green-300 font-medium">{benefit}</p>
            </div>
        </div>
    );
}

// Premium Feature Card
function PremiumFeature({ icon, title, description, benefit }: { icon: React.ReactNode; title: string; description: string; benefit: string }) {
    return (
        <div className="p-6 rounded-2xl bg-primary/5 border-2 border-primary/20 hover:border-primary/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold">{title}</h3>
                <div className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                    ⭐ Premium
                </div>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{description}</p>
            <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg border border-primary/10">
                <Sparkles className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-xs text-primary/80 font-medium">{benefit}</p>
            </div>
        </div>
    );
}

// Coming Soon Feature Card
function ComingSoonFeature({ icon, title, description, eta, benefit }: { icon: React.ReactNode; title: string; description: string; eta: string; benefit: string }) {
    return (
        <div className="p-6 rounded-2xl bg-muted/30 border-2 border-dashed border-muted-foreground/20 hover:border-muted-foreground/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4 text-muted-foreground group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold">{title}</h3>
                <div className="px-2 py-0.5 bg-muted text-muted-foreground text-xs font-semibold rounded-full">
                    {eta}
                </div>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{description}</p>
            <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg border border-muted-foreground/10">
                <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground/80 font-medium">{benefit}</p>
            </div>
        </div>
    );
}
