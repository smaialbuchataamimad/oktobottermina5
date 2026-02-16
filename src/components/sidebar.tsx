'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight, Search, BarChart3, TrendingUp, Droplets, Layers, Bot, Sparkles, Star, Flame, Zap, Coins, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { chains } from '@/lib/mock-data';
import { useWatchlist } from '@/hooks/use-watchlist';
import { getTrendingCoins, type CryptoToken } from '@/lib/api';
import Image from 'next/image';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    watchlist: true,
    multigraphiques: false,
    tableaux: true,
    chains: true,
  });
  const { watchlist, removeFromWatchlist } = useWatchlist();
  const [watchlistTokens, setWatchlistTokens] = useState<CryptoToken[]>([]);

  useEffect(() => {
    async function fetchWatchlistTokens() {
      if (watchlist.length === 0) {
        setWatchlistTokens([]);
        return;
      }

      const allTokens = await getTrendingCoins();
      const filtered = allTokens.filter(token => watchlist.includes(token.id));
      setWatchlistTokens(filtered);
    }

    fetchWatchlistTokens();
  }, [watchlist]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const formatPrice = (price: number) => {
    if (price < 0.01) return `${price.toFixed(6)}`;
    if (price < 1) return `${price.toFixed(4)}`;
    return `${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const SectionHeader = ({ title, section }: { title: string; section: string }) => (
    <button
      onClick={() => toggleSection(section)}
      className="flex items-center justify-between w-full px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-300 transition-colors"
    >
      {title}
      {expandedSections[section] ? (
        <ChevronDown className="h-3.5 w-3.5" />
      ) : (
        <ChevronRight className="h-3.5 w-3.5" />
      )}
    </button>
  );

  const NavItem = ({ icon: Icon, label, active, badge }: { icon: React.ElementType; label: string; active?: boolean; badge?: string }) => (
    <button
      className={`flex items-center justify-between w-full px-4 py-2.5 text-sm transition-all group ${
        active
          ? 'bg-purple-600/10 text-purple-400 border-l-2 border-purple-500'
          : 'text-gray-300 hover:bg-gray-800/60 hover:text-white border-l-2 border-transparent'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 flex-shrink-0" />
        <span className="truncate">{label}</span>
      </div>
      {badge && (
        <span className="ml-2 px-1.5 py-0.5 text-xs bg-purple-600/20 text-purple-400 rounded">
          {badge}
        </span>
      )}
    </button>
  );

  const ChainItem = ({ icon: Icon, name, active, color }: { icon: React.ElementType; name: string; active?: boolean; color?: string }) => (
    <button
      className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-all ${
        active
          ? 'bg-blue-600/10 text-blue-400 border-l-2 border-blue-500'
          : 'text-gray-300 hover:bg-gray-800/60 hover:text-white border-l-2 border-transparent'
      }`}
    >
      <Icon className={`h-4 w-4 flex-shrink-0 ${color || 'text-current'}`} />
      <span className="truncate">{name}</span>
    </button>
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-sm"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-[#0a0b0d] border-r border-gray-800/50 z-50 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } w-64 shadow-2xl`}
      >
        {/* Logo Header */}
        <div className="flex items-center justify-between gap-3 p-4 border-b border-gray-800/50 bg-gradient-to-r from-purple-900/10 to-transparent">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center shadow-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-baseline gap-0.5">
                <span className="font-bold text-white text-base">gecko</span>
                <span className="font-bold text-purple-500 text-base">terminal</span>
              </div>
              <span className="text-xs text-gray-500">v2.0</span>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="lg:hidden text-gray-400 hover:text-white p-1.5 hover:bg-gray-800 rounded transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <ScrollArea className="h-[calc(100vh-73px)]">
          <div className="py-2">
            {/* Main Watchlist */}
            <SectionHeader title="MAIN WATCHLIST" section="watchlist" />
            {expandedSections.watchlist && (
              <div className="space-y-0.5 px-2 mb-2">
                {watchlistTokens.length === 0 ? (
                  <div className="px-2 py-6 text-center text-sm text-gray-500">
                    <Star className="h-8 w-8 mx-auto mb-2 text-gray-700" />
                    <p>No tokens in watchlist</p>
                    <p className="mt-2 text-purple-400 text-xs">
                      Star tokens to add them here
                    </p>
                  </div>
                ) : (
                  watchlistTokens.map((token) => (
                    <Link
                      key={token.id}
                      href={`/token/${token.id}`}
                      className="flex items-center gap-2 px-2 py-2 hover:bg-gray-800/60 rounded transition-all group"
                    >
                      <div className="relative w-6 h-6 rounded-full overflow-hidden bg-gray-800 flex-shrink-0">
                        {token.image ? (
                          <Image
                            src={token.image}
                            alt={token.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white font-bold text-xs">
                            {token.symbol.substring(0, 1).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-white truncate">
                            {token.symbol.toUpperCase()}
                          </span>
                          <span className={`text-xs ${token.price_change_percentage_24h && token.price_change_percentage_24h > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {token.price_change_percentage_24h ? `${token.price_change_percentage_24h > 0 ? '+' : ''}${token.price_change_percentage_24h.toFixed(1)}%` : '-'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {formatPrice(token.current_price)}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeFromWatchlist(token.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-700 rounded"
                      >
                        <X className="h-3 w-3 text-gray-400 hover:text-red-400" />
                      </button>
                    </Link>
                  ))
                )}
              </div>
            )}

            <Separator className="my-2 bg-gray-800/50" />

            {/* Multigraphiques */}
            <SectionHeader title="MULTI CHARTS" section="multigraphiques" />
            {expandedSections.multigraphiques && (
              <div className="space-y-0.5 px-2 mb-2">
                <div className="px-2 py-4 text-center text-sm text-gray-500">
                  <BarChart3 className="h-6 w-6 mx-auto mb-1 text-gray-700" />
                  <p className="text-xs">No charts created</p>
                </div>
              </div>
            )}

            <Separator className="my-2 bg-gray-800/50" />

            {/* Tableaux de Bord */}
            <SectionHeader title="DASHBOARDS" section="tableaux" />
            {expandedSections.tableaux && (
              <div className="space-y-0.5 px-2 mb-2">
                <NavItem icon={BarChart3} label="Chain Rankings" />
                <NavItem icon={TrendingUp} label="DEX Rankings" />
                <NavItem icon={Droplets} label="New Pools" badge="Hot" />
                <NavItem icon={Layers} label="Categories" />
                <NavItem icon={Bot} label="AI Agents" badge="New" />
              </div>
            )}

            <Separator className="my-2 bg-gray-800/50" />

            {/* Chaînes */}
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                CHAINS
              </span>
              <button className="text-gray-500 hover:text-gray-300 transition-colors">
                <Search className="h-3.5 w-3.5" />
              </button>
            </div>
            {expandedSections.chains && (
              <div className="space-y-0.5 px-2 mb-2">
                <ChainItem icon={Zap} name="Solana" active color="text-purple-400" />
                <ChainItem icon={Coins} name="BNB Chain" color="text-yellow-400" />
                <ChainItem icon={Flame} name="Ethereum" color="text-blue-400" />
                <ChainItem icon={Layers} name="Base" color="text-blue-500" />
                <ChainItem icon={Droplets} name="Sepolia Testnet" color="text-cyan-400" />
                <ChainItem icon={BarChart3} name="Arbitrum" color="text-blue-600" />
              </div>
            )}
          </div>
        </ScrollArea>
      </aside>
    </>
  );
}
