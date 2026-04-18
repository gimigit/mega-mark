import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Currency = 'EUR' | 'RON';

interface CurrencyState {
  currency: Currency;
  rate: number;
  toggle: () => void;
  setCurrency: (currency: Currency) => void;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set) => ({
      currency: 'EUR',
      rate: 5.0,
      toggle: () => set((state) => ({
        currency: state.currency === 'EUR' ? 'RON' : 'EUR'
      })),
      setCurrency: (currency) => set({ currency }),
    }),
    {
      name: 'currency-preference',
    }
  )
);

// Helper to format price correctly
export const formatPrice = (price: number, listingCurrency?: 'EUR' | 'RON'): string => {
  const store = useCurrencyStore.getState();
  const targetCurrency = store.currency;

  // If listing has its own currency, convert if needed
  let displayPrice = price;
  if (listingCurrency && listingCurrency !== targetCurrency) {
    displayPrice = targetCurrency === 'RON'
      ? price * store.rate
      : price / store.rate;
  }

  if (targetCurrency === 'RON') {
    return `${Math.round(displayPrice).toLocaleString('ro-RO')} RON`;
  } else {
    return `€ ${displayPrice.toLocaleString('de-DE')}`;
  }
};
