'use client';

import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';

export default function ReloadPrompt() {
    const [needRefresh, setNeedRefresh] = useState(false);
    const [wb, setWb] = useState<any>(null);

    useEffect(() => {
        // Only run on client-side
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator && (window as any).workbox !== undefined) {
            const wbInstance = (window as any).workbox;
            setWb(wbInstance);

            // Add event listeners to detect when a new SW is waiting
            const onWaiting = () => {
                console.log('New service worker waiting. Prompting update.');
                setNeedRefresh(true);
            };

            wbInstance.addEventListener('waiting', onWaiting);
            wbInstance.addEventListener('externalwaiting', onWaiting);

            return () => {
                wbInstance.removeEventListener('waiting', onWaiting);
                wbInstance.removeEventListener('externalwaiting', onWaiting);
            };
        }
    }, []);

    const updateServiceWorker = async () => {
        if (wb) {
            // Tell the new SW to take control immediately
            wb.messageSkipWaiting();

            // Listen for the controlling event to reload the page once the new SW takes over
            wb.addEventListener('controlling', () => {
                window.location.reload();
            });
        }
    };

    if (!needRefresh) return null;

    return (
        <div className="update-toast">
            <div className="toast-message flex items-center gap-2">
                <span>Nova versão disponível! 🚀</span>
            </div>
            <button
                className="toast-button flex items-center gap-2"
                onClick={updateServiceWorker}
            >
                <RefreshCw size={14} className="animate-spin-slow" />
                Atualizar
            </button>
        </div>
    );
}
