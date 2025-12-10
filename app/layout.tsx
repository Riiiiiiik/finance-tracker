import type { Metadata, Viewport } from 'next';
import { Inter, Merriweather, Playfair_Display, Cormorant_Garamond, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { PrivacyProvider } from '@/lib/privacy-context';
import MonkDock from '@/components/MonkDock';
import { ThemeProvider } from '@/components/theme-provider';
import { SentryProvider } from '@/lib/sentry-context';
import ReloadPrompt from '@/components/ReloadPrompt';
import EmailGuard from '@/components/EmailGuard';
import PWAInstallBanner from '@/components/PWAInstallBanner';
import MonkModeToggle from '@/components/MonkModeToggle';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const merriweather = Merriweather({
    subsets: ['latin'],
    weight: ['300', '400', '700', '900'],
    variable: '--font-serif'
});
const playfair = Playfair_Display({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700', '800', '900'],
    variable: '--font-heading'
});
const cormorant = Cormorant_Garamond({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700'],
    variable: '--font-cormorant'
});
const jetbrains = JetBrains_Mono({
    subsets: ['latin'],
    weight: ['400', '500', '700'],
    variable: '--font-mono-code'
});

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
            <body className={`${inter.variable} ${merriweather.variable} ${playfair.variable} ${cormorant.variable} ${jetbrains.variable} font-sans`}>
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
                                    <div className="absolute inset-0 bg-[#000000] z-[-2]"></div>
                                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] z-[-1] opacity-50"></div>

                                    <EmailGuard />
                                    {children}
                                    <MonkDock />
                                    <EmailGuard />
                                    {children}
                                    <MonkDock />
                                    <ReloadPrompt />
                                    <MonkModeToggle />
                                    <PWAInstallBanner />
                                </main>
                            </PrivacyProvider>
                        </AuthProvider>
                    </SentryProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
