// ── Exact mirror of backend Python enums (models/schemas.py) ──────────────

export type TransactionType =
  | 'Deposit'
  | 'Withdrawal'
  | 'Transfer Sent'
  | 'Transfer Received'
  | 'Airtime Top-up'
  | 'Cable TV'
  | 'Electricity'
  | 'Sold Crypto';

export type TransactionStatus = 'Pending' | 'Completed' | 'Failed';

export type KYCLevel = 'Level 1' | 'Level 2' | 'Level 3';

export interface Transaction {
  id: string;
  type: TransactionType;
  title: string;        // maps from tx.description ?? tx.type
  amount: number;
  currency: string;
  date: string;         // formatted from tx.created_at
  status: TransactionStatus;
}

export interface UserProfile {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  kyc_level: KYCLevel;
  avatar_url?: string;
  created_at: string;
  referral_code?: string;
}


export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  currency: string;
}

export interface CryptoRate {
  id: string;
  name: string;
  symbol: string;
  usdValue: string;
  ourRate: string;
  change: string; // e.g. "+2.4%" or "-1.2%"
  changeType: 'up' | 'down';
  icon: string; // Symbol name
}

/** Live market coin from GET /crypto/markets */
export interface CryptoMarketCoin {
  id: string;
  name: string;
  symbol: string;
  price: number;       // NGN price
  change_24h: number;  // Percentage
  market_cap_rank: number | null;
  image: string;       // URL to coin logo
}

export interface QuickActionItem {
  id: string;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
}

export type ActiveScreen = 'home' | 'wealth' | 'cards' | 'profile';

export type ScreenName =
  | 'home'
  | 'wealth'
  | 'cards'
  | 'profile'
  | 'transfer'
  | 'withdraw'
  | 'sell'
  | 'sell_market'
  | 'sell_detail'
  | 'giftcard'
  | 'topup'
  | 'cable'
  | 'electricity'
  | 'bet'
  | 'refer'
  | 'apply_card'
  | 'tx_success'
  | 'pin_setup'
  | 'auth'
  | 'virtual_accounts'
  | 'paylence_transfer'
  | 'kyc'
  | 'crypto';

export interface CryptoWallet {
  asset_code: string;
  balance: number;
  escrow_balance: number;
  price_ngn: number;
  value_ngn: number;
}

export interface CryptoOrder {
  id: string;
  user_id: string;
  asset_code: string;
  side: 'Buy' | 'Sell';
  order_type: 'Market' | 'Limit';
  price: number;
  quantity: number;
  total_ngn: number;
  status: 'Completed' | 'Pending' | 'Cancelled' | 'Failed';
  created_at: string;
}

export interface CryptoTransaction {
  id: string;
  user_id: string;
  asset_code: string;
  tx_type: 'Deposit' | 'Withdrawal' | 'Buy' | 'Sell' | 'Swap_From' | 'Swap_To' | 'P2P_In' | 'P2P_Out';
  amount: number;
  price: number;
  total_ngn: number;
  status: 'Completed' | 'Pending' | 'Failed';
  address?: string;
  tx_hash?: string;
  created_at: string;
}

export interface P2PAd {
  id: string;
  user_id: string;
  username: string;
  asset_code: string;
  side: 'Buy' | 'Sell';
  price_ngn: number;
  amount: number;
  min_limit: number;
  max_limit: number;
  status: 'Active' | 'Closed';
  created_at: string;
}

export interface P2POrder {
  id: string;
  ad_id: string;
  buyer_id: string;
  buyer_name: string;
  seller_id: string;
  seller_name: string;
  asset_code: string;
  amount: number;
  price_ngn: number;
  total_ngn: number;
  status: 'Pending_Payment' | 'Paid' | 'Completed' | 'Cancelled' | 'Disputed';
  payment_proof_url: string | null;
  payment_details?: {
    bank_name?: string;
    account_number?: string;
    account_name?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface P2PPaymentMethod {
  id: string;
  user_id: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  created_at?: string;
}

export interface NavState {
  screen: ScreenName;
  params?: any;
}

export type CardType =
  | 'virtual_dollar'
  | 'virtual_naira'
  | 'premium_physical'
  | 'business';

export interface CardItem {
  id: string;
  number: string;
  expiry: string;
  cvv: string;
  name: string;
  brand: 'Visa' | 'Mastercard' | 'Verve';
  styleType: 'slate' | 'gold' | 'royal' | 'emerald' | 'crimson';
  isFrozen: boolean;
  // Extended fields
  cardType?: CardType;   // type of card product
  country?: string;      // display billing country (e.g. 'Nigeria')
  countryFlag?: string;  // emoji flag (e.g. '🇳🇬')
  currency?: string;     // display currency symbol (e.g. '$', '₦', '£')
  currencyCode?: string; // display currency code (e.g. 'USD', 'NGN', 'GBP')
  bgColor?: string;      // custom hex colour chosen by user
  photoUri?: string;     // local URI / data-URI from gallery
}
