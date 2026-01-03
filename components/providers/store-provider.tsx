"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { MarketData, PortfolioItem, PriceAlert } from '@/lib/types';
import { MOCK_MARKET_DATA, MOCK_PORTFOLIO, MOCK_ALERTS } from '@/lib/mock-data';
import { useBinanceWebSocket } from '@/lib/hooks/use-binance-websocket';

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

const BINANCE_SYMBOL_MAP: Record<string, string> = {
  'bitcoin': 'btcusdt',
  'ethereum': 'ethusdt',
  'solana': 'solusdt',
  'binancecoin': 'bnbusdt',
  'dogecoin': 'dogeusdt'
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<'USD' | 'IDR'>('IDR');
  const [marketData, setMarketData] = useState<MarketData>(MOCK_MARKET_DATA);
  const [portfolio] = useState<PortfolioItem[]>(MOCK_PORTFOLIO);
  const [alerts, setAlerts] = useState<PriceAlert[]>(MOCK_ALERTS);

  // Fetch initial data via REST API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/market-data');
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();

        if (data.crypto && data.crypto.length > 0) {
          setMarketData(prev => ({
            ...prev,
            crypto: data.crypto,
            stocksUS: data.stocksUS,
            stocksID: data.stocksID,
            commodities: data.commodities
          }));
        }
      } catch (err) {
        console.error("Market data sync error:", err);
      }
    };

    fetchData(); // Initial load
    const interval = setInterval(fetchData, 61000); // Backup polling for stocks/commodities

    return () => clearInterval(interval);
  }, []);

  // Real-time WebSocket updates for crypto prices
  const handlePriceUpdate = useCallback((symbol: string, price: number) => {
    setMarketData(prev => {
      const updatedCrypto = prev.crypto.map(coin => {
        const binanceSymbol = BINANCE_SYMBOL_MAP[coin.id];
        if (binanceSymbol === symbol) {
          return {
            ...coin,
            priceUSD: price,
            priceIDR: price * 16350, // Simple conversion
            lastUpdated: new Date().toISOString()
          };
        }
        return coin;
      });

      return { ...prev, crypto: updatedCrypto };
    });
  }, []);

  const { isConnected } = useBinanceWebSocket({
    symbols: Object.values(BINANCE_SYMBOL_MAP),
    onPriceUpdate: handlePriceUpdate,
    enabled: true
  });

  useEffect(() => {
    if (isConnected) {
      console.log('[Store] 🟢 Live WebSocket connected!');
    }
  }, [isConnected]);

  const refreshPrices = async () => {
    // Manual refresh logic if needed
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
