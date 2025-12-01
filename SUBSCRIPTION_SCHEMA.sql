-- =====================================================
-- FINANCE TRACKER - SUBSCRIPTION SYSTEM
-- =====================================================

-- 1. TABELA DE PLANOS
CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL, -- 'free', 'premium'
    price_monthly DECIMAL(10,2) NOT NULL,
    price_yearly DECIMAL(10,2),
    features JSONB NOT NULL, -- Lista de features habilitadas
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABELA DE ASSINATURAS DOS USUÁRIOS
CREATE TABLE user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    plan_id UUID REFERENCES subscription_plans(id) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'expired', 'trial')),
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    payment_provider TEXT, -- 'stripe', 'mercadopago', 'manual'
    payment_provider_subscription_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id) -- Um usuário só pode ter uma assinatura ativa por vez
);

-- 3. TABELA DE HISTÓRICO DE PAGAMENTOS
CREATE TABLE subscription_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'BRL',
    status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
    payment_method TEXT,
    payment_provider_payment_id TEXT,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INSERIR PLANOS PADRÃO
-- =====================================================

INSERT INTO subscription_plans (name, slug, price_monthly, price_yearly, features) VALUES
(
    'Gratuito',
    'free',
    0.00,
    0.00,
    '{
        "max_transactions_per_month": 50,
        "basic_analytics": true,
        "calendar_heatmap": false,
        "privacy_mode": false,
        "personal_inflation": false,
        "runway_analysis": false,
        "tags": false,
        "subscription_auditor": false,
        "rof_rating": false,
        "wishlist_timer": false,
        "card_optimizer": false
    }'::jsonb
),
(
    'Premium',
    'premium',
    0.99,
    9.99,
    '{
        "max_transactions_per_month": -1,
        "basic_analytics": true,
        "calendar_heatmap": true,
        "privacy_mode": true,
        "personal_inflation": true,
        "runway_analysis": true,
        "tags": true,
        "subscription_auditor": true,
        "rof_rating": true,
        "wishlist_timer": true,
        "card_optimizer": true
    }'::jsonb
);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_payments ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver apenas suas próprias assinaturas
CREATE POLICY "Users can view own subscription"
    ON user_subscriptions FOR SELECT
    USING (auth.uid() = user_id);

-- Usuários podem ver apenas seus próprios pagamentos
CREATE POLICY "Users can view own payments"
    ON subscription_payments FOR SELECT
    USING (auth.uid() = user_id);

-- Planos são públicos (todos podem ver)
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Plans are public"
    ON subscription_plans FOR SELECT
    TO public
    USING (is_active = true);

-- =====================================================
-- FUNÇÕES ÚTEIS
-- =====================================================

-- Função para verificar se usuário tem acesso a uma feature
CREATE OR REPLACE FUNCTION has_feature_access(
    p_user_id UUID,
    p_feature_name TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    v_has_access BOOLEAN;
BEGIN
    SELECT 
        COALESCE(
            (sp.features->p_feature_name)::boolean,
            false
        ) INTO v_has_access
    FROM user_subscriptions us
    JOIN subscription_plans sp ON us.plan_id = sp.id
    WHERE us.user_id = p_user_id
        AND us.status = 'active'
        AND us.current_period_end > NOW()
    LIMIT 1;
    
    RETURN COALESCE(v_has_access, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para criar assinatura gratuita para novos usuários
CREATE OR REPLACE FUNCTION create_free_subscription_for_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_free_plan_id UUID;
BEGIN
    -- Buscar ID do plano gratuito
    SELECT id INTO v_free_plan_id
    FROM subscription_plans
    WHERE slug = 'free'
    LIMIT 1;
    
    -- Criar assinatura gratuita
    INSERT INTO user_subscriptions (
        user_id,
        plan_id,
        status,
        current_period_start,
        current_period_end
    ) VALUES (
        NEW.id,
        v_free_plan_id,
        'active',
        NOW(),
        NOW() + INTERVAL '100 years' -- Gratuito nunca expira
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar assinatura gratuita automaticamente
CREATE TRIGGER on_auth_user_created_create_free_subscription
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_free_subscription_for_new_user();

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX idx_subscription_payments_user_id ON subscription_payments(user_id);
CREATE INDEX idx_subscription_payments_status ON subscription_payments(status);

-- =====================================================
-- VIEWS ÚTEIS
-- =====================================================

-- View para ver assinatura ativa do usuário com detalhes do plano
CREATE OR REPLACE VIEW user_subscription_details AS
SELECT 
    us.id as subscription_id,
    us.user_id,
    us.status,
    us.current_period_start,
    us.current_period_end,
    us.cancel_at_period_end,
    sp.name as plan_name,
    sp.slug as plan_slug,
    sp.price_monthly,
    sp.features,
    CASE 
        WHEN us.current_period_end < NOW() THEN true
        ELSE false
    END as is_expired
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.status IN ('active', 'trial');
