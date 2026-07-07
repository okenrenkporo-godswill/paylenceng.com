export interface VirtualAccount {
  id: string;
  user_id: string;
  currency: 'NGN' | 'USD';
  account_number: string;
  account_name: string;
  bank_name: string;
  provider: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface SimulateDepositRequest {
  account_number: string;
  amount: number;
  currency: 'NGN' | 'USD';
}

export interface SimulateWithdrawalRequest {
  amount: number;
  currency: 'NGN' | 'USD';
}

export interface BalanceResponse {
  wallet_balance: number;
  currency: string;
  message: string;
}
