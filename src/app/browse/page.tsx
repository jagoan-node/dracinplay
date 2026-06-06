'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import DramaCard from '@/components/DramaCard';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import type { Drama } from '@/lib/api';

type FilterType = 'all' | 'china' | 'korea';

function FilterTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
        active
          ? 'bg-[#e63946] text-white'
          : 'bg-[#1a1a2e] text-gray-400 hover:text-white hover:bg-[#252540]'
      }`}
    >
      {label}
    </button>
  );
}

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
          fetch('/api/drama/home/china').then((r) => r.json()),
          fetch('/api/drama/home/korea').then((r) => r.json()),
        ]);
        setChinaDramas(chinaRes.data || []);
        setKoreaDramas(koreaRes.data || []);
      } catch {
        console.error('Failed to load dramas');
      }
      setIsLoading(false);
    }
    loadData();
  }, []);

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setIsSearchMode(false);
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    setIsSearchMode(true);
    try {
      const res = await fetch(`/api/drama/search?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      setSearchResults(data.data || []);
    } catch {
      console.error('Search failed');
    }
    setIsSearching(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  useEffect(() => {
    const f = searchParams.get('filter') as FilterType;
    if (f) setFilter(f);
  }, [searchParams]);

  const getFilteredDramas = (): Drama[] => {
    if (isSearchMode) return searchResults;
    switch (filter) {
      case 'china':
        return chinaDramas;
      case 'korea':
        return koreaDramas;
      default:
        return [...chinaDramas, ...koreaDramas];
    }
  };

  const dramas = getFilteredDramas();

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-6">
        Browse <span className="text-[#e63946]">Drama</span>
      </h1>

      {/* Search */}
      <div className="relative mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari drama favoritmu..."
          className="w-full px-4 py-3 pl-12 bg-[#1a1a2e] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#e63946]/50 transition-colors text-sm"
        />
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Filter Tabs */}
      {!isSearchMode && (
        <div className="flex gap-2 mb-8">
          <FilterTab
            label="Semua"
            active={filter === 'all'}
            onClick={() => {
              setFilter('all');
              router.replace('/browse');
            }}
          />
          <FilterTab
            label="China"
            active={filter === 'china'}
            onClick={() => {
              setFilter('china');
              router.replace('/browse?filter=china');
            }}
          />
          <FilterTab
            label="Korea"
            active={filter === 'korea'}
            onClick={() => {
              setFilter('korea');
              router.replace('/browse?filter=korea');
            }}
          />
        </div>
      )}

      {/* Results Count */}
      {!isLoading && (
        <p className="text-sm text-gray-500 mb-4">
          {isSearchMode
            ? `${dramas.length} hasil untuk "${searchQuery}"`
            : `${dramas.length} drama ditemukan`}
        </p>
      )}

      {/* Content */}
      {isLoading || isSearching ? (
        <LoadingSkeleton count={15} />
      ) : dramas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-[#1a1a2e] rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-gray-400">
            {isSearchMode ? 'Tidak ada hasil ditemukan' : 'Tidak ada drama tersedia'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {dramas.map((drama) => (
            <DramaCard key={drama.id} drama={drama} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="skeleton h-8 w-48 rounded mb-6" />
          <div className="skeleton h-12 w-full rounded-xl mb-6" />
          <div className="flex gap-2 mb-8">
            <div className="skeleton h-10 w-20 rounded-full" />
            <div className="skeleton h-10 w-20 rounded-full" />
            <div className="skeleton h-10 w-20 rounded-full" />
          </div>
          <LoadingSkeleton count={15} />
        </div>
      }
    >
      <BrowseContent />
    </Suspense>
  );
}
