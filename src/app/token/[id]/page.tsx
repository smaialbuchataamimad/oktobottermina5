'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Share2, Star, Twitter, MessageCircle, Send, ExternalLink, ChevronDown, Heart, User, Droplets, Copy, CircleDot, Search, Info, Bell, Loader2 } from 'lucide-react';
import { Sidebar } from '@/components/sidebar';
import { TopNav } from '@/components/top-nav';
import { TradingChart } from '@/components/trading-chart';
import { Bubblemaps } from '@/components/bubblemaps';
import { PriceAlertDialog } from '@/components/price-alert-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockTransactions, mockPools } from '@/lib/mock-data';
import { getTokenDetails, type TokenDetails } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useWatchlist } from '@/hooks/use-watchlist';
import { useWebSocket } from '@/hooks/use-websocket';
import { usePriceAlerts } from '@/hooks/use-price-alerts';

export default function TokenPage() {
  const params = useParams();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showBubblemaps, setShowBubblemaps] = useState(false);
  const [showPriceAlert, setShowPriceAlert] = useState(false);
  const [token, setToken] = useState<TokenDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { toggleWatchlist, isInWatchlist } = useWatchlist();
  const { subscribe, unsubscribe, getPriceUpdate } = useWebSocket();
  const { checkAlerts, getAlertsForToken } = usePriceAlerts();

  // Fetch token data from API
  useEffect(() => {
    async function fetchToken() {
      setLoading(true);
      const tokenId = params.id as string;
      const data = await getTokenDetails(tokenId);
      if (data) {
        setToken(data);
      }
      setLoading(false);
    }
    fetchToken();
  }, [params.id]);

  // Get real-time price update
  const priceUpdate = token ? getPriceUpdate(token.id) : undefined;
  const currentPrice = priceUpdate?.price || token?.current_price || 0;
  const activeAlerts = token ? getAlertsForToken(token.id) : [];

  // Subscribe to real-time updates and check alerts
  useEffect(() => {
    if (token) {
      subscribe(token.id, token.symbol, token.current_price);
      return () => {
        unsubscribe(token.id);
      };
    }
  }, [token, subscribe, unsubscribe]);

  // Check price alerts when price updates
  useEffect(() => {
    if (priceUpdate && token) {
      checkAlerts(token.id, priceUpdate.price);
    }
  }, [priceUpdate, token, checkAlerts]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} address copied to clipboard`,
    });
  };

  const formatPrice = (price: number) => {
    if (price < 0.01) return `${price.toFixed(6)}`;
    if (price < 1) return `${price.toFixed(4)}`;
    return `${price.toFixed(2)}`;
  };

  const formatMarketCap = (cap: number) => {
    if (cap >= 1000000000) return `${(cap / 1000000000).toFixed(2)}B`;
    if (cap >= 1000000) return `${(cap / 1000000).toFixed(2)}M`;
    if (cap >= 1000) return `${(cap / 1000).toFixed(2)}K`;
    return `${cap.toFixed(2)}`;
  };

  const PercentChange = ({ value, period }: { value?: number; period: string }) => {
    if (value === undefined) return <div className="flex flex-col items-center"><span className="text-xs text-gray-500 mb-1">{period}</span><span className="text-gray-600">-</span></div>;
    const isPositive = value > 0;

    return (
      <div className="flex flex-col items-center">
        <span className="text-xs text-gray-500 mb-1">{period}</span>
        <span className={`text-sm font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive && '+'}{value.toFixed(2)}%
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0b0d] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-purple-500 mx-auto mb-3" />
          <p className="text-gray-400">Loading token data...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-[#0a0b0d] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Token not found</p>
          <Button onClick={() => router.push('/')} variant="outline">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0b0d]">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="lg:pl-64">
        <TopNav onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <main className="p-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
            <button onClick={() => router.push('/')} className="hover:text-white flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <span>&gt;</span>
            <span className="text-white">{token.name}</span>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="xl:col-span-2 space-y-6">
              {/* Token Header */}
              <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg p-6 border border-gray-800">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    {/* Token Logo */}
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-800 flex-shrink-0">
                      {token.image ? (
                        <Image
                          src={token.image}
                          alt={token.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-blue-500">
                          <span className="text-white text-3xl font-bold">
                            {token.symbol.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-2xl font-bold text-white">{token.symbol.toUpperCase()}</h1>
                        <Badge variant="outline" className="bg-gray-800/50 text-gray-400">
                          #{token.market_cap_rank}
                        </Badge>
                        {priceUpdate && (
                          <Badge variant="outline" className="bg-green-600/20 text-green-400 border-green-600/50 text-xs animate-pulse">
                            LIVE
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-400">{token.name}</p>
                    </div>
                  </div>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    Trade
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-baseline gap-2 mb-2 flex-wrap">
                      <span className="text-3xl font-bold text-white">
                        {formatPrice(currentPrice)}
                      </span>
                      <span className={`text-sm font-semibold ${(token.price_change_percentage_24h || 0) > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {(token.price_change_percentage_24h || 0) > 0 && '+'}{(token.price_change_percentage_24h || 0).toFixed(2)}%
                      </span>
                    </div>
                    <div className="text-sm text-gray-400">
                      Market Cap: {formatMarketCap(token.market_cap)}
                    </div>
                    <div className="text-sm text-gray-400">
                      24h Volume: {formatMarketCap(token.total_volume)}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 justify-start md:justify-end">
                    <PercentChange value={token.price_change_percentage_1h_in_currency} period="1H" />
                    <PercentChange value={token.price_change_percentage_24h} period="24H" />
                    <PercentChange value={token.price_change_percentage_7d_in_currency} period="7D" />
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    className={`bg-gray-800/50 border-gray-700 ${isInWatchlist(token.id) ? 'text-yellow-400' : ''}`}
                    onClick={() => {
                      const wasInWatchlist = isInWatchlist(token.id);
                      toggleWatchlist(token.id);
                      toast({
                        title: wasInWatchlist ? 'Removed from watchlist' : 'Added to watchlist',
                        description: wasInWatchlist ? `${token.symbol.toUpperCase()} removed` : `${token.symbol.toUpperCase()} added to your watchlist`,
                      });
                    }}
                  >
                    <Star className={`h-3 w-3 mr-1 ${isInWatchlist(token.id) ? 'fill-current' : ''}`} />
                    Watchlist
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`bg-gray-800/50 border-gray-700 relative ${activeAlerts.length > 0 ? 'text-purple-400' : ''}`}
                    onClick={() => setShowPriceAlert(true)}
                  >
                    <Bell className={`h-3 w-3 mr-1 ${activeAlerts.length > 0 ? 'fill-current' : ''}`} />
                    Alert
                    {activeAlerts.length > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-purple-600 text-white text-[10px]">
                        {activeAlerts.length}
                      </Badge>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-gray-800/50 border-gray-700"
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        navigator.clipboard.writeText(window.location.href);
                        toast({
                          title: "Link copied!",
                          description: "Token page URL copied to clipboard",
                        });
                      }
                    }}
                  >
                    <Share2 className="h-3 w-3 mr-1" />
                    Share
                  </Button>
                  {token.links?.twitter_screen_name && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-gray-800/50 border-gray-700"
                      onClick={() => window.open(`https://twitter.com/${token.links?.twitter_screen_name}`, '_blank')}
                    >
                      <Twitter className="h-3 w-3 mr-1" />
                    </Button>
                  )}
                  {token.links?.homepage?.[0] && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-gray-800/50 border-gray-700"
                      onClick={() => window.open(token.links?.homepage?.[0], '_blank')}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Website
                    </Button>
                  )}
                </div>
              </div>

              {/* TradingView Chart */}
              <div className="bg-[#0a0b0d] rounded-lg p-4 border border-gray-800">
                <TradingChart tokenSymbol={token.symbol} tokenImage={token.image} />
              </div>

              {/* Transactions Table */}
              <div className="bg-[#0a0b0d] rounded-lg border border-gray-800">
                <Tabs defaultValue="transactions" className="w-full">
                  <TabsList className="w-full justify-start border-b border-gray-800 bg-transparent rounded-none h-auto p-0">
                    <TabsTrigger value="transactions" className="data-[state=active]:border-b-2 data-[state=active]:border-purple-500 rounded-none">
                      Transactions
                    </TabsTrigger>
                    <TabsTrigger value="supports" className="data-[state=active]:border-b-2 data-[state=active]:border-purple-500 rounded-none">
                      <Heart className="h-3.5 w-3.5 mr-1.5" />
                      Supports <span className="ml-1 text-xs">540.8 k</span>
                    </TabsTrigger>
                    <TabsTrigger value="traders" className="data-[state=active]:border-b-2 data-[state=active]:border-purple-500 rounded-none">
                      <User className="h-3.5 w-3.5 mr-1.5" />
                      Traders
                    </TabsTrigger>
                    <TabsTrigger value="bubblemaps" className="data-[state=active]:border-b-2 data-[state=active]:border-purple-500 rounded-none">
                      <Droplets className="h-3.5 w-3.5 mr-1.5" />
                      Bubblemaps
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="transactions" className="p-4">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-800 text-gray-400">
                            <th className="text-left py-2">Temps</th>
                            <th className="text-left py-2">Type</th>
                            <th className="text-right py-2">Cours SOL</th>
                            <th className="text-right py-2">Cours USD</th>
                            <th className="text-right py-2">{token.symbol}</th>
                            <th className="text-right py-2">Valeur</th>
                          </tr>
                        </thead>
                        <tbody>
                          {mockTransactions.map((tx, i) => (
                            <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-900/30">
                              <td className="py-2 text-gray-400">{tx.timestamp}</td>
                              <td className="py-2">
                                <Badge
                                  variant="outline"
                                  className={tx.type === 'VEND' ? 'bg-red-600/20 text-red-400 border-red-600/50' : 'bg-green-600/20 text-green-400 border-green-600/50'}
                                >
                                  {tx.type}
                                </Badge>
                              </td>
                              <td className="py-2 text-right text-white">{tx.priceSOL.toFixed(5)}</td>
                              <td className="py-2 text-right text-white">{tx.priceUSD.toFixed(5)} $</td>
                              <td className="py-2 text-right text-white">{tx.amountPENGU.toFixed(2)} k</td>
                              <td className="py-2 text-right text-white">{tx.valueUSD.toFixed(2)} $</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </TabsContent>

                  <TabsContent value="bubblemaps" className="p-4">
                    <Button
                      onClick={() => setShowBubblemaps(true)}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      Ouvrir Bubblemaps
                    </Button>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Pool Information */}
              <div className="bg-[#0a0b0d] rounded-lg p-6 border border-gray-800">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Autres Pools Trading {token.name} ({token.symbol})
                </h3>
                <div className="space-y-3">
                  {mockPools.map((pool, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-900/30 rounded hover:bg-gray-900/50">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <div className="w-6 h-6 rounded-full bg-purple-500" />
                          <div className="w-6 h-6 rounded-full bg-blue-500 -ml-2" />
                        </div>
                        <div>
                          <div className="text-white font-medium">{pool.pair}</div>
                          <div className="text-xs text-gray-400">{pool.dex}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div>
                          <div className="text-gray-400">LIQ</div>
                          <div className="text-white">{(pool.liquidity / 1000000).toFixed(2)} M $</div>
                        </div>
                        <div>
                          <div className="text-gray-400">VOL. 24 h</div>
                          <div className="text-white">{(pool.volume24h / 1000000).toFixed(2)} M $</div>
                        </div>
                        <Button size="sm" variant="outline" className="bg-green-600/20 text-green-400 border-green-600/50 hover:bg-green-600/30">
                          Échanger
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-4">
              {/* Stats Cards */}
              <div className="bg-[#0a0b0d] rounded-lg p-4 border border-gray-800">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-xs text-gray-400 mb-1">24h Txn</div>
                    <div className="text-white font-semibold">1621</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Vol 24 h</div>
                    <div className="text-white font-semibold">376,06 k $</div>
                    <div className="text-xs text-green-500">+10,25 k $</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Achat net</div>
                    <div className="text-white font-semibold">3,9 M $</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">ACHET...</div>
                    <div className="text-white font-semibold">829</div>
                    <div className="text-xs text-green-500">VENDR... 792</div>
                  </div>
                </div>
              </div>

              {/* Pool Details */}
              <div className="bg-[#0a0b0d] rounded-lg p-4 border border-gray-800">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-white font-semibold">Résumé</span>
                  <Badge className="bg-gray-800 text-gray-400">Vol 24 h</Badge>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Liquidité</span>
                    <span className="text-white">3,9 M $</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Buys/Sells</span>
                    <span className="text-white">829/792</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Créé bourse</span>
                    <span className="text-white">690,2 M $</span>
                  </div>
                </div>
              </div>

              {/* Community Banner */}
              <div className="bg-gradient-to-br from-purple-900/40 to-purple-700/40 rounded-lg p-4 border border-purple-600/30">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-lg bg-purple-600 flex items-center justify-center">
                    <Info className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-300 mb-2">
                      La communauté était désormais classé ce pool pour un montant total de déficit !
                    </div>
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700 w-full">
                      En savoir plus
                    </Button>
                  </div>
                </div>
              </div>

              {/* POOL Info */}
              <div className="bg-[#0a0b0d] rounded-lg p-4 border border-gray-800">
                <h3 className="text-white font-semibold mb-3">POOL</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between p-2 bg-gray-900/30 rounded">
                    <span className="text-gray-400">{token.symbol}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white">2,2Mn...uBhV</span>
                      <button
                        onClick={() => copyToClipboard('2,2Mn7uBhV', token.symbol)}
                        className="text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-900/30 rounded">
                    <span className="text-gray-400">SOL</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white">So11...1111</span>
                      <button
                        onClick={() => copyToClipboard('So1111111111111111111111111111111111111111111', 'SOL')}
                        className="text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Score */}
              <div className="bg-[#0a0b0d] rounded-lg p-4 border border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-semibold">Score GT</h3>
                    <CircleDot className="h-4 w-4 text-purple-400" />
                  </div>
                  <span className="text-2xl font-bold text-white">93 <span className="text-sm text-gray-400">/100</span></span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">{token.symbol}/SOL</span>
                    <span className="text-white">{token.symbol}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Pool</span>
                    <Badge className="bg-green-600/20 text-green-400">Infos</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Transactions</span>
                    <Badge className="bg-green-600/20 text-green-400">100</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Création</span>
                    <Badge className="bg-green-600/20 text-green-400">300</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <Search className="h-3.5 w-3.5" />
                      Soul Scanner
                    </div>
                    <Badge className="bg-green-600/20 text-green-400">97</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {showBubblemaps && (
        <Bubblemaps
          tokenSymbol={token.symbol}
          onClose={() => setShowBubblemaps(false)}
        />
      )}

      <PriceAlertDialog
        open={showPriceAlert}
        onClose={() => setShowPriceAlert(false)}
        tokenId={token.id}
        tokenSymbol={token.symbol}
        currentPrice={currentPrice}
      />
    </div>
  );
}
