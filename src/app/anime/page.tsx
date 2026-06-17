'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function AnimePage() {
  const [animes, setAnimes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/anime/home')
      .then(r => r.json())
      .then(d => { setAnimes(d.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full"></div></div>;

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">🎌 Anime</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {animes.map((a: any) => (
          <Link key={a.id || a.url} href={`/anime/${a.url || a.id}`} className="group">
            <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-900">
              {a.cover && <Image src={a.cover} alt={a.judul || ''} fill className="object-cover group-hover:scale-105 transition-transform" sizes="(max-width: 640px) 50vw, 20vw" />}
            </div>
            <p className="text-white text-sm mt-2 line-clamp-2">{a.judul || a.title}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
