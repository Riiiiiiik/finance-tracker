import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { PrivacyProvider } from '@/lib/privacy-context';
import MonkDock from '@/components/MonkDock';
import { ThemeProvider } from '@/components/theme-provider';
import { SentryProvider } from '@/lib/sentry-context';
import ReloadPrompt from '@/components/ReloadPrompt';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Finance Tracker',
    description: 'Controle suas finanças de forma simples',
    manifest: '/manifest.json',
    icons: {
        icon: '/logo.png',
        apple: '/logo.png',
    },
    appleWebApp: {
        capable: true,
        statusBarStyle: 'black-translucent',
        title: 'Finance Tracker',
    },
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-BR" suppressHydrationWarning>
            <head>
                <link rel="apple-touch-icon" href="/icon-192-v2.png" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                <meta name="theme-color" content="#10B981" />
            </head>
            <body className={inter.className}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                    disableTransitionOnChange
                >
                    <SentryProvider>
                        <AuthProvider>
                            <PrivacyProvider>
                                <main className="min-h-screen bg-background relative overflow-hidden">
                                    {/* Background patterns */}
                                    <div className="absolute inset-0 bg-[#000000] z-[-2]"></div>
                                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] z-[-1] opacity-50"></div>

                                    {children}
                                    <MonkDock />
                                    <ReloadPrompt />
                                </main>
                            </PrivacyProvider>
                        </AuthProvider>
                    </SentryProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
