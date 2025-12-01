import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Finance Tracker - Controle Financeiro",
    description: "Controle suas finanças pessoais de forma simples e eficiente",
    manifest: "/manifest.json",
    appleWebApp: {
        capable: true,
        statusBarStyle: "black-translucent",
        title: "Finance Tracker",
    },
    icons: {
        icon: [
            { url: "/icon-192x192.svg", sizes: "192x192", type: "image/svg+xml" },
            { url: "/icon-512x512.svg", sizes: "512x512", type: "image/svg+xml" },
        ],
        apple: [
            { url: "/icon-192x192.svg", sizes: "192x192", type: "image/svg+xml" },
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
    interactiveWidget: "resizes-content",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="pt-BR">
            <head>
                <link rel="apple-touch-icon" href="/icon-192x192.svg" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
            </head>
            <body className={inter.className}>{children}</body>
        </html>
    );
}
