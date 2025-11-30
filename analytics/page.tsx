'use client';

import { BottomNav } from '@/components/bottom-nav';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, PieChart, TrendingUp } from 'lucide-react';

export default function AnalyticsPage() {
    return (
        <>
            <div className="min-h-screen pb-24">
                {/* Header */}
                <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border">
                    <div className="p-4">
                        <h1 className="text-2xl font-bold">Análise</h1>
                        <p className="text-sm text-muted-foreground">
                            Visualize seus gastos e receitas
                        </p>
                    </div>
                </header>

                {/* Main Content */}
                <main className="p-4 space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <BarChart3 className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <CardTitle>Gráficos e Relatórios</CardTitle>
                                    <CardDescription>Em desenvolvimento</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                Esta funcionalidade estará disponível em breve com gráficos interativos de gastos por categoria, evolução temporal e muito mais.
                            </p>
                        </CardContent>
                    </Card>

                    <div className="grid gap-4">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                                        <PieChart className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">Gastos por Categoria</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Visualize onde seu dinheiro está indo
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                                        <TrendingUp className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">Tendências Mensais</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Acompanhe a evolução dos seus gastos
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>

            {/* Bottom Navigation */}
            <BottomNav />
        </>
    );
}
