import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Finance Tracker - Controle de Gastos Pessoal",
    description: "Controle completo de gastos pessoais com categorização inteligente",
    manifest: "/manifest.json",
    appleWebApp: {
        capable: true,
        statusBarStyle: "black-translucent",
        title: "Finance Tracker",
    },
    icons: {
        icon: [
            { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
            { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
        ],
        apple: [
            { url: "/icon-152x152.png", sizes: "152x152", type: "image/png" },
            { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
        ],
    },
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
    themeColor: "#10b981",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="pt-BR" className="dark">
            <head>
                <link rel="apple-touch-icon" href="/icon-192x192.png" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
            </head>
            <body className={inter.className}>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}
