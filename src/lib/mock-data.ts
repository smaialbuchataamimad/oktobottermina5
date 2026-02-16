export interface Token {
  id: string;
  rank: number;
  symbol: string;
  name: string;
  icon: string;
  price: number;
  marketCap: number;
  age: string;
  change5m: number;
  change1h: number;
  change6h: number;
  change24h: number;
  liquidity: number;
  txCount: number;
  chain: string;
  pairAddress: string;
}

export interface Transaction {
  timestamp: string;
  type: 'VEND' | 'ACHAT';
  priceSOL: number;
  priceUSD: number;
  amountPENGU: number;
  valueUSD: number;
}

export interface Pool {
  pair: string;
  dex: string;
  price: number;
  liquidity: number;
  volume24h: number;
}

export const chains = [
  { id: 'solana', name: 'Solana', icon: '≋' },
  { id: 'bnb', name: 'BNB Chain', icon: '🔶' },
  { id: 'ethereum', name: 'Ethereum', icon: '♦' },
  { id: 'base', name: 'Base', icon: '🔵' },
  { id: 'sepolia', name: 'Sepolia Testnet', icon: '💧' },
  { id: 'arbitrum', name: 'Arbitrum', icon: '🔷' },
];

export const mockTokens: Token[] = [
  {
    id: '1',
    rank: 1,
    symbol: 'PENGU',
    name: 'Pudgy Penguins',
    icon: '/api/placeholder/40/40',
    price: 0.01098,
    marketCap: 690220000,
    age: '11 m.',
    change5m: -0.3,
    change1h: -0.9,
    change6h: -1.7,
    change24h: 0.2,
    liquidity: 3860000,
    txCount: 162,
    chain: 'SOL',
    pairAddress: 'PENGUxxx',
  },
  {
    id: '2',
    rank: 2,
    symbol: 'SINTESYS',
    name: 'SINTESYS',
    icon: '/api/placeholder/40/40',
    price: 0.000159,
    marketCap: 15380000,
    age: '3h',
    change5m: -22.3,
    change1h: -40.6,
    change6h: 166.4,
    change24h: 166.4,
    liquidity: 40780,
    txCount: 3658,
    chain: 'SOL',
    pairAddress: 'SINTxxx',
  },
  {
    id: '3',
    rank: 3,
    symbol: 'SAMUEL',
    name: 'Samuel the Ba...',
    icon: '/api/placeholder/40/40',
    price: 0.001676,
    marketCap: 16594000,
    age: '1j',
    change5m: 6.7,
    change1h: -19,
    change6h: -61.5,
    change24h: 228,
    liquidity: 52130,
    txCount: 9814,
    chain: 'SOL',
    pairAddress: 'SAMxxx',
  },
  {
    id: '4',
    rank: 4,
    symbol: 'LGNS',
    name: 'Longinus',
    icon: '/api/placeholder/40/40',
    price: 6.145,
    marketCap: 4310000,
    age: '1a',
    change5m: 0,
    change1h: 1.5,
    change6h: 4.6,
    change24h: -3.4,
    liquidity: 405760000,
    txCount: 77062,
    chain: 'DAI',
    pairAddress: 'LGNSxxx',
  },
  {
    id: '5',
    rank: 5,
    symbol: 'DINO',
    name: 'DINOSOL',
    icon: '/api/placeholder/40/40',
    price: 0.0007569,
    marketCap: 66863000,
    age: '8j',
    change5m: -3.9,
    change1h: 16.9,
    change6h: 16.9,
    change24h: 35.3,
    liquidity: 106330,
    txCount: 3159,
    chain: 'SOL',
    pairAddress: 'DINOxxx',
  },
  {
    id: '6',
    rank: 6,
    symbol: 'pippin',
    name: 'Pippin',
    icon: '/api/placeholder/40/40',
    price: 0.3429,
    marketCap: 34334000,
    age: '1a',
    change5m: -0.4,
    change1h: 0.2,
    change6h: -2.5,
    change24h: 8.6,
    liquidity: 12380000,
    txCount: 4314,
    chain: 'SOL',
    pairAddress: 'PIPxxx',
  },
];

export const mockTransactions: Transaction[] = Array.from({ length: 20 }, (_, i) => ({
  timestamp: `14 DÉC   09:16:${(i).toString().padStart(2, '0')} AM`,
  type: i % 3 === 0 ? 'VEND' : 'ACHAT',
  priceSOL: 0.06827 + Math.random() * 0.0001,
  priceUSD: 0.01103 + Math.random() * 0.00001,
  amountPENGU: Math.random() * 10000,
  valueUSD: Math.random() * 200,
}));

export const mockPools: Pool[] = [
  {
    pair: 'PENGU/USDC',
    dex: 'Raydium',
    price: 0.01098,
    liquidity: 964612.8,
    volume24h: 2310000,
  },
  {
    pair: 'PENGU/USDC',
    dex: 'PumpSwap',
    price: 0.01098,
    liquidity: 1300000,
    volume24h: 232608000,
  },
  {
    pair: 'PENGU/SOL',
    dex: 'PumpSwap',
    price: 0.01098,
    liquidity: 1600000,
    volume24h: 15000000,
  },
];

export function generateCandlestickData(days = 7) {
  const data = [];
  const now = Date.now();
  const basePrice = 0.01098;

  for (let i = days * 24 * 4; i >= 0; i--) {
    const time = now - i * 15 * 60 * 1000;
    const volatility = 0.0001;
    const open = basePrice + (Math.random() - 0.5) * volatility;
    const close = open + (Math.random() - 0.5) * volatility;
    const high = Math.max(open, close) + Math.random() * volatility;
    const low = Math.min(open, close) - Math.random() * volatility;
    const volume = Math.random() * 100000;

    data.push({
      time: Math.floor(time / 1000),
      open,
      high,
      low,
      close,
      volume,
    });
  }

  return data;
}

export const trendingTokens = [
  { name: 'Very Early Degens', change: '+402%', icon: '🔥' },
  { name: 'Rising Mid Caps', change: '+156%', icon: '📈' },
  { name: 'x402 Protocol', change: '+402%', icon: '⚡' },
  { name: 'MetaDAO Fundraisers', change: '+100%', icon: '💎' },
];
