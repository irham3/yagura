"use client"

import { useEffect, useRef, useState } from 'react';
interface UseBinanceWebSocketProps {
  symbols: string[]; // e.g., ['btcusdt', 'ethusdt']
  onPriceUpdate: (symbol: string, price: number) => void;
  enabled?: boolean;
}

export function useBinanceWebSocket({ symbols, onPriceUpdate, enabled = true }: UseBinanceWebSocketProps) {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled || symbols.length === 0) return;

    const connect = () => {
      try {
        // Binance WebSocket endpoint for multiple tickers
        const streams = symbols.map(s => `${s.toLowerCase()}@ticker`).join('/');
        const wsUrl = `wss://stream.binance.com:9443/stream?streams=${streams}`;
        
        console.log('[Binance WS] Connecting to:', symbols.length, 'streams');
        
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('[Binance WS] ✅ Connected! Streaming real-time prices');
          setIsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            
            if (message.data) {
              const ticker = message.data;
              // ticker.s = symbol (e.g., "BTCUSDT")
              // ticker.c = current price
              if (ticker.s && ticker.c) {
                const symbol = ticker.s.toLowerCase();
                const price = parseFloat(ticker.c);
                onPriceUpdate(symbol, price);
              }
            }
          } catch (error: unknown) {
            console.error('[Binance WS] Parse error:', error);
          }
        };

        ws.onerror = () => {
          // WebSocket errors are often empty objects in browser
          console.warn('[Binance WS] Connection issue (this is normal on first load)');
        };

        ws.onclose = (event) => {
          console.log('[Binance WS] Disconnected. Code:', event.code, 'Reason:', event.reason || 'Normal closure');
          wsRef.current = null;
          setIsConnected(false);
          
          // Only auto-reconnect if not a normal closure
          if (event.code !== 1000 && enabled) {
            console.log('[Binance WS] Reconnecting in 3s...');
            reconnectTimeoutRef.current = setTimeout(() => {
              connect();
            }, 3000);
          }
        };
      } catch (error: unknown) {
        console.error('[Binance WS] Setup error:', error);
      }
    };

    connect();

    // Cleanup on unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        console.log('[Binance WS] Closing connection...');
        wsRef.current.close(1000, 'Component unmounted');
        wsRef.current = null;
      }
    };
  }, [symbols, enabled, onPriceUpdate]);

  return {
    isConnected
  };
}
