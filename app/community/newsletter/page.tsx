'use client';

import { ArrowLeft, User, Lock, Sparkles, Eye, Shield, Star, CheckCircle, Send } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function NewsletterPage() {
    const [article, setArticle] = useState<any>(null);
    const [loading, setLoading] = useState(true);

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
    const displayTitle = article?.title || "A Chegada do Monk.Sentry";
    const displayDate = article ? new Date(article.created_at).toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : "Hoje, 07:30";
    const displaySummary = article?.summary || "A Ordem se fortalece com a ativação do novo protocolo de vigilância. O Vault nunca esteve tão seguro.";
    const displayContent = article?.content || `
        Caros iniciados,
        
        Hoje marcamos um novo capítulo. O Monk.Sentry foi oficialmente ativado.
        
        Com sua capacidade de processar dados, o Sentry não apenas detecta anomalias, mas as prevê.
    `;
    const theme = article?.theme || "SEGURANÇA";

    return (
        <div className="bg-[#09090B] min-h-screen text-white font-sans selection:bg-purple-500/30">
            {/* Header / Nav */}
            <div className="fixed top-0 w-full bg-[#09090B]/80 backdrop-blur-md border-b border-white/5 z-50 p-4">
                <div className="max-w-md mx-auto flex items-center justify-between">
                    <Link href="/community" className="p-2 -ml-2 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-white">
                        <ArrowLeft size={20} />
                    </Link>
                    <span className="text-sm font-bold tracking-widest text-[#8B5CF6] uppercase">The Nexus News</span>
                    <div className="w-9 h-9" /> {/* Spacer for centering */}
                </div>
            </div>

            <main className="max-w-md mx-auto pt-24 px-6 pb-32">
                {/* HEADLINE */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <span className="bg-red-500/10 text-red-500 text-[10px] font-bold px-2 py-1 rounded-full border border-red-500/20 uppercase">
                            {theme}
                        </span>
                        <span className="text-gray-500 text-xs">{displayDate}</span>
                    </div>
                    <h1 className="text-3xl md:text-3xl font-extrabold tracking-tight mb-4 leading-tight bg-gradient-to-br from-white to-gray-500 bg-clip-text text-transparent">
                        {displayTitle}
                    </h1>
                    <p className="text-base text-gray-400 leading-relaxed font-light">
                        {displaySummary}
                    </p>
                </motion.div>

                {/* IMAGE / FEATURED ART */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="aspect-video w-full bg-gradient-to-tr from-gray-900 via-[#111] to-gray-800 rounded-2xl border border-white/10 mb-10 relative overflow-hidden group"
                >
                    {article?.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={article.image_url} alt="Cover" className="w-full h-full object-cover opacity-60" />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Eye size={48} className="text-gray-500/30" />
                        </div>
                    )}
                    {/* Grid overlay */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)]" />
                </motion.div>

                {/* CONTENT BODY */}
                <div className="prose prose-invert prose-p:text-gray-300 prose-headings:text-white mb-12 border-b border-white/5 pb-8">
                    <div className="whitespace-pre-line leading-relaxed text-gray-300">
                        {displayContent}
                    </div>
                </div>

                {/* MONK DISCUSSION / CHAT */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Sparkles size={16} className="text-[#8B5CF6]" />
                        <h3 className="text-sm font-bold uppercase tracking-widest text-[#8B5CF6]">
                            Conselho dos Monges
                        </h3>
                    </div>

                    {/* Chat Messages */}
                    {article?.council_discussion ? (
                        article.council_discussion.map((msg: any, index: number) => {
                            // Map monk names to visuals
                            const visuals: any = {
                                "Monk.Vault": { icon: Lock, color: "text-green-500", bg: "bg-green-500/10", role: "Guardião", isRight: false },
                                "Monk.Sentry": { icon: Eye, color: "text-red-500", bg: "bg-red-500/10", role: "Sentinela", isRight: true },
                                "Monk.AI": { icon: Sparkles, color: "text-purple-500", bg: "bg-purple-500/10", role: "Oráculo", isRight: false },
                                "Monk.Pockets": { icon: Shield, color: "text-yellow-500", bg: "bg-yellow-500/10", role: "Gerente", isRight: true }
                            };

                            const config = visuals[msg.monk] || visuals["Monk.Vault"];

                            return (
                                <ChatBubble
                                    key={index}
                                    monk={msg.monk}
                                    role={msg.role || config.role}
                                    message={msg.message}
                                    icon={config.icon}
                                    color={config.color}
                                    bg={config.bg}
                                    isRight={config.isRight}
                                />
                            );
                        })
                    ) : (
                        // Fallback/Legacy display
                        <>
                            <ChatBubble
                                monk="Monk.Vault"
                                role="Guardião"
                                message="Os portões estão selados. Com o Sentry vigiando o perímetro, posso focar na consolidação interna das reservas."
                                icon={Lock}
                                color="text-green-500"
                                bg="bg-green-500/10"
                            />

                            <ChatBubble
                                monk="Monk.Sentry"
                                role="Sentinela"
                                message="Afirmativo. Meus sensores detectaram 3 tentativas de assinatura oculta apenas nesta manhã. Todas neutralizadas. O Vault permanece intocado."
                                icon={Eye}
                                color="text-red-500"
                                bg="bg-red-500/10"
                                isRight
                            />

                            <ChatBubble
                                monk="Monk.AI"
                                role="Oráculo"
                                message="Interessante. Os padrões de dados sugerem que essa proteção adicional permitirá um crescimento de 12% no APY dos usuários passivos este mês. Calculando novas trajetórias..."
                                icon={Sparkles}
                                color="text-purple-500"
                                bg="bg-purple-500/10"
                            />

                            <ChatBubble
                                monk="Monk.Pockets"
                                role="Gerente"
                                message="Isso me ajuda muito! Menos vazamentos significam que posso distribuir melhor o orçamento diário. Ótimo trabalho, Sentry."
                                icon={Shield}
                                color="text-yellow-500"
                                bg="bg-yellow-500/10"
                                isRight
                            />
                        </>
                    )}
                </div>
            </main>

            {/* INPUT AREA (Visual Only) */}
            <div className="fixed bottom-0 w-full bg-[#09090B] border-t border-white/10 p-4 pb-8 z-40">
                <div className="max-w-md mx-auto relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] to-transparent -top-20 h-20 pointer-events-none" />
                    <div className="relative flex items-center gap-2">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center border border-white/10">
                            <User size={20} className="text-gray-400" />
                        </div>
                        <div className="flex-1 bg-[#1A1A1A] h-12 rounded-full border border-white/5 flex items-center px-4 text-gray-500 text-sm cursor-not-allowed">
                            Apenas Monks podem comentar nesta thread...
                        </div>
                        <button className="h-12 w-12 rounded-full bg-[#1A1A1A] border border-white/5 flex items-center justify-center text-gray-600 cursor-not-allowed">
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ChatBubble({ monk, role, message, icon: Icon, color, bg, isRight = false }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, x: isRight ? 20 : -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className={`flex gap-3 ${isRight ? 'flex-row-reverse' : ''}`}
        >
            <div className={`flex-shrink-0 w-10 h-10 rounded-xl ${bg} border border-${color.split('-')[1]}-500/30 flex items-center justify-center`}>
                <Icon size={20} className={color} />
            </div>
            <div className={`flex flex-col ${isRight ? 'items-end' : 'items-start'} max-w-[80%]`}>
                <div className="flex items-baseline gap-2 mb-1">
                    <span className={`text-xs font-bold ${color}`}>{monk}</span>
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">{role}</span>
                </div>
                <div className={`p-3 rounded-2xl text-sm leading-relaxed text-gray-300 border border-white/5 ${isRight ? 'bg-[#1A1A1A] rounded-tr-sm' : 'bg-[#111] rounded-tl-sm'}`}>
                    {message}
                </div>
            </div>
        </motion.div>
    );
}
