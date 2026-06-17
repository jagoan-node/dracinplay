'use client';

import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

interface VideoQuality {
  playUrl: string;
  dpi: number;
  encode: string;
  bitrate?: string;
}

interface HlsPlayerProps {
  src: string;
  poster?: string;
  qualities?: VideoQuality[];
  autoPlay?: boolean;
}

export default function HlsPlayer({ src, poster, qualities = [], autoPlay = false }: HlsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [selectedQuality, setSelectedQuality] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isBuffering, setIsBuffering] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<NodeJS.Timeout>(undefined);

  const activeSrc = qualities.length > 0 && selectedQuality >= 0
    ? qualities[selectedQuality].playUrl
    : src;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.canPlayType('application/vnd.apple.mpegurl') || activeSrc.includes('.mp4')) {
      video.src = activeSrc;
    } else if (Hls.isSupported()) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
      const hls = new Hls({ enableWorker: true, lowLatencyMode: false, maxBufferLength: 30 });
      hlsRef.current = hls;
      hls.loadSource(activeSrc);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (autoPlay) video.play().catch(() => {});
        setIsBuffering(false);
      });
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) hls.destroy();
      });
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [activeSrc, autoPlay]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onDurationChange = () => setDuration(video.duration);
    const onWaiting = () => setIsBuffering(true);
    const onPlaying = () => setIsBuffering(false);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('durationchange', onDurationChange);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('playing', onPlaying);
    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('durationchange', onDurationChange);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('playing', onPlaying);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    video.paused ? video.play() : video.pause();
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    video.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
  };

  const formatTime = (s: number) => {
    if (!s || !isFinite(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return m + ':' + (sec < 10 ? '0' : '') + sec;
  };

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) el.requestFullscreen();
    else document.exitFullscreen();
  };

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(hideTimer.current);
    if (isPlaying) hideTimer.current = setTimeout(() => setShowControls(false), 3000);
  };

  const handleQualityChange = (dpi: number) => {
    const idx = qualities.findIndex(q => q.dpi === dpi);
    if (idx >= 0) {
      const video = videoRef.current;
      const time = video?.currentTime || 0;
      const wasPlaying = video && !video.paused;
      setSelectedQuality(idx);
      setTimeout(() => {
        const v = videoRef.current;
        if (v) {
          v.currentTime = time;
          if (wasPlaying) v.play();
        }
      }, 500);
    }
  };

  const qualityOptions = [...qualities].sort((a, b) => (b.dpi || 0) - (a.dpi || 0));
  const currentDpi = selectedQuality >= 0 ? qualities[selectedQuality]?.dpi : 0;

  return (
    <div
      ref={containerRef}
      className="relative bg-black rounded-xl overflow-hidden group"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        className="w-full aspect-video"
        poster={poster}
        onClick={togglePlay}
        playsInline
      />

      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-12 h-12 border-3 border-white/30 border-t-[#e63946] rounded-full animate-spin"></div>
        </div>
      )}

      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div
          className="w-full h-1 bg-white/20 cursor-pointer hover:h-2 transition-all"
          onClick={seek}
        >
          <div
            className="h-full bg-[#e63946] relative"
            style={{ width: duration ? (currentTime / duration) * 100 + '%' : '0%' }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#e63946] rounded-full"></div>
          </div>
        </div>

        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-3">
            <button onClick={togglePlay} className="text-white hover:text-[#e63946] transition-colors">
              {isPlaying ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6zm8 0h4v16h-4z"/></svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              )}
            </button>
            <span className="text-white text-sm font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {qualityOptions.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => {
                    const dd = document.getElementById('quality-dd');
                    if (dd) dd.classList.toggle('hidden');
                  }}
                  className="text-xs text-white bg-white/20 hover:bg-[#e63946] px-2 py-1 rounded transition-colors font-bold"
                >
                  {currentDpi > 0 ? currentDpi + 'p' : 'AUTO'}
                </button>
                <div id="quality-dd" className="hidden absolute bottom-full right-0 mb-2 bg-[#1a1a2e] border border-white/10 rounded-lg overflow-hidden shadow-xl min-w-[120px]">
                  {qualityOptions.map((q) => (
                    <button
                      key={q.dpi}
                      onClick={() => {
                        handleQualityChange(q.dpi);
                        document.getElementById('quality-dd')?.classList.add('hidden');
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${q.dpi === currentDpi ? 'text-[#e63946] bg-white/5' : 'text-white'}`}
                    >
                      {q.dpi > 0 ? q.dpi + 'p' : 'Auto'} <span className="text-[10px] text-gray-500">{q.encode}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <button onClick={() => { const v = videoRef.current; if (v) v.muted = !v.muted; }} className="text-white hover:text-[#e63946] transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
            </button>
            <button onClick={toggleFullscreen} className="text-white hover:text-[#e63946] transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
