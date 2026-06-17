'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
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
  title?: string;
  onEnded?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}

export default function HlsPlayer({ src, poster, qualities = [], autoPlay = false, title, onEnded, onPrev, onNext }: HlsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const seekIndicatorRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const [selectedQuality, setSelectedQuality] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [isBuffering, setIsBuffering] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [seekIndicator, setSeekIndicator] = useState<'forward' | 'backward' | null>(null);
  const [isPiP, setIsPiP] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeSrc = qualities.length > 0 && selectedQuality >= 0
    ? qualities[selectedQuality].playUrl
    : src;

  // Initialize HLS
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !activeSrc) return;
    setError(null);

    if (video.canPlayType('application/vnd.apple.mpegurl') || activeSrc.includes('.mp4')) {
      video.src = activeSrc;
      if (autoPlay) video.play().catch(() => {});
      setIsBuffering(false);
    } else if (Hls.isSupported()) {
      if (hlsRef.current) hlsRef.current.destroy();
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        startLevel: -1,
      });
      hlsRef.current = hls;
      hls.loadSource(activeSrc);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (autoPlay) video.play().catch(() => {});
        setIsBuffering(false);
      });
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            setError('Playback error. Try a different quality.');
            hls.destroy();
          }
        }
      });
    } else {
      video.src = activeSrc;
      setIsBuffering(false);
    }

    return () => { if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; } };
  }, [activeSrc, autoPlay]);

  // Video events
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const handlers = {
      play: () => setIsPlaying(true),
      pause: () => setIsPlaying(false),
      timeupdate: () => setCurrentTime(v.currentTime),
      durationchange: () => setDuration(v.duration),
      waiting: () => setIsBuffering(true),
      playing: () => { setIsBuffering(false); setError(null); },
      volumechange: () => { setVolume(v.volume); setIsMuted(v.muted); },
      ended: () => { setIsPlaying(false); onEnded?.(); },
      progress: () => {
        if (v.buffered.length > 0) setBuffered(v.buffered.end(v.buffered.length - 1));
      },
    };
    Object.entries(handlers).forEach(([e, h]) => v.addEventListener(e, h));
    return () => Object.entries(handlers).forEach(([e, h]) => v.removeEventListener(e, h));
  }, [onEnded]);

  // Fullscreen change detection
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // PiP change detection
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const enter = () => setIsPiP(true);
    const leave = () => setIsPiP(false);
    v.addEventListener('enterpictureinpicture', enter);
    v.addEventListener('leavepictureinpicture', leave);
    return () => { v.removeEventListener('enterpictureinpicture', enter); v.removeEventListener('leavepictureinpicture', leave); };
  }, []);

  // Orientation detection
  useEffect(() => {
    const handler = () => setIsLandscape(window.innerWidth > window.innerHeight);
    handler();
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // Auto-hide controls
  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    clearTimeout(hideTimer.current);
    if (isPlaying) hideTimer.current = setTimeout(() => setShowControls(false), 3000);
  }, [isPlaying]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      const v = videoRef.current;
      if (!v) return;
      switch (e.key) {
        case ' ':
        case 'k': e.preventDefault(); v.paused ? v.play() : v.pause(); break;
        case 'ArrowLeft': e.preventDefault(); v.currentTime = Math.max(0, v.currentTime - 10); showSeekIndicator('backward'); break;
        case 'ArrowRight': e.preventDefault(); v.currentTime = Math.min(duration, v.currentTime + 10); showSeekIndicator('forward'); break;
        case 'ArrowUp': e.preventDefault(); v.volume = Math.min(1, v.volume + 0.1); break;
        case 'ArrowDown': e.preventDefault(); v.volume = Math.max(0, v.volume - 0.1); break;
        case 'f': e.preventDefault(); toggleFullscreen(); break;
        case 'm': e.preventDefault(); v.muted = !v.muted; break;
        case 'p': e.preventDefault(); togglePiP(); break;
      }
      resetHideTimer();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [duration, resetHideTimer]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    v.paused ? v.play() : v.pause();
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    if (!v || !duration || !progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    v.currentTime = pct * duration;
  };

  const showSeekIndicator = (dir: 'forward' | 'backward') => {
    setSeekIndicator(dir);
    setTimeout(() => setSeekIndicator(null), 600);
  };

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  };

  const togglePiP = async () => {
    const v = videoRef.current;
    if (!v) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await v.requestPictureInPicture();
      }
    } catch {}
  };

  const changeQuality = (dpi: number) => {
    const idx = qualities.findIndex(q => q.dpi === dpi);
    if (idx < 0) return;
    const v = videoRef.current;
    const time = v?.currentTime || 0;
    const wasPlaying = v && !v.paused;
    setSelectedQuality(idx);
    setShowQualityMenu(false);
    setShowSettings(false);
    setTimeout(() => {
      const nv = videoRef.current;
      if (nv) {
        nv.currentTime = time;
        if (wasPlaying) nv.play();
      }
    }, 300);
  };

  const changePlaybackRate = (rate: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSettings(false);
  };

  // Touch gesture for seek
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const dt = Date.now() - touchStartRef.current.time;
    const v = videoRef.current;

    // Double-tap detection (fast tap with minimal movement)
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10 && dt < 300) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const x = touch.clientX - rect.left;
        const mid = rect.width / 2;
        if (v) {
          if (x < mid) {
            v.currentTime = Math.max(0, v.currentTime - 10);
            showSeekIndicator('backward');
          } else {
            v.currentTime = Math.min(duration, v.currentTime + 10);
            showSeekIndicator('forward');
          }
        }
      }
      touchStartRef.current = null;
      return;
    }

    // Swipe horizontal: seek
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) && v && duration) {
      const seekAmount = (dx / 200) * 30; // 30s per 200px
      v.currentTime = Math.max(0, Math.min(duration, v.currentTime + seekAmount));
      showSeekIndicator(dx > 0 ? 'forward' : 'backward');
    }

    touchStartRef.current = null;
  };

  const formatTime = (s: number) => {
    if (!s || !isFinite(s)) return '0:00';
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = Math.floor(s % 60);
    if (h > 0) return `${h}:${m < 10 ? '0' : ''}${m}:${sec < 10 ? '0' : ''}${sec}`;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const progressPct = duration ? (currentTime / duration) * 100 : 0;
  const bufferPct = duration ? (buffered / duration) * 100 : 0;
  const sortedQualities = [...qualities].sort((a, b) => (b.dpi || 0) - (a.dpi || 0));
  const currentDpi = selectedQuality >= 0 ? qualities[selectedQuality]?.dpi : 0;

  return (
    <div
      ref={containerRef}
      className={`relative bg-black overflow-hidden select-none ${isFullscreen ? 'w-screen h-screen' : 'rounded-xl'}`}
      onMouseMove={resetHideTimer}
      onMouseLeave={() => { if (isPlaying) setShowControls(false); setShowQualityMenu(false); setShowSettings(false); }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Video */}
      <video
        ref={videoRef}
        className={`w-full ${isFullscreen ? 'h-full object-contain' : 'aspect-video'}`}
        poster={poster}
        onClick={togglePlay}
        playsInline
        preload="metadata"
      />

      {/* Buffering spinner */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="w-14 h-14 border-[3px] border-white/20 border-t-[#e63946] rounded-full animate-spin" />
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-20">
          <div className="text-center px-6">
            <svg className="w-12 h-12 text-[#e63946] mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-white text-sm mb-3">{error}</p>
            <button onClick={() => { setError(null); if (hlsRef.current) hlsRef.current.startLoad(); }} className="px-4 py-2 bg-[#e63946] text-white rounded-lg text-sm font-medium">Retry</button>
          </div>
        </div>
      )}

      {/* Seek indicator */}
      {seekIndicator && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div ref={seekIndicatorRef} className={`flex items-center gap-1 bg-black/60 px-4 py-2 rounded-full animate-fade-in-out ${seekIndicator === 'forward' ? 'ml-20' : 'mr-20'}`}>
            {seekIndicator === 'forward' ? (
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z" /></svg>
            ) : (
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z" /></svg>
            )}
            <span className="text-white text-sm font-medium">10s</span>
          </div>
        </div>
      )}

      {/* Title bar (top) */}
      {showControls && title && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent px-4 py-3 flex items-center gap-3 z-10 transition-opacity duration-300">
          <button onClick={() => window.history.back()} className="text-white/80 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <span className="text-white text-sm font-medium truncate flex-1">{title}</span>
        </div>
      )}

      {/* Big play button (center, when paused and not buffering) */}
      {!isPlaying && !isBuffering && !error && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="w-16 h-16 bg-[#e63946]/90 rounded-full flex items-center justify-center shadow-lg shadow-[#e63946]/30 backdrop-blur-sm">
            <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
          </div>
        </div>
      )}

      {/* Bottom controls */}
      <div className={`absolute bottom-0 left-0 right-0 z-10 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {/* Gradient bg */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent pointer-events-none" />

        <div className="relative px-3 pb-3 pt-10">
          {/* Progress bar */}
          <div
            ref={progressRef}
            className="w-full h-6 flex items-center cursor-pointer group -mt-2 mb-1"
            onClick={seek}
          >
            <div className="w-full h-1 group-hover:h-2 bg-white/20 rounded-full relative transition-all overflow-hidden">
              {/* Buffered */}
              <div className="absolute h-full bg-white/30 rounded-full" style={{ width: bufferPct + '%' }} />
              {/* Progress */}
              <div className="absolute h-full bg-[#e63946] rounded-full flex items-center justify-end" style={{ width: progressPct + '%' }}>
                <div className="w-4 h-4 bg-[#e63946] rounded-full shadow-lg shadow-[#e63946]/50 -mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>

          {/* Controls row */}
          <div className="flex items-center justify-between">
            {/* Left controls */}
            <div className="flex items-center gap-2">
              {onPrev && (
                <button onClick={onPrev} className="text-white/70 hover:text-white p-1 transition-colors" title="Previous">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg>
                </button>
              )}
              <button onClick={togglePlay} className="text-white hover:text-[#e63946] p-1 transition-colors" title={isPlaying ? 'Pause' : 'Play'}>
                {isPlaying ? (
                  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>
                ) : (
                  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                )}
              </button>
              {onNext && (
                <button onClick={onNext} className="text-white/70 hover:text-white p-1 transition-colors" title="Next">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
                </button>
              )}
              <span className="text-white/80 text-xs font-mono ml-1 hidden sm:inline">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-1.5">
              {/* Speed */}
              <button
                onClick={() => { setShowSettings(!showSettings); setShowQualityMenu(false); }}
                className="text-white/80 hover:text-white text-xs font-bold px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors hidden sm:block"
              >
                {playbackRate}x
              </button>

              {/* Quality */}
              {sortedQualities.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => { setShowQualityMenu(!showQualityMenu); setShowSettings(false); }}
                    className="text-white/90 hover:text-white text-xs font-bold px-2.5 py-1 rounded bg-white/15 hover:bg-[#e63946] transition-colors"
                  >
                    {currentDpi > 0 ? currentDpi + 'p' : 'AUTO'}
                  </button>
                  {showQualityMenu && (
                    <div className="absolute bottom-full right-0 mb-2 bg-[#1a1a2e]/95 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-2xl min-w-[140px] animate-in fade-in slide-in-from-bottom-2">
                      <div className="px-3 py-2 text-[10px] text-gray-500 font-bold uppercase tracking-wider border-b border-white/5">Quality</div>
                      <button
                        onClick={() => { setSelectedQuality(-1); setShowQualityMenu(false); }}
                        className={`w-full text-left px-3 py-2.5 text-sm hover:bg-white/10 transition-colors ${selectedQuality < 0 ? 'text-[#e63946] bg-white/5' : 'text-white'}`}
                      >
                        <span className="flex items-center justify-between">
                          <span>Auto</span>
                          {selectedQuality < 0 && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>}
                        </span>
                      </button>
                      {sortedQualities.map(q => (
                        <button
                          key={q.dpi}
                          onClick={() => changeQuality(q.dpi)}
                          className={`w-full text-left px-3 py-2.5 text-sm hover:bg-white/10 transition-colors ${q.dpi === currentDpi ? 'text-[#e63946] bg-white/5' : 'text-white'}`}
                        >
                          <span className="flex items-center justify-between">
                            <span>{q.dpi}p <span className="text-[10px] text-gray-500 ml-1">{q.encode}</span></span>
                            {q.dpi === currentDpi && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Settings (mobile) */}
              <div className="relative sm:hidden">
                <button
                  onClick={() => { setShowSettings(!showSettings); setShowQualityMenu(false); }}
                  className="text-white/80 hover:text-white p-1 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.488.488 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" /></svg>
                </button>
                {showSettings && (
                  <div className="absolute bottom-full right-0 mb-2 bg-[#1a1a2e]/95 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-2xl min-w-[160px] animate-in fade-in">
                    <div className="px-3 py-2 text-[10px] text-gray-500 font-bold uppercase tracking-wider border-b border-white/5">Speed</div>
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                      <button key={rate} onClick={() => changePlaybackRate(rate)}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${playbackRate === rate ? 'text-[#e63946]' : 'text-white'}`}>
                        {rate === 1 ? 'Normal' : rate + 'x'}
                        {playbackRate === rate && <svg className="w-3 h-3 inline ml-2" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Volume (desktop only) */}
              <div className="hidden sm:flex items-center gap-1 group/vol">
                <button onClick={() => { const v = videoRef.current; if (v) v.muted = !v.muted; }} className="text-white/80 hover:text-white p-1 transition-colors">
                  {isMuted || volume === 0 ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0021 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 003.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" /></svg>
                  ) : volume < 0.5 ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" /></svg>
                  )}
                </button>
              </div>

              {/* PiP */}
              <button onClick={togglePiP} className="text-white/80 hover:text-white p-1 transition-colors hidden sm:block" title="Picture in Picture">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16.01H3V4.98h18v14.03z" /></svg>
              </button>

              {/* Fullscreen */}
              <button onClick={toggleFullscreen} className="text-white/80 hover:text-white p-1 transition-colors" title="Fullscreen">
                {isFullscreen ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" /></svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: time overlay */}
      {!showControls && (
        <div className="absolute top-3 right-3 bg-black/60 px-2 py-1 rounded text-white/70 text-xs font-mono z-10 sm:hidden">
          {formatTime(currentTime)}
        </div>
      )}
    </div>
  );
}
