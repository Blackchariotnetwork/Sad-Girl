import React, { useState, useRef } from 'react';
import { VideoItem } from '../types';
import { Play, Bookmark, BookmarkCheck, ExternalLink, Eye, Flame, Zap } from 'lucide-react';

interface VideoCardProps {
  video: VideoItem;
  onSelect: (video: VideoItem, e?: React.MouseEvent) => void;
  isSaved: boolean;
  onToggleSave: (video: VideoItem) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  onSelect,
  isSaved,
  onToggleSave,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [scrubPercent, setScrubPercent] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setScrubPercent(null);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const clamped = Math.max(0, Math.min(1, pos));
    setScrubPercent(clamped * 100);
    if (videoRef.current.duration) {
      videoRef.current.currentTime = clamped * videoRef.current.duration;
    }
  };

  const formatViews = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
    return num.toString();
  };

  return (
    <div
      className="group relative flex flex-col bg-[#0b0d18]/90 border border-neutral-800/80 hover:border-cyan-400 hover:shadow-[0_0_22px_rgba(5,217,232,0.25)] transition-all duration-200 font-mono"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Top micro identifier */}
      <div className="flex items-center justify-between px-2.5 py-1 bg-[#070912] border-b border-neutral-800/80 text-[10px] text-neutral-400 font-mono">
        <span className="font-semibold text-cyan-400">[{video.id}]</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-black text-black bg-cyan-400 px-1 py-0.2 shadow-[0_0_6px_rgba(5,217,232,0.6)]">
            {video.resolution}
          </span>
          <span className="text-[9px] text-pink-400 font-bold">{video.fps}FPS</span>
        </div>
      </div>

      {/* Thumbnail / Video Preview Area with real href link */}
      <a
        href={`?v=${video.id}`}
        onClick={(e) => {
          if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            onSelect(video, e);
          }
        }}
        className="relative aspect-video bg-black overflow-hidden cursor-pointer block border-b border-neutral-800/60"
        onMouseMove={handleMouseMove}
      >
        {/* Still image fallback */}
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className={`w-full h-full object-cover transition-opacity duration-200 group-hover:scale-103 ${
            isHovered && videoLoaded ? 'opacity-0' : 'opacity-90'
          }`}
          loading="lazy"
        />

        {/* Hover preview video */}
        {isHovered && (
          <video
            ref={videoRef}
            src={video.videoUrl}
            muted
            loop
            playsInline
            onLoadedData={() => setVideoLoaded(true)}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Scrub progress bar */}
        {scrubPercent !== null && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-neutral-800">
            <div
              className="h-full bg-gradient-to-r from-pink-500 to-cyan-400 transition-all shadow-[0_0_8px_#05d9e8]"
              style={{ width: `${scrubPercent}%` }}
            />
          </div>
        )}

        {/* Duration badge */}
        <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-black/90 border border-neutral-700 text-cyan-300 text-[9px] font-bold tracking-wider select-none shadow-sm">
          {video.duration}
        </div>

        {/* Quick action buttons overlay */}
        <div className="absolute top-1.5 right-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleSave(video);
            }}
            className="p-1 bg-black/90 hover:bg-pink-600 hover:text-white border border-neutral-700 text-white transition-colors shadow-xs"
            title={isSaved ? 'Remove from Queue' : 'Add to Queue'}
          >
            {isSaved ? (
              <BookmarkCheck className="w-3 h-3 text-pink-400" />
            ) : (
              <Bookmark className="w-3 h-3" />
            )}
          </button>

          <a
            href={`?v=${video.id}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-1 bg-black/90 hover:bg-cyan-500 hover:text-black border border-neutral-700 text-cyan-300 transition-colors shadow-xs"
            title="Open Video in New Tab"
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Play Icon Centered On Hover */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-10 h-10 rounded-full bg-black/85 text-cyan-400 flex items-center justify-center pl-0.5 border border-cyan-400 shadow-[0_0_15px_rgba(5,217,232,0.6)]">
            <Play className="w-4 h-4 fill-current" />
          </div>
        </div>
      </a>

      {/* Card Info Section */}
      <div className="p-3 flex-1 flex flex-col justify-between space-y-2 bg-[#0a0c16]/70">
        <div>
          {/* Main Title with link */}
          <a
            href={`?v=${video.id}`}
            onClick={(e) => {
              if (!e.metaKey && !e.ctrlKey) {
                e.preventDefault();
                onSelect(video, e);
              }
            }}
            className="text-[12px] font-bold text-white leading-snug line-clamp-2 hover:text-cyan-300 transition-colors cursor-pointer tracking-tight block"
            title={video.title}
          >
            {video.title}
          </a>

          {/* Japanese Subtitle / Kanji Tag */}
          <p className="text-[10px] text-neutral-400 font-sans mt-1 line-clamp-1 jp-font">
            {video.titleJp}
          </p>
        </div>

        {/* Channel & Metadata row */}
        <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[10px] text-neutral-400">
          <div className="flex items-center gap-1.5 truncate max-w-[65%]">
            <img
              src={video.channel.avatar}
              alt={video.channel.name}
              className="w-4 h-4 border border-cyan-500/40 object-cover shrink-0"
            />
            <span className="truncate font-semibold text-neutral-200">
              {video.channel.name}
            </span>
            {video.channel.verified && (
              <span className="text-[8px] text-cyan-400 font-bold shrink-0">
                [✓]
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-[9px] text-pink-400 font-semibold shrink-0">
            <Eye className="w-2.5 h-2.5" />
            <span>{formatViews(video.views)}</span>
          </div>
        </div>

        {/* Category tag & upload date */}
        <div className="flex items-center justify-between text-[9px] text-neutral-500 font-mono">
          <span className="text-cyan-300 bg-cyan-950/50 border border-cyan-800/50 px-1 py-0.2">
            #{video.category.toLowerCase()}
          </span>
          <span>{video.uploadDate}</span>
        </div>
      </div>
    </div>
  );
};
