"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    ArrowDownCircle,
    ArrowUpCircle,
    LogOut,
    Plus,
    Wallet,
    TrendingUp,
    TrendingDown,
    Calendar,
    Loader2,
    Trash2,
    User,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { AddTransactionModal } from "@/components/add-transaction-modal";
import { ProfileModal } from "@/components/profile-modal";

interface Transaction {
    id: string;
    description: string;
    amount: number;
    category: string;
    date: string;
    type: "income" | "expense";
}

interface DashboardProps {
    user: any;
    onLogout: () => void;
}

export function Dashboard({ user, onLogout }: DashboardProps) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    useEffect(() => {
        if (user) {
            loadTransactions();
        }
    }, [user]);

    const loadTransactions = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("transactions")
                .select("*")
                .order("date", { ascending: false })
                .limit(10);

            if (error) throw error;

            setTransactions(data || []);
        } catch (error) {
            console.error("Erro ao carregar transações:", error);
        } finally {
            setLoading(false);
        }
    };

    const deleteTransaction = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir esta transação?")) return;

        try {
            const { error } = await supabase
                .from("transactions")
                .delete()
                .eq("id", id);

            if (error) throw error;

            loadTransactions();
        } catch (error) {
            console.error("Erro ao excluir transação:", error);
            alert("Erro ao excluir transação. Tente novamente.");
        }
    };

    const balance = transactions.reduce((acc, t) => acc + t.amount, 0);
    const income = transactions
        .filter((t) => t.type === "income")
        .reduce((acc, t) => acc + t.amount, 0);
    const expenses = transactions
        .filter((t) => t.type === "expense")
        .reduce((acc, t) => acc + Math.abs(t.amount), 0);

    const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Usuário";

    return (
        <main className="min-h-screen pb-24 animate-fade-in">
            {/* Header com efeito glass */}
            <header className="sticky top-0 z-10 glass-effect border-b border-white/10 px-4 py-4 animate-slide-up">
                <div className="flex items-center justify-between max-w-4xl mx-auto">
                    <div>
                        <h1 className="text-xl font-bold flex items-center gap-2">
                            Olá, {userName}!
                            <span className="text-2xl animate-bounce inline-block">👋</span>
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Bem-vindo ao seu controle financeiro
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsProfileModalOpen(true)}
                            className="hover:bg-primary/10 hover:text-primary transition-all duration-200"
                        >
                            <User className="h-5 w-5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onLogout}
                            className="hover:bg-red-500/10 hover:text-red-500 transition-all duration-200"
                        >
                            <LogOut className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
                {/* Balance Card com gradiente e animação */}
                <Card className="gradient-card border-primary/30 hover-lift overflow-hidden relative animate-scale-in">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl"></div>

                    <CardHeader className="relative z-10">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Wallet className="h-4 w-4 text-primary" />
                            Saldo Atual
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-5xl font-bold text-gradient mb-6 tracking-tight">
                            R$ {balance.toFixed(2).replace(".", ",")}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Card de Receitas */}
                            <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20 hover-lift">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="p-2 bg-green-500/20 rounded-full">
                                        <TrendingUp className="h-4 w-4 text-green-500" />
                                    </div>
                                    <p className="text-xs text-muted-foreground">Receitas</p>
                                </div>
                                <p className="text-xl font-bold text-green-500">
                                    R$ {income.toFixed(2).replace(".", ",")}
                                </p>
                            </div>

                            {/* Card de Despesas */}
                            <div className="bg-red-500/10 rounded-lg p-4 border border-red-500/20 hover-lift">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="p-2 bg-red-500/20 rounded-full">
                                        <TrendingDown className="h-4 w-4 text-red-500" />
                                    </div>
                                    <p className="text-xs text-muted-foreground">Despesas</p>
                                </div>
                                <p className="text-xl font-bold text-red-500">
                                    R$ {expenses.toFixed(2).replace(".", ",")}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Transactions List com animação */}
                <Card className="glass-effect border-white/10 hover-lift animate-slide-up">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <div className="h-1 w-1 rounded-full bg-primary animate-pulse"></div>
                            Últimas Transações
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : transactions.length === 0 ? (
                            <div className="text-center py-12 px-4">
                                <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                                <p className="text-muted-foreground mb-2">Nenhuma transação ainda</p>
                                <p className="text-sm text-muted-foreground">
                                    Clique no botão + para adicionar sua primeira transação
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-white/5 hover:bg-transparent">
                                            <TableHead className="text-muted-foreground">Descrição</TableHead>
                                            <TableHead className="text-right text-muted-foreground">Valor</TableHead>
                                            <TableHead className="w-12"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {transactions.map((transaction, index) => (
                                            <TableRow
                                                key={transaction.id}
                                                className="border-white/5 hover:bg-white/5 transition-all duration-200 group"
                                                style={{
                                                    animationDelay: `${index * 0.1}s`,
                                                    animation: "slideUp 0.4s ease-out backwards",
                                                }}
                                            >
                                                <TableCell className="py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className={`p-2 rounded-full ${transaction.type === "income"
                                                                ? "bg-green-500/10 group-hover:bg-green-500/20"
                                                                : "bg-red-500/10 group-hover:bg-red-500/20"
                                                                } transition-colors duration-200`}
                                                        >
                                                            {transaction.type === "income" ? (
                                                                <ArrowUpCircle className="h-4 w-4 text-green-500" />
                                                            ) : (
                                                                <ArrowDownCircle className="h-4 w-4 text-red-500" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium group-hover:text-primary transition-colors duration-200">
                                                                {transaction.description}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                                {transaction.category} •{" "}
                                                                {new Date(transaction.date).toLocaleDateString("pt-BR")}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right py-4">
                                                    <span
                                                        className={`text-lg font-bold ${transaction.type === "income"
                                                            ? "text-green-500"
                                                            : "text-red-500"
                                                            }`}
                                                    >
                                                        {transaction.type === "income" ? "+" : "-"}R${" "}
                                                        {Math.abs(transaction.amount)
                                                            .toFixed(2)
                                                            .replace(".", ",")}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="py-4">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => deleteTransaction(transaction.id)}
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10 hover:text-red-500"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Floating Action Button com animação de pulso */}
            <div className="fixed bottom-8 right-8 z-20">
                <Button
                    size="lg"
                    onClick={() => setIsModalOpen(true)}
                    className="h-16 w-16 rounded-full gradient-primary shadow-2xl hover:shadow-primary/50 hover:scale-110 transition-all duration-300 pulse-animation border-2 border-primary/20"
                >
                    <Plus className="h-7 w-7" />
                </Button>
            </div>

            {/* Modal de Adicionar Transação */}
            <AddTransactionModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                onTransactionAdded={loadTransactions}
            />

            {/* Modal de Perfil */}
            <ProfileModal
                open={isProfileModalOpen}
                onOpenChange={setIsProfileModalOpen}
                user={user}
            />
        </main>
    );
}
