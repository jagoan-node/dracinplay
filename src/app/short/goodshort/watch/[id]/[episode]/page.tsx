'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Hls from 'hls.js';

interface MultiVideo {
  type: string;
  filePath: string;
}

interface DownloadEntry {
  index: number;
  chapterName: string;
  multiVideos: MultiVideo[];
}

interface StreamApiResponse {
  bookId: string;
  bookName: string;
  downloadList: DownloadEntry[];
}

export default function GoodShortWatchPage() {
  const params = useParams();
  const { id, episode } = params as { id: string; episode: string };
  const videoRef = useRef<HTMLVideoElement>(null);

  const [streamUrl, setStreamUrl] = useState('');
  const [bookName, setBookName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const ep = parseInt(episode, 10);
  const chapterIndex = ep - 1; // 0-based

  useEffect(() => {
    async function loadStream() {
      setLoading(true);
      setError('');
      setStreamUrl('');
      try {
        const res = await fetch(`https://api.sonzaix.indevs.in/goodshort/stream?bookId=${id}&chapterIndex=${chapterIndex}`);
        const json = await res.json();
        const apiData: StreamApiResponse | undefined = json.data;
        if (apiData?.downloadList?.length) {
          const entry = apiData.downloadList.find((d) => d.index === chapterIndex) ?? apiData.downloadList[0];
          const filePath = entry?.multiVideos?.[0]?.filePath;
          if (filePath) {
            setStreamUrl(filePath);
            setBookName(apiData.bookName || 'GoodShort Drama');
          } else {
            setError('No video URL found for this episode');
          }
        } else {
          setError('Stream not available');
        }
      } catch {
        setError('Failed to load stream');
      }
      setLoading(false);
    }
    loadStream();
  }, [id, chapterIndex]);

  useEffect(() => {
    if (!streamUrl || !videoRef.current) return;
    const video = videoRef.current;

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
      return () => { hls.destroy(); };
    } else if (streamUrl.includes('.m3u8') && video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else {
      video.src = streamUrl;
    }
  }, [streamUrl]);

  return (
    <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <span>/</span>
        <Link href="/short/goodshort/all" className="hover:text-white transition-colors">GoodShort</Link>
        <span>/</span>
        <Link href={`/short/goodshort/${id}`} className="hover:text-white transition-colors">Drama</Link>
        <span>/</span>
        <span className="text-white">Episode {episode}</span>
      </nav>

      <h1 className="text-xl md:text-2xl font-bold text-white mb-1">{bookName || 'GoodShort Drama'}</h1>
      <p className="text-gray-500 text-sm mb-6">Episode {episode}</p>

      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden mb-6 shadow-2xl shadow-black/50">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a2e]">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
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
          <video ref={videoRef} key={`${id}-${episode}`} controls autoPlay className="w-full h-full" />
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href={ep > 1 ? `/short/goodshort/watch/${id}/${ep - 1}` : '#'}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
            ep > 1 ? 'bg-[#1a1a2e] text-white hover:bg-[#252540] border border-white/10' : 'bg-[#1a1a2e]/50 text-gray-600 cursor-not-allowed border border-white/5 pointer-events-none'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Episode {ep > 1 ? ep - 1 : '-'}
        </Link>
        <Link href={`/short/goodshort/${id}`} className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 transition-all">
          All Episodes
        </Link>
        <Link
          href={`/short/goodshort/watch/${id}/${ep + 1}`}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium bg-[#1a1a2e] text-white hover:bg-[#252540] border border-white/10 transition-all"
        >
          Episode {ep + 1}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </Link>
      </div>
    </div>
  );
}
