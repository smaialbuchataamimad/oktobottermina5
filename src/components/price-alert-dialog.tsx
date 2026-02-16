'use client';

import { useState } from 'react';
import { Bell, X, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { usePriceAlerts } from '@/hooks/use-price-alerts';
import { useToast } from '@/hooks/use-toast';

interface PriceAlertDialogProps {
  open: boolean;
  onClose: () => void;
  tokenId: string;
  tokenSymbol: string;
  currentPrice: number;
}

export function PriceAlertDialog({
  open,
  onClose,
  tokenId,
  tokenSymbol,
  currentPrice,
}: PriceAlertDialogProps) {
  const [targetPrice, setTargetPrice] = useState('');
  const [condition, setCondition] = useState<'above' | 'below'>('above');
  const { addAlert, permission, requestNotificationPermission, getAlertsForToken } = usePriceAlerts();
  const { toast } = useToast();
  const activeAlerts = getAlertsForToken(tokenId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const price = Number.parseFloat(targetPrice);
    if (Number.isNaN(price) || price <= 0) {
      toast({
        title: 'Invalid price',
        description: 'Please enter a valid price',
        variant: 'destructive',
      });
      return;
    }

    // Request notification permission if not granted
    if (permission !== 'granted') {
      const perm = await requestNotificationPermission();
      if (perm !== 'granted') {
        toast({
          title: 'Notifications blocked',
          description: 'Please enable notifications to receive price alerts',
          variant: 'destructive',
        });
        return;
      }
    }

    addAlert({
      tokenId,
      tokenSymbol,
      targetPrice: price,
      condition,
      currentPrice,
    });

    toast({
      title: 'Alert created',
      description: `You'll be notified when ${tokenSymbol} goes ${condition} $${price.toFixed(6)}`,
    });

    setTargetPrice('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-purple-400" />
            Set Price Alert for {tokenSymbol}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Get notified when the price reaches your target
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">
              Current Price
            </label>
            <div className="text-2xl font-bold text-white">
              ${currentPrice.toFixed(6)}
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">
              Alert Condition
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCondition('above')}
                className={`${
                  condition === 'above'
                    ? 'bg-green-600/20 border-green-500 text-green-400'
                    : 'bg-gray-800 border-gray-700 text-gray-400'
                }`}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Above
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCondition('below')}
                className={`${
                  condition === 'below'
                    ? 'bg-red-600/20 border-red-500 text-red-400'
                    : 'bg-gray-800 border-gray-700 text-gray-400'
                }`}
              >
                <TrendingDown className="h-4 w-4 mr-2" />
                Below
              </Button>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">
              Target Price (USD)
            </label>
            <Input
              type="number"
              step="0.000001"
              placeholder="0.000000"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white"
              required
            />
          </div>

          {activeAlerts.length > 0 && (
            <div className="border-t border-gray-800 pt-4">
              <div className="text-sm text-gray-400 mb-2">Active Alerts</div>
              <div className="space-y-2">
                {activeAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-center justify-between p-2 bg-gray-800/50 rounded"
                  >
                    <div className="flex items-center gap-2 text-sm">
                      {alert.condition === 'above' ? (
                        <TrendingUp className="h-3 w-3 text-green-400" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-400" />
                      )}
                      <span className="text-white">
                        ${alert.targetPrice.toFixed(6)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-gray-800 border-gray-700 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              Create Alert
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
