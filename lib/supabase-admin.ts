import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
    // Warn but don't crash immediately, though likely will fail on use if missing
    console.warn('Missing Supabase Service Key or URL for Admin Client');
}

// Client com privilégios de Admin (Bypassa RLS). Usar apenas no servidor.
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || '', {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});
