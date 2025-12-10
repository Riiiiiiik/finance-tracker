'use client';

import { useEffect } from 'react';
import { Terminal, AlertTriangle, RefreshCcw } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Monk Error Boundary Caught:', error);
    }, [error]);

    return (
        <div className="min-h-screen bg-[#050505] text-white font-mono p-6 flex flex-col items-center justify-center">
            <div className="max-w-2xl w-full border border-red-900/50 bg-red-950/10 rounded-xl p-8 relative overflow-hidden">
                {/* Header */}
                <div className="flex items-center gap-3 text-red-500 mb-6 border-b border-red-900/30 pb-4">
                    <AlertTriangle size={24} />
                    <h2 className="text-xl font-bold tracking-widest">FALHA NO PROTOCOLO</h2>
                </div>

                {/* Error Details */}
                <div className="bg-black/80 rounded p-4 mb-6 border border-red-900/30 overflow-auto max-h-[400px]">
                    <p className="text-red-400 font-bold mb-2">{error.name}: {error.message}</p>
                    <pre className="text-xs text-gray-500 whitespace-pre-wrap leading-relaxed">
                        {error.stack}
                    </pre>
                    {error.digest && (
                        <p className="text-xs text-gray-600 mt-4 border-t border-gray-800 pt-2">
                            Digest: {error.digest}
                        </p>
                    )}
                </div>

                {/* Action */}
                <button
                    onClick={() => reset()}
                    className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded font-bold uppercase tracking-wider transition-all"
                >
                    <RefreshCcw size={16} />
                    Reiniciar Sistema
                </button>

                {/* Background Decor */}
                <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(45deg,transparent_25%,#ff0000_50%,transparent_75%)] bg-[length:4px_4px]"></div>
            </div>
        </div>
    );
}
