import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type CurrencyCode = 'IDR' | 'MYR';

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  formatPrice: (price: number | string, sourceCurrency?: CurrencyCode | string) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<CurrencyCode>('IDR');

  // Exchange rates (1 MYR = 4.184 IDR)
  const MYR_TO_IDR_RATE = 4184;

  useEffect(() => {
    loadCurrency();
  }, []);

  const loadCurrency = async () => {
    try {
      const storedCurrency = await AsyncStorage.getItem('@app_currency');
      if (storedCurrency === 'IDR' || storedCurrency === 'MYR') {
        setCurrencyState(storedCurrency);
      }
    } catch (error) {
      console.error('Failed to load currency', error);
    }
  };

  const setCurrency = async (newCurrency: CurrencyCode) => {
    try {
      setCurrencyState(newCurrency);
      await AsyncStorage.setItem('@app_currency', newCurrency);
    } catch (error) {
      console.error('Failed to save currency', error);
    }
  };

  const formatPrice = (priceInput: number | string, sourceCurrency?: CurrencyCode | string): string => {
    // Convert to number if string
    const price = typeof priceInput === 'string' ? parseFloat(priceInput) : priceInput;

    // Safety check: handle undefined, null, or NaN
    if (price === undefined || price === null || isNaN(price)) {
      return currency === 'IDR' ? 'Rp 0.00' : 'RM 0.00';
    }

    // Determine the source currency (property's original currency)
    const source = (sourceCurrency as CurrencyCode) || 'IDR'; // Default to IDR if not specified

    let finalPrice = price;

    // Convert if source and target currencies are different
    if (source !== currency) {
      if (source === 'IDR' && currency === 'MYR') {
        // IDR → MYR: divide by rate
        finalPrice = price / MYR_TO_IDR_RATE;
      } else if (source === 'MYR' && currency === 'IDR') {
        // MYR → IDR: multiply by rate
        finalPrice = price * MYR_TO_IDR_RATE;
      }
    }

    // Format based on target currency
    if (currency === 'IDR') {
      return `Rp ${finalPrice.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
    } else {
      return `RM ${finalPrice.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
