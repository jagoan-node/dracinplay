'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Hls from 'hls.js';

interface DramaBoxStreamChapter {
  chapterId?: string;
  chapterName?: string;
  chapterNum?: number;
  playUrl?: string;
  m3u8Url?: string;
  h264M3u8?: string;
  videoUrl?: string;
  unlock?: boolean;
  [key: string]: unknown;
}

interface DramaBoxStreamResponse {
  chapterList: DramaBoxStreamChapter[];
  [key: string]: unknown;
}

export default function DramaBoxWatchPage() {
  const params = useParams();
  const { bookId, episode } = params as { bookId: string; episode: string };
  const videoRef = useRef<HTMLVideoElement>(null);

  const [streamData, setStreamData] = useState<DramaBoxStreamResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const ep = parseInt(episode, 10);

  useEffect(() => {
    async function loadStream() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`https://api.sonzaix.indevs.in/dramabox/stream?id=${bookId}&episode=${episode}`);
        const data = await res.json();
        if (data.chapterList) {
          setStreamData(data);
        } else {
          setError('Stream not available');
        }
      } catch {
        setError('Failed to load stream');
      }
      setLoading(false);
    }
    loadStream();
  }, [bookId, episode]);

  useEffect(() => {
    if (!streamData || !videoRef.current) return;
    const video = videoRef.current;

    // Find the chapter for current episode
    const chapter = streamData.chapterList?.find(
      (ch) => ch.chapterNum === ep || ch.chapterNum === ep - 1
    ) || streamData.chapterList?.[ep - 1];

    if (!chapter) {
      setError('Episode not found');
      return;
    }

    const streamUrl = (chapter as Record<string, string>).h264M3u8 ||
      (chapter as Record<string, string>).m3u8Url ||
      (chapter as Record<string, string>).playUrl ||
      (chapter as Record<string, string>).videoUrl ||
      '';

    if (!streamUrl) {
      setError('No stream URL available');
      return;
    }

    if (streamUrl.includes('.m3u8') && Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          console.error('HLS fatal error', data);
          setError('Stream playback error');
        }
      });
      return () => {
        hls.destroy();
      };
    } else if (streamUrl.includes('.m3u8') && video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else {
      video.src = streamUrl;
    }
  }, [streamData, ep]);

  return (
    <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <span>/</span>
        <Link href="/short/dramabox/all" className="hover:text-white transition-colors">DramaBox</Link>
        <span>/</span>
        <Link href={`/short/dramabox/${bookId}`} className="hover:text-white transition-colors">Drama</Link>
        <span>/</span>
        <span className="text-white">Episode {episode}</span>
      </nav>

      <h1 className="text-xl md:text-2xl font-bold text-white mb-1">DramaBox Short Drama</h1>
      <p className="text-gray-500 text-sm mb-6">Episode {episode}</p>

      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden mb-6 shadow-2xl shadow-black/50">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a2e]">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-400 text-sm">Loading video...</p>
            </div>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a2e]">
            <div className="text-center px-4">
              <p className="text-[#e63946] font-semibold text-lg">Streaming not available</p>
              <p className="text-gray-500 text-sm mt-1">{error}</p>
            </div>
          </div>
        ) : (
          <video
            ref={videoRef}
            key={`${bookId}-${episode}`}
            controls
            autoPlay
            className="w-full h-full"
          />
        )}
      </div>

      {/* Episode Navigation */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href={ep > 1 ? `/short/dramabox/watch/${bookId}/${ep - 1}` : '#'}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
            ep > 1
              ? 'bg-[#1a1a2e] text-white hover:bg-[#252540] border border-white/10'
              : 'bg-[#1a1a2e]/50 text-gray-600 cursor-not-allowed border border-white/5 pointer-events-none'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Episode {ep > 1 ? ep - 1 : '-'}
        </Link>

        <Link
          href={`/short/dramabox/${bookId}`}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium bg-purple-500 text-white hover:bg-purple-600 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
          All Episodes
        </Link>

        <Link
          href={`/short/dramabox/watch/${bookId}/${ep + 1}`}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium bg-[#1a1a2e] text-white hover:bg-[#252540] border border-white/10 transition-all"
        >
          Episode {ep + 1}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Episode Grid */}
      <section className="mt-8">
        <h3 className="text-lg font-semibold text-white mb-4">Episode List</h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {streamData?.chapterList?.map((ch, idx) => (
            <Link
              key={idx}
              href={`/short/dramabox/watch/${bookId}/${idx + 1}`}
              className={`flex items-center justify-center py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                idx + 1 === ep
                  ? 'bg-purple-500 text-white'
                  : 'bg-[#1a1a2e] text-gray-400 hover:text-white hover:bg-[#252540] border border-white/10'
              }`}
            >
              {idx + 1}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
