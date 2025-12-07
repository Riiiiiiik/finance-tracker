import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const authHeader = request.headers.get('x-api-key');

        // Verificação simples por enquanto (ideal é user process.env.CRON_SECRET)
        // Você pode definir isso no .env depois
        const validSecrets = [process.env.CRON_SECRET, 'monk_secret_123'];

        if (!validSecrets.includes(authHeader || '')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { title, summary, content, theme, monk_author, date, image_url, council_discussion } = body;

        // Inserir no Supabase
        const { data, error } = await supabase
            .from('news_articles')
            .insert([
                {
                    title,
                    summary,
                    content,
                    theme,
                    monk_author: monk_author || 'Monk.Sentry',
                    date: date || new Date().toISOString().split('T')[0], // Hoje se não vier data
                    image_url,
                    council_discussion, // Array JSON do chat
                    is_published: true
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
