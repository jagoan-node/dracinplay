'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import LoadingSkeleton from '@/components/LoadingSkeleton';

export default function MovieBoxDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [movie, setMovie] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/moviebox/detail?id=${id}`)
      .then(r => r.json())
      .then(d => { setMovie(d.data); setLoading(false); })
      .catch(() => { setError('Gagal memuat'); setLoading(false); });
  }, [id]);

  if (loading) return <LoadingSkeleton type="detail" />;
  if (error || !movie) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-400 mb-3">{error || 'Not found'}</p>
        <button onClick={() => router.back()} className="px-4 py-2 bg-[#e63946] text-white rounded-lg text-sm">Kembali</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-4 page-enter">
      {movie.cover && (
        <div className="relative h-[40vh] sm:h-[50vh] min-h-[250px] overflow-hidden">
          <Image src={movie.cover} alt={movie.title || ''} fill className="object-cover" priority sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/70 to-transparent" />
        </div>
      )}
      <div className="relative -mt-24 sm:-mt-32 max-w-5xl mx-auto px-4 pb-12">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          {movie.cover && (
            <div className="shrink-0 w-40 sm:w-48 md:w-56 mx-auto md:mx-0">
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-2xl shadow-black/50">
                <Image src={movie.cover} alt={movie.title || ''} fill className="object-cover" sizes="224px" />
              </div>
            </div>
          )}
          <div className="flex-1 text-center md:text-left">
            <span className="bg-yellow-500 text-black text-xs px-3 py-1 rounded-full font-semibold">MovieBox</span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mt-3 mb-3">{movie.title}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 text-sm text-gray-400 mb-3">
              {movie.year && <span className="bg-white/5 px-2 py-0.5 rounded">{movie.year}</span>}
              {movie.duration && <span>{movie.duration}</span>}
              {movie.rating && <span>⭐ {movie.rating}</span>}
            </div>
            {movie.tags && (
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                {movie.tags.map((t: string) => <span key={t} className="text-xs px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-300">{t}</span>)}
              </div>
            )}
            {movie.description && <p className="text-gray-400 text-sm leading-relaxed mb-6">{movie.description}</p>}
            {movie.playUrl && (
              <a href={movie.playUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#e63946] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#ff4757] transition">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                Watch Now
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}