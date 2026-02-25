// Purchase Service - Abstraction layer for Apple StoreKit via Capacitor
// In web preview, this provides mock/no-op implementations.
// On native iOS, this would integrate with a Capacitor StoreKit plugin.

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

const PRODUCT_ID = '20260224';

export interface PurchaseResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

export interface ProductInfo {
  id: string;
  title: string;
  description: string;
  price: string;
}

class PurchaseService {
  private isNativePlatform(): boolean {
    // Check if running inside Capacitor native shell
    return !!(window as any).Capacitor?.isNativePlatform?.();
  }

  /**
   * Get available product info from the App Store
   */
  async getProduct(): Promise<ProductInfo> {
    if (this.isNativePlatform()) {
      // TODO: Integrate with Capacitor StoreKit plugin
      // const products = await CapacitorPurchases.getProducts({ productIds: [PRODUCT_ID] });
      // return products[0];
    }

    // Fallback / web preview
    return {
      id: PRODUCT_ID,
      title: 'Budder Buddy Pro',
      description: 'Unlimited tattoos, Ghost Camera, AI Guide & more',
      price: '$2.99/mo',
    };
  }

  /**
   * Initiate a purchase through Apple's native payment sheet
   */
  async purchase(): Promise<PurchaseResult> {
    if (!this.isNativePlatform()) {
      logger.log('[Purchase] Web preview - simulating purchase');
      // In web preview, call validate-receipt with a mock to create active sub
      return this.validateReceipt('web-preview-mock', 'mock-original');
    }

    try {
      // TODO: Integrate with Capacitor StoreKit plugin
      // const result = await CapacitorPurchases.purchaseProduct({ productId: PRODUCT_ID });
      // return this.validateReceipt(result.transactionId, result.originalTransactionId);
      
      return { success: false, error: 'Native purchases not yet configured' };
    } catch (error) {
      logger.error('[Purchase] Purchase failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Purchase failed' 
      };
    }
  }

  /**
   * Restore previous purchases (required by Apple)
   */
  async restore(): Promise<PurchaseResult> {
    if (!this.isNativePlatform()) {
      logger.log('[Purchase] Web preview - restore not available');
      return { success: false, error: 'Restore only available on iOS' };
    }

    try {
      // TODO: Integrate with Capacitor StoreKit plugin
      // const result = await CapacitorPurchases.restorePurchases();
      // if (result.activeSubscription) {
      //   return this.validateReceipt(result.transactionId, result.originalTransactionId);
      // }
      
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
   * Validate receipt with backend and update subscription status
   */
  private async validateReceipt(
    transactionId: string,
    originalTransactionId: string
  ): Promise<PurchaseResult> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return { success: false, error: 'Not authenticated' };
      }

      const response = await supabase.functions.invoke('validate-receipt', {
        body: { transactionId, originalTransactionId, productId: PRODUCT_ID },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return { success: true, transactionId };
    } catch (error) {
      logger.error('[Purchase] Receipt validation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Validation failed',
      };
    }
  }
}

export const purchaseService = new PurchaseService();
