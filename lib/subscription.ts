import { createSupabaseClient } from './supabase';

// =====================================================
// TIPOS
// =====================================================

export interface SubscriptionPlan {
    id: string;
    name: string;
    slug: 'free' | 'premium';
    price_monthly: number;
    price_yearly: number | null;
    features: SubscriptionFeatures;
    is_active: boolean;
}

export interface SubscriptionFeatures {
    max_transactions_per_month: number; // -1 = ilimitado
    basic_analytics: boolean;
    calendar_heatmap: boolean;
    privacy_mode: boolean;
    personal_inflation: boolean;
    runway_analysis: boolean;
    tags: boolean;
    subscription_auditor: boolean;
    rof_rating: boolean;
    wishlist_timer: boolean;
    card_optimizer: boolean;
}

export interface UserSubscription {
    id: string;
    user_id: string;
    plan_id: string;
    status: 'active' | 'canceled' | 'expired' | 'trial';
    current_period_start: string;
    current_period_end: string;
    cancel_at_period_end: boolean;
    payment_provider: string | null;
    payment_provider_subscription_id: string | null;
}

export interface UserSubscriptionDetails extends UserSubscription {
    plan_name: string;
    plan_slug: 'free' | 'premium';
    price_monthly: number;
    features: SubscriptionFeatures;
    is_expired: boolean;
}

// =====================================================
// FUNÇÕES DE VERIFICAÇÃO
// =====================================================

/**
 * Verifica se o usuário tem acesso a uma feature específica
 */
export async function hasFeatureAccess(
    featureName: keyof SubscriptionFeatures
): Promise<boolean> {
    try {
        const supabase = createSupabaseClient();

        // Buscar assinatura ativa do usuário
        const { data, error } = await supabase
            .from('user_subscription_details')
            .select('features')
            .single();

        if (error || !data) {
            console.error('Error checking feature access:', error);
            return false;
        }

        return data.features[featureName] === true;
    } catch (error) {
        console.error('Error in hasFeatureAccess:', error);
        return false;
    }
}

/**
 * Busca os detalhes da assinatura do usuário atual
 */
export async function getUserSubscription(): Promise<UserSubscriptionDetails | null> {
    try {
        const supabase = createSupabaseClient();

        const { data, error } = await supabase
            .from('user_subscription_details')
            .select('*')
            .single();

        if (error) {
            console.error('Error fetching subscription:', error);
            return null;
        }

        return data as UserSubscriptionDetails;
    } catch (error) {
        console.error('Error in getUserSubscription:', error);
        return null;
    }
}

/**
 * Busca todos os planos disponíveis
 */
export async function getAvailablePlans(): Promise<SubscriptionPlan[]> {
    try {
        const supabase = createSupabaseClient();

        const { data, error } = await supabase
            .from('subscription_plans')
            .select('*')
            .eq('is_active', true)
            .order('price_monthly', { ascending: true });

        if (error) {
            console.error('Error fetching plans:', error);
            return [];
        }

        return data as SubscriptionPlan[];
    } catch (error) {
        console.error('Error in getAvailablePlans:', error);
        return [];
    }
}

/**
 * Verifica se o usuário é premium
 */
export async function isPremiumUser(): Promise<boolean> {
    try {
        const subscription = await getUserSubscription();
        return subscription?.plan_slug === 'premium' && !subscription.is_expired;
    } catch (error) {
        console.error('Error checking premium status:', error);
        return false;
    }
}

/**
 * Verifica se o usuário atingiu o limite de transações do mês
 */
export async function hasReachedTransactionLimit(): Promise<boolean> {
    try {
        const subscription = await getUserSubscription();

        if (!subscription) return true;

        const maxTransactions = subscription.features.max_transactions_per_month;

        // -1 significa ilimitado
        if (maxTransactions === -1) return false;

        // Contar transações do mês atual
        const supabase = createSupabaseClient();
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const { count, error } = await supabase
            .from('transactions')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', firstDayOfMonth.toISOString());

        if (error) {
            console.error('Error counting transactions:', error);
            return false;
        }

        return (count || 0) >= maxTransactions;
    } catch (error) {
        console.error('Error in hasReachedTransactionLimit:', error);
        return false;
    }
}

// =====================================================
// CONSTANTES
// =====================================================

export const FEATURE_NAMES: Record<keyof SubscriptionFeatures, string> = {
    max_transactions_per_month: 'Transações Ilimitadas',
    basic_analytics: 'Analytics Básico',
    calendar_heatmap: 'Calendário de Calor',
    privacy_mode: 'Modo Privacidade',
    personal_inflation: 'Inflação Pessoal',
    runway_analysis: 'Análise de Runway',
    tags: 'Tags Transversais',
    subscription_auditor: 'Auditor de Assinaturas',
    rof_rating: 'Avaliação R.O.F.',
    wishlist_timer: 'Botão do Arrependimento',
    card_optimizer: 'Otimizador de Cartão'
};

export const FEATURE_DESCRIPTIONS: Record<keyof SubscriptionFeatures, string> = {
    max_transactions_per_month: 'Adicione quantas transações quiser, sem limites',
    basic_analytics: 'Visualize gráficos e relatórios básicos',
    calendar_heatmap: 'Veja seus gastos em um calendário visual com código de cores',
    privacy_mode: 'Oculte valores monetários com um clique para usar em público',
    personal_inflation: 'Calcule sua inflação pessoal real',
    runway_analysis: 'Descubra por quantos meses você consegue viver sem renda',
    tags: 'Organize gastos com hashtags personalizadas',
    subscription_auditor: 'Monitore e controle todas as suas assinaturas recorrentes',
    rof_rating: 'Avalie se seus gastos realmente valeram a pena',
    wishlist_timer: 'Evite compras por impulso com timer obrigatório',
    card_optimizer: 'Descubra o melhor dia para fazer compras no cartão'
};
