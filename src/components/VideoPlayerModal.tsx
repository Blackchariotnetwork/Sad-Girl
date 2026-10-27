import React, { useState, useRef, useEffect } from 'react';
import { VideoItem, DanmakuComment } from '../types';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  RotateCcw,
  Sliders,
  Send,
  MessageSquare,
  ThumbsUp,
  Share2,
  Bookmark,
  BookmarkCheck,
  X,
  Tv,
  Cpu,
  Radio,
} from 'lucide-react';

interface VideoPlayerModalProps {
  video: VideoItem;
  onClose: () => void;
  onSelectRelated: (video: VideoItem) => void;
  allVideos: VideoItem[];
  isSaved: boolean;
  onToggleSave: (video: VideoItem) => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  video,
  onClose,
  onSelectRelated,
  allVideos,
  isSaved,
  onToggleSave,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(video.durationSec || 100);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [resolution, setResolution] = useState<'4K' | '1080P' | '720P'>(video.resolution);
  const [likes, setLikes] = useState(video.likes);
  const [hasLiked, setHasLiked] = useState(false);

  // Danmaku comments state
  const [showDanmaku, setShowDanmaku] = useState(true);
  const [danmakuList, setDanmakuList] = useState<DanmakuComment[]>(video.danmakuComments);
  const [newCommentText, setNewCommentText] = useState('');
  const [activeDanmaku, setActiveDanmaku] = useState<
    Array<{ id: string; text: string; top: number; color?: string }>
  >([]);

