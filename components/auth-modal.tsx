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
import { supabase } from "@/lib/supabase";
import { Loader2, Mail, Lock, User } from "lucide-react";

interface AuthModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: "login" | "signup";
    onSuccess: () => void;
    onSwitchMode: () => void;
}

export function AuthModal({
    open,
    onOpenChange,
    mode,
    onSuccess,
    onSwitchMode,
}: AuthModalProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            if (mode === "signup") {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: name,
                        },
                    },
                });

                if (error) throw error;

                if (data.user) {
                    // Verificar se precisa confirmar email
                    if (data.user.identities && data.user.identities.length === 0) {
                        setError("Este email já está cadastrado. Faça login.");
                        return;
                    }

                    alert("Conta criada com sucesso! Você já pode fazer login.");
                    onSuccess();
                }
            } else {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) throw error;

                if (data.user) {
                    onSuccess();
                }
            }

            // Reset form
            setEmail("");
            setPassword("");
            setName("");
            onOpenChange(false);
        } catch (error: any) {
            console.error("Erro de autenticação:", error);

            // Traduzir erros comuns
            let errorMessage = "Erro ao processar sua solicitação";

            if (error.message.includes("Invalid login credentials")) {
                errorMessage = "Email ou senha incorretos";
            } else if (error.message.includes("Email not confirmed")) {
                errorMessage = "Por favor, confirme seu email antes de fazer login";
            } else if (error.message.includes("User already registered")) {
                errorMessage = "Este email já está cadastrado";
            } else if (error.message.includes("Password should be at least 6 characters")) {
                errorMessage = "A senha deve ter no mínimo 6 caracteres";
            } else if (error.message.includes("Unable to validate email address")) {
                errorMessage = "Email inválido";
            } else if (error.message.includes("Failed to fetch") || error.message.includes("fetch")) {
                errorMessage = "Erro de conexão. Verifique: 1) Sua internet 2) Se executou o SQL no Supabase 3) Se configurou as URLs no Supabase (veja DATABASE_SETUP.md)";
            } else if (error.message) {
                errorMessage = error.message;
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl">
                        {mode === "login" ? "Entrar na sua conta" : "Criar nova conta"}
                    </DialogTitle>
                    <DialogDescription>
                        {mode === "login"
                            ? "Entre com suas credenciais para acessar o dashboard"
                            : "Preencha os dados abaixo para criar sua conta gratuita"}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    {mode === "signup" && (
                        <div className="space-y-2">
                            <Label htmlFor="name" className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Nome Completo
                            </Label>
                            <Input
                                id="name"
                                placeholder="Seu nome"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password" className="flex items-center gap-2">
                            <Lock className="h-4 w-4" />
                            Senha
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                        {mode === "signup" && (
                            <p className="text-xs text-muted-foreground">
                                Mínimo de 6 caracteres
                            </p>
                        )}
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                            <p className="text-sm text-red-500">{error}</p>
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full gradient-primary"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Processando...
                            </>
                        ) : mode === "login" ? (
                            "Entrar"
                        ) : (
                            "Criar Conta"
                        )}
                    </Button>

                    <div className="text-center pt-2">
                        <button
                            type="button"
                            onClick={onSwitchMode}
                            className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                            {mode === "login" ? (
                                <>
                                    Não tem uma conta?{" "}
                                    <span className="text-primary font-medium">Cadastre-se</span>
                                </>
                            ) : (
                                <>
                                    Já tem uma conta?{" "}
                                    <span className="text-primary font-medium">Faça login</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
