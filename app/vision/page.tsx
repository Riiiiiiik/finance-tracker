'use client';

import MonkForge from '@/components/MonkForge';
import { useRouter } from 'next/navigation';

export default function MonkVisionPage() {
    const router = useRouter();

    return (
        <MonkForge
            fullScreen={true}
            moduleName="MONK VISION CORTEX"
            description="O sistema de visão computacional está sendo calibrado. Aguarde atualizações da Ordem."
            onClose={() => router.back()}
        />
    );
}
