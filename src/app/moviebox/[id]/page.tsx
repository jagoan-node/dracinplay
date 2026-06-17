'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';

export default function MovieBoxDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [movie, setMovie] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/moviebox/detail?id=${id}`)
      .then(r => r.json())
      .then(d => { setMovie(d.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full"></div></div>;
  if (!movie) return <div className="min-h-screen flex items-center justify-center text-white">Not found</div>;

  return (
    <div className="min-h-screen">
      {movie.cover && (
        <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
          <Image src={movie.cover} alt={movie.title || ''} fill className="object-cover" priority sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/70 to-transparent" />
        </div>
      )}
      <div className="relative -mt-32 max-w-7xl mx-auto px-4 pb-12">
        <div className="flex flex-col md:flex-row gap-8">
          {movie.cover && (
            <div className="shrink-0 w-48 md:w-64 mx-auto md:mx-0">
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-2xl">
                <Image src={movie.cover} alt={movie.title || ''} fill className="object-cover" sizes="256px" />
              </div>
            </div>
          )}
          <div className="flex-1">
            <span className="bg-yellow-500 text-black text-xs px-3 py-1 rounded-full font-semibold">MovieBox</span>
            <h1 className="text-3xl md:text-4xl font-bold text-white mt-3 mb-4">{movie.title}</h1>
            <div className="flex gap-4 text-sm text-gray-400 mb-4">
              {movie.year && <span>{movie.year}</span>}
              {movie.duration && <span>{movie.duration}</span>}
              {movie.rating && <span>⭐ {movie.rating}</span>}
            </div>
            {movie.tags && <div className="flex flex-wrap gap-2 mb-4">{movie.tags.map((t: string) => <span key={t} className="text-xs px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-300">{t}</span>)}</div>}
            {movie.description && <p className="text-gray-400 text-sm leading-relaxed">{movie.description}</p>}
            {movie.playUrl && (
              <a href={movie.playUrl} target="_blank" rel="noopener noreferrer" className="mt-6 inline-block bg-red-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-600 transition">
                ▶ Watch Now
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
