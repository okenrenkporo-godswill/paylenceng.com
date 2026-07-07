import { apiClient } from './api';
import { VirtualAccount, BalanceResponse } from '../types/virtualAccount';

class VirtualAccountService {
  async fetchVirtualAccounts(): Promise<VirtualAccount[]> {
    return await apiClient.callApi('/virtual-accounts');
  }

  async fetchVirtualAccountById(id: string): Promise<VirtualAccount> {
    return await apiClient.callApi(`/virtual-accounts/${id}`);
  }

  async simulateDeposit(
    accountNumber: string,
    amount: number,
    currency: 'NGN' | 'USD'
  ): Promise<BalanceResponse> {
    return await apiClient.callApi('/virtual-accounts/fund', {
      method: 'POST',
      body: JSON.stringify({
        account_number: accountNumber,
        amount,
        currency,
      }),
    });
  }

  async simulateDepositDirect(
    accountNumber: string,
    amount: number,
    currency: 'NGN' | 'USD'
  ): Promise<BalanceResponse> {
    return await apiClient.callApi('/virtual-accounts/simulate-deposit', {
      method: 'POST',
      body: JSON.stringify({
        account_number: accountNumber,
        amount,
        currency,
      }),
    });
  }

  async simulateWithdrawal(
    amount: number,
    currency: 'NGN' | 'USD'
  ): Promise<BalanceResponse> {
    return await apiClient.callApi('/virtual-accounts/withdraw', {
      method: 'POST',
      body: JSON.stringify({
        amount,
        currency,
      }),
    });
  }

  async fetchHistory(): Promise<any[]> {
    return await apiClient.callApi('/virtual-accounts/history');
  }
}

export const virtualAccountService = new VirtualAccountService();
export default virtualAccountService;
