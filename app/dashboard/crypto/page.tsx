"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthProvider';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, Coins, RefreshCw, Eye, EyeOff, ShieldCheck, 
  ArrowUpRight, ArrowDownLeft, Shuffle, BookOpen, PlusCircle, MinusCircle, 
  Building, User, MessageCircle, Info, Landmark, HelpCircle, Lock, Delete, Plus,
  ChevronRight
} from 'lucide-react';
import { Button, Input, Checkbox } from '../../components/UI';
import cryptoApi from '../../services/cryptoApi';
import apiClient from '../../services/api';
import BiometricPinModal from '../../components/BiometricPinModal';
import { CryptoWallet, CryptoMarketCoin, P2PAd, P2POrder, P2PPaymentMethod } from '../../types/wallet';

type CryptoTab = 'dashboard' | 'markets' | 'p2p';
type P2PSubView = 'market' | 'orders' | 'post' | 'payments' | 'order_details';

export default function CryptoPage() {
  const { balance: mainBalance, syncWithBackend } = useAuth();
  const { colors } = useTheme();

  // Tab State
  const [activeTab, setActiveTab] = useState<CryptoTab>('dashboard');
  const [loading, setLoading] = useState(true);

  // Biometric/PIN Modal controls
  const [pinVisible, setPinVisible] = useState(false);
  const [pinAction, setPinAction] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Portfolio State
  const [portfolio, setPortfolio] = useState({ total_value: 0, preferred_currency: 'USDT' });
  const [isValuationVisible, setIsValuationVisible] = useState(true);
  const [wallets, setWallets] = useState<CryptoWallet[]>([]);

  // Markets Spot State
  const [markets, setMarkets] = useState<CryptoMarketCoin[]>([]);
  const [selectedCoin, setSelectedCoin] = useState<CryptoMarketCoin | null>(null);
  const [buySellType, setBuySellType] = useState<'buy' | 'sell'>('buy');
  const [tradeAmount, setTradeAmount] = useState('');

  // Swap State
  const [swapFrom, setSwapFrom] = useState('USDT');
  const [swapTo, setSwapTo] = useState('BTC');
  const [swapAmount, setSwapAmount] = useState('100');
  const [swapRateInfo, setSwapRateInfo] = useState<any>(null);
  const [isFetchingSwapRate, setIsFetchingSwapRate] = useState(false);

  // P2P State
  const [p2pView, setP2pView] = useState<P2PSubView>('market');
  const [p2pAds, setP2pAds] = useState<P2PAd[]>([]);
  const [p2pOrders, setP2pOrders] = useState<P2POrder[]>([]);
  const [p2pPaymentMethods, setP2pPaymentMethods] = useState<P2PPaymentMethod[]>([]);
  const [selectedP2pOrder, setSelectedP2pOrder] = useState<P2POrder | null>(null);

  // P2P Filter state
  const [filterSide, setFilterSide] = useState<'Buy' | 'Sell'>('Buy'); // User wants to buy or sell
  const [filterAsset, setFilterAsset] = useState<'USDT' | 'BTC' | 'ETH'>('USDT');

  // P2P Post Ad input state
  const [adAsset, setAdAsset] = useState<'USDT' | 'BTC' | 'ETH'>('USDT');
  const [adSide, setAdSide] = useState<'Buy' | 'Sell'>('Sell');
  const [adPrice, setAdPrice] = useState('');
  const [adAmount, setAdAmount] = useState('');
  const [adMinLimit, setAdMinLimit] = useState('');
  const [adMaxLimit, setAdMaxLimit] = useState('');

  // P2P Trade dialog input state
  const [p2pTradeAd, setP2pTradeAd] = useState<P2PAd | null>(null);
  const [p2pTradeAmount, setP2pTradeAmount] = useState('');

  // P2P New Payment Method state
  const [p2pNewBank, setP2pNewBank] = useState('');
  const [p2pNewAcctNum, setP2pNewAcctNum] = useState('');
  const [p2pNewAcctName, setP2pNewAcctName] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [portVal, walletList, coinMarkets] = await Promise.all([
        cryptoApi.fetchPortfolioValuation(),
        cryptoApi.fetchCryptoWallet(),
        apiClient.fetchCryptoMarkets()
      ]);
      setPortfolio(portVal);
      setWallets(walletList);
      setMarkets(coinMarkets);

      // Default trade selection
      if (coinMarkets.length > 0 && !selectedCoin) {
        setSelectedCoin(coinMarkets[0]);
      }
    } catch (e) {
      console.warn('Failed to fetch crypto resources:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 12000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Swap Rates live
  useEffect(() => {
    if (activeTab !== 'dashboard') return;
    const amountVal = parseFloat(swapAmount) || 0;
    if (amountVal <= 0 || swapFrom === swapTo) {
      setSwapRateInfo(null);
      return;
    }
    const fetchRate = async () => {
      setIsFetchingSwapRate(true);
      try {
        const rate = await cryptoApi.fetchSwapRate(swapFrom, swapTo, amountVal);
        setSwapRateInfo(rate);
      } catch {
        setSwapRateInfo(null);
      } finally {
        setIsFetchingSwapRate(false);
      }
    };
    const timer = setTimeout(fetchRate, 500);
    return () => clearTimeout(timer);
  }, [swapFrom, swapTo, swapAmount, activeTab]);

  // Load P2P sub-data
  const loadP2pData = async () => {
    try {
      if (p2pView === 'market') {
        const list = await cryptoApi.fetchP2PAds();
        setP2pAds(list);
      } else if (p2pView === 'orders') {
        const list = await cryptoApi.fetchP2POrders();
        setP2pOrders(list);
      } else if (p2pView === 'payments') {
        const list = await cryptoApi.fetchP2PPaymentMethods();
        setP2pPaymentMethods(list);
      }
    } catch (e) {
      console.warn('Error loading P2P dashboard data:', e);
    }
  };

  useEffect(() => {
    if (activeTab === 'p2p') {
      loadP2pData();
    }
  }, [activeTab, p2pView]);

  // Live order poller in detail view
  useEffect(() => {
    if (activeTab === 'p2p' && p2pView === 'order_details' && selectedP2pOrder) {
      const poller = setInterval(async () => {
        try {
          const fresh = await cryptoApi.fetchP2POrderById(selectedP2pOrder.id);
          setSelectedP2pOrder(fresh);
        } catch {}
      }, 5000);
      return () => clearInterval(poller);
    }
  }, [activeTab, p2pView, selectedP2pOrder?.id]);

  // Currency preference changes
  const handleCurrencyChange = async (currency: string) => {
    try {
      setPortfolio(prev => ({ ...prev, preferred_currency: currency }));
      await cryptoApi.updatePortfolioCurrency(currency);
      const portVal = await cryptoApi.fetchPortfolioValuation();
      setPortfolio(portVal);
    } catch (e) {
      console.warn('Failed to patch portfolio currency settings:', e);
    }
  };

  // Spot Order Trade confirmation
  const executeSpotTrade = async (pin?: string) => {
    if (!selectedCoin) return;
    const amountVal = parseFloat(tradeAmount) || 0;
    if (amountVal <= 0) return alert('Please enter a valid amount.');

    setIsSubmitting(true);
    try {
      if (buySellType === 'buy') {
        await cryptoApi.buyCrypto(selectedCoin.symbol, amountVal, pin);
        alert(`Successfully purchased ${selectedCoin.symbol}!`);
      } else {
        await cryptoApi.sellCrypto(selectedCoin.symbol, amountVal, pin);
        alert(`Successfully sold ${selectedCoin.symbol}!`);
      }
      setTradeAmount('');
      syncWithBackend();
      loadData();
    } catch (err: any) {
      alert(err.message || 'Trade execution failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Swap/Convert trade execution
  const executeSwapTrade = async (pin?: string) => {
    const amountVal = parseFloat(swapAmount) || 0;
    if (amountVal <= 0) return;
    setIsSubmitting(true);
    try {
      await cryptoApi.swapCrypto(swapFrom, swapTo, amountVal, pin);
      alert('Swap trade conversion executed successfully!');
      setSwapAmount('100');
      syncWithBackend();
      loadData();
    } catch (err: any) {
      alert(err.message || 'Swap conversion failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // P2P ad publish
  const executePostAd = async (pin?: string) => {
    const priceVal = parseFloat(adPrice) || 0;
    const amountVal = parseFloat(adAmount) || 0;
    const minVal = parseFloat(adMinLimit) || 0;
    const maxVal = parseFloat(adMaxLimit) || 0;

    if (priceVal <= 0 || amountVal <= 0 || minVal <= 0 || maxVal <= 0) {
      alert('Please fill out all ad terms.');
      return;
    }

    setIsSubmitting(true);
    try {
      await cryptoApi.createP2PAd({
        asset_code: adAsset,
        side: adSide,
        price_ngn: priceVal,
        amount: amountVal,
        min_limit: minVal,
        max_limit: maxVal,
        pin
      });
      alert('Your P2P advertisement is now live on the trading desk!');
      setAdPrice('');
      setAdAmount('');
      setAdMinLimit('');
      setAdMaxLimit('');
      setP2pView('market');
    } catch (err: any) {
      alert(err.message || 'Post ad failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // P2P order creation
  const handleP2pCreateOrderSubmit = async () => {
    if (!p2pTradeAd) return;
    const qty = parseFloat(p2pTradeAmount) || 0;
    if (qty <= 0) return alert('Enter valid quantity.');

    setIsSubmitting(true);
    try {
      const order = await cryptoApi.createP2POrder(p2pTradeAd.id, qty);
      setP2pTradeAd(null);
      setP2pTradeAmount('');
      setSelectedP2pOrder(order);
      setP2pView('order_details');
      alert('Trade order created. Funding locked in Escrow.');
    } catch (err: any) {
      alert(err.message || 'Create trade failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // P2P order payment proof
  const handleP2pPaySubmit = async () => {
    if (!selectedP2pOrder) return;
    setIsSubmitting(true);
    try {
      const fresh = await cryptoApi.payP2POrder(selectedP2pOrder.id, 'https://example.com/proofs/paylence_p2p_receipt.png');
      setSelectedP2pOrder(fresh);
      alert('Marked as paid! Seller has been notified to verify.');
    } catch (err: any) {
      alert(err.message || 'Action failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // P2P order escrow release
  const executeReleaseEscrow = async (pin?: string) => {
    if (!selectedP2pOrder) return;
    setIsSubmitting(true);
    try {
      const fresh = await cryptoApi.releaseP2POrder(selectedP2pOrder.id, pin);
      setSelectedP2pOrder(fresh);
      alert('Escrow funds released directly to Buyer wallet!');
      syncWithBackend();
      loadData();
    } catch (err: any) {
      alert(err.message || 'Escrow release failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleP2pCancelSubmit = async () => {
    if (!selectedP2pOrder) return;
    if (!confirm('Are you sure you want to cancel this order? Escrow will be unlocked.')) return;
    setIsSubmitting(true);
    try {
      const fresh = await cryptoApi.cancelP2POrder(selectedP2pOrder.id);
      setSelectedP2pOrder(fresh);
      alert('Trade order cancelled.');
    } catch (err: any) {
      alert(err.message || 'Cancel failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleP2pDisputeSubmit = async () => {
    if (!selectedP2pOrder) return;
    setIsSubmitting(true);
    try {
      const fresh = await cryptoApi.disputeP2POrder(selectedP2pOrder.id);
      setSelectedP2pOrder(fresh);
      alert('Dispute opened. Paylence compliance officers will review the transaction logs.');
    } catch (err: any) {
      alert(err.message || 'Dispute failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // P2P Payment bank setup
  const handleP2pCreatePMSubmit = async () => {
    if (!p2pNewBank || !p2pNewAcctNum || !p2pNewAcctName) return alert('Fill in all fields.');
    setIsSubmitting(true);
    try {
      await cryptoApi.createP2PPaymentMethod({
        bank_name: p2pNewBank,
        account_number: p2pNewAcctNum,
        account_name: p2pNewAcctName
      });
      setP2pNewBank('');
      setP2pNewAcctNum('');
      setP2pNewAcctName('');
      loadP2pData();
      alert('Payment setup completed.');
    } catch (err: any) {
      alert(err.message || 'Payment method setup failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Valuation formatter
  const formattedValuation = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: portfolio.preferred_currency === 'USD' ? 'USD' : 'NGN',
    minimumFractionDigits: 2
  }).format(portfolio.total_value * (portfolio.preferred_currency === 'NGN' ? 1485.0 : 1));

  // Filter spot coins
  const trendingCoins = markets.slice(0, 5);
  const topGainers = [...markets].sort((a, b) => b.change_24h - a.change_24h).slice(0, 3);
  const topLosers = [...markets].sort((a, b) => a.change_24h - b.change_24h).slice(0, 3);

  // Filter P2P Ads
  const filteredAds = p2pAds.filter(
    (ad) => ad.asset_code === filterAsset && ad.side === (filterSide === 'Buy' ? 'Sell' : 'Buy')
  );

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-8 select-none">
      
      {/* 1. Sub Header Nav Tabs */}
      <div className="flex justify-between items-center border-b border-border pb-2.5">
        <div className="flex gap-4">
          {[
            { id: 'dashboard' as const, label: 'Swap Desk' },
            { id: 'markets' as const, label: 'Spot Market' },
            { id: 'p2p' as const, label: 'P2P Exchange' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`pb-2.5 text-sm font-extrabold relative transition-colors ${
                activeTab === t.id ? 'text-primary' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {t.label}
              {activeTab === t.id && (
                <motion.div layoutId="cryptoActiveTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </div>

        <button 
          onClick={loadData}
          className="p-2 rounded-lg bg-surface border border-border hover:border-primary/20 text-text-primary transition-colors cursor-pointer"
          title="Refresh prices"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* 2. TAB: DASHBOARD & SWAP */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          
          {/* Portfolio & Wallets */}
          <div className="space-y-6">
            
            {/* Portfolio Card */}
            <div className="bg-surface border border-border rounded-3xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.01)] relative overflow-hidden">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Total Portfolio Valuation</span>
                <button onClick={() => setIsValuationVisible(!isValuationVisible)} className="text-text-muted hover:text-text-primary transition-colors">
                  {isValuationVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>

              <h3 className="text-2xl font-black text-text-primary">
                {isValuationVisible ? formattedValuation : '•••••••••'}
              </h3>

              {/* Currency selectors */}
              <div className="flex gap-2 mt-4">
                {['USDT', 'USDC', 'USD', 'NGN'].map((curr) => {
                  const active = portfolio.preferred_currency === curr;
                  return (
                    <button
                      key={curr}
                      onClick={() => handleCurrencyChange(curr)}
                      className={`px-3 py-1.5 rounded-lg border text-[10px] font-extrabold cursor-pointer transition-colors ${
                        active ? 'border-primary bg-primary/10 text-primary' : 'border-border text-text-secondary hover:border-primary/25'
                      }`}
                    >
                      {curr}
                    </button>
                  );
                })}
              </div>

              <div className="h-[1px] bg-border/40 my-4" />
              <div className="flex items-center gap-1.5 text-[9px] text-text-muted font-bold">
                <ShieldCheck className="w-4.5 h-4.5 text-primary" />
                <span>Protected by Paylence Vault Escrow Escrow</span>
              </div>
            </div>

            {/* Asset Wallets */}
            <div className="bg-surface border border-border rounded-3xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
              <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Asset Wallets</h4>
              
              {wallets.length === 0 ? (
                <div className="text-center py-6 text-xs text-text-muted">No balances yet.</div>
              ) : (
                <div className="divide-y divide-border/30">
                  {wallets.map((wallet) => (
                    <div key={wallet.asset_code} className="flex justify-between items-center py-3">
                      <div>
                        <span className="text-xs font-extrabold text-text-primary block">{wallet.asset_code} Wallet</span>
                        <span className="text-[10px] text-text-muted block mt-0.5">Escrow balance: {wallet.escrow_balance}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-text-primary block">{wallet.balance.toFixed(4)}</span>
                        <span className="text-[9px] text-text-muted font-bold block mt-0.5">≈ ₦{wallet.value_ngn.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Swap / Buy Sell Card */}
          <div className="bg-surface border border-border rounded-3xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.01)] space-y-5">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-extrabold text-text-primary">Instant Swap Converter</h4>
              <Shuffle className="w-4 h-4 text-text-muted" />
            </div>

            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-text-secondary font-bold text-xs uppercase tracking-wider">From Asset</label>
                  <select
                    value={swapFrom}
                    onChange={(e) => setSwapFrom(e.target.value)}
                    className="w-full h-11 bg-input-bg border border-border rounded-xl px-3 text-text-primary text-xs outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="USDT">USDT</option>
                    <option value="BTC">BTC</option>
                    <option value="ETH">ETH</option>
                    <option value="SOL">SOL</option>
                  </select>
                </div>

                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-text-secondary font-bold text-xs uppercase tracking-wider">To Asset</label>
                  <select
                    value={swapTo}
                    onChange={(e) => setSwapTo(e.target.value)}
                    className="w-full h-11 bg-input-bg border border-border rounded-xl px-3 text-text-primary text-xs outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="BTC">BTC</option>
                    <option value="ETH">ETH</option>
                    <option value="USDT">USDT</option>
                    <option value="SOL">SOL</option>
                  </select>
                </div>
              </div>

              <Input
                label="Swap Amount"
                value={swapAmount}
                onValueChange={setSwapAmount}
                type="number"
                variant="primary"
                classNames={{ inputWrapper: "h-11 rounded-xl" }}
              />

              {/* Conversion Estimate Display */}
              <div className="p-3.5 rounded-2xl bg-input-bg border border-border/40 text-xs">
                {isFetchingSwapRate ? (
                  <div className="flex items-center justify-center py-2">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : swapRateInfo ? (
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-text-muted">
                      <span>Rate Estimate</span>
                      <span className="font-bold text-text-primary">1 {swapFrom} ≈ {swapRateInfo.rate} {swapTo}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-text-muted">Expected Yield</span>
                      <span className="font-black text-primary text-sm">{swapRateInfo.expected_to_amount} {swapTo}</span>
                    </div>
                  </div>
                ) : (
                  <span className="text-text-muted block text-center py-2">Enter amount to view estimates</span>
                )}
              </div>

              <Button
                isDisabled={!swapRateInfo}
                onPress={() => {
                  setPinAction('swap');
                  setPinVisible(true);
                }}
                className="w-full h-11 bg-primary text-white font-bold rounded-xl shadow-sm cursor-pointer"
              >
                Execute Swap
              </Button>
            </div>
          </div>

        </div>
      )}

      {/* 3. TAB: SPOT MARKETS */}
      {activeTab === 'markets' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          
          {/* Markets List */}
          <div className="md:col-span-2 bg-surface border border-border rounded-3xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.01)] space-y-4">
            <h4 className="text-sm font-extrabold text-text-primary">Spot Market Coin Pairs</h4>

            <div className="divide-y divide-border/30">
              {markets.map((coin) => {
                const isUp = coin.change_24h >= 0;
                return (
                  <div 
                    key={coin.id}
                    onClick={() => setSelectedCoin(coin)}
                    className={`flex items-center justify-between py-3.5 px-2 rounded-xl cursor-pointer transition-colors hover:bg-border/10 ${
                      selectedCoin?.id === coin.id ? 'bg-primary-light/10 border border-primary/20' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
                      <div>
                        <span className="text-xs font-bold text-text-primary block">{coin.symbol} / NGN</span>
                        <span className="text-[10px] text-text-muted block mt-0.5">{coin.name}</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <span className="text-xs font-black text-text-primary block">
                        ₦{coin.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                      <span className={`text-[9px] font-bold block mt-0.5 ${isUp ? 'text-emerald-500' : 'text-danger'}`}>
                        {isUp ? '+' : ''}{coin.change_24h}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trade Panel */}
          {selectedCoin && (
            <div className="bg-surface border border-border rounded-3xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.01)] space-y-5">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-extrabold text-text-primary">Trade {selectedCoin.symbol}</h4>
                <div className="flex gap-1.5 p-1 bg-input-bg rounded-lg border border-border/40">
                  <button
                    onClick={() => setBuySellType('buy')}
                    className={`px-3 py-1 rounded-md text-[10px] font-extrabold transition-colors cursor-pointer ${
                      buySellType === 'buy' ? 'bg-success text-white' : 'text-text-secondary'
                    }`}
                  >
                    Buy
                  </button>
                  <button
                    onClick={() => setBuySellType('sell')}
                    className={`px-3 py-1 rounded-md text-[10px] font-extrabold transition-colors cursor-pointer ${
                      buySellType === 'sell' ? 'bg-danger text-white' : 'text-text-secondary'
                    }`}
                  >
                    Sell
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <Input
                  label={buySellType === 'buy' ? 'Spend Amount (₦)' : `Sell Quantity (${selectedCoin.symbol})`}
                  placeholder="e.g. 5,000"
                  labelPlacement="outside"
                  type="number"
                  value={tradeAmount}
                  onValueChange={setTradeAmount}
                  variant="primary"
                  classNames={{ inputWrapper: "h-11 rounded-xl" }}
                />

                <span className="text-[10px] text-text-muted font-bold block">
                  {buySellType === 'buy'
                    ? `Naira Balance Available: ₦${mainBalance.toLocaleString()}`
                    : `${selectedCoin.symbol} Wallet Available: ${(wallets.find(w => w.asset_code === selectedCoin.symbol)?.balance || 0).toFixed(4)}`
                  }
                </span>

                <Button
                  onPress={() => {
                    setPinAction('spot_trade');
                    setPinVisible(true);
                  }}
                  className={`w-full h-11 text-white font-bold rounded-xl shadow-sm cursor-pointer ${
                    buySellType === 'buy' ? 'bg-success' : 'bg-danger'
                  }`}
                >
                  {buySellType === 'buy' ? 'Purchase Coin' : 'Sell Asset'}
                </Button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* 4. TAB: P2P EXCHANGE */}
      {activeTab === 'p2p' && (
        <div className="space-y-6">
          
          {/* P2P Sub navigation */}
          <div className="flex gap-3 bg-surface border border-border p-2.5 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.01)] overflow-x-auto">
            {[
              { id: 'market' as const, label: 'Ad Board' },
              { id: 'orders' as const, label: 'My Trades' },
              { id: 'payments' as const, label: 'Payout Methods' },
              { id: 'post' as const, label: 'Post Ad' },
            ].map(p => (
              <button
                key={p.id}
                onClick={() => setP2pView(p.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  p2pView === p.id ? 'bg-primary text-background' : 'text-text-muted hover:bg-border/20'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* P2P VIEW: MARKET LISTINGS */}
          {p2pView === 'market' && (
            <div className="space-y-4">
              
              {/* Filter controls */}
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div className="flex gap-1.5 p-1 bg-input-bg border border-border rounded-xl">
                  {['Buy', 'Sell'].map((side) => (
                    <button
                      key={side}
                      onClick={() => setFilterSide(side as any)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-extrabold transition-colors cursor-pointer ${
                        filterSide === side 
                          ? (side === 'Buy' ? 'bg-success text-white' : 'bg-danger text-white')
                          : 'text-text-secondary'
                      }`}
                    >
                      {side}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  {['USDT', 'BTC', 'ETH'].map(token => (
                    <button
                      key={token}
                      onClick={() => setFilterAsset(token as any)}
                      className={`px-3.5 py-1.5 rounded-xl border text-xs font-extrabold cursor-pointer transition-colors ${
                        filterAsset === token ? 'border-primary bg-primary/10 text-primary' : 'border-border text-text-secondary hover:border-primary/20'
                      }`}
                    >
                      {token}
                    </button>
                  ))}
                </div>
              </div>

              {/* Advertiser list */}
              {filteredAds.length === 0 ? (
                <div className="border border-border border-dashed rounded-3xl py-12 text-center text-xs text-text-muted">
                  No active P2P adverts for this token category.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredAds.map((ad) => (
                    <div 
                      key={ad.id}
                      className="bg-surface border border-border rounded-2xl p-4 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:border-primary/20 transition-all"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="text-xs font-bold text-text-primary block">{ad.username}</span>
                            <span className="text-[9px] text-text-muted mt-0.5 block">Completion Rate: 100%</span>
                          </div>
                          <span className="text-sm font-black text-primary">
                            ₦{ad.price_ngn.toLocaleString()}/$
                          </span>
                        </div>

                        <div className="space-y-1 text-[10px] text-text-muted mt-3">
                          <div className="flex justify-between">
                            <span>Available Amount</span>
                            <span className="font-bold text-text-secondary">{ad.amount} {ad.asset_code}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Limits</span>
                            <span className="font-bold text-text-secondary">₦{ad.min_limit.toLocaleString()} - ₦{ad.max_limit.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      <Button
                        onPress={() => setP2pTradeAd(ad)}
                        className={`w-full h-9 rounded-xl font-bold text-white mt-4 ${
                          filterSide === 'Buy' ? 'bg-success' : 'bg-danger'
                        }`}
                      >
                        {filterSide === 'Buy' ? `Buy ${ad.asset_code}` : `Sell ${ad.asset_code}`}
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Trade Modal Overlay */}
              {p2pTradeAd && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="w-full max-w-[380px] bg-surface border border-border p-5 rounded-3xl shadow-xl space-y-4">
                    <h3 className="text-base font-extrabold text-text-primary">
                      Initialize P2P Trade with {p2pTradeAd.username}
                    </h3>
                    
                    <div className="p-3 bg-primary-light/10 border border-primary/10 rounded-xl space-y-1 text-xs text-text-secondary">
                      <div className="flex justify-between">
                        <span>Price Exchange</span>
                        <span className="font-bold text-text-primary">₦{p2pTradeAd.price_ngn.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Min/Max Limits</span>
                        <span className="font-bold text-text-primary">₦{p2pTradeAd.min_limit.toLocaleString()} - ₦{p2pTradeAd.max_limit.toLocaleString()}</span>
                      </div>
                    </div>

                    <Input
                      label="Buy Amount (₦)"
                      placeholder="e.g. 10,000"
                      labelPlacement="outside"
                      type="number"
                      value={p2pTradeAmount}
                      onValueChange={setP2pTradeAmount}
                      variant="primary"
                      classNames={{ inputWrapper: "h-11 rounded-xl" }}
                    />

                    <div className="flex gap-3 pt-2">
                      <Button variant="outline" className="flex-1 h-11 rounded-xl font-bold" onClick={() => setP2pTradeAd(null)}>
                        Cancel
                      </Button>
                      <Button 
                        isPending={isSubmitting} 
                        onPress={handleP2pCreateOrderSubmit}
                        className="flex-1 h-11 bg-primary text-white font-bold rounded-xl shadow-sm"
                      >
                        Open Trade
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* P2P VIEW: ACTIVE ORDERS */}
          {p2pView === 'orders' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">My Trades</h4>

              {p2pOrders.length === 0 ? (
                <div className="border border-border border-dashed rounded-3xl py-12 text-center text-xs text-text-muted">
                  No trade logs found.
                </div>
              ) : (
                <div className="space-y-3">
                  {p2pOrders.map((order) => (
                    <div 
                      key={order.id}
                      onClick={() => {
                        setSelectedP2pOrder(order);
                        setP2pView('order_details');
                      }}
                      className="bg-surface border border-border p-4 rounded-2xl flex justify-between items-center cursor-pointer hover:border-primary/20 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.01)]"
                    >
                      <div>
                        <span className="text-xs font-extrabold text-text-primary block">Order #{order.id.slice(-6)}</span>
                        <span className="text-[10px] text-text-muted block mt-1">Amount: {order.amount} USDT · ₦{order.total_ngn.toLocaleString()}</span>
                      </div>
                      
                      <div className="text-right flex flex-col items-end gap-1.5">
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-md ${
                          order.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500' : order.status === 'Paid' ? 'bg-blue-500/10 text-blue-500' : 'bg-amber-500/10 text-amber-500'
                        }`}>
                          {order.status}
                        </span>
                        <ChevronRight className="w-4 h-4 text-text-muted" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* P2P VIEW: ORDER DETAILS & ACTIONS */}
          {p2pView === 'order_details' && selectedP2pOrder && (
            <div className="bg-surface border border-border rounded-3xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.01)] space-y-6">
              
              <div className="flex justify-between items-center border-b border-border/40 pb-3">
                <button onClick={() => setP2pView('orders')} className="text-xs text-text-muted hover:text-text-primary">
                  ➔ Back to list
                </button>
                <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">Order Details</h4>
              </div>

              {/* Order meta */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-text-muted block">Trade Quantity</span>
                  <span className="font-extrabold text-text-primary mt-1 block">{selectedP2pOrder.amount} USDT</span>
                </div>
                <div>
                  <span className="text-text-muted block">Total Payment (NGN)</span>
                  <span className="font-extrabold text-text-primary mt-1 block">₦{selectedP2pOrder.total_ngn.toLocaleString()}</span>
                </div>
              </div>

              {/* Bank Payout details (if buyer) */}
              <div className="p-4 bg-input-bg border border-border/40 rounded-2xl space-y-2">
                <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Seller Payment Details</span>
                <div className="text-xs font-bold text-text-primary">
                  {selectedP2pOrder.payment_details?.bank_name || 'Standard Trust Bank'}<br />
                  {selectedP2pOrder.payment_details?.account_number || '1020492810'}<br />
                  {selectedP2pOrder.payment_details?.account_name || 'Merchant Escrow Escrow'}
                </div>
              </div>

              {/* Current Status info box */}
              <div className="p-3.5 bg-primary-light/10 border border-primary/10 rounded-2xl text-xs text-text-secondary flex gap-2">
                <Info className="w-5 h-5 text-primary shrink-0" />
                <div className="space-y-1">
                  <span className="font-bold text-text-primary block">Current status: {selectedP2pOrder.status}</span>
                  <p className="leading-relaxed">
                    Please upload screenshot or make payment before checking the "Mark Paid" button. Locked escrow assets are protected securely.
                  </p>
                </div>
              </div>

              {/* Action buttons based on state */}
              <div className="space-y-2">
                {selectedP2pOrder.status === 'Pending_Payment' && (
                  <>
                    <Button
                      isPending={isSubmitting}
                      onPress={handleP2pPaySubmit}
                      className="w-full h-11 bg-success text-white font-bold rounded-xl"
                    >
                      I Have Paid (Mark Paid)
                    </Button>
                    <Button
                      isPending={isSubmitting}
                      onPress={handleP2pCancelSubmit}
                      variant="outline"
                      className="w-full h-11 border-danger text-danger hover:bg-danger/5 font-bold rounded-xl"
                    >
                      Cancel Order
                    </Button>
                  </>
                )}

                {selectedP2pOrder.status === 'Paid' && (
                  <>
                    <Button
                      onPress={() => {
                        setPinAction('release_p2p');
                        setPinVisible(true);
                      }}
                      className="w-full h-11 bg-primary text-background font-black rounded-xl"
                    >
                      Confirm and Release Escrow
                    </Button>
                    
                    <Button
                      isPending={isSubmitting}
                      onPress={handleP2pDisputeSubmit}
                      variant="outline"
                      className="w-full h-11 border-border text-text-muted font-bold rounded-xl"
                    >
                      Open Dispute
                    </Button>
                  </>
                )}

                {selectedP2pOrder.status === 'Completed' && (
                  <div className="text-center py-2 text-xs font-bold text-emerald-500">
                    This order has been completed successfully. Assets are released!
                  </div>
                )}
              </div>

            </div>
          )}

          {/* P2P VIEW: PAYOUT METHODS SETUP */}
          {p2pView === 'payments' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              
              {/* Payment Methods listing */}
              <div className="bg-surface border border-border rounded-3xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.01)] space-y-4">
                <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">Linked Payout Accounts</h4>
                
                {p2pPaymentMethods.length === 0 ? (
                  <div className="text-center py-8 text-xs text-text-muted">No payout accounts set up.</div>
                ) : (
                  <div className="space-y-3">
                    {p2pPaymentMethods.map((pm, idx) => (
                      <div key={idx} className="p-3 border border-border bg-background rounded-xl flex items-center gap-3">
                        <Building className="w-5 h-5 text-primary shrink-0" />
                        <div>
                          <span className="text-xs font-bold text-text-primary block">{pm.bank_name}</span>
                          <span className="text-[10px] text-text-muted block mt-0.5">{pm.account_number} · {pm.account_name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Link New Form */}
              <div className="bg-surface border border-border rounded-3xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.01)] space-y-4">
                <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">Configure Bank Payout</h4>
                
                <Input label="Bank Name" value={p2pNewBank} onValueChange={setP2pNewBank} variant="primary" classNames={{ inputWrapper: "h-11 rounded-xl" }} />
                <Input label="Account Number" value={p2pNewAcctNum} onValueChange={setP2pNewAcctNum} variant="primary" classNames={{ inputWrapper: "h-11 rounded-xl" }} />
                <Input label="Account Name" value={p2pNewAcctName} onValueChange={setP2pNewAcctName} variant="primary" classNames={{ inputWrapper: "h-11 rounded-xl" }} />

                <Button
                  isPending={isSubmitting}
                  onPress={handleP2pCreatePMSubmit}
                  className="w-full h-11 bg-primary text-white font-bold rounded-xl mt-2"
                >
                  Save Account
                </Button>
              </div>

            </div>
          )}

          {/* P2P VIEW: POST ADVERT */}
          {p2pView === 'post' && (
            <div className="bg-surface border border-border rounded-3xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.01)] max-w-lg mx-auto space-y-4">
              <h4 className="text-sm font-extrabold text-text-primary text-center mb-2">Publish P2P Advertisement</h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-text-secondary font-bold text-xs uppercase tracking-wider">Asset Code</label>
                  <select
                    value={adAsset}
                    onChange={(e) => setAdAsset(e.target.value as any)}
                    className="w-full h-11 bg-input-bg border border-border rounded-xl px-3 text-text-primary text-xs outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="USDT">USDT</option>
                    <option value="BTC">BTC</option>
                    <option value="ETH">ETH</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-text-secondary font-bold text-xs uppercase tracking-wider">Trade Side</label>
                  <select
                    value={adSide}
                    onChange={(e) => setAdSide(e.target.value as any)}
                    className="w-full h-11 bg-input-bg border border-border rounded-xl px-3 text-text-primary text-xs outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="Sell">Sell (USDT to NGN)</option>
                    <option value="Buy">Buy (NGN to USDT)</option>
                  </select>
                </div>
              </div>

              <Input label="Exchange Rate (₦/$)" placeholder="e.g. 1480" value={adPrice} onValueChange={setAdPrice} variant="primary" classNames={{ inputWrapper: "h-11 rounded-xl" }} />
              <Input label="Total Amount" placeholder="e.g. 500" value={adAmount} onValueChange={setAdAmount} variant="primary" classNames={{ inputWrapper: "h-11 rounded-xl" }} />
              
              <div className="grid grid-cols-2 gap-4">
                <Input label="Min Limit (₦)" placeholder="e.g. 1000" value={adMinLimit} onValueChange={setAdMinLimit} variant="primary" classNames={{ inputWrapper: "h-11 rounded-xl" }} />
                <Input label="Max Limit (₦)" placeholder="e.g. 50000" value={adMaxLimit} onValueChange={setAdMaxLimit} variant="primary" classNames={{ inputWrapper: "h-11 rounded-xl" }} />
              </div>

              <Button
                onPress={() => {
                  setPinAction('post_ad');
                  setPinVisible(true);
                }}
                className="w-full h-11 bg-primary text-white font-bold rounded-xl mt-4"
              >
                Publish Ad
              </Button>
            </div>
          )}

        </div>
      )}

      {/* Security Override Modals */}
      <BiometricPinModal
        visible={pinVisible}
        onClose={() => setPinVisible(false)}
        onSuccess={(pin) => {
          if (pinAction === 'spot_trade') {
            executeSpotTrade(pin);
          } else if (pinAction === 'swap') {
            executeSwapTrade(pin);
          } else if (pinAction === 'post_ad') {
            executePostAd(pin);
          } else if (pinAction === 'release_p2p') {
            executeReleaseEscrow(pin);
          }
        }}
      />

    </div>
  );
}
