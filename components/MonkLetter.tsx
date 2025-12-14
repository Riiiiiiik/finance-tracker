'use client';

import { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

import { supabase } from '@/lib/supabase';

import SentryToast from './SentryToast';

export default function MonkLetter() {
    const [article, setArticle] = useState<any>(null);
    const [notification, setNotification] = useState<string | null>(null);

    const fetchLatestNews = async () => {
        const { data } = await supabase
            .from('news_articles')
            .select('title, summary, created_at')
            .eq('is_published', true)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (data) setArticle(data);
    };

    useEffect(() => {
        fetchLatestNews();

        // Realtime Subscription
        const channel = supabase
            .channel('news_updates')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'news_articles'
                },
                (payload) => {
                    console.log('Nova Monk Letter recebida:', payload);
                    setNotification("Nova Monk's Letter disponível! Atualizando...");
                    fetchLatestNews();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return (
        <div className="w-full px-1 py-4">
            {/* The Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#0A0A0A] rounded-2xl border border-purple-500/20 p-5 relative overflow-hidden"
            >
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-3xl rounded-full pointer-events-none" />

                {/* Header */}
                <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                        <span className="text-purple-500 font-bold text-xs tracking-widest uppercase">Monk&apos;s Letter</span>
                    </div>
                    <span className="text-[10px] text-gray-500 font-medium">
                        {article ? new Date(article.created_at).toLocaleDateString('pt-BR') : 'Hoje'}
                    </span>
                </div>

                {/* Content */}
                <div className="mb-6">
                    <h3 className="text-white font-bold text-lg mb-2 line-clamp-1">
                        {article?.title || "A Chegada do Monk.Sentry"}
                    </h3>
                    <p className="text-gray-400 text-xs leading-relaxed line-clamp-3">
                        {article?.summary || "Implementamos o novo algoritmo de detecção de risco e melhoramos a performance do Vault. Veja o que mudou na Ordem."}
                    </p>
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-end border-t border-white/5 pt-4">
                    <Link href="/community/newsletter" className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors group">
                        Ler Completo
                        <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                </div>
            </motion.div>

            {/* Subtext Footer */}
            <p className="text-center text-[10px] text-gray-600 mt-3 font-medium tracking-wide">
                Todo dia as 07:30h a melhor curadoria selecionado por cada Monk.
            </p>

            <SentryToast
                message={notification}
                onClose={() => setNotification(null)}
            />
        </div>
    );
}
