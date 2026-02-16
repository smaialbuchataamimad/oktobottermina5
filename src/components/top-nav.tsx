'use client';

import { useState } from 'react';
import { Search, Bell, Settings, Menu, Sparkles, Filter, TrendingUp, Zap, FileText, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { trendingTokens } from '@/lib/mock-data';

interface TopNavProps {
  onMenuClick: () => void;
  onSearch?: (query: string) => void;
  onTimeFilterChange?: (timeFilter: string) => void;
  selectedTimeFilter?: string;
}

export function TopNav({ onMenuClick, onSearch, onTimeFilterChange, selectedTimeFilter = '24H' }: TopNavProps) {
  const timeFilters = ['5M', '1H', '6H', '24H'];
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (onSearch) {
      onSearch(query);
    }
  };

  const handleTimeFilterClick = (filter: string) => {
    if (onTimeFilterChange) {
      onTimeFilterChange(filter);
    }
  };

  return (
    <div className="sticky top-0 z-30 bg-[#0a0b0d]/98 backdrop-blur-md border-b border-gray-800/50">
      {/* Main top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800/30">
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={onMenuClick}
            className="lg:hidden text-gray-400 hover:text-white p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Search */}
          <div className="relative flex-1 max-w-2xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search network, DEX or token..."
              className="pl-10 bg-gray-900/50 border-gray-800 text-gray-300 placeholder:text-gray-600 h-10 focus-visible:ring-purple-500/50"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 text-xs text-gray-500 bg-gray-800/50 rounded border border-gray-700">
              /
            </kbd>
          </div>
        </div>

        {/* Right side buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white hover:bg-gray-800 hidden md:flex"
          >
            <FileText className="h-4 w-4 mr-2" />
            API Docs
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white hover:bg-gray-800 hidden md:flex"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Feedback
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white hover:bg-gray-800 relative"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-purple-500 rounded-full"></span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Trending tokens bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 overflow-x-auto scrollbar-hide">
        <Button
          variant="outline"
          size="sm"
          className="bg-gray-900/50 border-gray-800 text-gray-300 hover:bg-gray-800 hover:text-white h-8 px-3"
        >
          Sort
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="bg-purple-600/20 border-purple-500/50 text-purple-400 hover:bg-purple-600/30 h-8 px-3"
        >
          <TrendingUp className="h-3 w-3 mr-1.5" />
          TRENDING
        </Button>

        {timeFilters.map((filter) => (
          <Button
            key={filter}
            variant="outline"
            size="sm"
            onClick={() => handleTimeFilterClick(filter)}
            className={`h-8 px-3 transition-all ${
              selectedTimeFilter === filter
                ? 'bg-purple-600/30 border-purple-500 text-purple-400 hover:bg-purple-600/40'
                : 'bg-gray-900/50 border-gray-800 text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            {filter}
          </Button>
        ))}

        <Button
          variant="outline"
          size="sm"
          className="bg-gray-900/50 border-gray-800 text-gray-300 hover:bg-gray-800 hover:text-white h-8 px-2.5"
        >
          <Sparkles className="h-3 w-3" />
        </Button>

        {/* Trending token badges */}
        <div className="hidden md:flex items-center gap-2">
          {trendingTokens.slice(0, 3).map((token, i) => (
            <Badge
              key={i}
              variant="outline"
              className="bg-gray-900/50 border-gray-800 text-gray-300 hover:bg-gray-800 cursor-pointer whitespace-nowrap h-8 px-3"
            >
              <Zap className="h-3 w-3 mr-1.5 text-purple-400" />
              {token.name}
            </Badge>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          className="bg-gray-900/50 border-gray-800 text-gray-300 hover:bg-gray-800 hover:text-white ml-auto h-8 px-3"
        >
          <Filter className="h-3 w-3 mr-1.5" />
          FILTER
        </Button>
      </div>
    </div>
  );
}
