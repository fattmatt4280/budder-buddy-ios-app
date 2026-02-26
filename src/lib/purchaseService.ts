// Purchase Service - RevenueCat integration via Capacitor plugin
// On web preview, provides mock/no-op implementations.
// On native iOS, uses RevenueCat for StoreKit purchases.

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

const REVENUECAT_API_KEY = 'test_BUVslRNoWEZMGNWOJiTDTjItfiv';
const ENTITLEMENT_ID = 'Pro'; // Must match RevenueCat dashboard entitlement identifier

export interface PurchaseResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

export type PlanType = 'monthly' | 'annual';

export interface ProductInfo {
  id: string;
  title: string;
  description: string;
  price: string;
}

export interface PlanOfferings {
  monthly: ProductInfo;
  annual: ProductInfo;
}

class PurchaseService {
  private initialized = false;
  private Purchases: any = null;

  private isNativePlatform(): boolean {
    return !!(window as any).Capacitor?.isNativePlatform?.();
  }

  /**
   * Initialize RevenueCat SDK — call once at app startup on native
   */
  async initialize(appUserId?: string): Promise<void> {
    if (!this.isNativePlatform() || this.initialized) return;

    try {
      const { Purchases } = await import('@revenuecat/purchases-capacitor');
      this.Purchases = Purchases;

      await Purchases.configure({
        apiKey: REVENUECAT_API_KEY,
        appUserID: appUserId ?? undefined,
      });

      this.initialized = true;
      logger.log('[RevenueCat] Initialized successfully');
    } catch (error) {
      logger.error('[RevenueCat] Initialization failed:', error);
    }
  }

  /**
   * Identify user with RevenueCat (call after login)
   */
  async identify(userId: string): Promise<void> {
    if (!this.isNativePlatform() || !this.Purchases) return;

    try {
      await this.Purchases.logIn({ appUserID: userId });
      logger.log('[RevenueCat] User identified:', userId);
    } catch (error) {
      logger.error('[RevenueCat] Identify failed:', error);
    }
  }

  /**
   * Log out from RevenueCat (call on sign out)
   */
  async logout(): Promise<void> {
    if (!this.isNativePlatform() || !this.Purchases) return;

    try {
      await this.Purchases.logOut();
      logger.log('[RevenueCat] User logged out');
    } catch (error) {
      logger.error('[RevenueCat] Logout failed:', error);
    }
  }

  /**
   * Get available product info for both plans from RevenueCat offerings
   */
  async getProducts(): Promise<PlanOfferings> {
    if (this.isNativePlatform() && this.Purchases) {
      try {
        const offerings = await this.Purchases.getOfferings();
        const currentOffering = offerings.current;
        const monthly = currentOffering?.monthly;
        const annual = currentOffering?.annual;

        return {
          monthly: monthly ? {
            id: monthly.storeProduct.productIdentifier,
            title: monthly.storeProduct.title || 'Monthly',
            description: monthly.storeProduct.description || 'Billed monthly',
            price: monthly.storeProduct.priceString || '$2.99/mo',
          } : this.fallbackMonthly(),
          annual: annual ? {
            id: annual.storeProduct.productIdentifier,
            title: annual.storeProduct.title || 'Yearly',
            description: annual.storeProduct.description || 'Billed annually',
            price: annual.storeProduct.priceString || '$24.99/yr',
          } : this.fallbackAnnual(),
        };
      } catch (error) {
        logger.error('[RevenueCat] Failed to get offerings:', error);
      }
    }

    return { monthly: this.fallbackMonthly(), annual: this.fallbackAnnual() };
  }

  private fallbackMonthly(): ProductInfo {
    return { id: '20260224', title: 'Monthly', description: 'Billed monthly', price: '$3.99/mo' };
  }

  private fallbackAnnual(): ProductInfo {
    return { id: '20260224_annual', title: 'Yearly', description: 'Billed annually', price: '$24.99/yr' };
  }

  /**
   * Initiate a purchase through RevenueCat
   */
  async purchase(plan: PlanType = 'monthly'): Promise<PurchaseResult> {
    if (!this.isNativePlatform() || !this.Purchases) {
      logger.log('[Purchase] Web preview - simulating purchase');
      return this.syncSubscriptionToBackend();
    }

    try {
      const offerings = await this.Purchases.getOfferings();
      const currentOffering = offerings.current;
      const pkg = plan === 'annual' ? currentOffering?.annual : currentOffering?.monthly;

      if (!pkg) {
        return { success: false, error: `No ${plan} offering available` };
      }

      const { customerInfo } = await this.Purchases.purchasePackage({
        aPackage: pkg,
      });

      // Check if Pro entitlement is now active
      const isPro = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;

      if (isPro) {
        // Sync to our backend
        await this.syncSubscriptionToBackend();
        return { success: true };
      }

      return { success: false, error: 'Purchase completed but entitlement not found' };
    } catch (error: any) {
      // RevenueCat returns userCancelled for dismissed payment sheet
      if (error?.code === 1 || error?.message?.includes('cancelled')) {
        return { success: false, error: 'Purchase cancelled' };
      }
      logger.error('[Purchase] Purchase failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Purchase failed',
      };
    }
  }

  /**
   * Restore previous purchases (required by Apple)
   */
  async restore(): Promise<PurchaseResult> {
    if (!this.isNativePlatform() || !this.Purchases) {
      logger.log('[Purchase] Web preview - restore not available');
      return { success: false, error: 'Restore only available on iOS' };
    }

    try {
      const { customerInfo } = await this.Purchases.restorePurchases();
      const isPro = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;

      if (isPro) {
        await this.syncSubscriptionToBackend();
        return { success: true };
      }

      return { success: false, error: 'No active subscription found' };
    } catch (error) {
      logger.error('[Purchase] Restore failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Restore failed',
      };
    }
  }

  /**
   * Check current entitlement status from RevenueCat
   */
  async checkEntitlement(): Promise<boolean> {
    if (!this.isNativePlatform() || !this.Purchases) return false;

    try {
      const { customerInfo } = await this.Purchases.getCustomerInfo();
      return customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
    } catch (error) {
      logger.error('[RevenueCat] Failed to check entitlement:', error);
      return false;
    }
  }

  /**
   * Sync subscription status to our backend via validate-receipt edge function.
   * RevenueCat server-side verification ensures legitimacy.
   */
  private async syncSubscriptionToBackend(): Promise<PurchaseResult> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return { success: false, error: 'Not authenticated' };
      }

      const response = await supabase.functions.invoke('validate-receipt', {
        body: { source: 'revenuecat' },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return { success: true };
    } catch (error) {
      logger.error('[Purchase] Backend sync failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Validation failed',
      };
    }
  }
}

export const purchaseService = new PurchaseService();
