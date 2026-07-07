import { apiClient } from './api';
import { CryptoWallet, CryptoOrder, CryptoTransaction, P2PAd, P2POrder, P2PPaymentMethod } from '../types/wallet';

export const cryptoApi = {
  async fetchCryptoWallet(): Promise<CryptoWallet[]> {
    return await apiClient.callApi('/crypto/wallet');
  },

  async fetchCryptoPrice(symbol: string): Promise<{ symbol: string; price: number }> {
    return await apiClient.callApi(`/crypto/price/${symbol}`);
  },

  async buyCrypto(assetCode: string, amountNgn: number, pin?: string): Promise<any> {
    return await apiClient.callApi('/crypto/buy', {
      method: 'POST',
      body: JSON.stringify({ asset_code: assetCode, amount_ngn: amountNgn, pin }),
    });
  },

  async sellCrypto(assetCode: string, quantity: number, pin?: string): Promise<any> {
    return await apiClient.callApi('/crypto/sell', {
      method: 'POST',
      body: JSON.stringify({ asset_code: assetCode, quantity, pin }),
    });
  },

  async convertCrypto(fromAsset: string, toAsset: string, amount: number, pin?: string): Promise<any> {
    return await apiClient.callApi('/crypto/convert', {
      method: 'POST',
      body: JSON.stringify({ from_asset: fromAsset, to_asset: toAsset, amount, pin }),
    });
  },

  async fetchCryptoAssets(): Promise<any[]> {
    return await apiClient.callApi('/crypto/assets');
  },

  async fetchSwapRate(fromAsset: string, toAsset: string, amount: number): Promise<any> {
    return await apiClient.callApi(`/crypto/swap-rate?from_asset=${fromAsset}&to_asset=${toAsset}&amount=${amount}`);
  },

  async swapCrypto(fromAsset: string, toAsset: string, amount: number, pin?: string): Promise<any> {
    return await apiClient.callApi('/crypto/swap', {
      method: 'POST',
      body: JSON.stringify({ from_asset: fromAsset, to_asset: toAsset, amount, pin }),
    });
  },

  async fetchPortfolioValuation(): Promise<any> {
    return await apiClient.callApi('/crypto/portfolio');
  },

  async updatePortfolioCurrency(currency: string): Promise<any> {
    return await apiClient.callApi('/crypto/portfolio-currency', {
      method: 'PATCH',
      body: JSON.stringify({ currency }),
    });
  },

  async fetchCryptoOrders(): Promise<CryptoOrder[]> {
    return await apiClient.callApi('/crypto/orders');
  },

  async fetchCryptoTransactions(): Promise<CryptoTransaction[]> {
    return await apiClient.callApi('/crypto/transactions');
  },

  async withdrawCrypto(assetCode: string, amount: number, address: string, pin?: string): Promise<any> {
    return await apiClient.callApi('/crypto/withdraw', {
      method: 'POST',
      body: JSON.stringify({ asset_code: assetCode, amount, address, pin }),
    });
  },

  async depositCrypto(assetCode: string, amount: number): Promise<any> {
    return await apiClient.callApi('/crypto/deposit', {
      method: 'POST',
      body: JSON.stringify({ asset_code: assetCode, amount }),
    });
  },

  async fetchP2PAds(): Promise<P2PAd[]> {
    return await apiClient.callApi('/crypto/p2p/ads');
  },

  async createP2PAd(payload: { asset_code: string; side: 'Buy' | 'Sell'; price_ngn: number; amount: number; min_limit: number; max_limit: number; pin?: string }): Promise<P2PAd> {
    return await apiClient.callApi('/crypto/p2p/ads', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async closeP2PAd(adId: string): Promise<any> {
    return await apiClient.callApi(`/crypto/p2p/ads/${adId}/close`, {
      method: 'POST',
    });
  },

  async fetchP2POrders(): Promise<P2POrder[]> {
    return await apiClient.callApi('/crypto/p2p/orders');
  },

  async fetchP2POrderById(orderId: string): Promise<P2POrder> {
    return await apiClient.callApi(`/crypto/p2p/orders/${orderId}`);
  },

  async createP2POrder(adId: string, amount: number): Promise<P2POrder> {
    return await apiClient.callApi('/crypto/p2p/orders', {
      method: 'POST',
      body: JSON.stringify({ ad_id: adId, amount }),
    });
  },

  async payP2POrder(orderId: string, paymentProofUrl: string): Promise<P2POrder> {
    return await apiClient.callApi(`/crypto/p2p/orders/${orderId}/pay`, {
      method: 'POST',
      body: JSON.stringify({ payment_proof_url: paymentProofUrl }),
    });
  },

  async releaseP2POrder(orderId: string, pin?: string): Promise<P2POrder> {
    return await apiClient.callApi(`/crypto/p2p/orders/${orderId}/release`, {
      method: 'POST',
      body: JSON.stringify({ pin }),
    });
  },

  async cancelP2POrder(orderId: string): Promise<P2POrder> {
    return await apiClient.callApi(`/crypto/p2p/orders/${orderId}/cancel`, {
      method: 'POST',
    });
  },

  async disputeP2POrder(orderId: string): Promise<P2POrder> {
    return await apiClient.callApi(`/crypto/p2p/orders/${orderId}/dispute`, {
      method: 'POST',
    });
  },

  async fetchP2PPaymentMethods(): Promise<P2PPaymentMethod[]> {
    return await apiClient.callApi('/crypto/p2p/payment-methods');
  },

  async createP2PPaymentMethod(payload: { bank_name: string; account_number: string; account_name: string }): Promise<P2PPaymentMethod> {
    return await apiClient.callApi('/crypto/p2p/payment-methods', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

export default cryptoApi;
