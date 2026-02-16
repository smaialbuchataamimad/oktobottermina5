'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/sidebar';
import { TopNav } from '@/components/top-nav';
import { TokenList } from '@/components/token-list';

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState('24H');

  return (
    <div className="min-h-screen bg-[#0a0b0d]">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="lg:pl-64">
        <TopNav
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          onSearch={setSearchQuery}
          onTimeFilterChange={setTimeFilter}
          selectedTimeFilter={timeFilter}
        />

        <main className="p-4">
          <TokenList searchQuery={searchQuery} timeFilter={timeFilter} />
        </main>
      </div>
    </div>
  );
}
