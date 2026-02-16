'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { TrendingUp, BarChart3, Loader2 } from 'lucide-react';

interface TradingChartProps {
  tokenSymbol: string;
  tokenImage?: string;
}

// Map common crypto symbols to TradingView format
const symbolMap: Record<string, string> = {
  BTC: 'BINANCE:BTCUSDT',
  ETH: 'BINANCE:ETHUSDT',
  USDT: 'BINANCE:USDTUSD',
  BNB: 'BINANCE:BNBUSDT',
  XRP: 'BINANCE:XRPUSDT',
  SOL: 'BINANCE:SOLUSDT',
  USDC: 'BINANCE:USDCUSDT',
  ADA: 'BINANCE:ADAUSDT',
  DOGE: 'BINANCE:DOGEUSDT',
  TRX: 'BINANCE:TRXUSDT',
  DOT: 'BINANCE:DOTUSDT',
  MATIC: 'BINANCE:MATICUSDT',
  SHIB: 'BINANCE:SHIBUSDT',
  AVAX: 'BINANCE:AVAXUSDT',
  LINK: 'BINANCE:LINKUSDT',
  UNI: 'BINANCE:UNIUSDT',
  ATOM: 'BINANCE:ATOMUSDT',
  LTC: 'BINANCE:LTCUSDT',
  BCH: 'BINANCE:BCHUSDT',
  XLM: 'BINANCE:XLMUSDT',
  PENGU: 'BINANCE:BTCUSDT',
};

// Map timeframes to TradingView intervals
const intervalMap: Record<string, string> = {
  '1m': '1',
  '5m': '5',
  '15m': '15',
  '1h': '60',
  '4h': '240',
  '1D': 'D',
  '1W': 'W',
};

export function TradingChart({ tokenSymbol, tokenImage }: TradingChartProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState('15m');
  const [chartType, setChartType] = useState<'tradingview' | 'simple'>('tradingview');
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const timeframes = ['1m', '5m', '15m', '1h', '4h', '1D', '1W'];

  // Get TradingView symbol
  const tradingViewSymbol = symbolMap[tokenSymbol.toUpperCase()] || `BINANCE:${tokenSymbol.toUpperCase()}USDT`;
  const tradingViewInterval = intervalMap[selectedTimeframe] || '15';

  // Load TradingView widget
  useEffect(() => {
    if (chartType !== 'tradingview' || !containerRef.current) return;

    setIsLoading(true);

    // Clear existing content
    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: tradingViewSymbol,
      interval: tradingViewInterval,
      timezone: 'Etc/UTC',
      theme: 'dark',
      style: '1',
      locale: 'en',
      toolbar_bg: '#0a0b0d',
      enable_publishing: false,
      withdateranges: true,
      hide_side_toolbar: false,
      allow_symbol_change: true,
      calendar: false,
      hide_volume: false,
      support_host: 'https://www.tradingview.com',
    });

    script.onload = () => {
      setIsLoading(false);
    };

    const wrapper = document.createElement('div');
    wrapper.className = 'tradingview-widget-container';
    wrapper.style.height = '100%';
    wrapper.style.width = '100%';

    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';
    widgetDiv.style.height = '100%';
    widgetDiv.style.width = '100%';

    wrapper.appendChild(widgetDiv);
    wrapper.appendChild(script);
    containerRef.current.appendChild(wrapper);

    // Set loading to false after a timeout (in case onload doesn't fire)
    const timeout = setTimeout(() => setIsLoading(false), 3000);

    // Copy ref to local variable for cleanup
    const currentContainer = containerRef.current;

    return () => {
      clearTimeout(timeout);
      if (currentContainer) {
        currentContainer.innerHTML = '';
      }
    };
  }, [chartType, tradingViewSymbol, tradingViewInterval]);

  return (
    <div className="w-full">
      {/* Chart Controls */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        {/* Timeframe Buttons */}
        <div className="flex items-center gap-1 flex-wrap">
          {timeframes.map((timeframe) => (
            <button
              key={timeframe}
              onClick={() => setSelectedTimeframe(timeframe)}
              className={`px-3 py-1.5 text-xs rounded font-medium transition-all ${
                timeframe === selectedTimeframe
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {timeframe}
            </button>
          ))}
        </div>

        {/* Chart Type Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-gray-800/50 rounded-lg p-1">
            <button
              onClick={() => setChartType('tradingview')}
              className={`px-3 py-1.5 text-xs rounded-md transition-all flex items-center gap-1.5 font-medium ${
                chartType === 'tradingview'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <TrendingUp className="h-3.5 w-3.5" />
              TradingView
            </button>
            <button
              onClick={() => setChartType('simple')}
              className={`px-3 py-1.5 text-xs rounded-md transition-all flex items-center gap-1.5 font-medium ${
                chartType === 'simple'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              Simple
            </button>
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="rounded-lg overflow-hidden border border-gray-800 bg-[#131722]">
        {chartType === 'tradingview' ? (
          <div className="relative" style={{ height: '500px' }}>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#131722] z-10">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Loading TradingView Chart...</p>
                </div>
              </div>
            )}
            <div ref={containerRef} style={{ height: '100%', width: '100%' }} />
          </div>
        ) : (
          <div className="p-4" style={{ height: '500px' }}>
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">Simple chart view</p>
                <p className="text-gray-500 text-sm">Switch to TradingView for advanced features</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chart Footer */}
      <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <span className="text-purple-400">{tradingViewSymbol}</span>
          <span>|</span>
          <span>{selectedTimeframe}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Powered by TradingView</span>
        </div>
      </div>
    </div>
  );
}
