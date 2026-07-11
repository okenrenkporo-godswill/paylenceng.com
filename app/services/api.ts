import { Transaction, CryptoRate, CryptoMarketCoin } from '../types/wallet';

export const API_BASE_URL = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? "http://localhost:8000"
  : "https://fintech-1-xynq.onrender.com";

class ApiClient {
  private baseUrl: string = API_BASE_URL;
  private token: string | null = null;
  private activeEmail: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('paylence_token');
      this.activeEmail = localStorage.getItem('paylence_email');
      const customUrl = localStorage.getItem('paylence_api_url');
      if (customUrl) {
        this.baseUrl = customUrl;
      }
    }
  }

  setBaseUrl(url: string) {
    this.baseUrl = url;
    if (typeof window !== 'undefined') {
      localStorage.setItem('paylence_api_url', url);
    }
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('paylence_token', token);
      } else {
        localStorage.removeItem('paylence_token');
      }
    }
  }

  getToken(): string | null {
    return this.token;
  }

  getActiveEmail(): string | null {
    return this.activeEmail;
  }

  setActiveEmail(email: string | null) {
    this.activeEmail = email;
    if (typeof window !== 'undefined') {
      if (email) {
        localStorage.setItem('paylence_email', email);
      } else {
        localStorage.removeItem('paylence_email');
      }
    }
  }

  private async request(path: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${path}`;
    const headers = new Headers(options.headers || {});
    
    // Add JSON content type by default (unless body is FormData)
    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    // Add Authorization header if token is set
    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    const mergedOptions: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, mergedOptions);
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const errMsg = data?.detail || `API request failed with status ${response.status}`;
        throw new Error(errMsg);
      }

      return data;
    } catch (error: any) {
      console.error(`API Error on ${options.method || 'GET'} ${path}:`, error.message);
      throw error;
    }
  }

  async callApi(path: string, options: RequestInit = {}) {
    return await this.request(path, options);
  }

  // ── AUTHENTICATION ENDPOINTS ──────────────────────────────

  async login(payload: Record<string, any>) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: payload.email,
        password: payload.password,
      }),
    });
    if (data?.access_token) {
      this.setToken(data.access_token);
      this.setActiveEmail(payload.email);
    }
    return data;
  }

  async signup(payload: Record<string, any>) {
    return await this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        email: payload.email,
        password: payload.password,
        first_name: payload.firstName,
        last_name: payload.lastName,
        username: payload.username,
        phone: payload.phone,
        referral_code: payload.referralCode,
      }),
    });
  }

  async verifyOtp(email: string, token: string) {
    const data = await this.request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, token }),
    });
    if (data?.access_token) {
      this.setToken(data.access_token);
      this.setActiveEmail(email);
    }
    return data;
  }

  async resendOtp(email: string) {
    return await this.request('/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.setToken(null);
      this.setActiveEmail(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('paylence_biometric_enabled');
      }
    }
  }

  async toggleBiometric(enabled: boolean): Promise<any> {
    return await this.request('/profile/biometric', {
      method: 'POST',
      body: JSON.stringify({ biometric_enabled: enabled }),
    });
  }

  // ── SAVINGS & WEALTH ENDPOINTS ────────────────────────────

  async fetchSavings() {
    return await this.request('/savings/');
  }

  async fundSavings(product: string, amount: number) {
    return await this.request('/savings/fund', {
      method: 'POST',
      body: JSON.stringify({ product, amount }),
    });
  }

  async withdrawSavings(product: string, amount: number) {
    return await this.request('/savings/withdraw', {
      method: 'POST',
      body: JSON.stringify({ product, amount }),
    });
  }

  async createFixedLock(amount: number, durationDays: number) {
    return await this.request('/savings/lock', {
      method: 'POST',
      body: JSON.stringify({ amount, duration_days: durationDays }),
    });
  }

  async updateAutoSave(amount: number, frequency: string, active: boolean) {
    return await this.request('/savings/autosave', {
      method: 'POST',
      body: JSON.stringify({ amount, frequency, active }),
    });
  }

  // ── PROFILE ENDPOINTS ─────────────────────────────────────

  async fetchProfile() {
    return await this.request('/profile/');
  }

  async fetchBankAccounts() {
    return await this.request('/profile/bank-accounts');
  }

  // ── WALLET ENDPOINTS ──────────────────────────────────────

  async fetchBalance(): Promise<number> {
    const data = await this.request('/wallet/balance');
    return data?.balance || 0;
  }

  async fetchBanks(): Promise<Array<{ code: string; name: string }>> {
    return await this.request('/wallet/banks');
  }

  async resolveBankAccount(accountNumber: string, bankCode: string) {
    return await this.request('/wallet/resolve-account', {
      method: 'POST',
      body: JSON.stringify({
        account_number: accountNumber,
        bank_code: bankCode,
      }),
    });
  }

  async fetchRates(): Promise<CryptoRate[]> {
    const rawRates = await this.request('/wallet/rates');
    if (!Array.isArray(rawRates)) return [];

    return rawRates
      .filter((r) => r.symbol && r.symbol !== 'FX') // Filter out fiat rate
      .map((r, idx) => {
        const changeVal = parseFloat(r.change) || 0;
        return {
          id: `rate-${idx}`,
          name: r.name,
          symbol: r.symbol,
          usdValue: r.rate.split('/')[0].trim(),
          ourRate: r.rate,
          change: r.change,
          changeType: changeVal >= 0 ? 'up' : 'down',
          icon: r.symbol.toLowerCase(),
        };
      });
  }

  async fetchRawRates(): Promise<Array<{ name: string; symbol: string; rate: string; change: string }>> {
    const raw = await this.request('/wallet/rates');
    return Array.isArray(raw) ? raw : [];
  }

  async fetchCryptoMarkets(): Promise<CryptoMarketCoin[]> {
    const raw = await this.request('/crypto/markets');
    return Array.isArray(raw) ? raw : [];
  }

  // ── TRANSACTIONS ENDPOINTS ────────────────────────────

  async fetchTransactions(): Promise<Transaction[]> {
    const data = await this.request('/transactions/');
    if (!Array.isArray(data)) return [];

    const formatDate = (isoString: string) => {
      try {
        const date = new Date(isoString);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
      } catch {
        return 'Recent';
      }
    };

    return data.map((tx: any) => ({
      id: tx.id || `tx-${Date.now()}-${Math.random()}`,
      type: tx.type,
      title: tx.description || tx.type || 'Transaction',
      amount: tx.amount,
      currency: 'NGN',
      date: formatDate(tx.created_at),
      status: tx.status || 'Completed',
    }));
  }

  // ── BILLS PAYMENT ENDPOINTS ────────────────────────────────

  async buyAirtime(network: string, phone: string, amount: number, pin: string) {
    return await this.request('/bills/airtime', {
      method: 'POST',
      body: JSON.stringify({
        network,
        phone,
        amount,
        pin,
      }),
    });
  }

  async payBill(type: 'airtime' | 'cable' | 'electricity', amount: number, customerId: string, providerName?: string, pin?: string) {
    let path = '/bills/airtime';
    let defaultBiller = 'MTN';
    let defaultItem = '100';

    if (type === 'cable') {
      path = '/bills/cable';
      defaultBiller = 'DSTV';
      defaultItem = '200';
    } else if (type === 'electricity') {
      path = '/bills/electricity';
      defaultBiller = 'EKEDC';
      defaultItem = '300';
    }

    return await this.request(path, {
      method: 'POST',
      body: JSON.stringify({
        biller_code: providerName || defaultBiller,
        item_code: defaultItem,
        amount: amount,
        customer_id: customerId,
        pin: pin || null,
      }),
    });
  }

  async payData(amount: number, phoneNumber: string, network: string, packageCode: string, pin?: string) {
    return await this.request('/bills/data', {
      method: 'POST',
      body: JSON.stringify({
        biller_code: network,
        item_code: packageCode,
        amount: amount,
        customer_id: phoneNumber,
        pin: pin || null,
      }),
    });
  }

  async transferFunds(amount: number, recipientAccount: string, bankCode: string, bankName: string, resolvedName: string, remark?: string, pin?: string) {
    return await this.request('/wallet/transfer', {
      method: 'POST',
      body: JSON.stringify({
        amount,
        recipient_account: recipientAccount,
        bank_code: bankCode,
        bank_name: bankName,
        resolved_name: resolvedName,
        remark: remark || null,
        pin: pin || null,
      }),
    });
  }

  async transferToPaylence(amount: number, accountNumber: string, remark?: string, pin?: string) {
    return await this.request('/wallet/transfer/internal', {
      method: 'POST',
      body: JSON.stringify({
        amount,
        account_number: accountNumber,
        remark: remark || null,
        pin: pin || null,
      }),
    });
  }

  async withdrawFunds(amount: number, accountNumber: string, bankCode: string, bankName: string, resolvedName: string, pin?: string) {
    return await this.request('/wallet/withdraw', {
      method: 'POST',
      body: JSON.stringify({
        amount,
        account_number: accountNumber,
        bank_code: bankCode,
        bank_name: bankName,
        resolved_name: resolvedName,
        pin: pin || null,
      }),
    });
  }

  async withdrawToMerchant(amount: number, merchantId: string, merchantName: string, pin?: string) {
    return await this.request('/wallet/withdraw/merchant', {
      method: 'POST',
      body: JSON.stringify({
        amount,
        merchant_id: merchantId,
        merchant_name: merchantName,
        pin: pin || null,
      }),
    });
  }

  async withdrawToCard(amount: number, cardId: string, pin?: string) {
    return await this.request('/wallet/withdraw/card', {
      method: 'POST',
      body: JSON.stringify({
        amount,
        card_id: cardId,
        pin: pin || null,
      }),
    });
  }

  // ── CRYPTO & GIFTCARD ENDPOINTS ───────────────────────────

  async sellCrypto(assetType: string, amount: number, walletAddress: string, liveRate?: number, pin?: string) {
    return await this.request('/assets/crypto/sell', {
      method: 'POST',
      body: JSON.stringify({
        asset_type: assetType,
        amount,
        wallet_address: walletAddress,
        live_rate: liveRate ?? null,
        pin: pin || null,
      }),
    });
  }

  async sellGiftcard(assetType: string, amount: number, cardCode: string, country = 'US', pin?: string) {
    return await this.request('/assets/giftcards/sell', {
      method: 'POST',
      body: JSON.stringify({
        asset_type: assetType,
        amount,
        card_code: cardCode,
        country,
        pin: pin || null,
      }),
    });
  }

  // ── TRANSACTION PIN ENDPOINTS ──────────────────────────────

  async fetchPinStatus(): Promise<{ has_pin: boolean }> {
    return await this.request('/pin/status');
  }

  async createPin(pin: string): Promise<any> {
    return await this.request('/pin/create', {
      method: 'POST',
      body: JSON.stringify({ pin }),
    });
  }

  async verifyPin(pin: string): Promise<any> {
    return await this.request('/pin/verify', {
      method: 'POST',
      body: JSON.stringify({ pin }),
    });
  }

  // ── KYC ENDPOINTS ──────────────────────────────────────────

  async fetchKycStatus() {
    return await this.request('/kyc/status');
  }

  async submitKycProfile(payload: Record<string, any>) {
    return await this.request('/kyc/profile', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async submitBvn(bvn: string) {
    return await this.request('/kyc/bvn', {
      method: 'POST',
      body: JSON.stringify({ bvn }),
    });
  }

  async submitNin(nin: string) {
    return await this.request('/kyc/nin', {
      method: 'POST',
      body: JSON.stringify({ nin }),
    });
  }

  async uploadSelfie(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return await this.request('/kyc/selfie', {
      method: 'POST',
      body: formData,
    });
  }

  async uploadGovId(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return await this.request('/kyc/government-id', {
      method: 'POST',
      body: formData,
    });
  }

  async submitKycForReview() {
    return await this.request('/kyc/submit', {
      method: 'POST',
    });
  }

  async fetchKycProfile() {
    return await this.request('/kyc/me');
  }

  async fetchKycNotifications(): Promise<any[]> {
    return await this.request('/kyc/notifications');
  }

  async markKycNotificationsRead() {
    return await this.request('/kyc/notifications/read', {
      method: 'POST',
    });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
