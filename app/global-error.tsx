'use client';

import { Terminal, AlertTriangle, RefreshCcw } from 'lucide-react';

// Force deploy trigger
export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body className="bg-[#050505] text-white">
                <div className="min-h-screen font-mono p-6 flex flex-col items-center justify-center">
                    <div className="max-w-2xl w-full border border-red-900/50 bg-red-950/10 rounded-xl p-8 relative overflow-hidden">
                        <div className="flex items-center gap-3 text-red-500 mb-6 border-b border-red-900/30 pb-4">
                            <AlertTriangle size={24} />
                            <h2 className="text-xl font-bold tracking-widest">CRITICAL SYSTEM FAILURE</h2>
                        </div>

                        <div className="bg-black/80 rounded p-4 mb-6 border border-red-900/30 overflow-auto max-h-[400px]">
                            <p className="text-red-400 font-bold mb-2">{error.name}: {error.message}</p>
                            <pre className="text-xs text-gray-500 whitespace-pre-wrap">
                                {error.stack}
                            </pre>
                        </div>

                        <button
                            onClick={() => reset()}
                            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded font-bold uppercase tracking-wider"
                        >
                            REBOOT SYSTEM
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}
