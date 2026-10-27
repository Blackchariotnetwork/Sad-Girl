import React, { useState, useRef, useEffect } from 'react';
import { VideoItem, DanmakuComment } from '../types';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Sliders,
  Send,
  ThumbsUp,
  Share2,
  Bookmark,
  BookmarkCheck,
  Cpu,
  Radio,
  ArrowLeft,
  ExternalLink,
  Flame,
  Zap,
} from 'lucide-react';

interface WatchPageProps {
  video: VideoItem;
  onBackToHome: () => void;
  onSelectRelated: (video: VideoItem) => void;
  allVideos: VideoItem[];
  isSaved: boolean;
  onToggleSave: (video: VideoItem) => void;
}

export const WatchPage: React.FC<WatchPageProps> = ({
  video,
  onBackToHome,
  onSelectRelated,
  allVideos,
  isSaved,
  onToggleSave,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(video.durationSec || 100);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [resolution, setResolution] = useState<'4K' | '1080P' | '720P'>(video.resolution);
  const [likes, setLikes] = useState(video.likes);
  const [hasLiked, setHasLiked] = useState(false);

  // Danmaku comments
  const [showDanmaku, setShowDanmaku] = useState(true);
  const [danmakuList, setDanmakuList] = useState<DanmakuComment[]>(video.danmakuComments);
  const [newCommentText, setNewCommentText] = useState('');
  const [activeDanmaku, setActiveDanmaku] = useState<
    Array<{ id: string; text: string; top: number; color?: string }>
  >([]);

  // Telemetry HUD
  const [showTelemetry, setShowTelemetry] = useState(false);

  // Scroll to top when video changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentTime(0);
    setIsPlaying(true);
    setDanmakuList(video.danmakuComments);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [video.id]);

  // Video time update & Danmaku triggering
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const curr = videoRef.current.currentTime;
    setCurrentTime(curr);

    const matching = danmakuList.filter(
      (d) => Math.abs(d.time - curr) < 0.35 && !activeDanmaku.some((a) => a.id === d.id)
    );

    if (matching.length > 0) {
      const spawned = matching.map((m) => ({
        id: m.id,
        text: m.text,
        top: 15 + Math.random() * 65,
        color: m.color || '#05d9e8',
      }));
      setActiveDanmaku((prev) => [...prev, ...spawned]);

      setTimeout(() => {
        setActiveDanmaku((prev) => prev.filter((a) => !spawned.some((s) => s.id === a.id)));
      }, 6000);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setCurrentTime(val);
    if (videoRef.current) {
      videoRef.current.currentTime = val;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.muted = false;
      setIsMuted(false);
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    if (videoRef.current) {
      videoRef.current.playbackRate = newSpeed;
    }
  };

  const handleSendDanmaku = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const colors = ['#05d9e8', '#ff2a6d', '#ffb703', '#39ff14'];
    const chosenColor = colors[Math.floor(Math.random() * colors.length)];

    const newDanmaku: DanmakuComment = {
      id: 'd-usr-' + Date.now(),
      time: currentTime,
      text: newCommentText.trim(),
      user: 'Rider',
      color: chosenColor,
    };

    setDanmakuList((prev) => [...prev, newDanmaku]);
    setActiveDanmaku((prev) => [
      ...prev,
      {
        id: newDanmaku.id,
        text: newDanmaku.text,
        top: 20 + Math.random() * 50,
        color: chosenColor,
      },
    ]);
    setNewCommentText('');
  };

  const handleLike = () => {
    if (hasLiked) {
      setLikes((prev) => prev - 1);
      setHasLiked(false);
    } else {
      setLikes((prev) => prev + 1);
      setHasLiked(true);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const relatedVideos = allVideos.filter((v) => v.id !== video.id).slice(0, 5);

  return (
    <div className="max-w-[1920px] mx-auto w-full px-4 py-4 space-y-4 font-mono text-neutral-200">
      {/* Navigation Breadcrumb Bar with Cyan Neon Edge */}
      <div className="flex items-center justify-between text-xs bg-[#090b14]/90 border border-neutral-800 px-3.5 py-2.5 shadow-md">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-2 font-bold text-cyan-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>RETURN TO 5-COL MATRIX // 単車一覧へ戻る</span>
        </button>

        <div className="flex items-center gap-3 text-neutral-400 text-[11px]">
          <span className="text-pink-400 font-semibold">STREAM_NODE: [{video.id}]</span>
          <span>•</span>
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            AV1_4K_STREAMING
          </span>
        </div>
      </div>

      {/* Main Watch Page Container */}
      <div className="bg-[#0b0d18]/95 border-2 border-neutral-800 shadow-[0_0_30px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col">
        {/* Terminal Header Bar */}
        <div className="bg-[#070912] text-white px-3.5 py-2.5 flex items-center justify-between text-xs select-none border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500 inline-block shadow-[0_0_6px_#ff2a6d]" />
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block shadow-[0_0_6px_#05d9e8]" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block shadow-[0_0_6px_#34d399]" />
            <span className="ml-2 font-bold tracking-wider text-cyan-300">
              KUROGANE_MOTORCYCLE_THEATER // [{video.id}]
            </span>
            <span className="hidden sm:inline text-neutral-400 text-[10px]">
              - {video.title}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowTelemetry(!showTelemetry)}
              className="text-[10px] text-cyan-400 hover:text-white px-2 py-0.5 border border-cyan-800/80 bg-cyan-950/40 flex items-center gap-1 cursor-pointer"
            >
              <Cpu className="w-3 h-3 text-pink-500" />
              <span>{showTelemetry ? 'HIDE_STATS' : 'STREAM_STATS'}</span>
            </button>

            <a
              href={`?v=${video.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-neutral-300 hover:text-cyan-400 px-2 py-0.5 border border-neutral-700 bg-neutral-900 flex items-center gap-1"
              title="Open stream in separate browser tab"
            >
              <ExternalLink className="w-3 h-3" />
              <span>NEW_TAB</span>
            </a>
          </div>
        </div>

        {/* Video Player Box */}
        <div className="relative aspect-video bg-black overflow-hidden group">
          <video
            ref={videoRef}
            src={video.videoUrl}
            autoPlay
            playsInline
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={() => {
              if (videoRef.current) setDuration(videoRef.current.duration);
            }}
            onEnded={() => setIsPlaying(false)}
            onClick={togglePlay}
            className="w-full h-full object-contain cursor-pointer"
          />

          {/* Danmaku Floating Bullet Comments Overlay */}
          {showDanmaku && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
              {activeDanmaku.map((dan) => (
                <div
                  key={dan.id}
                  className="absolute whitespace-nowrap text-sm sm:text-base font-black drop-shadow-[0_2px_8px_rgba(0,0,0,1)] font-mono tracking-wider"
                  style={{
                    top: `${dan.top}%`,
                    color: dan.color || '#05d9e8',
                    textShadow: `0 0 10px ${dan.color || '#05d9e8'}`,
                    animation: 'danmakuScroll 6s linear forwards',
                  }}
                >
                  {dan.text}
                </div>
              ))}
            </div>
          )}

          <style>{`
            @keyframes danmakuScroll {
              0% { transform: translateX(100vw); }
              100% { transform: translateX(-100%); }
            }
          `}</style>

          {/* Stream Telemetry HUD Drawer */}
          {showTelemetry && (
            <div className="absolute top-3 left-3 bg-[#070912]/92 backdrop-blur-md border border-cyan-500/50 p-3 text-[10px] text-neutral-300 font-mono space-y-1.5 z-20 pointer-events-none shadow-2xl">
              <div className="text-cyan-400 font-bold flex items-center gap-1.5 border-b border-neutral-800 pb-1">
                <Radio className="w-3 h-3 text-pink-500 animate-pulse" />
                REALTIME BUFFER TELEMETRY
              </div>
              <div>CODEC: AV1 // OPUS 48kHz [HDR10]</div>
              <div>RESOLUTION: {resolution} (60.00 FPS)</div>
              <div>BITRATE: {video.bitrate}</div>
              <div>NODE: TOKYO-C1-YAMATE-04</div>
              <div>DROPPED FRAMES: 0 / 24,100</div>
              <div>LATENCY: 8.2ms // JITTER: 0.4ms</div>
            </div>
          )}

          {/* Video Controls Bar Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/85 to-transparent p-3.5 text-white font-mono opacity-95 group-hover:opacity-100 transition-opacity">
            {/* Timeline Track with neon glow */}
            <div className="relative mb-2">
              <input
                type="range"
                min="0"
                max={duration || 100}
                step="0.1"
                value={currentTime}
                onChange={handleSeek}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-neutral-800 rounded-none shadow-[0_0_8px_#05d9e8]"
              />
            </div>

            {/* Control Buttons Row */}
            <div className="flex items-center justify-between text-xs gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  className="p-1 hover:text-cyan-400 transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 fill-current text-cyan-400" />
                  ) : (
                    <Play className="w-4 h-4 fill-current text-cyan-400" />
                  )}
                </button>

                {/* Volume Slider */}
                <div className="flex items-center gap-1.5">
                  <button onClick={toggleMute} className="hover:text-cyan-400">
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-16 accent-cyan-400 h-1 bg-neutral-800"
                  />
                </div>

                {/* Time Stamp */}
                <div className="text-[11px] text-neutral-300 font-mono">
                  <span className="font-bold text-cyan-300">{formatTime(currentTime)}</span>
                  <span className="text-neutral-600"> / </span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px]">
                {/* Danmaku toggle */}
                <button
                  onClick={() => setShowDanmaku(!showDanmaku)}
                  className={`px-2 py-0.5 border text-[10px] ${
                    showDanmaku
                      ? 'border-pink-500 text-pink-300 bg-pink-950/60 shadow-[0_0_8px_rgba(255,42,109,0.4)]'
                      : 'border-neutral-700 text-neutral-500'
                  }`}
                  title="Toggle Danmaku Bullet Comments"
                >
                  弾幕 // DANMAKU: {showDanmaku ? 'ON' : 'OFF'}
                </button>

                {/* Speed selector */}
                <select
                  value={speed}
                  onChange={(e) => handleSpeedChange(Number(e.target.value))}
                  className="bg-[#090b14] border border-neutral-700 px-1 py-0.5 text-white text-[10px] focus:outline-none"
                >
                  <option value="0.5">0.5x</option>
                  <option value="1">1.0x</option>
                  <option value="1.5">1.5x</option>
                  <option value="2">2.0x</option>
                </select>

                {/* Resolution selector */}
                <div className="flex border border-neutral-700 bg-neutral-900 text-[10px]">
                  {(['720P', '1080P', '4K'] as const).map((res) => (
                    <button
                      key={res}
                      onClick={() => setResolution(res)}
                      className={`px-1.5 py-0.5 ${
                        resolution === res
                          ? 'bg-cyan-500 text-black font-black'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      {res}
                    </button>
                  ))}
                </div>

                {/* Fullscreen */}
                <button
                  onClick={() => {
                    if (videoRef.current) {
                      if (document.fullscreenElement) {
                        document.exitFullscreen();
                      } else {
                        videoRef.current.requestFullscreen();
                      }
                    }
                  }}
                  className="p-1 hover:text-cyan-400"
                  title="Fullscreen"
                >
                  <Maximize className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Danmaku Input Bar */}
        <form
          onSubmit={handleSendDanmaku}
          className="flex items-center border-t border-b border-neutral-800 bg-[#070912] p-2 text-xs font-mono"
        >
          <div className="px-2 text-pink-400 text-[11px] font-bold shrink-0 flex items-center gap-1">
            <Flame className="w-3 h-3 text-pink-500" />
            弾幕 FIRE:
          </div>
          <input
            type="text"
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            placeholder="Send colorful flying commentary (e.g. 'C1ループ最高速!', 'マフラー音たまらん')..."
            className="flex-1 px-2 py-1 bg-transparent text-xs text-white focus:outline-none placeholder:text-neutral-500 font-mono"
          />
          <button
            type="submit"
            className="px-4 py-1.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white text-xs flex items-center gap-1 font-bold transition-all cursor-pointer shadow-[0_0_10px_rgba(255,42,109,0.5)]"
          >
            <Send className="w-3 h-3" />
            <span>SHOOT</span>
          </button>
        </form>

        {/* Video Info Section */}
        <div className="p-4 space-y-4 bg-[#0a0c16]">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <h1 className="text-lg sm:text-xl font-black text-white leading-snug tracking-tight">
                {video.title}
              </h1>
              <div className="text-xs text-cyan-400 jp-font mt-1 font-medium">
                {video.titleJp}
              </div>
              <div className="flex items-center gap-3 text-[11px] text-neutral-400 mt-2.5">
                <span className="font-bold text-white">
                  {video.views.toLocaleString()} VIEWS
                </span>
                <span>•</span>
                <span>UPLOADED {video.uploadDate}</span>
                <span>•</span>
                <span className="bg-pink-950/60 text-pink-300 border border-pink-800 px-1.5 py-0.2 font-semibold">
                  #{video.category}
                </span>
                <span>•</span>
                <span className="text-cyan-400 font-semibold">{video.bitrate}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleLike}
                className={`px-3 py-1.5 border text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                  hasLiked
                    ? 'border-pink-500 text-pink-400 bg-pink-950/60 font-bold shadow-[0_0_10px_rgba(255,42,109,0.4)]'
                    : 'border-neutral-700 hover:border-pink-500 text-neutral-200 bg-[#0e1122]'
                }`}
              >
                <ThumbsUp className={`w-3.5 h-3.5 ${hasLiked ? 'fill-current text-pink-500' : ''}`} />
                <span>{likes.toLocaleString()}</span>
              </button>

              <button
                onClick={() => onToggleSave(video)}
                className={`px-3 py-1.5 border text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isSaved
                    ? 'border-cyan-400 text-cyan-300 bg-cyan-950/60 font-bold shadow-[0_0_10px_rgba(5,217,232,0.4)]'
                    : 'border-neutral-700 hover:border-cyan-400 text-neutral-200 bg-[#0e1122]'
                }`}
              >
                {isSaved ? (
                  <BookmarkCheck className="w-3.5 h-3.5 text-cyan-400" />
                ) : (
                  <Bookmark className="w-3.5 h-3.5" />
                )}
                <span>{isSaved ? 'QUEUED' : 'SAVE'}</span>
              </button>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Video page link copied to clipboard!');
                }}
                className="px-3 py-1.5 border border-neutral-700 hover:border-white text-xs flex items-center gap-1.5 text-neutral-300 bg-[#0e1122] cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>SHARE</span>
              </button>
            </div>
          </div>

          {/* Channel Info */}
          <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={video.channel.avatar}
                alt={video.channel.name}
                className="w-10 h-10 border border-cyan-500/50 object-cover shadow-[0_0_10px_rgba(5,217,232,0.3)]"
              />
              <div>
                <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                  <span>{video.channel.name}</span>
                  {video.channel.verified && (
                    <span className="text-[9px] text-cyan-400 font-bold">[VERIFIED]</span>
                  )}
                </div>
                <div className="text-[10px] text-neutral-400">
                  {video.channel.handle} • 260K riders
                </div>
              </div>
            </div>

            <button className="px-4 py-1.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white text-xs font-bold transition-all cursor-pointer shadow-[0_0_12px_rgba(255,42,109,0.5)]">
              SUBSCRIBE // 単車登録
            </button>
          </div>

          {/* Description */}
          <p className="text-xs text-neutral-300 leading-relaxed pt-2 border-t border-neutral-800/80">
            {video.description}
          </p>
        </div>
      </div>

      {/* 5-VIDEO RECOMMENDATIONS MATRIX */}
      <div className="bg-[#0b0d18]/90 border border-neutral-800 p-4 space-y-3 font-mono">
        <div className="flex items-center justify-between text-xs font-bold text-cyan-400">
          <div className="flex items-center gap-2">
            <span>RECOMMENDED STREAMS // 関連推奨単車 [5-COL MATRIX]</span>
          </div>
          <span className="text-[10px] text-neutral-500 font-normal">
            SELECT A NODE TO NAVIGATE TO NEW STREAM
          </span>
        </div>

        {/* 5 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {relatedVideos.map((rel) => (
            <a
              key={rel.id}
              href={`?v=${rel.id}`}
              onClick={(e) => {
                if (!e.metaKey && !e.ctrlKey) {
                  e.preventDefault();
                  onSelectRelated(rel);
                }
              }}
              className="group block bg-[#070912] border border-neutral-800 hover:border-cyan-400 p-2 transition-all hover:bg-[#0e1124] shadow-md"
            >
              <div className="relative aspect-video bg-black overflow-hidden mb-2">
                <img
                  src={rel.thumbnailUrl}
                  alt={rel.title}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform"
                />
                <span className="absolute bottom-1 right-1 bg-black/90 text-cyan-300 text-[8px] px-1 font-bold">
                  {rel.duration}
                </span>
                <span className="absolute top-1 left-1 bg-black/80 text-pink-400 text-[8px] px-1 font-bold">
                  {rel.resolution}
                </span>
              </div>
              <h4 className="text-[11px] font-bold text-white line-clamp-2 leading-tight group-hover:text-cyan-300">
                {rel.title}
              </h4>
              <div className="text-[9px] text-neutral-400 jp-font mt-1 line-clamp-1">
                {rel.titleJp}
              </div>
              <div className="text-[9px] text-neutral-500 mt-2 pt-1 border-t border-neutral-800 flex justify-between">
                <span className="text-neutral-400">{rel.channel.name}</span>
                <span className="text-pink-400 font-semibold">{rel.views.toLocaleString()}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
