import React from 'react';
import { VideoItem, ViewMode } from '../types';
import { CATEGORIES } from '../data/mockVideos';
import { VideoCard } from './VideoCard';
import { LayoutGrid, List, Terminal, Filter, RefreshCcw, Flame } from 'lucide-react';

interface VideoGridProps {
  videos: VideoItem[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onSelectVideo: (video: VideoItem, e?: React.MouseEvent) => void;
  savedVideoIds: Set<string>;
  onToggleSave: (video: VideoItem) => void;
  onResetFilters: () => void;
}

export const VideoGrid: React.FC<VideoGridProps> = ({
  videos,
  selectedCategory,
  onSelectCategory,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  onSelectVideo,
  savedVideoIds,
  onToggleSave,
  onResetFilters,
}) => {
  return (
    <div className="space-y-4">
      {/* Category Pills Bar & Mode Controls in Dark Cyberpunk Glass */}
      <div className="bg-[#090b14]/90 backdrop-blur-md border border-neutral-800 p-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3 font-mono text-xs shadow-lg">
        {/* Categories scrollable list with neon accents */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <span className="text-[10px] text-pink-400 font-bold px-1 shrink-0 flex items-center gap-1">
            <Flame className="w-3 h-3 text-pink-500" />
            TRIBE:
          </span>
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`px-2.5 py-1 text-[11px] whitespace-nowrap border transition-all cursor-pointer ${
                  isActive
                    ? 'border-pink-500 bg-pink-950/70 text-pink-300 font-black shadow-[0_0_12px_rgba(255,42,109,0.5)]'
                    : 'border-neutral-800 bg-[#0d0f1b] hover:border-cyan-500/50 hover:text-cyan-300 text-neutral-300'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Sort & Layout View Mode Switchers */}
        <div className="flex items-center justify-between md:justify-end gap-2.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-neutral-800">
          {/* Sort Selector */}
          <div className="flex items-center gap-1 text-[11px]">
            <span className="text-neutral-500 text-[10px]">SORT:</span>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="bg-[#0e1122] border border-neutral-700 px-2 py-0.5 text-cyan-300 text-[11px] font-mono focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              <option value="views">MOST_VIEWED // 閲覧順</option>
              <option value="newest">NEWEST // 新着順</option>
              <option value="duration">DURATION // 再生時間</option>
            </select>
          </div>

          {/* View Mode buttons */}
          <div className="flex items-center border border-neutral-800 bg-[#070912] p-0.5">
            <button
              onClick={() => onViewModeChange('grid5')}
              className={`p-1 cursor-pointer transition-colors ${
                viewMode === 'grid5'
                  ? 'bg-cyan-500 text-black shadow-[0_0_8px_#05d9e8]'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="5 Videos Per Row (Matrix)"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onViewModeChange('compact')}
              className={`p-1 cursor-pointer transition-colors ${
                viewMode === 'compact'
                  ? 'bg-cyan-500 text-black shadow-[0_0_8px_#05d9e8]'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Compact Rows View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onViewModeChange('cli')}
              className={`p-1 cursor-pointer transition-colors ${
                viewMode === 'cli'
                  ? 'bg-cyan-500 text-black shadow-[0_0_8px_#05d9e8]'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="CLI Monospace Table View"
            >
              <Terminal className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid Status Header */}
      <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono px-1">
        <div className="flex items-center gap-2">
          <span className="font-bold text-cyan-400">
            MOTORCYCLE_MATRIX [5_PER_LINE]
          </span>
          <span className="text-neutral-600">//</span>
          <span className="text-neutral-300">TOTAL: {videos.length} NODES</span>
          {selectedCategory !== 'ALL' && (
            <span className="text-pink-400 bg-pink-950/60 border border-pink-800 px-1.5 font-bold">
              TRIBE: {selectedCategory}
            </span>
          )}
        </div>
        <div>
          <span className="text-neutral-500 hidden sm:inline">LAYOUT: 5-COLUMNS STRICT // TOKYO HIGHWAY VELOCITY</span>
        </div>
      </div>

      {/* Main Video View: 5 Videos Per Line on Desktop / XL Screens */}
      {videos.length === 0 ? (
        <div className="bg-[#0b0d18]/90 border border-neutral-800 p-12 text-center font-mono space-y-3">
          <div className="text-sm font-bold text-pink-400">
            [NULL_RESULT]: NO MATCHING MOTORCYCLE BUFFERS
          </div>
          <p className="text-xs text-neutral-400">
            No video streams match the current query or motorcycle culture tag.
          </p>
          <button
            onClick={onResetFilters}
            className="px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-600 text-white text-xs font-bold inline-flex items-center gap-1.5 hover:opacity-90 cursor-pointer shadow-[0_0_12px_rgba(255,42,109,0.5)]"
          >
            <RefreshCcw className="w-3 h-3" />
            RESET_FILTERS // フィルター解除
          </button>
        </div>
      ) : viewMode === 'grid5' ? (
        /* 5 VIDEOS PER LINE MATRIX */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5 gap-3.5">
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              onSelect={onSelectVideo}
              isSaved={savedVideoIds.has(video.id)}
              onToggleSave={onToggleSave}
            />
          ))}
        </div>
      ) : viewMode === 'compact' ? (
        /* COMPACT LIST VIEW */
        <div className="space-y-2">
          {videos.map((video) => (
            <a
              key={video.id}
              href={`?v=${video.id}`}
              onClick={(e) => {
                if (!e.metaKey && !e.ctrlKey) {
                  e.preventDefault();
                  onSelectVideo(video, e);
                }
              }}
              className="flex items-center justify-between gap-4 bg-[#0a0c16]/90 border border-neutral-800/80 hover:border-cyan-400 p-2 font-mono cursor-pointer transition-all hover:bg-[#0f1222] block"
            >
              <div className="flex items-center gap-3">
                <div className="w-24 aspect-video bg-black shrink-0 overflow-hidden relative border border-neutral-800">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1 right-1 bg-black/90 text-cyan-300 text-[8px] px-1 font-bold">
                    {video.duration}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-cyan-400">
                      [{video.id}]
                    </span>
                    <span className="text-xs font-bold text-white line-clamp-1">
                      {video.title}
                    </span>
                  </div>
                  <div className="text-[10px] text-neutral-400 jp-font mt-0.5">
                    {video.titleJp}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 shrink-0 text-right text-[11px] text-neutral-400">
                <span className="hidden sm:inline text-neutral-300 font-semibold">
                  {video.channel.name}
                </span>
                <span className="text-pink-400 font-medium">{video.views.toLocaleString()} VIEWS</span>
                <span className="text-neutral-500">{video.uploadDate}</span>
                <span className="bg-cyan-950/60 border border-cyan-800 text-cyan-300 px-1 py-0.5 text-[9px] font-bold">
                  {video.resolution}
                </span>
              </div>
            </a>
          ))}
        </div>
      ) : (
        /* RAW CLI TABLE VIEW */
        <div className="bg-[#05060b] text-neutral-200 font-mono text-xs p-4 border border-neutral-800 overflow-x-auto">
          <div className="text-[11px] text-cyan-400 border-b border-neutral-800 pb-2 mb-2 grid grid-cols-12 gap-2 font-bold uppercase">
            <span className="col-span-1">ID</span>
            <span className="col-span-5">TITLE // MOTORCYCLE SUB-GENRE</span>
            <span className="col-span-2">CHANNEL</span>
            <span className="col-span-1">DUR</span>
            <span className="col-span-1">RES</span>
            <span className="col-span-2 text-right">VIEWS</span>
          </div>
          <div className="space-y-1.5">
            {videos.map((v) => (
              <a
                key={v.id}
                href={`?v=${v.id}`}
                onClick={(e) => {
                  if (!e.metaKey && !e.ctrlKey) {
                    e.preventDefault();
                    onSelectVideo(v, e);
                  }
                }}
                className="grid grid-cols-12 gap-2 hover:bg-[#0e1124] p-1 cursor-pointer transition-colors text-[11px] block"
              >
                <span className="col-span-1 text-cyan-400 font-bold">{v.id}</span>
                <span className="col-span-5 truncate text-white">
                  {v.title}{' '}
                  <span className="text-neutral-500 text-[10px]">({v.titleJp})</span>
                </span>
                <span className="col-span-2 truncate text-neutral-400">{v.channel.name}</span>
                <span className="col-span-1 text-neutral-400">{v.duration}</span>
                <span className="col-span-1 text-pink-400 font-semibold">{v.resolution}</span>
                <span className="col-span-2 text-right text-emerald-400 font-bold">
                  {v.views.toLocaleString()}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
