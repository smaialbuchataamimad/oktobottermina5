import { useEffect, useState, useCallback, useRef } from 'react';

export interface PriceUpdate {
  tokenId: string;
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  timestamp: number;
}

export function useWebSocket() {
  const [connected, setConnected] = useState(false);
  const [priceUpdates, setPriceUpdates] = useState<Map<string, PriceUpdate>>(new Map());
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const subscribedTokensRef = useRef<Set<string>>(new Set());

  const connect = useCallback(() => {
    // Note: This is a mock WebSocket connection
    // In production, replace with actual WebSocket URL (e.g., wss://api.coingecko.com/api/v3/...)
    // For now, we'll simulate updates using setInterval

    setConnected(true);

    // Simulate real-time price updates
    const interval = setInterval(() => {
      subscribedTokensRef.current.forEach((tokenId) => {
        setPriceUpdates(prev => {
          const current = prev.get(tokenId);
          const newMap = new Map(prev);

          // Simulate price fluctuation (±0.5%)
          const priceChange = (Math.random() - 0.5) * 0.01;
          const currentPrice = current?.price || 1.0;
          const newPrice = currentPrice * (1 + priceChange);

          newMap.set(tokenId, {
            tokenId,
            symbol: current?.symbol || 'UNKNOWN',
            price: newPrice,
            change24h: (current?.change24h || 0) + priceChange * 100,
            volume24h: current?.volume24h || 1000000,
            timestamp: Date.now(),
          });

          return newMap;
        });
      });
    }, 3000); // Update every 3 seconds

    return () => {
      clearInterval(interval);
      setConnected(false);
    };
  }, []);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    setConnected(false);
  }, []);

  const subscribe = useCallback((tokenId: string, symbol: string, initialPrice: number) => {
    subscribedTokensRef.current.add(tokenId);

    // Initialize with current price
    setPriceUpdates(prev => {
      const newMap = new Map(prev);
      if (!newMap.has(tokenId)) {
        newMap.set(tokenId, {
          tokenId,
          symbol,
          price: initialPrice,
          change24h: 0,
          volume24h: 0,
          timestamp: Date.now(),
        });
      }
      return newMap;
    });
  }, []);

  const unsubscribe = useCallback((tokenId: string) => {
    subscribedTokensRef.current.delete(tokenId);
    setPriceUpdates(prev => {
      const newMap = new Map(prev);
      newMap.delete(tokenId);
      return newMap;
    });
  }, []);

  const getPriceUpdate = useCallback((tokenId: string): PriceUpdate | undefined => {
    return priceUpdates.get(tokenId);
  }, [priceUpdates]);

  useEffect(() => {
    const cleanup = connect();

    return () => {
      cleanup();
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    connected,
    subscribe,
    unsubscribe,
    getPriceUpdate,
    priceUpdates,
  };
}
