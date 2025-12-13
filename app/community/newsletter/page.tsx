'use client';

import { ArrowLeft, User, Lock, Sparkles, Eye, Shield, Send, BookOpen, Minimize2, Maximize2 } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

// Helper to parse simple markdown structure from Bot
const SimpleMarkdown = ({ content }: { content: string }) => {
    if (!content) return null;

    const sections = content.split('\n\n');

    return (
        <div className="space-y-6 font-serif text-lg leading-relaxed text-gray-300">
            {sections.map((section, index) => {
                // Quote
                if (section.startsWith('>')) {
                    const quoteText = section.replace(/^>\s*/, '').replace(/"/g, '');
                    const [text, author] = quoteText.split('—');
                    return (
                        <blockquote key={index} className="border-l-4 border-[#8B5CF6] pl-6 my-8 italic text-xl text-gray-200 bg-white/5 py-4 rounded-r-lg">
                            &quot;{text.trim()}&quot;

                            {author && <footer className="text-sm text-[#8B5CF6] font-bold mt-2 not-italic tracking-widest uppercase">— {author.trim()}</footer>}
                        </blockquote>
                    );
                }
                // Heading 2
                if (section.startsWith('##')) {
                    return (
                        <h2 key={index} className="font-heading text-2xl font-bold text-white mt-10 mb-4 border-b border-white/10 pb-2">
                            {section.replace(/^##\s*/, '')}
                        </h2>
                    );
                }
                // Horizontal Rule
                if (section.startsWith('---')) {
                    return <hr key={index} className="border-white/10 my-10" />;
                }
                // Italic / Footer note
                if (section.startsWith('*') && section.endsWith('*')) {
                    return <p key={index} className="text-sm text-gray-500 italic text-center">{section.replace(/\*/g, '')}</p>;
                }
                // Standard Paragraph
                return <p key={index} className="text-gray-300 font-serif leading-8">{section}</p>;
            })}
        </div>
    );
};

export default function NewsletterPage() {
    const [article, setArticle] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [zenMode, setZenMode] = useState(false);

    useEffect(() => {
        const fetchArticle = async () => {
            const { data } = await supabase
                .from('news_articles')
                .select('*')
                .eq('is_published', true)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (data) setArticle(data);
            setLoading(false);
        };
        fetchArticle();
    }, []);

    // Fallback static data if no DB data
    const displayTitle = article?.title || "A Arte da Guerra Financeira";
    const displayDate = article ? new Date(article.created_at).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }) : "Hoje";
    const displayContent = article?.content || `> "A riqueza consiste não em ter grandes posses, mas em ter poucas necessidades." — Epicteto

## A Exegese
Vivemos em uma era de acumulação desenfreada. O sistema financeiro tradicional lucra com sua insatisfação, vendendo produtos complexos para problemas que não existiriam se mantivéssemos a simplicidade. A estratégia "Monk" não é sobre pobreza, é sobre eficiência.

Ao reduzir a complexidade da sua carteira, você elimina pontos de falha. Um portfólio de 3 ativos que você compreende profundamente supera um de 30 que você apenas monitora superficialmente. A verdadeira segurança vem do controle, e o controle exige foco.

## A Prática
Sua tarefa para hoje é auditar suas assinaturas recorrentes. Identifique uma que não traz valor real e elimine-a sem piedade. O dinheiro economizado deve ser redirecionado imediatamente para o seu aporte principal.

---
*Tempo de contemplação: ~2 minutos*`;

    const theme = article?.theme || "ESTRATÉGIA";

    return (
        <div className={`min-h-screen text-gray-200 transition-colors duration-700 ${zenMode ? 'bg-[#050505]' : 'bg-[#09090B]'}`}>

            {/* Nav - Hidden in Zen Mode */}
            <AnimatePresence>
                {!zenMode && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-0 w-full bg-[#09090B]/80 backdrop-blur-md border-b border-white/5 z-50 p-4"
                    >
                        <div className="max-w-xl mx-auto flex items-center justify-between">
                            <Link href="/community" className="p-2 -ml-2 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-white">
                                <ArrowLeft size={20} />
                            </Link>
                            <span className="text-xs font-bold tracking-[0.2em] text-[#8B5CF6] uppercase font-sans">Monk&apos;s Letter</span>
                            <button onClick={() => setZenMode(true)} className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-[#8B5CF6] transition-colors" title="Modo Zen">
                                <Maximize2 size={18} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Zen Mode Escape Button */}
            <AnimatePresence>
                {zenMode && (
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setZenMode(false)}
                        className="fixed top-6 right-6 z-50 p-3 bg-white/5 rounded-full text-gray-500 hover:text-white hover:bg-white/10 transition-all"
                    >
                        <Minimize2 size={20} />
                    </motion.button>
                )}
            </AnimatePresence>

            <main className={`max-w-xl mx-auto px-6 pb-32 transition-all duration-700 ${zenMode ? 'pt-20' : 'pt-32'}`}>

                {/* HEADLINE AREA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="mb-12 text-center"
                >
                    {!zenMode && (
                        <div className="flex items-center justify-center gap-2 mb-6">
                            <span className="bg-[#8B5CF6]/10 text-[#8B5CF6] text-[10px] font-bold px-3 py-1 rounded-full border border-[#8B5CF6]/20 uppercase tracking-widest font-sans">
                                {theme}
                            </span>
                        </div>
                    )}

                    <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                        {displayTitle}
                    </h1>

                    <p className="text-sm text-gray-500 font-sans tracking-widest uppercase">
                        {displayDate}
                    </p>
                </motion.div>

                {/* FEATURED IMAGE - Visible only in Normal Mode */}
                {!zenMode && article?.image_url && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="aspect-video w-full rounded-lg overflow-hidden mb-12 border border-white/10 grayscale hover:grayscale-0 transition-all duration-700 opacity-80 hover:opacity-100"
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={article.image_url} alt="Cover" className="w-full h-full object-cover" />
                    </motion.div>
                )}

                {/* CONTENT BODY */}
                <motion.div
                    className="prose prose-invert prose-lg max-w-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                >
                    <SimpleMarkdown content={displayContent} />
                </motion.div>

                {/* FOOTER - Hidden in Zen Mode */}
                {!zenMode && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mt-20 border-t border-white/10 pt-10"
                    >
                        <div className="flex items-center justify-center gap-2 text-gray-600 mb-8">
                            <Sparkles size={16} />
                            <span className="text-xs uppercase tracking-widest font-bold">Conselho dos Monges</span>
                        </div>

                        {/* Council Chat */}
                        <div className="space-y-4">
                            {article?.council_discussion && article.council_discussion.map((msg: any, index: number) => (
                                <div key={index} className="bg-[#111] p-6 rounded-lg border border-white/5 relative">
                                    <div className="absolute -top-3 left-6 px-2 bg-[#111] text-xs font-bold text-[#8B5CF6] uppercase tracking-wider">
                                        {msg.monk}
                                    </div>
                                    <p className="text-gray-400 italic text-sm font-serif leading-relaxed">
                                        &quot;{msg.message}&quot;

                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-16 text-center">
                            <p className="text-xs text-gray-600 font-serif italic">
                                &quot;Memento Mori. Você recebeu esta carta porque escolheu trilhar este caminho.&quot;

                            </p>
                        </div>
                    </motion.div>
                )}
            </main>
        </div>
    );
}

