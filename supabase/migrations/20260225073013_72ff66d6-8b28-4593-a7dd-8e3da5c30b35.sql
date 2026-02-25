
-- Subscriptions table for Apple IAP
CREATE TABLE public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  apple_transaction_id TEXT,
  apple_original_transaction_id TEXT,
  product_id TEXT NOT NULL DEFAULT 'budderbuddy_pro_monthly',
  status TEXT NOT NULL DEFAULT 'free' CHECK (status IN ('free', 'active', 'expired', 'canceled', 'grace_period')),
  expires_at TIMESTAMPTZ,
  original_purchase_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_subscription UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can read their own subscription
CREATE POLICY "Users can read own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own subscription (initial free row)
CREATE POLICY "Users can insert own subscription"
  ON public.subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Only service role can update (via edge function after receipt validation)
-- No user update policy - updates happen server-side only

-- Trigger for updated_at
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
