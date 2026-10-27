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
  Eye,
  CheckCircle2,
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
        color: m.color || '#ffffff',
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

    const newDanmaku: DanmakuComment = {
      id: 'd-usr-' + Date.now(),
      time: currentTime,
      text: newCommentText.trim(),
      user: 'You',
      color: '#ff0055',
    };

    setDanmakuList((prev) => [...prev, newDanmaku]);
    setActiveDanmaku((prev) => [
      ...prev,
      {
        id: newDanmaku.id,
        text: newDanmaku.text,
        top: 20 + Math.random() * 50,
        color: '#ff0055',
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
    <div className="max-w-[1920px] mx-auto w-full px-4 py-4 space-y-4 font-mono">
      {/* Navigation Breadcrumb Bar */}
      <div className="flex items-center justify-between text-xs bg-white/90 border border-neutral-200 px-3 py-2 shadow-xs">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-2 font-bold text-neutral-900 hover:text-black hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>RETURN TO 5-COL MATRIX // 全動画一覧へ戻る</span>
        </button>

        <div className="flex items-center gap-3 text-neutral-500 text-[11px]">
          <span>STREAM_ID: [{video.id}]</span>
          <span>•</span>
          <span className="text-emerald-600 font-bold">STATUS: 4K STREAMING</span>
        </div>
      </div>

      {/* Main Watch Page Container */}
      <div className="bg-white border-2 border-black shadow-xl overflow-hidden flex flex-col">
        {/* Terminal Header Bar */}
        <div className="bg-neutral-900 text-white px-3 py-2 flex items-center justify-between text-xs select-none">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-red-500 inline-block" />
            <span className="w-2.5 h-2.5 bg-yellow-500 inline-block" />
            <span className="w-2.5 h-2.5 bg-green-500 inline-block" />
            <span className="ml-2 font-bold tracking-wider text-neutral-200">
              KUROGANE_WATCH_THEATER // [{video.id}]
            </span>
            <span className="hidden sm:inline text-neutral-400 text-[10px]">
              - {video.title}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowTelemetry(!showTelemetry)}
              className="text-[10px] text-neutral-300 hover:text-white px-2 py-0.5 border border-neutral-700 bg-neutral-800 flex items-center gap-1 cursor-pointer"
            >
              <Cpu className="w-3 h-3 text-emerald-400" />
              <span>{showTelemetry ? 'HIDE_STATS' : 'STREAM_STATS'}</span>
            </button>

            <a
              href={`?v=${video.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-neutral-300 hover:text-white px-2 py-0.5 border border-neutral-700 bg-neutral-800 flex items-center gap-1"
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
                  className="absolute whitespace-nowrap text-sm sm:text-base font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] font-mono"
                  style={{
                    top: `${dan.top}%`,
                    color: dan.color || '#ffffff',
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
            <div className="absolute top-3 left-3 bg-black/90 backdrop-blur-md border border-neutral-700 p-3 text-[10px] text-neutral-300 font-mono space-y-1.5 z-20 pointer-events-none">
              <div className="text-emerald-400 font-bold flex items-center gap-1.5 border-b border-neutral-800 pb-1">
                <Radio className="w-3 h-3 animate-pulse" />
                REALTIME BUFFER TELEMETRY
              </div>
              <div>CODEC: AV1 // OPUS 48kHz [HDR10]</div>
              <div>RESOLUTION: {resolution} (60.00 FPS)</div>
              <div>BITRATE: {video.bitrate}</div>
              <div>NODE: TOKYO-WEST-C1-04</div>
              <div>DROPPED FRAMES: 0 / 18,400</div>
              <div>LATENCY: 9.4ms // JITTER: 0.6ms</div>
            </div>
          )}

          {/* Video Controls Bar Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-3 text-white font-mono opacity-95 group-hover:opacity-100 transition-opacity">
            {/* Timeline Track */}
            <div className="relative mb-2">
              <input
                type="range"
                min="0"
                max={duration || 100}
                step="0.1"
                value={currentTime}
                onChange={handleSeek}
                className="w-full accent-white cursor-pointer h-1.5 bg-neutral-700 rounded-none"
              />
            </div>

            {/* Control Buttons Row */}
            <div className="flex items-center justify-between text-xs gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  className="p-1 hover:text-neutral-300 transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current" />
                  )}
                </button>

                {/* Volume Slider */}
                <div className="flex items-center gap-1.5">
                  <button onClick={toggleMute} className="hover:text-neutral-300">
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
                    className="w-16 accent-white h-1 bg-neutral-700"
                  />
                </div>

                {/* Time Stamp */}
                <div className="text-[11px] text-neutral-300 font-mono">
                  <span className="font-bold text-white">{formatTime(currentTime)}</span>
                  <span className="text-neutral-500"> / </span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px]">
                {/* Danmaku toggle */}
                <button
                  onClick={() => setShowDanmaku(!showDanmaku)}
                  className={`px-1.5 py-0.5 border text-[10px] ${
                    showDanmaku
                      ? 'border-emerald-400 text-emerald-400 bg-emerald-950/40'
                      : 'border-neutral-600 text-neutral-400'
                  }`}
                  title="Toggle Danmaku Bullet Comments"
                >
                  弾幕 // DANMAKU: {showDanmaku ? 'ON' : 'OFF'}
                </button>

                {/* Speed selector */}
                <select
                  value={speed}
                  onChange={(e) => handleSpeedChange(Number(e.target.value))}
                  className="bg-neutral-800 border border-neutral-700 px-1 py-0.5 text-white text-[10px] focus:outline-none"
                >
                  <option value="0.5">0.5x</option>
                  <option value="1">1.0x</option>
                  <option value="1.5">1.5x</option>
                  <option value="2">2.0x</option>
                </select>

                {/* Resolution selector */}
                <div className="flex border border-neutral-700 bg-neutral-800 text-[10px]">
                  {(['720P', '1080P', '4K'] as const).map((res) => (
                    <button
                      key={res}
                      onClick={() => setResolution(res)}
                      className={`px-1.5 py-0.5 ${
                        resolution === res ? 'bg-white text-black font-bold' : 'text-neutral-400'
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
                  className="p-1 hover:text-neutral-300"
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
          className="flex items-center border-t border-b border-neutral-300 bg-white p-1.5 text-xs font-mono shadow-xs"
        >
          <div className="px-2 text-neutral-600 text-[11px] font-bold shrink-0">
            弾幕 SEND:
          </div>
          <input
            type="text"
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            placeholder="Fire bullet commentary across the screen (e.g. '高速走行カッコいい!', '4K最高')..."
            className="flex-1 px-2 py-1 bg-transparent text-xs text-neutral-900 focus:outline-none placeholder:text-neutral-400"
          />
          <button
            type="submit"
            className="px-4 py-1.5 bg-black hover:bg-neutral-800 text-white text-xs flex items-center gap-1 font-bold transition-colors cursor-pointer"
          >
            <Send className="w-3 h-3" />
            <span>FIRE</span>
          </button>
        </form>

        {/* Video Info Section */}
        <div className="p-4 space-y-4 bg-white">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <h1 className="text-lg sm:text-xl font-black text-neutral-950 leading-snug tracking-tight">
                {video.title}
              </h1>
              <div className="text-xs text-neutral-600 jp-font mt-1 font-medium">
                {video.titleJp}
              </div>
              <div className="flex items-center gap-3 text-[11px] text-neutral-500 mt-2.5">
                <span className="font-bold text-neutral-900">
                  {video.views.toLocaleString()} VIEWS
                </span>
                <span>•</span>
                <span>UPLOADED {video.uploadDate}</span>
                <span>•</span>
                <span className="bg-neutral-100 text-neutral-800 px-1.5 py-0.2 font-semibold border border-neutral-200">
                  #{video.category}
                </span>
                <span>•</span>
                <span className="text-neutral-500 font-semibold">{video.bitrate}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleLike}
                className={`px-3 py-1.5 border text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                  hasLiked
                    ? 'border-red-600 text-red-600 bg-red-50 font-bold'
                    : 'border-neutral-300 hover:border-black text-neutral-800 bg-neutral-50'
                }`}
              >
                <ThumbsUp className={`w-3.5 h-3.5 ${hasLiked ? 'fill-current' : ''}`} />
                <span>{likes.toLocaleString()}</span>
              </button>

              <button
                onClick={() => onToggleSave(video)}
                className={`px-3 py-1.5 border text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isSaved
                    ? 'border-emerald-600 text-emerald-700 bg-emerald-50 font-bold'
                    : 'border-neutral-300 hover:border-black text-neutral-800 bg-neutral-50'
                }`}
              >
                {isSaved ? (
                  <BookmarkCheck className="w-3.5 h-3.5" />
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
                className="px-3 py-1.5 border border-neutral-300 hover:border-black text-xs flex items-center gap-1.5 text-neutral-800 bg-neutral-50 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>SHARE</span>
              </button>
            </div>
          </div>

          {/* Channel Info */}
          <div className="pt-3 border-t border-neutral-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={video.channel.avatar}
                alt={video.channel.name}
                className="w-10 h-10 border border-neutral-400 object-cover"
              />
              <div>
                <div className="flex items-center gap-1.5 font-bold text-xs text-neutral-900">
                  <span>{video.channel.name}</span>
                  {video.channel.verified && (
                    <span className="text-[9px] text-blue-600 font-bold">[VERIFIED]</span>
                  )}
                </div>
                <div className="text-[10px] text-neutral-500">
                  {video.channel.handle} • 148K subscribers
                </div>
              </div>
            </div>

            <button className="px-4 py-1.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold transition-colors cursor-pointer">
              SUBSCRIBE // チャンネル登録
            </button>
          </div>

          {/* Description */}
          <p className="text-xs text-neutral-700 leading-relaxed pt-2 border-t border-neutral-100">
            {video.description}
          </p>
        </div>
      </div>

      {/* 5-VIDEO RECOMMENDATIONS MATRIX */}
      <div className="bg-white border border-neutral-200 p-4 space-y-3 font-mono">
        <div className="flex items-center justify-between text-xs font-bold text-neutral-900">
          <div className="flex items-center gap-2">
            <span>RECOMMENDED STREAMS // 関連推奨動画 [5-COL MATRIX]</span>
          </div>
          <span className="text-[10px] text-neutral-500 font-normal">
            SELECT A NODE TO NAVIGATE TO NEW PAGE
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
              className="group block bg-neutral-50 border border-neutral-200 hover:border-black p-2 transition-all hover:bg-white shadow-xs"
            >
              <div className="relative aspect-video bg-neutral-900 overflow-hidden mb-2">
                <img
                  src={rel.thumbnailUrl}
                  alt={rel.title}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform"
                />
                <span className="absolute bottom-1 right-1 bg-black/90 text-white text-[8px] px-1 font-bold">
                  {rel.duration}
                </span>
                <span className="absolute top-1 left-1 bg-black/80 text-white text-[8px] px-1 font-bold">
                  {rel.resolution}
                </span>
              </div>
              <h4 className="text-[11px] font-bold text-neutral-900 line-clamp-2 leading-tight group-hover:underline">
                {rel.title}
              </h4>
              <div className="text-[9px] text-neutral-500 jp-font mt-1 line-clamp-1">
                {rel.titleJp}
              </div>
              <div className="text-[9px] text-neutral-500 mt-2 pt-1 border-t border-neutral-200 flex justify-between">
                <span>{rel.channel.name}</span>
                <span>{rel.views.toLocaleString()}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
