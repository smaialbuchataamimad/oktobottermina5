"use client"

import { useState, useEffect } from 'react';

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<string[]>([]);

  useEffect(() => {
    // Load watchlist from localStorage on mount
    const saved = localStorage.getItem('crypto-watchlist');
    if (saved) {
      try {
        setWatchlist(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading watchlist:', e);
      }
    }
  }, []);

  const addToWatchlist = (tokenId: string) => {
    const newWatchlist = [...watchlist, tokenId];
    setWatchlist(newWatchlist);
    localStorage.setItem('crypto-watchlist', JSON.stringify(newWatchlist));
  };

  const removeFromWatchlist = (tokenId: string) => {
    const newWatchlist = watchlist.filter(id => id !== tokenId);
    setWatchlist(newWatchlist);
    localStorage.setItem('crypto-watchlist', JSON.stringify(newWatchlist));
  };

  const toggleWatchlist = (tokenId: string) => {
    if (watchlist.includes(tokenId)) {
      removeFromWatchlist(tokenId);
    } else {
      addToWatchlist(tokenId);
    }
  };

  const isInWatchlist = (tokenId: string) => {
    return watchlist.includes(tokenId);
  };

  return {
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    toggleWatchlist,
    isInWatchlist,
  };
}
