import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { z } from 'zod';

// Schema de validação
const ingestSchema = z.object({
    title: z.string().min(1),
    summary: z.string().min(1),
    content: z.string().min(1),
    theme: z.string().optional(),
    monk_author: z.string().optional().default('Monk.Sentry'),
    date: z.string().optional(),
    image_url: z.string().url().optional(),
    council_discussion: z.any().optional(), // Pode ser array ou string json
    is_published: z.boolean().optional().default(true)
});

export async function POST(request: Request) {
    try {
        const apiKey = request.headers.get('x-api-key');
        const cronSecret = process.env.CRON_SECRET;

        // 1. Validação de Autenticação Segura
        if (!cronSecret || apiKey !== cronSecret) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Validação de Input (Zod)
        const body = await request.json();
        const validation = ingestSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: 'Invalid data', details: validation.error.format() }, { status: 400 });
        }

        const newsData = validation.data;

        // 3. Inserção Segura (Usando Admin Client)
        // Isso permite bloquear a tabela news_articles para insert público/anon via RLS
        const { data, error } = await supabaseAdmin
            .from('news_articles')
            .insert([
                {
                    title: newsData.title,
                    summary: newsData.summary,
                    content: newsData.content,
                    theme: newsData.theme,
                    monk_author: newsData.monk_author,
                    date: newsData.date || new Date().toISOString().split('T')[0],
                    image_url: newsData.image_url,
                    council_discussion: newsData.council_discussion,
                    is_published: newsData.is_published
                }
            ])
            .select();

        if (error) {
            console.error('Supabase Error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
