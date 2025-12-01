"use client";

import { useState, useEffect } from "react";
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
import { Loader2, User, Mail, Save } from "lucide-react";

interface ProfileModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: any;
}

export function ProfileModal({ open, onOpenChange, user }: ProfileModalProps) {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadingProfile, setLoadingProfile] = useState(true);

    useEffect(() => {
        if (open && user) {
            loadProfile();
        }
    }, [open, user]);

    const loadProfile = async () => {
        try {
            setLoadingProfile(true);

            // Buscar perfil do usuário
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();

            if (error && error.code !== "PGRST116") {
                // PGRST116 = não encontrado (perfil ainda não criado)
                throw error;
            }

            if (data) {
                setFullName(data.full_name || "");
                setEmail(data.email || user.email || "");
            } else {
                // Se não existe perfil, usar dados do auth
                setFullName(user.user_metadata?.full_name || "");
                setEmail(user.email || "");
            }
        } catch (error) {
            console.error("Erro ao carregar perfil:", error);
        } finally {
            setLoadingProfile(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Atualizar perfil
            const { error } = await supabase
                .from("profiles")
                .upsert({
                    id: user.id,
                    email: user.email,
                    full_name: fullName,
                    updated_at: new Date().toISOString(),
                });

            if (error) throw error;

            alert("Perfil atualizado com sucesso!");
            onOpenChange(false);
        } catch (error: any) {
            console.error("Erro ao atualizar perfil:", error);
            alert("Erro ao atualizar perfil: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl flex items-center gap-2">
                        <User className="h-6 w-6 text-primary" />
                        Meu Perfil
                    </DialogTitle>
                    <DialogDescription>
                        Visualize e edite suas informações pessoais
                    </DialogDescription>
                </DialogHeader>

                {loadingProfile ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                        {/* Nome Completo */}
                        <div className="space-y-2">
                            <Label htmlFor="fullName" className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Nome Completo
                            </Label>
                            <Input
                                id="fullName"
                                placeholder="Seu nome completo"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                            />
                        </div>

                        {/* Email (somente leitura) */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                disabled
                                className="bg-muted cursor-not-allowed"
                            />
                            <p className="text-xs text-muted-foreground">
                                O email não pode ser alterado
                            </p>
                        </div>

                        {/* ID do Usuário (para referência) */}
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">ID do Usuário</Label>
                            <div className="bg-muted rounded-md p-2">
                                <code className="text-xs break-all">{user.id}</code>
                            </div>
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
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Salvar
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
