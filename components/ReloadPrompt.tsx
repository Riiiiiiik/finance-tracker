'use client';

import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';

export default function ReloadPrompt() {
    const [wb, setWb] = useState<any>(null);

    useEffect(() => {
        // Only run on client-side
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator && (window as any).workbox !== undefined) {
            const wbInstance = (window as any).workbox;
            setWb(wbInstance);

            // Add event listeners to detect when a new SW is waiting
            const onWaiting = () => {
                console.log('New service worker detected. Auto-updating...');

                // Atualizar automaticamente SEM mostrar prompt
                if (wbInstance) {
                    wbInstance.messageSkipWaiting();

                    wbInstance.addEventListener('controlling', () => {
                        window.location.reload();
                    });
                }
            };

            wbInstance.addEventListener('waiting', onWaiting);
            wbInstance.addEventListener('externalwaiting', onWaiting);

            return () => {
                wbInstance.removeEventListener('waiting', onWaiting);
                wbInstance.removeEventListener('externalwaiting', onWaiting);
            };
        }
    }, []);

    // Não renderizar nada - atualização é automática
    return null;
}
