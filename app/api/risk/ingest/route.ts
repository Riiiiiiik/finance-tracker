import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { z } from 'zod';

// Schema Validation matches Geminin Output
const riskReportSchema = z.object({
    matriz_liquidez: z.object({
        nivel_risco: z.string(),
        probabilidade_insolvencia: z.union([z.number(), z.string()]),
        impacto_orcamento: z.union([z.number(), z.string()]),
        analise_curta: z.string()
    }),
    matriz_estrutural: z.object({
        nivel_risco: z.string(),
        tendencia_patrimonial: z.string(),
        resiliencia_meses: z.union([z.number(), z.string()]),
        analise_curta: z.string()
    })
});

export async function POST(request: Request) {
    try {
        const apiKey = request.headers.get('x-api-key');
        const cronSecret = process.env.CRON_SECRET;

        // 1. Auth Check
        if (!cronSecret || apiKey !== cronSecret) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Body Validation
        const body = await request.json();

        // Allow for "wrapper" object if needed, or direct fields
        // The bot sends { ...json_output ... }
        const validation = riskReportSchema.safeParse(body.report || body);

        if (!validation.success) {
            return NextResponse.json({ error: 'Invalid schema', details: validation.error }, { status: 400 });
        }

        const reportJson = validation.data;

        // 3. Resolve User
        // Since this is a personal tracker, we attach to the primary user.
        // We'll fetch the first user found or use provided ID.
        let userId = body.user_id;

        if (!userId) {
            // Fetch first user from auth
            const { data: { users }, error: userError } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1 });
            if (userError || !users || users.length === 0) {
                return NextResponse.json({ error: 'No users found to attach report' }, { status: 404 });
            }
            userId = users[0].id;
        }

        // 4. Insert into Risk Profiles
        const { error: insertError } = await supabaseAdmin
            .from('risk_profiles')
            .insert({
                user_id: userId,
                report_json: reportJson,
                created_at: new Date().toISOString()
            });

        if (insertError) {
            console.error('Insert Error:', insertError);
            return NextResponse.json({ error: insertError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, user_id: userId });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
