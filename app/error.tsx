'use client';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
            <h2 className="text-xl font-bold text-red-500 mb-4">Algo deu errado!</h2>
            <p className="text-muted-foreground mb-4">{error.message}</p>
            <button
                onClick={() => reset()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
            >
                Tentar novamente
            </button>
        </div>
    );
}
