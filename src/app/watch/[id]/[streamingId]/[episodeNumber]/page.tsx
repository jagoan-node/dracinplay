'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface StreamData {
  '360p': string;
  '480p': string;
  '720p': string;
  '360p_size': string;
  '480p_size': string;
  '720p_size': string;
}

type Quality = '360p' | '480p' | '720p';

interface DramaInfo {
  id: number;
  title: string;
  data_episode: Array<{
    episode_id: number;
    episode_number: number;
    episode_label: string;
    episode_image: string;
    streaming: string;
    cdn_ready: boolean;
  }>;
}

export default function WatchPage() {
  const params = useParams();
  const router = useRouter();
  const { id, streamingId, episodeNumber } = params as {
    id: string;
    streamingId: string;
    episodeNumber: string;
  };

  const [streamData, setStreamData] = useState<StreamData | null>(null);
  const [quality, setQuality] = useState<Quality>('720p');
  const [dramaInfo, setDramaInfo] = useState<DramaInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError('');
      try {
        const [streamRes, infoRes] = await Promise.all([
          fetch(`/api/drama/stream?id=${streamingId}`),
          fetch(`/api/drama/info?id=${id}`),
        ]);

        const streamJson = await streamRes.json();
        const infoJson = await infoRes.json();

        if (streamJson.data_stream && streamJson.data_stream.length > 0) {
          setStreamData(streamJson.data_stream[0]);
        } else {
          setError('Streaming tidak tersedia');
        }

        if (infoJson.id) {
          setDramaInfo(infoJson);
        }
      } catch {
        setError('Gagal memuat data streaming');
      }
      setLoading(false);
    }

    loadData();
  }, [id, streamingId, episodeNumber]);

  const currentStreamUrl = streamData?.[quality] || '';

  // Find prev/next episodes
  const currentEp = parseInt(episodeNumber);
  const episodes = dramaInfo?.data_episode || [];
  const currentEpIndex = episodes.findIndex(
    (ep) => ep.episode_number === currentEp
  );
  const prevEp = currentEpIndex > 0 ? episodes[currentEpIndex - 1] : null;
  const nextEp =
    currentEpIndex < episodes.length - 1
      ? episodes[currentEpIndex + 1]
      : null;

  return (
    <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:text-white transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href={`/drama/${id}`} className="hover:text-white transition-colors">
          {dramaInfo?.title || 'Drama'}
        </Link>
        <span>/</span>
        <span className="text-white">Episode {episodeNumber}</span>
      </nav>

      {/* Title */}
      <h1 className="text-xl md:text-2xl font-bold text-white mb-1">
        {dramaInfo?.title || 'Loading...'}
      </h1>
      <p className="text-gray-500 text-sm mb-6">Episode {episodeNumber}</p>

      {/* Video Player */}
      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden mb-6 shadow-2xl shadow-black/50">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a2e]">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-2 border-[#e63946] border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-400 text-sm">Memuat video...</p>
            </div>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a2e]">
            <div className="text-center px-4">
              <svg
                className="w-16 h-16 text-gray-600 mx-auto mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <p className="text-[#e63946] font-semibold text-lg">Streaming tidak tersedia</p>
              <p className="text-gray-500 text-sm mt-1">
                Episode ini belum tersedia atau sedang diproses.
              </p>
            </div>
          </div>
        ) : currentStreamUrl ? (
          <video
            key={`${streamingId}-${quality}`}
            src={currentStreamUrl}
            controls
            autoPlay
            className="w-full h-full"
          >
            Browser Anda tidak mendukung video playback.
          </video>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a2e]">
            <div className="text-center px-4">
              <p className="text-[#e63946] font-semibold">Streaming tidak tersedia</p>
              <p className="text-gray-500 text-sm mt-1">
                URL streaming untuk kualitas ini tidak tersedia.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Quality Selector */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-sm text-gray-400">Quality:</span>
        {(['720p', '480p', '360p'] as Quality[]).map((q) => {
          const url = streamData?.[q];
          const size = streamData?.[`${q}_size`];
          const available = url && url.length > 0;
          return (
            <button
              key={q}
              onClick={() => available && setQuality(q)}
              disabled={!available}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                quality === q
                  ? 'bg-[#e63946] text-white'
                  : available
                  ? 'bg-[#1a1a2e] text-gray-400 hover:text-white hover:bg-[#252540] border border-white/10'
                  : 'bg-[#1a1a2e]/50 text-gray-600 cursor-not-allowed border border-white/5'
              }`}
            >
              {q}
              {size && (
                <span className="text-[10px] ml-1 opacity-70">({size})</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Episode Navigation */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href={
            prevEp
              ? `/watch/${id}/${prevEp.streaming}/${prevEp.episode_number}`
              : '#'
          }
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
            prevEp
              ? 'bg-[#1a1a2e] text-white hover:bg-[#252540] border border-white/10'
              : 'bg-[#1a1a2e]/50 text-gray-600 cursor-not-allowed border border-white/5 pointer-events-none'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Episode {prevEp ? prevEp.episode_number : '-'}
        </Link>

        <Link
          href={`/drama/${id}`}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium bg-[#e63946] text-white hover:bg-[#ff4757] transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
          Semua Episode
        </Link>

        <Link
          href={
            nextEp
              ? `/watch/${id}/${nextEp.streaming}/${nextEp.episode_number}`
              : '#'
          }
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
            nextEp
              ? 'bg-[#1a1a2e] text-white hover:bg-[#252540] border border-white/10'
              : 'bg-[#1a1a2e]/50 text-gray-600 cursor-not-allowed border border-white/5 pointer-events-none'
          }`}
        >
          Episode {nextEp ? nextEp.episode_number : '-'}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Episode List Mini */}
      {episodes.length > 0 && (
        <section className="mt-8">
          <h3 className="text-lg font-semibold text-white mb-4">Episode List</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {episodes.map((ep) => (
              <Link
                key={ep.episode_id}
                href={`/watch/${id}/${ep.streaming}/${ep.episode_number}`}
                className={`flex items-center justify-center py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  ep.episode_number === currentEp
                    ? 'bg-[#e63946] text-white'
                    : 'bg-[#1a1a2e] text-gray-400 hover:text-white hover:bg-[#252540] border border-white/10'
                }`}
              >
                {ep.episode_number}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
