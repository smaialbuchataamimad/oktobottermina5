const COINGECKO_API = 'https://api.coingecko.com/api/v3';

export interface CryptoToken {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_1h_in_currency?: number;
  price_change_percentage_24h?: number;
  price_change_percentage_7d_in_currency?: number;
  total_volume: number;
  circulating_supply: number;
  high_24h: number;
  low_24h: number;
  ath: number;
  atl: number;
}

export interface TokenDetails extends CryptoToken {
  description?: {
    en: string;
  };
  links?: {
    homepage: string[];
    blockchain_site: string[];
    twitter_screen_name: string;
    telegram_channel_identifier: string;
  };
}

export interface ChartData {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

export async function getTrendingCoins(): Promise<CryptoToken[]> {
  try {
    const response = await fetch(
      `${COINGECKO_API}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=1h,24h,7d`,
      { next: { revalidate: 60 } }
    );
    if (!response.ok) throw new Error('Failed to fetch trending coins');
    return await response.json();
  } catch (error) {
    console.error('Error fetching trending coins:', error);
    return [];
  }
}

export async function getTopGainers(): Promise<CryptoToken[]> {
  try {
    const response = await fetch(
      `${COINGECKO_API}/coins/markets?vs_currency=usd&order=price_change_percentage_24h_desc&per_page=20&page=1&sparkline=false&price_change_percentage=1h,24h,7d`,
      { next: { revalidate: 60 } }
    );
    if (!response.ok) throw new Error('Failed to fetch top gainers');
    return await response.json();
  } catch (error) {
    console.error('Error fetching top gainers:', error);
    return [];
  }
}

export async function getTokenDetails(coinId: string): Promise<TokenDetails | null> {
  try {
    const response = await fetch(
      `${COINGECKO_API}/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`,
      { next: { revalidate: 60 } }
    );
    if (!response.ok) throw new Error('Failed to fetch token details');
    const data = await response.json();

    return {
      id: data.id,
      symbol: data.symbol,
      name: data.name,
      image: data.image?.large || data.image?.small,
      current_price: data.market_data?.current_price?.usd || 0,
      market_cap: data.market_data?.market_cap?.usd || 0,
      market_cap_rank: data.market_cap_rank || 0,
      price_change_percentage_1h_in_currency: data.market_data?.price_change_percentage_1h_in_currency?.usd,
      price_change_percentage_24h: data.market_data?.price_change_percentage_24h,
      price_change_percentage_7d_in_currency: data.market_data?.price_change_percentage_7d_in_currency?.usd,
      total_volume: data.market_data?.total_volume?.usd || 0,
      circulating_supply: data.market_data?.circulating_supply || 0,
      high_24h: data.market_data?.high_24h?.usd || 0,
      low_24h: data.market_data?.low_24h?.usd || 0,
      ath: data.market_data?.ath?.usd || 0,
      atl: data.market_data?.atl?.usd || 0,
      description: data.description,
      links: data.links,
    };
  } catch (error) {
    console.error('Error fetching token details:', error);
    return null;
  }
}

export async function getChartData(
  coinId: string,
  days: number = 7
): Promise<ChartData | null> {
  try {
    const response = await fetch(
      `${COINGECKO_API}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`,
      { next: { revalidate: 300 } }
    );
    if (!response.ok) throw new Error('Failed to fetch chart data');
    return await response.json();
  } catch (error) {
    console.error('Error fetching chart data:', error);
    return null;
  }
}

export interface SearchResult {
  id: string;
  name: string;
  symbol: string;
  market_cap_rank?: number;
  thumb?: string;
  large?: string;
}

export async function searchCoins(query: string): Promise<SearchResult[]> {
  try {
    const response = await fetch(
      `${COINGECKO_API}/search?query=${encodeURIComponent(query)}`,
      { next: { revalidate: 300 } }
    );
    if (!response.ok) throw new Error('Failed to search coins');
    const data = await response.json();
    return data.coins || [];
  } catch (error) {
    console.error('Error searching coins:', error);
    return [];
  }
}
