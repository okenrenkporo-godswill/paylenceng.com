"use client";

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthProvider';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Shield, Plus, Globe, Briefcase, Sparkles, Check, Info, Lock, Eye, EyeOff, RotateCcw, Image as ImageIcon } from 'lucide-react';
import { Button, Input, Checkbox } from '../../components/UI';
import { Modal } from '@heroui/react';
import { CardItem, CardType } from '../../types/wallet';

type CreationStep = 1 | 2 | 3;

interface CountryData {
  name: string;
  flag: string;
  currency: string;
  currencyCode: string;
  currencyName: string;
}

const COUNTRIES: CountryData[] = [
  { name: 'Nigeria',      flag: '🇳🇬', currency: '₦',  currencyCode: 'NGN', currencyName: 'Naira' },
  { name: 'United States',flag: '🇺🇸', currency: '$',  currencyCode: 'USD', currencyName: 'Dollar' },
  { name: 'United Kingdom',flag: '🇬🇧', currency: '£',  currencyCode: 'GBP', currencyName: 'Pound' },
  { name: 'Europe',       flag: '🇪🇺', currency: '€',  currencyCode: 'EUR', currencyName: 'Euro' },
  { name: 'Ghana',        flag: '🇬🇭', currency: '₵',  currencyCode: 'GHS', currencyName: 'Cedi' },
  { name: 'Kenya',        flag: '🇰🇪', currency: 'KSh',currencyCode: 'KES', currencyName: 'Shilling' },
  { name: 'Canada',       flag: '🇨🇦', currency: 'C$', currencyCode: 'CAD', currencyName: 'Dollar' },
];

interface CardTypeDef {
  id: CardType;
  title: string;
  subtitle: string;
  icon: React.ComponentType<any>;
  fee: number;
  defaultBrand: CardItem['brand'];
  gradients: string; // Tailwind class
  accentColor: string;
  chipColor: string;
  badge: string;
  badgeColor: string;
  bg?: string;
  color?: string;
}

const CARD_TYPES: CardTypeDef[] = [
  {
    id: 'virtual_dollar',
    title: 'Virtual Dollar',
    subtitle: 'Shop online globally',
    icon: Globe,
    fee: 3500,
    defaultBrand: 'Visa',
    gradients: 'from-blue-700 via-blue-600 to-sky-500',
    accentColor: 'text-sky-300 border-sky-300/35',
    chipColor: 'bg-blue-300',
    badge: 'USD',
    badgeColor: 'bg-sky-400/20 text-sky-400',
    bg: 'bg-blue-100',
    color: 'text-blue-600',
  },
  {
    id: 'virtual_naira',
    title: 'Virtual Naira',
    subtitle: 'Local online payments',
    icon: CreditCard,
    fee: 2000,
    defaultBrand: 'Verve',
    gradients: 'from-slate-800 via-slate-700 to-slate-600',
    accentColor: 'text-slate-300 border-slate-300/35',
    chipColor: 'bg-amber-400',
    badge: 'NGN',
    badgeColor: 'bg-slate-400/20 text-slate-400',
    bg: 'bg-slate-100',
    color: 'text-slate-600',
  },
  {
    id: 'premium_physical',
    title: 'Premium Physical',
    subtitle: 'ATM + POS worldwide',
    icon: Sparkles,
    fee: 5000,
    defaultBrand: 'Visa',
    gradients: 'from-amber-800 via-amber-700 to-amber-500',
    accentColor: 'text-amber-300 border-amber-300/35',
    chipColor: 'bg-amber-300',
    badge: 'GOLD',
    badgeColor: 'bg-amber-300/20 text-amber-300',
    bg: 'bg-amber-100',
    color: 'text-amber-600',
  },
  {
    id: 'business',
    title: 'Business Card',
    subtitle: 'Corporate spending',
    icon: Briefcase,
    fee: 8000,
    defaultBrand: 'Mastercard',
    gradients: 'from-zinc-950 via-zinc-900 to-zinc-800',
    accentColor: 'text-zinc-400 border-zinc-400/35',
    chipColor: 'bg-zinc-300',
    badge: 'BIZ',
    badgeColor: 'bg-zinc-400/20 text-zinc-400',
    bg: 'bg-zinc-100',
    color: 'text-zinc-600',
  },
];

