import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type CurrencyCode = 'IDR' | 'MYR';

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  formatPrice: (price: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<CurrencyCode>('IDR');

  // Exchange rates (Base: USD)
  // 1 USD = 16,000 IDR
  // 1 USD = 4.7 MYR
  const exchangeRates = {
    IDR: 16000,
    MYR: 4.7,
  };

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

  const formatPrice = (price: number): string => {
    // Assuming 'price' input is in USD
    const rate = exchangeRates[currency];
    const convertedPrice = price * rate;

    if (currency === 'IDR') {
      // Format IDR: Rp 8.000.000
      return `Rp ${convertedPrice.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
    } else {
      // Format MYR: RM 2,500
      return `RM ${convertedPrice.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
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
