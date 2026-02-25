-- R-01: Remove the INSERT policy on subscriptions so users cannot self-grant Pro
DROP POLICY IF EXISTS "Users can insert own subscription" ON subscriptions;

-- R-03: Fix tattoo_wishlist restrictive-only policies by converting to permissive
DROP POLICY IF EXISTS "Users can delete own wishlist" ON tattoo_wishlist;
DROP POLICY IF EXISTS "Users can insert own wishlist" ON tattoo_wishlist;
DROP POLICY IF EXISTS "Users can update own wishlist" ON tattoo_wishlist;
DROP POLICY IF EXISTS "Users can view own wishlist" ON tattoo_wishlist;

CREATE POLICY "Users can view own wishlist" ON tattoo_wishlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wishlist" ON tattoo_wishlist FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own wishlist" ON tattoo_wishlist FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own wishlist" ON tattoo_wishlist FOR DELETE USING (auth.uid() = user_id);