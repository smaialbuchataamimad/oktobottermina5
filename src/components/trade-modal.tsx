'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, ArrowDownUp, TrendingUp, Clock, DollarSign } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { CryptoToken } from '@/lib/api';

interface TradeModalProps {
  token: CryptoToken | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TradeModal({ token, isOpen, onClose }: TradeModalProps) {
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [usdValue, setUsdValue] = useState('');

  if (!token) return null;

  const handleAmountChange = (value: string) => {
    setAmount(value);
    const usd = (Number.parseFloat(value) || 0) * token.current_price;
    setUsdValue(usd.toFixed(2));
  };

  const handleUsdChange = (value: string) => {
    setUsdValue(value);
    const tokens = (Number.parseFloat(value) || 0) / token.current_price;
    setAmount(tokens.toFixed(6));
  };

  const formatPrice = (price: number) => {
    if (price < 0.01) return `$${price.toFixed(6)}`;
    if (price < 1) return `$${price.toFixed(4)}`;
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-[#0a0b0d] border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-800">
              {token.image ? (
                <Image
                  src={token.image}
                  alt={token.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-bold">
                  {token.symbol.substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <div className="text-lg font-bold">{token.symbol.toUpperCase()}</div>
              <div className="text-sm text-gray-400 font-normal">{token.name}</div>
            </div>
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            Current Price: <span className="text-purple-400 font-semibold">{formatPrice(token.current_price)}</span>
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tradeType} onValueChange={(v) => setTradeType(v as 'buy' | 'sell')} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-900/50">
            <TabsTrigger value="buy" className="data-[state=active]:bg-green-600/20 data-[state=active]:text-green-400">
              Buy
            </TabsTrigger>
            <TabsTrigger value="sell" className="data-[state=active]:bg-red-600/20 data-[state=active]:text-red-400">
              Sell
            </TabsTrigger>
          </TabsList>

          <TabsContent value={tradeType} className="space-y-4 mt-4">
            {/* Amount Input */}
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Amount ({token.symbol.toUpperCase()})</label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="bg-gray-900/50 border-gray-800 text-white pr-16"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                  {token.symbol.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Swap Icon */}
            <div className="flex justify-center">
              <button className="p-2 rounded-full bg-gray-900 hover:bg-gray-800 border border-gray-800">
                <ArrowDownUp className="h-4 w-4 text-gray-400" />
              </button>
            </div>

            {/* USD Value Input */}
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Value (USD)</label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={usdValue}
                  onChange={(e) => handleUsdChange(e.target.value)}
                  className="bg-gray-900/50 border-gray-800 text-white pr-16"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                  USD
                </span>
              </div>
            </div>

            {/* Trade Info */}
            <div className="space-y-2 p-4 rounded-lg bg-gray-900/30 border border-gray-800">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Price per token</span>
                <span className="text-white">{formatPrice(token.current_price)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">24h Change</span>
                <span className={token.price_change_percentage_24h && token.price_change_percentage_24h > 0 ? 'text-green-400' : 'text-red-400'}>
                  {token.price_change_percentage_24h ? `${token.price_change_percentage_24h > 0 ? '+' : ''}${token.price_change_percentage_24h.toFixed(2)}%` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Network Fee</span>
                <span className="text-white">~$0.50</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 border-gray-800 text-gray-400 hover:bg-gray-900 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                className={`flex-1 ${
                  tradeType === 'buy'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
                disabled={!amount || Number.parseFloat(amount) <= 0}
              >
                {tradeType === 'buy' ? 'Buy' : 'Sell'} {token.symbol.toUpperCase()}
              </Button>
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-gray-500 text-center">
              This is a demo. No real trading functionality is implemented.
            </p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
