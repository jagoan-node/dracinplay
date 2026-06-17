'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import DramaCard from '@/components/DramaCard';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import type { Drama } from '@/lib/api';

type FilterType = 'all' | 'china' | 'korea';

function BrowseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialFilter = (searchParams.get('filter') as FilterType) || 'all';
  const initialQuery = searchParams.get('q') || '';

  const [filter, setFilter] = useState<FilterType>(initialFilter);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [chinaDramas, setChinaDramas] = useState<Drama[]>([]);
  const [koreaDramas, setKoreaDramas] = useState<Drama[]>([]);
  const [searchResults, setSearchResults] = useState<Drama[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearchMode, setIsSearchMode] = useState(!!initialQuery);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [chinaRes, koreaRes] = await Promise.all([
          fetch('/api/drama/home/china').then(r => r.json()),
          fetch('/api/drama/home/korea').then(r => r.json()),
        ]);
        setChinaDramas(chinaRes.data || []);
        setKoreaDramas(koreaRes.data || []);
      } catch {}
      setIsLoading(false);
    }
    loadData();
  }, []);

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) { setIsSearchMode(false); setSearchResults([]); return; }
    setIsSearching(true);
    setIsSearchMode(true);
    try {
      const res = await fetch(`/api/drama/search?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      setSearchResults(data.data || []);
    } catch {}
    setIsSearching(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => handleSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  useEffect(() => {
    const f = searchParams.get('filter') as FilterType;
    if (f) setFilter(f);
  }, [searchParams]);

  const getFilteredDramas = (): Drama[] => {
    if (isSearchMode) return searchResults;
    switch (filter) {
      case 'china': return chinaDramas;
      case 'korea': return koreaDramas;
      default: return [...chinaDramas, ...koreaDramas];
    }
  };

  const dramas = getFilteredDramas();

  return (
    <div className="min-h-screen pb-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">
          Browse <span className="text-[#e63946]">Drama</span>
        </h1>

        <div className="relative mb-4">
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari drama favoritmu..."
            className="w-full px-4 py-3 pl-11 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#e63946]/50 transition-colors text-sm" />
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {!isSearchMode && (
          <div className="flex gap-2 mb-6 overflow-x-auto hide-scrollbar">
            {[{ key: 'all', label: 'Semua' }, { key: 'china', label: 'China' }, { key: 'korea', label: 'Korea' }].map(f => (
              <button key={f.key} onClick={() => { setFilter(f.key as FilterType); router.replace(f.key === 'all' ? '/browse' : `/browse?filter=${f.key}`); }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${filter === f.key ? 'bg-[#e63946] text-white' : 'bg-[#1a1a2e] text-gray-400 hover:text-white'}`}>
                {f.label}
              </button>
            ))}
          </div>
        )}

        {!isLoading && <p className="text-xs text-gray-500 mb-3">{isSearchMode ? `${dramas.length} hasil untuk "${searchQuery}"` : `${dramas.length} drama ditemukan`}</p>}

        {isLoading || isSearching ? (
          <LoadingSkeleton count={15} />
        ) : dramas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <svg className="w-16 h-16 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <p className="text-gray-400">{isSearchMode ? 'Tidak ada hasil ditemukan' : 'Tidak ada drama tersedia'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {dramas.map((drama, i) => (
              <div key={drama.id} className="stagger-item" style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}>
                <DramaCard drama={drama} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<div className="min-h-screen max-w-7xl mx-auto px-4 pt-6"><LoadingSkeleton count={15} /></div>}>
      <BrowseContent />
    </Suspense>
  );
}