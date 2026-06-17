'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function MangaReadPage() {
  const params = useParams();
  const [pages, setPages] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/manga/chapter?id=${params.chapterId}`);
        const data = await res.json();
        setPages(data.data?.images || data.data?.pages || []);
        setTitle(data.data?.chapterTitle || data.data?.title || '');
      } catch { setError('Gagal memuat chapter'); }
      setLoading(false);
    }
    if (params.chapterId) load();
  }, [params.chapterId]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-400 mb-3">{error}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm">Retry</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-4 page-enter">
      <div className="max-w-3xl mx-auto px-3 sm:px-4 pt-4">
        <Link href="/manga" className="text-sm text-gray-400 hover:text-white mb-3 inline-flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Kembali
        </Link>
        <h1 className="text-lg sm:text-xl font-bold text-white mb-4">{title || 'Chapter'}</h1>
        <div className="space-y-1">
          {pages.map((page: any, i: number) => (
            <div key={i} className="relative w-full">
              <Image src={typeof page === 'string' ? page : page.url || page.image || ''} alt={`Page ${i + 1}`} width={800} height={1200} className="w-full h-auto" />
            </div>
          ))}
        </div>
        {pages.length === 0 && <div className="text-center text-gray-500 py-12">Tidak ada halaman</div>}
      </div>
    </div>
  );
}