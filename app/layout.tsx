import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { PrivacyProvider } from '@/lib/privacy-context';
import MonkDock from '@/components/MonkDock';
import { ThemeProvider } from '@/components/theme-provider';
import { SentryProvider } from '@/lib/sentry-context';
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Finance Tracker',
    description: 'Controle suas finanças de forma simples',
    manifest: '/manifest.json',
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
                <link rel="apple-touch-icon" href="/icon-192.png" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                <meta name="theme-color" content="#16a34a" />
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
                                {children}
                                <MonkDock />
                            </PrivacyProvider>
                        </AuthProvider>
                    </SentryProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
