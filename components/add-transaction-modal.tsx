"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { ArrowDownCircle, ArrowUpCircle, Loader2 } from "lucide-react";

interface AddTransactionModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onTransactionAdded: () => void;
}

const expenseCategories = [
    "Alimentação",
    "Transporte",
    "Moradia",
    "Saúde",
    "Educação",
    "Lazer",
    "Assinaturas",
    "Compras",
    "Outros",
];

const incomeCategories = [
    "Salário",
    "Freelance",
    "Investimentos",
    "Renda Extra",
    "Outros",
];

export function AddTransactionModal({
    open,
    onOpenChange,
    onTransactionAdded,
}: AddTransactionModalProps) {
    const [type, setType] = useState<"income" | "expense">("expense");
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [loading, setLoading] = useState(false);

    const categories = type === "income" ? incomeCategories : expenseCategories;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                alert("Você precisa estar logado para adicionar transações");
                return;
            }

            const { error } = await supabase.from("transactions").insert({
                user_id: user.id,
                description,
                amount: type === "expense" ? -Math.abs(parseFloat(amount)) : Math.abs(parseFloat(amount)),
                type,
                category,
                date,
            });

            if (error) throw error;

            // Reset form
            setDescription("");
            setAmount("");
            setCategory("");
            setDate(new Date().toISOString().split("T")[0]);

            onTransactionAdded();
            onOpenChange(false);
        } catch (error) {
            console.error("Erro ao adicionar transação:", error);
            alert("Erro ao adicionar transação. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-2xl">Nova Transação</DialogTitle>
                    <DialogDescription>
                        Adicione uma nova receita ou despesa ao seu controle financeiro
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    {/* Tipo de Transação */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setType("expense")}
                            className={`p-4 rounded-lg border-2 transition-all duration-200 ${type === "expense"
                                    ? "border-red-500 bg-red-500/10"
                                    : "border-white/10 hover:border-red-500/50"
                                }`}
                        >
                            <ArrowDownCircle
                                className={`h-6 w-6 mx-auto mb-2 ${type === "expense" ? "text-red-500" : "text-muted-foreground"
                                    }`}
                            />
                            <p className={`text-sm font-medium ${type === "expense" ? "text-red-500" : "text-muted-foreground"
                                }`}>
                                Despesa
                            </p>
                        </button>

                        <button
                            type="button"
                            onClick={() => setType("income")}
                            className={`p-4 rounded-lg border-2 transition-all duration-200 ${type === "income"
                                    ? "border-green-500 bg-green-500/10"
                                    : "border-white/10 hover:border-green-500/50"
                                }`}
                        >
                            <ArrowUpCircle
                                className={`h-6 w-6 mx-auto mb-2 ${type === "income" ? "text-green-500" : "text-muted-foreground"
                                    }`}
                            />
                            <p className={`text-sm font-medium ${type === "income" ? "text-green-500" : "text-muted-foreground"
                                }`}>
                                Receita
                            </p>
                        </button>
                    </div>

                    {/* Descrição */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Input
                            id="description"
                            placeholder="Ex: Café, Salário, Uber..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </div>

                    {/* Valor */}
                    <div className="space-y-2">
                        <Label htmlFor="amount">Valor (R$)</Label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            placeholder="0,00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                        />
                    </div>

                    {/* Categoria */}
                    <div className="space-y-2">
                        <Label htmlFor="category">Categoria</Label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione uma categoria" value={category} />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((cat) => (
                                    <SelectItem key={cat} value={cat}>
                                        {cat}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Data */}
                    <div className="space-y-2">
                        <Label htmlFor="date">Data</Label>
                        <Input
                            id="date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                        />
                    </div>

                    {/* Botões */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="flex-1"
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 gradient-primary"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                "Adicionar"
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
