"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Asset, MarketData, PortfolioItem, PriceAlert } from '@/lib/types';
import { MOCK_MARKET_DATA, MOCK_PORTFOLIO, MOCK_ALERTS } from '@/lib/mock-data';
import { USD_IDR_RATE } from '@/lib/utils';

interface StoreState {
  currency: 'USD' | 'IDR';
  setCurrency: (c: 'USD' | 'IDR') => void;
  marketData: MarketData;
  portfolio: PortfolioItem[];
  alerts: PriceAlert[];
  addAlert: (alert: PriceAlert) => void;
  removeAlert: (id: string) => void;
  refreshPrices: () => Promise<void>;
}

const StoreContext = createContext<StoreState | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<'USD' | 'IDR'>('IDR');
  const [marketData, setMarketData] = useState<MarketData>(MOCK_MARKET_DATA);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(MOCK_PORTFOLIO);
  const [alerts, setAlerts] = useState<PriceAlert[]>(MOCK_ALERTS);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMarketData(prev => {
        const fluctuate = (assets: Asset[]) => assets.map(a => {
          const change = (Math.random() - 0.5) * 0.002; // 0.2% fluctuation
          const newPriceUSD = a.priceUSD * (1 + change);
          return {
            ...a,
            priceUSD: newPriceUSD,
            priceIDR: newPriceUSD * USD_IDR_RATE,
            lastUpdated: new Date().toISOString()
          };
        });

        return {
          crypto: fluctuate(prev.crypto),
          stocksUS: fluctuate(prev.stocksUS),
          stocksID: fluctuate(prev.stocksID),
          commodities: fluctuate(prev.commodities),
        };
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const refreshPrices = async () => {
    // Placeholder logic
  };

  const addAlert = (alert: PriceAlert) => setAlerts(prev => [...prev, alert]);
  const removeAlert = (id: string) => setAlerts(prev => prev.filter(a => a.id !== id));

  return (
    <StoreContext.Provider value={{ currency, setCurrency, marketData, portfolio, alerts, addAlert, removeAlert, refreshPrices }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