const INITIAL_CARDS: CardItem[] = [
  {
    id: 'card-1',
    number: '5399481209844085',
    expiry: '08/29',
    cvv: '542',
    name: 'Joel Verified',
    brand: 'Visa',
    styleType: 'slate',
    cardType: 'virtual_naira',
    country: 'Nigeria',
    countryFlag: '🇳🇬',
    currency: '₦',
    currencyCode: 'NGN',
    isFrozen: false,
  }
];

export default function CardsPage() {
  const { balance, setBalance, setTransactions } = useAuth();
  const { isDark } = useTheme();
  
  const [cards, setCards] = useState<CardItem[]>(INITIAL_CARDS);
  const [selectedCardId, setSelectedCardId] = useState<string>('card-1');
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  // Card creation modal state
  const [isOpen, setIsOpen] = useState(false);
  const onOpen = () => setIsOpen(true);
  const onOpenChange = () => setIsOpen(!isOpen);
  const [step, setStep] = useState<CreationStep>(1);
  const [selectedCountry, setSelectedCountry] = useState<CountryData>(COUNTRIES[0]);
  const [selectedCardType, setSelectedCardType] = useState<CardType>('virtual_dollar');
  const [cardHolderName, setCardHolderName] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<CardItem['brand']>('Visa');
  const [selectedColor, setSelectedColor] = useState('#1E40AF');

  const activeCard = cards.find(c => c.id === selectedCardId) || cards[0];

  const handleToggleFlip = (cardId: string) => {
    setFlippedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const handleToggleFreeze = (cardId: string) => {
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, isFrozen: !c.isFrozen } : c));
  };

  // Card details calculations
  const genCardNumber = (brand: CardItem['brand']): string => {
    const prefix = brand === 'Visa' ? '4' : brand === 'Mastercard' ? '5' : '6';
    let n = prefix;
    while (n.length < 16) n += Math.floor(Math.random() * 10);
    return n;
  };

  const handleCreateCard = () => {
    const typeDef = CARD_TYPES.find(t => t.id === selectedCardType) || CARD_TYPES[0];
    
    if (balance < typeDef.fee) {
      alert('Insufficient wallet balance to issue this card.');
      return;
    }

    if (!cardHolderName.trim()) {
      alert('Please enter a cardholder name.');
      return;
    }

    const newCard: CardItem = {
      id: `card-${Date.now()}`,
      number: genCardNumber(selectedBrand),
      expiry: `08/30`,
      cvv: String(100 + Math.floor(Math.random() * 900)),
      name: cardHolderName,
      brand: selectedBrand,
      styleType: 'slate',
      cardType: selectedCardType,
      country: selectedCountry.name,
      countryFlag: selectedCountry.flag,
      currency: selectedCountry.currency,
      currencyCode: selectedCountry.currencyCode,
      isFrozen: false,
      bgColor: selectedColor
    };

    // Deduct fee and save
    setBalance(prev => prev - typeDef.fee);
    setCards(prev => [...prev, newCard]);
    setSelectedCardId(newCard.id);

    // Add log transaction
    const newTx = {
      id: `tx-${Date.now()}`,
      type: 'Withdrawal' as const,
      title: `Issued ${typeDef.title} Card`,
      amount: typeDef.fee,
      currency: 'NGN',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Completed' as const
    };
    setTransactions(prev => [newTx, ...prev]);

    // Close and reset
    onOpenChange();
    setStep(1);
    setCardHolderName('');
    alert('Virtual Card Issued Successfully!');
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-8 select-none">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-text-primary">My Cards</h2>
          <p className="text-xs text-text-muted mt-1">Manage your virtual and physical cards</p>
        </div>
        
        <Button
          onPress={() => {
            setStep(1);
            onOpen();
          }}
          className="rounded-xl font-bold text-white bg-primary shadow-sm cursor-pointer flex items-center gap-1.5 h-10"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>New Card</span>
        </Button>
      </div>

      {/* Card Carousel Area */}
      {cards.length === 0 ? (
        <div className="border border-border/80 border-dashed rounded-3xl py-12 flex flex-col items-center justify-center text-center gap-3">
          <CreditCard className="w-12 h-12 text-text-muted" />
          <p className="text-sm text-text-muted max-w-[280px]">No active cards. Apply for a card to get started shopping online globally!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          
          {/* Virtual Card 3D Flip Render */}
          <div className="flex flex-col items-center gap-4">
            <div 
              onClick={() => handleToggleFlip(activeCard.id)}
              className="relative w-full aspect-[1.586/1] max-w-[380px] cursor-pointer group [perspective:1000px]"
            >
              <motion.div
                animate={{ rotateY: flippedCards[activeCard.id] ? 180 : 0 }}
                transition={{ type: 'spring', damping: 20, stiffness: 120 }}
                className="w-full h-full relative [transform-style:preserve-3d]"
              >
                
                {/* CARD FRONT FACE */}
                <div 
                  className={`absolute inset-0 rounded-[22px] p-5 flex flex-col justify-between text-white shadow-xl [backface-visibility:hidden] overflow-hidden ${
                    activeCard.bgColor 
                      ? '' 
                      : (CARD_TYPES.find(t => t.id === activeCard.cardType)?.gradients || 'bg-slate-800')
                  }`}
                  style={activeCard.bgColor ? { backgroundColor: activeCard.bgColor } : undefined}
                >
                  {/* Decorative card gradient circles */}
                  <div className="absolute top-[-40px] right-[-40px] w-[140px] h-[140px] rounded-full bg-white/5 pointer-events-none" />
                  
                  {/* Row 1: Brand & Logo */}
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[15px] font-black tracking-widest uppercase">Paylence</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[9px] font-bold opacity-80 uppercase">
                          {CARD_TYPES.find(t => t.id === activeCard.cardType)?.title || 'Virtual'}
                        </span>
                        {activeCard.countryFlag && (
                          <span className="text-xs">{activeCard.countryFlag}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs font-black italic">{activeCard.brand.toUpperCase()}</span>
                      {activeCard.currencyCode && (
                        <div className="px-2 py-0.5 rounded-md text-[8px] font-bold bg-white/15 border border-white/20">
                          {activeCard.currencyCode}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* EMV Chip */}
                  <div className="w-10 h-7 rounded-md bg-amber-400/80 flex flex-col gap-1 p-1">
                    <div className="h-[2px] bg-slate-900/10" />
                    <div className="h-[2px] bg-slate-900/10" />
                  </div>

                  {/* Masked Card Number */}
                  <div className="text-lg sm:text-xl font-bold tracking-widest text-center mt-2">
                    {`••••  ••••  ••••  ${activeCard.number.slice(-4)}`}
                  </div>

                  {/* Card Footer */}
                  <div className="flex justify-between items-end text-[9px]">
                    <div>
                      <span className="opacity-60 block tracking-wider uppercase">Cardholder</span>
                      <span className="font-bold text-[10px] mt-0.5 block truncate max-w-[120px]">{activeCard.name}</span>
                    </div>
                    
                    <div>
                      <span className="opacity-60 block tracking-wider uppercase">Expires</span>
                      <span className="font-bold text-[10px] mt-0.5 block">{activeCard.expiry}</span>
                    </div>

                    <div className="flex gap-1.5">
                      <div className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                        <Eye className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>

                  {/* Freeze Overlay */}
                  {activeCard.isFrozen && (
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2">
                      <Lock className="w-8 h-8 text-white" />
                      <span className="text-xs font-black uppercase tracking-wider text-white">Frozen</span>
                    </div>
                  )}
                </div>

                {/* CARD BACK FACE */}
                <div className="absolute inset-0 rounded-[22px] p-5 flex flex-col justify-between text-white bg-slate-950 [backface-visibility:hidden] [transform:rotateY(180deg)] overflow-hidden">
                  <div className="absolute left-0 top-4 right-0 h-9 bg-black" />
                  
                  <div className="mt-10 flex flex-col items-center">
                    <span className="text-sm font-semibold tracking-widest text-slate-300">
                      {activeCard.number.replace(/(.{4})/g, '$1  ').trim()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center bg-slate-900/50 p-2.5 rounded-xl border border-white/5">
                    <div className="flex-1">
                      <span className="text-[7px] text-slate-400 block tracking-wider uppercase">Signature Panel</span>
                      <span className="text-[10px] font-bold italic mt-0.5 block">{activeCard.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[7px] text-slate-400 block tracking-wider uppercase">CVV</span>
                      <span className="text-xs font-black mt-0.5 block">{activeCard.cvv}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[8px] text-slate-500">
                    <span>EXPIRES: {activeCard.expiry}</span>
                    <span>support@paylence.com</span>
                  </div>
                </div>

              </motion.div>
            </div>

            <p className="text-xs text-text-muted italic">Click card to show/reveal back details</p>
          </div>

          {/* Card Management Controls Panel */}
          <div className="bg-surface border border-border p-5 rounded-3xl space-y-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)] w-full">
            <h4 className="text-sm font-bold text-text-primary">Card Settings</h4>
            
            <div className="flex items-center justify-between p-3 border border-border rounded-xl">
              <div>
                <h5 className="text-xs font-bold text-text-primary">Freeze Card</h5>
                <p className="text-[10px] text-text-muted mt-0.5">Temporarily block card operations</p>
              </div>
              <Checkbox
                isSelected={activeCard.isFrozen}
                onValueChange={() => handleToggleFreeze(activeCard.id)}
                classNames={{ wrapper: "after:bg-primary" }}
              />
            </div>

            <div className="flex items-center justify-between p-3 border border-border rounded-xl">
              <div>
                <h5 className="text-xs font-bold text-text-primary">3D Secure Verification</h5>
                <p className="text-[10px] text-text-muted mt-0.5">Automated web transaction approvals</p>
              </div>
              <div className="px-2 py-0.5 bg-success-bg text-success rounded-md text-[9px] font-bold">
                Active
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-primary-light/10 border border-primary/10 rounded-xl text-xs text-text-secondary">
              <Info className="w-5 h-5 text-primary shrink-0" />
              <p className="leading-relaxed">
                Your virtual dollar card can be funded directly from your main wallet balance. Standard transactions incur zero local maintenance fees.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* Select Card List (if user has multiple cards) */}
      {cards.length > 1 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">My Virtual Cards ({cards.length})</h4>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {cards.map(c => {
              const active = selectedCardId === c.id;
              const typeDef = CARD_TYPES.find(t => t.id === c.cardType);
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCardId(c.id)}
                  className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer shrink-0 transition-all ${
                    active ? 'border-primary bg-primary-light/15' : 'border-border bg-surface hover:border-primary/20'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${typeDef?.bg || 'bg-slate-100'} ${typeDef?.color || 'text-slate-600'}`}>
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-bold text-text-primary block">{c.brand} ({c.number.slice(-4)})</span>
                    <span className="text-[9px] text-text-muted block capitalize">{c.country} · {c.currencyCode}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Premium Multi-step Application Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <Modal.Backdrop>
          <Modal.Container size="md">
            <Modal.Dialog className="select-none text-text-primary outline-none">
              {({ close }) => (
                <>
                  <Modal.Header className="flex flex-col gap-1 text-base font-extrabold">
                    Apply for Virtual Card
                  </Modal.Header>
                  
                  <Modal.Body className="pb-6">
                    
                    {/* Progress Indicators */}
                    <div className="flex justify-between items-center mb-6 px-4">
                      {[1, 2, 3].map((s) => (
                        <React.Fragment key={s}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            step >= s ? 'bg-primary text-background' : 'bg-border/60 text-text-muted'
                          }`}>
                            {s}
                          </div>
                          {s < 3 && (
                            <div className={`flex-1 h-[2px] mx-2 ${
                              step > s ? 'bg-primary' : 'bg-border/40'
                            }`} />
                          )}
                        </React.Fragment>
                      ))}
                    </div>

                    {/* Step 1: Country Selection */}
                    {step === 1 && (
                      <div className="space-y-4">
                        <span className="text-xs font-extrabold text-text-primary block">Select Card Issuing Country</span>
                        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                          {COUNTRIES.map((country) => (
                            <div
                              key={country.name}
                              onClick={() => setSelectedCountry(country)}
                              className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer hover:border-primary/20 transition-all ${
                                selectedCountry.name === country.name ? 'border-primary bg-primary-light/10' : 'border-border'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-xl">{country.flag}</span>
                                <span className="text-xs font-bold">{country.name}</span>
                              </div>
                              <span className="text-[10px] text-text-muted font-bold">
                                {country.currencyCode} ({country.currency})
                              </span>
                            </div>
                          ))}
                        </div>

                        <Button
                          onPress={() => setStep(2)}
                          className="w-full h-11 rounded-xl font-bold text-white bg-primary mt-4 cursor-pointer"
                        >
                          Continue
                        </Button>
                      </div>
                    )}

                    {/* Step 2: Card Type & Brand Selection */}
                    {step === 2 && (
                      <div className="space-y-4">
                        <span className="text-xs font-extrabold text-text-primary block">Select Card Product Type</span>
                        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                          {CARD_TYPES.map((type) => {
                            const Icon = type.icon;
                            return (
                              <div
                                key={type.id}
                                onClick={() => {
                                  setSelectedCardType(type.id);
                                  setSelectedBrand(type.defaultBrand);
                                }}
                                className={`flex items-center gap-3.5 p-3.5 border rounded-xl cursor-pointer hover:border-primary/20 transition-all ${
                                  selectedCardType === type.id ? 'border-primary bg-primary-light/10' : 'border-border'
                                }`}
                              >
                                <div className="w-9 h-9 bg-primary-light text-primary rounded-xl flex items-center justify-center shrink-0">
                                  <Icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-text-primary">{type.title}</span>
                                    <span className="text-[8px] font-bold text-text-muted">₦{type.fee.toLocaleString()} fee</span>
                                  </div>
                                  <p className="text-[10px] text-text-muted mt-1 truncate">{type.subtitle}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Brand select option */}
                        <div className="space-y-2 mt-4">
                          <span className="text-xs font-bold text-text-secondary block">Card Brand Network</span>
                          <div className="grid grid-cols-3 gap-2">
                            {(['Visa', 'Mastercard', 'Verve'] as const).map(brand => (
                              <button
                                key={brand}
                                type="button"
                                onClick={() => setSelectedBrand(brand)}
                                className={`py-2 px-3 rounded-xl border text-xs font-bold capitalize cursor-pointer transition-all ${
                                  selectedBrand === brand
                                    ? 'border-primary bg-primary-light/25 text-primary'
                                    : 'border-border text-text-secondary hover:border-primary/20'
                                }`}
                              >
                                {brand}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                          <Button
                            onPress={() => setStep(1)}
                            variant="bordered"
                            className="flex-1 h-11 rounded-xl font-bold text-text-primary border-border"
                          >
                            Back
                          </Button>
                          <Button
                            onPress={() => setStep(3)}
                            className="flex-1 h-11 rounded-xl font-bold text-white bg-primary cursor-pointer"
                          >
                            Continue
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Cardholder Name & Color Customization */}
                    {step === 3 && (
                      <div className="space-y-4">
                        <Input
                          label="Cardholder Display Name"
                          placeholder="e.g. John Doe"
                          labelPlacement="outside"
                          value={cardHolderName}
                          onValueChange={setCardHolderName}
                          variant="bordered"
                          classNames={{
                            inputWrapper: "border-border hover:border-primary focus-within:border-primary bg-input-bg h-11 rounded-xl",
                            label: "text-text-secondary font-bold text-xs uppercase tracking-wider"
                          }}
                        />

                        {/* Color selection circles */}
                        <div className="space-y-2">
                          <span className="text-xs font-bold text-text-secondary block">Select Custom Theme Color</span>
                          <div className="flex gap-2.5 flex-wrap">
                            {['#1E40AF', '#059669', '#DC2626', '#CA8A04', '#7C3AED', '#DB2777', '#0F172A'].map((col) => (
                              <button
                                key={col}
                                type="button"
                                onClick={() => setSelectedColor(col)}
                                className="w-8 h-8 rounded-full border border-white/20 shadow-sm relative cursor-pointer"
                                style={{ backgroundColor: col }}
                              >
                                {selectedColor === col && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-full">
                                    <Check className="w-4 h-4 text-white" />
                                  </div>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                          <Button
                            onPress={() => setStep(2)}
                            variant="bordered"
                            className="flex-1 h-11 rounded-xl font-bold text-text-primary border-border"
                          >
                            Back
                          </Button>
                          <Button
                            onPress={handleCreateCard}
                            className="flex-1 h-11 rounded-xl font-bold text-white bg-gradient-to-r from-amber-500 to-amber-600 shadow-md shadow-amber-500/20 cursor-pointer"
                          >
                            Issue Card
                          </Button>
                        </div>
                      </div>
                    )}

                  </Modal.Body>
                </>
              )}
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

    </div>
  );
}
