'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpDown, Star, BarChart2, Loader2, ArrowUp, ArrowDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getTrendingCoins, type CryptoToken } from '@/lib/api';
import { useWatchlist } from '@/hooks/use-watchlist';
import { useToast } from '@/hooks/use-toast';
import { TradeModal } from '@/components/trade-modal';

type SortField = 'rank' | 'price' | 'market_cap' | '24h' | '7d' | 'volume';
type SortDirection = 'asc' | 'desc';

interface TokenListProps {
  searchQuery?: string;
  timeFilter?: string;
}

export function TokenList({ searchQuery = '', timeFilter = '24H' }: TokenListProps) {
  const [tokens, setTokens] = useState<CryptoToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedToken, setSelectedToken] = useState<CryptoToken | null>(null);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const { toggleWatchlist, isInWatchlist } = useWatchlist();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchTokens() {
      try {
        setLoading(true);
        const data = await getTrendingCoins();
        setTokens(data);
      } catch (err) {
        setError('Failed to fetch tokens');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchTokens();
    const interval = setInterval(fetchTokens, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Filter tokens based on search query
  const filteredTokens = tokens.filter((token) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      token.name.toLowerCase().includes(query) ||
      token.symbol.toLowerCase().includes(query)
    );
  });

  const sortedTokens = [...filteredTokens].sort((a, b) => {
    let aValue: number;
    let bValue: number;

    switch (sortField) {
      case 'rank':
        aValue = a.market_cap_rank || 9999;
        bValue = b.market_cap_rank || 9999;
        break;
      case 'price':
        aValue = a.current_price;
        bValue = b.current_price;
        break;
      case 'market_cap':
        aValue = a.market_cap;
        bValue = b.market_cap;
        break;
      case '24h':
        aValue = a.price_change_percentage_24h || 0;
        bValue = b.price_change_percentage_24h || 0;
        break;
      case '7d':
        aValue = a.price_change_percentage_7d_in_currency || 0;
        bValue = b.price_change_percentage_7d_in_currency || 0;
        break;
      case 'volume':
        aValue = a.total_volume;
        bValue = b.total_volume;
        break;
      default:
        return 0;
    }

    return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
  });

  const formatPrice = (price: number) => {
    if (price < 0.01) {
      return `$${price.toFixed(6)}`;
    }
    if (price < 1) {
      return `$${price.toFixed(4)}`;
    }
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatMarketCap = (cap: number) => {
    if (cap >= 1000000000) {
      return `$${(cap / 1000000000).toFixed(2)}B`;
    }
    if (cap >= 1000000) {
      return `$${(cap / 1000000).toFixed(2)}M`;
    }
    return `$${(cap / 1000).toFixed(2)}K`;
  };

  const PercentChange = ({ value }: { value?: number }) => {
    if (value === undefined || value === null) return <span className="text-gray-600">-</span>;

    const isPositive = value > 0;
    const isNeutral = value === 0;

    return (
      <span
        className={`font-medium tabular-nums ${
          isNeutral
            ? 'text-gray-500'
            : isPositive
            ? 'text-green-400'
            : 'text-red-400'
        }`}
      >
        {isPositive && '+'}{value.toFixed(1)}%
      </span>
    );
  };

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 hover:text-gray-300 transition-colors"
    >
      {children}
      {sortField === field ? (
        sortDirection === 'asc' ? (
          <ArrowUp className="h-3 w-3 text-purple-400" />
        ) : (
          <ArrowDown className="h-3 w-3 text-purple-400" />
        )
      ) : (
        <ArrowUpDown className="h-3 w-3 opacity-50" />
      )}
    </button>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto mb-3" />
          <p className="text-gray-400">Loading tokens...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-red-400 mb-2">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline" size="sm">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Search results info */}
      {searchQuery && (
        <div className="mb-4 px-4 py-3 bg-gray-900/50 border border-gray-800 rounded-lg">
          <p className="text-sm text-gray-400">
            Found <span className="text-white font-semibold">{sortedTokens.length}</span> result{sortedTokens.length !== 1 ? 's' : ''} for "<span className="text-purple-400">{searchQuery}</span>"
          </p>
        </div>
      )}

      {/* Table header - Hidden on mobile */}
      <div className="sticky top-0 bg-[#0a0b0d] border-b border-gray-800/50 z-20 hidden md:block">
        <div className="grid grid-cols-12 gap-4 px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <div className="col-span-1">
            <SortButton field="rank">Rank</SortButton>
          </div>
          <div className="col-span-2">Token</div>
          <div className="col-span-1">
            <SortButton field="price">Price</SortButton>
          </div>
          <div className="col-span-1 text-center">1h</div>
          <div className="col-span-1 text-center">
            <SortButton field="24h">24h</SortButton>
          </div>
          <div className="col-span-1 text-center">
            <SortButton field="7d">7d</SortButton>
          </div>
          <div className="col-span-2 text-right">
            <SortButton field="market_cap">Market Cap</SortButton>
          </div>
          <div className="col-span-2 text-right">
            <SortButton field="volume">Volume 24h</SortButton>
          </div>
          <div className="col-span-1 text-center">Actions</div>
        </div>
      </div>

      {/* Mobile sort controls */}
      <div className="md:hidden px-4 py-3 border-b border-gray-800/50 bg-[#0a0b0d] sticky top-0 z-20">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => handleSort('rank')}
            className={`px-3 py-1.5 text-xs rounded-lg whitespace-nowrap ${
              sortField === 'rank'
                ? 'bg-purple-600/20 text-purple-400 border border-purple-600/50'
                : 'bg-gray-900/50 text-gray-400 border border-gray-800'
            }`}
          >
            Rank {sortField === 'rank' && (sortDirection === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => handleSort('price')}
            className={`px-3 py-1.5 text-xs rounded-lg whitespace-nowrap ${
              sortField === 'price'
                ? 'bg-purple-600/20 text-purple-400 border border-purple-600/50'
                : 'bg-gray-900/50 text-gray-400 border border-gray-800'
            }`}
          >
            Price {sortField === 'price' && (sortDirection === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => handleSort('24h')}
            className={`px-3 py-1.5 text-xs rounded-lg whitespace-nowrap ${
              sortField === '24h'
                ? 'bg-purple-600/20 text-purple-400 border border-purple-600/50'
                : 'bg-gray-900/50 text-gray-400 border border-gray-800'
            }`}
          >
            24h {sortField === '24h' && (sortDirection === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => handleSort('market_cap')}
            className={`px-3 py-1.5 text-xs rounded-lg whitespace-nowrap ${
              sortField === 'market_cap'
                ? 'bg-purple-600/20 text-purple-400 border border-purple-600/50'
                : 'bg-gray-900/50 text-gray-400 border border-gray-800'
            }`}
          >
            Market Cap {sortField === 'market_cap' && (sortDirection === 'asc' ? '↑' : '↓')}
          </button>
        </div>
      </div>

      {/* Table body */}
      <div className="divide-y divide-gray-800/30">
        {sortedTokens.length === 0 && searchQuery ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <p className="text-gray-400 mb-2">No tokens found for "{searchQuery}"</p>
              <p className="text-sm text-gray-500">Try a different search term</p>
            </div>
          </div>
        ) : (
          sortedTokens.map((token) => (
            <Link
              key={token.id}
              href={`/token/${token.id}`}
              className="block md:grid md:grid-cols-12 gap-4 px-4 py-4 hover:bg-gray-900/40 transition-all group cursor-pointer"
            >
              {/* Mobile Card Layout */}
              <div className="md:hidden">
                <div className="flex items-start gap-3">
                  {/* Token Icon & Info */}
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-800 flex-shrink-0">
                    {token.image ? (
                      <Image
                        src={token.image}
                        alt={token.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm bg-gradient-to-br from-purple-500 to-blue-500">
                        {token.symbol.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Main Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{token.symbol.toUpperCase()}</span>
                          <Badge variant="outline" className="bg-gray-800/50 text-gray-500 border-gray-700 text-xs px-1.5 py-0">
                            #{token.market_cap_rank}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-500">{token.name}</div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 p-0 hover:bg-gray-800 ${isInWatchlist(token.id) ? 'text-yellow-400' : 'hover:text-yellow-400'}`}
                        onClick={(e: React.MouseEvent) => {
                          e.preventDefault();
                          const wasInWatchlist = isInWatchlist(token.id);
                          toggleWatchlist(token.id);
                          toast({
                            title: wasInWatchlist ? 'Removed from watchlist' : 'Added to watchlist',
                            description: wasInWatchlist ? `${token.symbol.toUpperCase()} removed` : `${token.symbol.toUpperCase()} added to your watchlist`,
                          });
                        }}
                      >
                        <Star className={`h-4 w-4 ${isInWatchlist(token.id) ? 'fill-current' : ''}`} />
                      </Button>
                    </div>

                    {/* Price & Change */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-semibold">{formatPrice(token.current_price)}</span>
                      <PercentChange value={token.price_change_percentage_24h} />
                    </div>

                    {/* Market Cap & Volume */}
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="text-gray-500">MCap: </span>
                        <span className="text-gray-300">{formatMarketCap(token.market_cap)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Vol: </span>
                        <span className="text-gray-400">{formatMarketCap(token.total_volume)}</span>
                      </div>
                    </div>

                    {/* Trade Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-3 bg-purple-600/20 border-purple-500/50 text-purple-400 hover:bg-purple-600/30"
                      onClick={(e: React.MouseEvent) => {
                        e.preventDefault();
                        setSelectedToken(token);
                        setIsTradeModalOpen(true);
                      }}
                    >
                      Trade
                    </Button>
                  </div>
                </div>
              </div>

              {/* Desktop Table Layout */}
              <div className="hidden md:contents">
                {/* Rank & Icons */}
                <div className="col-span-1 flex items-center gap-2">
                  <span className="text-sm text-gray-500 font-medium w-8">{token.market_cap_rank || '-'}</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-6 w-6 p-0 hover:bg-gray-800 ${isInWatchlist(token.id) ? 'text-yellow-400' : 'hover:text-yellow-400'}`}
                      onClick={(e: React.MouseEvent) => {
                        e.preventDefault();
                        const wasInWatchlist = isInWatchlist(token.id);
                        toggleWatchlist(token.id);
                        toast({
                          title: wasInWatchlist ? 'Removed from watchlist' : 'Added to watchlist',
                          description: wasInWatchlist ? `${token.symbol.toUpperCase()} removed` : `${token.symbol.toUpperCase()} added to your watchlist`,
                        });
                      }}
                    >
                      <Star className={`h-3 w-3 ${isInWatchlist(token.id) ? 'fill-current' : ''}`} />
                    </Button>
                  </div>
                </div>

                {/* Token info */}
                <div className="col-span-2 flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-800 flex-shrink-0">
                    {token.image ? (
                      <Image
                        src={token.image}
                        alt={token.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm bg-gradient-to-br from-purple-500 to-blue-500">
                        {token.symbol.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white truncate">{token.symbol.toUpperCase()}</span>
                      <Badge variant="outline" className="bg-gray-800/50 text-gray-500 border-gray-700 text-xs px-1.5 py-0">
                        #{token.market_cap_rank}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500 truncate">{token.name}</div>
                  </div>
                </div>

                {/* Price */}
                <div className="col-span-1 flex flex-col justify-center">
                  <span className="text-white font-semibold">{formatPrice(token.current_price)}</span>
                </div>

                {/* 1h change */}
                <div className="col-span-1 flex items-center justify-center">
                  <PercentChange value={token.price_change_percentage_1h_in_currency} />
                </div>

                {/* 24h change */}
                <div className="col-span-1 flex items-center justify-center">
                  <PercentChange value={token.price_change_percentage_24h} />
                </div>

                {/* 7d change */}
                <div className="col-span-1 flex items-center justify-center">
                  <PercentChange value={token.price_change_percentage_7d_in_currency} />
                </div>

                {/* Market Cap */}
                <div className="col-span-2 flex items-center justify-end">
                  <span className="text-sm text-gray-300 font-medium">{formatMarketCap(token.market_cap)}</span>
                </div>

                {/* Volume */}
                <div className="col-span-2 flex items-center justify-end">
                  <span className="text-sm text-gray-400">{formatMarketCap(token.total_volume)}</span>
                </div>

                {/* Actions */}
                <div className="col-span-1 flex items-center justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-3 text-xs opacity-0 group-hover:opacity-100 transition-opacity bg-purple-600/20 border-purple-500/50 text-purple-400 hover:bg-purple-600/30"
                    onClick={(e: React.MouseEvent) => {
                      e.preventDefault();
                      setSelectedToken(token);
                      setIsTradeModalOpen(true);
                    }}
                  >
                    Trade
                  </Button>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Trade Modal */}
      <TradeModal
        token={selectedToken}
        isOpen={isTradeModalOpen}
        onClose={() => {
          setIsTradeModalOpen(false);
          setSelectedToken(null);
        }}
      />
    </div>
  );
}
