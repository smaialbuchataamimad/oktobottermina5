'use client';

import { useEffect, useRef, memo } from 'react';

interface TradingViewWidgetProps {
  symbol?: string;
  theme?: 'light' | 'dark';
  autosize?: boolean;
  interval?: string;
  timezone?: string;
  style?: string;
  locale?: string;
  toolbar_bg?: string;
  enable_publishing?: boolean;
  withdateranges?: boolean;
  hide_side_toolbar?: boolean;
  allow_symbol_change?: boolean;
  container_id?: string;
}

function TradingViewWidget({
  symbol = 'BINANCE:BTCUSDT',
  theme = 'dark',
  autosize = true,
  interval = 'D',
  timezone = 'Etc/UTC',
  style = '1',
  locale = 'en',
  toolbar_bg = '#0a0b0d',
  enable_publishing = false,
  withdateranges = true,
  hide_side_toolbar = false,
  allow_symbol_change = true,
  container_id = 'tradingview_widget',
}: TradingViewWidgetProps) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    // Clear any existing content
    container.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize,
      symbol,
      interval,
      timezone,
      theme,
      style,
      locale,
      toolbar_bg,
      enable_publishing,
      withdateranges,
      hide_side_toolbar,
      allow_symbol_change,
      calendar: false,
      support_host: 'https://www.tradingview.com',
    });

    container.current.appendChild(script);

    // Copy ref to local variable for cleanup
    const currentContainer = container.current;

    return () => {
      if (currentContainer) {
        currentContainer.innerHTML = '';
      }
    };
  }, [
    symbol,
    theme,
    autosize,
    interval,
    timezone,
    style,
    locale,
    toolbar_bg,
    enable_publishing,
    withdateranges,
    hide_side_toolbar,
    allow_symbol_change,
  ]);

  return (
    <div className="tradingview-widget-container" ref={container} style={{ height: '100%', width: '100%' }}>
      <div className="tradingview-widget-container__widget" style={{ height: 'calc(100% - 32px)', width: '100%' }} />
      <div className="tradingview-widget-copyright">
        <a href="https://www.tradingview.com/" rel="noopener nofollow noreferrer" target="_blank">
          <span className="blue-text">Track all markets on TradingView</span>
        </a>
      </div>
    </div>
  );
}

export default memo(TradingViewWidget);
