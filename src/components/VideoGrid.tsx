import React from 'react';
import { VideoItem, ViewMode } from '../types';
import { CATEGORIES } from '../data/mockVideos';
import { VideoCard } from './VideoCard';
import { LayoutGrid, List, Terminal, Filter, RefreshCcw, ExternalLink } from 'lucide-react';

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
      {/* Category Pills Bar & Mode Controls */}
      <div className="bg-white/90 backdrop-blur-xs border border-neutral-200 p-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3 font-mono text-xs shadow-xs">
        {/* Categories scrollable list */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <span className="text-[10px] text-neutral-400 font-bold px-1 shrink-0 flex items-center gap-1">
            <Filter className="w-2.5 h-2.5" />
            CAT:
          </span>
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`px-2.5 py-1 text-[11px] whitespace-nowrap border transition-all cursor-pointer ${
                  isActive
                    ? 'border-black bg-black text-white font-bold'
                    : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-700'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Sort & Layout View Mode Switchers */}
        <div className="flex items-center justify-between md:justify-end gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-neutral-100">
          {/* Sort Selector */}
          <div className="flex items-center gap-1 text-[11px]">
            <span className="text-neutral-400 text-[10px]">SORT:</span>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="bg-neutral-50 border border-neutral-200 px-1.5 py-0.5 text-neutral-800 text-[11px] font-mono focus:outline-none focus:border-black cursor-pointer"
            >
              <option value="views">MOST_VIEWED // 閲覧順</option>
              <option value="newest">NEWEST // 新着順</option>
              <option value="duration">DURATION // 再生時間</option>
            </select>
          </div>

          {/* View Mode buttons */}
          <div className="flex items-center border border-neutral-200 bg-neutral-50 p-0.5">
            <button
              onClick={() => onViewModeChange('grid5')}
              className={`p-1 cursor-pointer ${
                viewMode === 'grid5' ? 'bg-black text-white' : 'text-neutral-600 hover:text-black'
              }`}
              title="5 Videos Per Row (Matrix)"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onViewModeChange('compact')}
              className={`p-1 cursor-pointer ${
                viewMode === 'compact' ? 'bg-black text-white' : 'text-neutral-600 hover:text-black'
              }`}
              title="Compact Rows View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onViewModeChange('cli')}
              className={`p-1 cursor-pointer ${
                viewMode === 'cli' ? 'bg-black text-white' : 'text-neutral-600 hover:text-black'
              }`}
              title="CLI Monospace Table View"
            >
              <Terminal className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid Status Header */}
      <div className="flex items-center justify-between text-[10px] text-neutral-500 font-mono px-1">
        <div className="flex items-center gap-2">
          <span className="font-bold text-neutral-800">
            VIDEO_MATRIX [5_PER_ROW]
          </span>
          <span>// TOTAL: {videos.length} NODES</span>
          {selectedCategory !== 'ALL' && (
            <span className="text-neutral-800 bg-neutral-200 px-1 font-semibold">
              TAG: {selectedCategory}
            </span>
          )}
        </div>
        <div>
          <span>CLICK ANY LINK TO LOAD FULL VIDEO PAGE [OR MIDDLE-CLICK FOR NEW TAB]</span>
        </div>
      </div>

      {/* Main Video View: 5 Videos Per Row on Desktop / XL Screens */}
      {videos.length === 0 ? (
        <div className="bg-white border border-neutral-300 p-12 text-center font-mono space-y-3">
          <div className="text-sm font-bold text-neutral-800">
            [NULL_RESULT]: NO MATCHING VIDEO BUFFERS FOUND
          </div>
          <p className="text-xs text-neutral-500">
            No video streams match the current query or category filter.
          </p>
          <button
            onClick={onResetFilters}
            className="px-3 py-1.5 bg-black text-white text-xs font-mono inline-flex items-center gap-1.5 hover:bg-neutral-800 cursor-pointer"
          >
            <RefreshCcw className="w-3 h-3" />
            RESET_FILTERS // フィルター解除
          </button>
        </div>
      ) : viewMode === 'grid5' ? (
        /* 5 VIDEOS PER ROW MATRIX */
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
              className="flex items-center justify-between gap-4 bg-white border border-neutral-200 hover:border-black p-2 font-mono cursor-pointer transition-all hover:bg-neutral-50 block"
            >
              <div className="flex items-center gap-3">
                <div className="w-24 aspect-video bg-neutral-900 shrink-0 overflow-hidden relative">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1 right-1 bg-black/90 text-white text-[8px] px-1 font-bold">
                    {video.duration}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-neutral-500">
                      [{video.id}]
                    </span>
                    <span className="text-xs font-bold text-neutral-900 line-clamp-1">
                      {video.title}
                    </span>
                  </div>
                  <div className="text-[10px] text-neutral-500 jp-font mt-0.5">
                    {video.titleJp}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 shrink-0 text-right text-[11px] text-neutral-600">
                <span className="hidden sm:inline text-neutral-800 font-medium">
                  {video.channel.name}
                </span>
                <span>{video.views.toLocaleString()} VIEWS</span>
                <span className="text-neutral-400">{video.uploadDate}</span>
                <span className="bg-neutral-100 border border-neutral-200 px-1 py-0.5 text-[9px] font-bold">
                  {video.resolution}
                </span>
              </div>
            </a>
          ))}
        </div>
      ) : (
        /* RAW CLI TABLE VIEW */
        <div className="bg-neutral-950 text-neutral-200 font-mono text-xs p-4 border border-neutral-800 overflow-x-auto">
          <div className="text-[11px] text-neutral-400 border-b border-neutral-800 pb-2 mb-2 grid grid-cols-12 gap-2 font-bold uppercase">
            <span className="col-span-1">ID</span>
            <span className="col-span-5">TITLE // JAPANESE DESCRIPTOR</span>
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
                className="grid grid-cols-12 gap-2 hover:bg-neutral-900 p-1 cursor-pointer transition-colors text-[11px] block"
              >
                <span className="col-span-1 text-emerald-400 font-bold">{v.id}</span>
                <span className="col-span-5 truncate text-white">
                  {v.title}{' '}
                  <span className="text-neutral-500 text-[10px]">({v.titleJp})</span>
                </span>
                <span className="col-span-2 truncate text-neutral-400">{v.channel.name}</span>
                <span className="col-span-1 text-neutral-400">{v.duration}</span>
                <span className="col-span-1 text-neutral-300 font-semibold">{v.resolution}</span>
                <span className="col-span-2 text-right text-emerald-300">
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
