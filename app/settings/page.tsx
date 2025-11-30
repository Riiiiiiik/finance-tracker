'use client';

import { BottomNav } from '@/components/bottom-nav';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, User, LogOut, Moon } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function SettingsPage() {
    const { user, signOut } = useAuth();

    const handleLogout = async () => {
        await signOut();
    };

    return (
        <>
            <div className="min-h-screen pb-24">
                {/* Header */}
                <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border">
                    <div className="p-4">
                        <h1 className="text-2xl font-bold">Configurações</h1>
                        <p className="text-sm text-muted-foreground">
                            Gerencie sua conta e preferências
                        </p>
                    </div>
                </header>

                {/* Main Content */}
                <main className="p-4 space-y-6">
                    {/* Profile Section */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-2xl font-bold text-white">
                                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div>
                                    <CardTitle>{user?.email?.split('@')[0] || 'Usuário'}</CardTitle>
                                    <CardDescription>{user?.email || 'user@example.com'}</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                    </Card>

                    {/* Import Section */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Upload className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <CardTitle>Importar Transações</CardTitle>
                                    <CardDescription>
                                        Importe seus extratos em CSV ou OFX
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button variant="outline" className="w-full justify-start" size="lg">
                                <FileText className="w-5 h-5 mr-3" />
                                Importar arquivo CSV
                            </Button>
                            <Button variant="outline" className="w-full justify-start" size="lg">
                                <FileText className="w-5 h-5 mr-3" />
                                Importar arquivo OFX
                            </Button>
                            <p className="text-xs text-muted-foreground">
                                Funcionalidade em desenvolvimento - Interface apenas
                            </p>
                        </CardContent>
                    </Card>

                    {/* Settings Options */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Preferências</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <button className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-accent transition-colors">
                                <div className="flex items-center gap-3">
                                    <User className="w-5 h-5 text-muted-foreground" />
                                    <span className="font-medium">Editar Perfil</span>
                                </div>
                            </button>

                            <button className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-accent transition-colors">
                                <div className="flex items-center gap-3">
                                    <Moon className="w-5 h-5 text-muted-foreground" />
                                    <span className="font-medium">Tema Escuro</span>
                                </div>
                                <div className="w-12 h-6 bg-primary rounded-full relative">
                                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                                </div>
                            </button>
                        </CardContent>
                    </Card>

                    {/* Logout */}
                    <Button
                        variant="destructive"
                        className="w-full"
                        size="lg"
                        onClick={handleLogout}
                    >
                        <LogOut className="w-5 h-5 mr-2" />
                        Sair da Conta
                    </Button>

                    {/* App Info */}
                    <div className="text-center text-sm text-muted-foreground space-y-1">
                        <p>Finance Tracker MVP v1.0.0</p>
                        <p>Desenvolvido com Next.js & Supabase</p>
                    </div>
                </main>
            </div>

            {/* Bottom Navigation */}
            <BottomNav />
        </>
    );
}
