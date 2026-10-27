import React, { useState, useRef } from 'react';
import { VideoItem } from '../types';
import { Play, Bookmark, BookmarkCheck, ExternalLink, Eye } from 'lucide-react';

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
      className="group relative flex flex-col bg-white border border-neutral-200 hover:border-black transition-all duration-150 font-mono shadow-xs hover:shadow-md"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Top micro identifier */}
      <div className="flex items-center justify-between px-2 py-1 bg-neutral-50 border-b border-neutral-100 text-[10px] text-neutral-500 font-mono">
        <span className="font-semibold text-neutral-700">[{video.id}]</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-bold text-neutral-800 bg-neutral-200 px-1 py-0.2">
            {video.resolution}
          </span>
          <span className="text-[9px] text-neutral-500">{video.fps}fps</span>
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
        className="relative aspect-video bg-neutral-900 overflow-hidden cursor-pointer block"
        onMouseMove={handleMouseMove}
      >
        {/* Still image fallback */}
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className={`w-full h-full object-cover transition-opacity duration-200 ${
            isHovered && videoLoaded ? 'opacity-0' : 'opacity-100'
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
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-neutral-300">
            <div
              className="h-full bg-black transition-all"
              style={{ width: `${scrubPercent}%` }}
            />
          </div>
        )}

        {/* Duration badge */}
        <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-black/85 text-white text-[9px] font-bold tracking-wider select-none">
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
            className="p-1 bg-white/95 hover:bg-black hover:text-white border border-neutral-300 text-neutral-900 transition-colors shadow-xs"
            title={isSaved ? 'Remove from Queue' : 'Add to Queue'}
          >
            {isSaved ? (
              <BookmarkCheck className="w-3 h-3 text-emerald-600" />
            ) : (
              <Bookmark className="w-3 h-3" />
            )}
          </button>

          <a
            href={`?v=${video.id}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-1 bg-white/95 hover:bg-black hover:text-white border border-neutral-300 text-neutral-900 transition-colors shadow-xs"
            title="Open Video in New Tab"
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Play Icon Centered On Hover */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-90 transition-opacity">
          <div className="w-9 h-9 bg-black/80 text-white flex items-center justify-center pl-0.5 border border-white/50 shadow-md">
            <Play className="w-4 h-4 fill-current" />
          </div>
        </div>
      </a>

      {/* Card Info Section */}
      <div className="p-2.5 flex-1 flex flex-col justify-between space-y-2">
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
            className="text-[12px] font-bold text-neutral-900 leading-snug line-clamp-2 hover:underline cursor-pointer tracking-tight block"
            title={video.title}
          >
            {video.title}
          </a>

          {/* Japanese Subtitle / Kanji Tag */}
          <p className="text-[10px] text-neutral-500 font-sans mt-0.5 line-clamp-1 jp-font">
            {video.titleJp}
          </p>
        </div>

        {/* Channel & Metadata row */}
        <div className="pt-1.5 border-t border-neutral-100 flex items-center justify-between text-[10px] text-neutral-600">
          <div className="flex items-center gap-1.5 truncate max-w-[65%]">
            <img
              src={video.channel.avatar}
              alt={video.channel.name}
              className="w-4 h-4 border border-neutral-300 object-cover shrink-0"
            />
            <span className="truncate font-medium text-neutral-800">
              {video.channel.name}
            </span>
            {video.channel.verified && (
              <span className="text-[8px] text-blue-600 font-bold shrink-0">
                [✓]
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-[9px] text-neutral-500 shrink-0">
            <Eye className="w-2.5 h-2.5" />
            <span>{formatViews(video.views)}</span>
          </div>
        </div>

        {/* Category tag & upload date */}
        <div className="flex items-center justify-between text-[9px] text-neutral-400 font-mono">
          <span className="text-neutral-700 bg-neutral-100 px-1 py-0.2">
            #{video.category.toLowerCase()}
          </span>
          <span>{video.uploadDate}</span>
        </div>
      </div>
    </div>
  );
};
