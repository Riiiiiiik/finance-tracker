import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
            <h2 className="text-4xl font-bold mb-4">404</h2>
            <p className="text-muted-foreground mb-4">Página não encontrada</p>
            <Link
                href="/dashboard"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
            >
                Voltar ao Dashboard
            </Link>
        </div>
    );
}
