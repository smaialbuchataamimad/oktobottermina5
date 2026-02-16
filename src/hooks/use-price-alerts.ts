import { useState, useEffect, useCallback } from 'react';

export interface PriceAlert {
  id: string;
  tokenId: string;
  tokenSymbol: string;
  targetPrice: number;
  condition: 'above' | 'below';
  currentPrice: number;
  createdAt: number;
  triggered: boolean;
}

export function usePriceAlerts() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Load alerts from localStorage
    const stored = localStorage.getItem('priceAlerts');
    if (stored) {
      setAlerts(JSON.parse(stored));
    }

    // Check notification permission
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    // Save alerts to localStorage
    localStorage.setItem('priceAlerts', JSON.stringify(alerts));
  }, [alerts]);

  const requestNotificationPermission = useCallback(async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      return perm;
    }
    return 'denied';
  }, []);

  const addAlert = useCallback((alert: Omit<PriceAlert, 'id' | 'createdAt' | 'triggered'>) => {
    const newAlert: PriceAlert = {
      ...alert,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now(),
      triggered: false,
    };
    setAlerts(prev => [...prev, newAlert]);
    return newAlert.id;
  }, []);

  const removeAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);

  const checkAlerts = useCallback((tokenId: string, currentPrice: number) => {
    setAlerts(prev => {
      const updated = prev.map(alert => {
        if (alert.tokenId === tokenId && !alert.triggered) {
          const shouldTrigger =
            (alert.condition === 'above' && currentPrice >= alert.targetPrice) ||
            (alert.condition === 'below' && currentPrice <= alert.targetPrice);

          if (shouldTrigger) {
            // Send notification
            if (permission === 'granted') {
              new Notification(`Price Alert: ${alert.tokenSymbol}`, {
                body: `${alert.tokenSymbol} is now ${alert.condition} $${alert.targetPrice.toFixed(6)}.\nCurrent price: $${currentPrice.toFixed(6)}`,
                icon: '/favicon.ico',
                tag: alert.id,
              });
            }
            return { ...alert, triggered: true, currentPrice };
          }
        }
        return alert;
      });
      return updated;
    });
  }, [permission]);

  const getAlertsForToken = useCallback((tokenId: string) => {
    return alerts.filter(alert => alert.tokenId === tokenId && !alert.triggered);
  }, [alerts]);

  const getActiveAlerts = useCallback(() => {
    return alerts.filter(alert => !alert.triggered);
  }, [alerts]);

  return {
    alerts,
    permission,
    requestNotificationPermission,
    addAlert,
    removeAlert,
    checkAlerts,
    getAlertsForToken,
    getActiveAlerts,
  };
}
