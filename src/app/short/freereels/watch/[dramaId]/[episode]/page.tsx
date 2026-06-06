'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Hls from 'hls.js';

interface FreeReelsStreamData {
  episode_id: string;
  name: string;
  cover: string;
  video_url: string;
  m3u8_url: string;
  h264_m3u8: string;
  h265_m3u8: string;
  subtitles: string;
  [key: string]: unknown;
}

export default function FreeReelsWatchPage() {
  const params = useParams();
  const { dramaId, episode } = params as { dramaId: string; episode: string };
  const videoRef = useRef<HTMLVideoElement>(null);

  const [streamData, setStreamData] = useState<FreeReelsStreamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const ep = parseInt(episode, 10);

  useEffect(() => {
    async function loadStream() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`https://api.sonzaix.indevs.in/freereels/stream?id=${dramaId}&episode=${episode}`);
        const data = await res.json();
        if (data.data) {
          setStreamData(data.data);
        } else {
          setError('Stream not available');
        }
      } catch {
        setError('Failed to load stream');
      }
      setLoading(false);
    }
    loadStream();
  }, [dramaId, episode]);

  useEffect(() => {
    if (!streamData || !videoRef.current) return;
    const video = videoRef.current;

    const streamUrl = streamData.h264_m3u8 || streamData.m3u8_url || streamData.video_url || '';

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
  }, [streamData]);

  const streamUrl = streamData?.h264_m3u8 || streamData?.m3u8_url || streamData?.video_url || '';

  return (
    <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <span>/</span>
        <Link href="/short/freereels/all" className="hover:text-white transition-colors">FreeReels</Link>
        <span>/</span>
        <Link href={`/short/freereels/${dramaId}`} className="hover:text-white transition-colors">
          {streamData?.name || 'Drama'}
        </Link>
        <span>/</span>
        <span className="text-white">Episode {episode}</span>
      </nav>

      <h1 className="text-xl md:text-2xl font-bold text-white mb-1">
        {streamData?.name || 'FreeReels Short Drama'}
      </h1>
      <p className="text-gray-500 text-sm mb-6">Episode {episode}</p>

      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden mb-6 shadow-2xl shadow-black/50">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a2e]">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
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
            key={`${dramaId}-${episode}`}
            controls
            autoPlay
            className="w-full h-full"
          />
        )}
      </div>

      {/* Episode Navigation */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href={ep > 1 ? `/short/freereels/watch/${dramaId}/${ep - 1}` : '#'}
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
          href={`/short/freereels/${dramaId}`}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium bg-cyan-500 text-white hover:bg-cyan-600 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
          All Episodes
        </Link>

        <Link
          href={`/short/freereels/watch/${dramaId}/${ep + 1}`}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium bg-[#1a1a2e] text-white hover:bg-[#252540] border border-white/10 transition-all"
        >
          Episode {ep + 1}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