  // Telemetry drawer
  const [showTelemetry, setShowTelemetry] = useState(false);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === ' ' && e.target === document.body) {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying]);

  // Video time update & Danmaku triggering
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const curr = videoRef.current.currentTime;
    setCurrentTime(curr);

    // Check if new danmaku should be spawned
    const matching = danmakuList.filter(
      (d) => Math.abs(d.time - curr) < 0.35 && !activeDanmaku.some((a) => a.id === d.id)
    );

    if (matching.length > 0) {
      const spawned = matching.map((m) => ({
        id: m.id,
        text: m.text,
        top: 15 + Math.random() * 65, // percentage from top
        color: m.color || '#ffffff',
      }));
      setActiveDanmaku((prev) => [...prev, ...spawned]);

      // Remove after 6 seconds
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto font-mono">
      <div
        ref={containerRef}
        className="w-full max-w-6xl bg-white border-2 border-black shadow-2xl overflow-hidden my-auto flex flex-col max-h-[96vh]"
      >
        {/* Terminal Window Header Bar */}
        <div className="bg-neutral-900 text-white px-3 py-2 flex items-center justify-between border-b border-black text-xs select-none">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
            <span className="ml-2 font-bold tracking-wider text-neutral-200">
              TERMINAL_THEATER // [{video.id}]
            </span>
            <span className="hidden sm:inline text-neutral-400 text-[10px]">
              - {video.title}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowTelemetry(!showTelemetry)}
              className="text-[10px] text-neutral-300 hover:text-white px-1.5 py-0.5 border border-neutral-700 bg-neutral-800 flex items-center gap-1"
            >
              <Cpu className="w-3 h-3 text-emerald-400" />
              <span>{showTelemetry ? 'HIDE_STATS' : 'STREAM_STATS'}</span>
            </button>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-white font-bold p-1 hover:bg-neutral-800 transition-colors"
              title="Close Player [Esc]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50">
          {/* Main Video Viewport */}
          <div className="relative aspect-video bg-black overflow-hidden border border-neutral-300 shadow-inner group">
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

            {/* Danmaku Floating Bullet Comments Overlay (Japanese NicoNico / Tube style) */}
            {showDanmaku && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
                {activeDanmaku.map((dan) => (
                  <div
                    key={dan.id}
                    className="absolute whitespace-nowrap text-sm sm:text-base font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] animate-marquee font-mono"
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

            {/* Custom CSS for Danmaku bullet comment flight */}
            <style>{`
              @keyframes danmakuScroll {
                0% { transform: translateX(100vw); }
                100% { transform: translateX(-100%); }
              }
            `}</style>

            {/* Stream Telemetry HUD Drawer (Toggleable) */}
            {showTelemetry && (
              <div className="absolute top-3 left-3 bg-black/85 backdrop-blur-md border border-neutral-700 p-2.5 text-[10px] text-neutral-300 font-mono space-y-1 z-20 pointer-events-none">
                <div className="text-emerald-400 font-bold flex items-center gap-1.5 border-b border-neutral-800 pb-1">
                  <Radio className="w-3 h-3 animate-pulse" />
                  REALTIME BUFFER TELEMETRY
                </div>
                <div>CODEC: AV1 // OPUS 48kHz</div>
                <div>RESOLUTION: {resolution} (60.00 FPS)</div>
                <div>BITRATE: {video.bitrate}</div>
                <div>NODE: TOKYO-WEST-C1-04</div>
                <div>DROPPED FRAMES: 0 / 14,200</div>
                <div>LATENCY: 11ms // JITTER: 0.8ms</div>
              </div>
            )}

            {/* Video Controls Bar Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/75 to-transparent p-3 text-white font-mono opacity-95 group-hover:opacity-100 transition-opacity">
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

          {/* Danmaku Input Bar (Interactive commentary flight) */}
          <form
            onSubmit={handleSendDanmaku}
            className="flex items-center border border-neutral-300 bg-white p-1 text-xs font-mono shadow-xs"
          >
            <div className="px-2 text-neutral-400 text-[11px] font-bold shrink-0">
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
              className="px-3 py-1 bg-neutral-900 hover:bg-black text-white text-xs flex items-center gap-1 font-semibold transition-colors"
            >
              <Send className="w-3 h-3" />
              <span>FIRE</span>
            </button>
          </form>

          {/* Video Metadata & Action Header */}
          <div className="bg-white border border-neutral-200 p-4 space-y-3 font-mono">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <h1 className="text-base sm:text-lg font-extrabold text-neutral-950 leading-snug">
                  {video.title}
                </h1>
                <div className="text-xs text-neutral-600 jp-font mt-0.5">
                  {video.titleJp}
                </div>
                <div className="flex items-center gap-3 text-[11px] text-neutral-500 mt-2">
                  <span>{video.views.toLocaleString()} VIEWS</span>
                  <span>•</span>
                  <span>UPLOADED {video.uploadDate}</span>
                  <span>•</span>
                  <span className="bg-neutral-100 text-neutral-800 px-1.5 py-0.2 font-semibold">
                    #{video.category}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleLike}
                  className={`px-3 py-1.5 border text-xs flex items-center gap-1.5 transition-colors ${
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
                  className={`px-3 py-1.5 border text-xs flex items-center gap-1.5 transition-colors ${
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
                    alert('Video link copied to clipboard!');
                  }}
                  className="px-3 py-1.5 border border-neutral-300 hover:border-black text-xs flex items-center gap-1.5 text-neutral-800 bg-neutral-50"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>SHARE</span>
                </button>
              </div>
            </div>

            {/* Channel Profile Row */}
            <div className="pt-3 border-t border-neutral-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={video.channel.avatar}
                  alt={video.channel.name}
                  className="w-10 h-10 rounded-full border border-neutral-400 object-cover"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-xs text-neutral-900">
                    <span>{video.channel.name}</span>
                    {video.channel.verified && (
                      <span className="text-[9px] text-blue-600">[VERIFIED]</span>
                    )}
                  </div>
                  <div className="text-[10px] text-neutral-500">
                    {video.channel.handle} • 148K subscribers
                  </div>
                </div>
              </div>

              <button className="px-3 py-1.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold transition-colors">
                SUBSCRIBE // 登録
              </button>
            </div>

            {/* Description */}
            <p className="text-xs text-neutral-700 leading-relaxed pt-2 border-t border-neutral-100">
              {video.description}
            </p>
          </div>

          {/* Related 5-Video Recommendations */}
          <div className="space-y-2 font-mono">
            <div className="text-xs font-bold text-neutral-800 flex items-center gap-2">
              <span>RELATED STREAMS // 関連動画推薦</span>
              <span className="text-[10px] text-neutral-500 font-normal">
                [5 NODES SELECTED]
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
              {relatedVideos.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => onSelectRelated(rel)}
                  className="bg-white border border-neutral-200 hover:border-black p-1.5 cursor-pointer transition-all hover:bg-neutral-50 flex flex-col justify-between"
                >
                  <div className="relative aspect-video bg-neutral-900 overflow-hidden mb-1.5">
                    <img
                      src={rel.thumbnailUrl}
                      alt={rel.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 right-1 bg-black/90 text-white text-[8px] px-1 font-bold">
                      {rel.duration}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold text-neutral-900 line-clamp-2 leading-tight">
                      {rel.title}
                    </h4>
                    <div className="text-[9px] text-neutral-500 mt-1 flex justify-between">
                      <span>{rel.channel.name}</span>
                      <span>{rel.views.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
