import React from 'react';
import { VideoItem } from '../types';
import { Bookmark, Play, Trash2, X, Film } from 'lucide-react';

interface SavedQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedVideos: VideoItem[];
  onSelectVideo: (video: VideoItem) => void;
  onRemoveVideo: (id: string) => void;
  onClearQueue: () => void;
}

export const SavedQueueModal: React.FC<SavedQueueModalProps> = ({
  isOpen,
  onClose,
  savedVideos,
  onSelectVideo,
  onRemoveVideo,
  onClearQueue,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono">
      <div className="w-full max-w-xl bg-[#0b0d18] border-2 border-neutral-800 shadow-[0_0_30px_rgba(0,0,0,0.9)] flex flex-col max-h-[80vh] text-neutral-200">
        {/* Header */}
        <div className="bg-[#070912] border-b border-neutral-800 px-3.5 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-pink-400" />
            <span className="font-bold tracking-wider text-white">
              WATCH_QUEUE // 保存済み動画リスト [{savedVideos.length}]
            </span>
          </div>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 overflow-y-auto space-y-2.5">
          {savedVideos.length === 0 ? (
            <div className="py-12 text-center text-neutral-500 text-xs">
              <Film className="w-8 h-8 mx-auto mb-2 opacity-40 text-neutral-600" />
              <div>QUEUE_BUFFER_EMPTY // 保存された単車動画はありません</div>
              <p className="text-[10px] mt-1 text-neutral-600">
                Hover over any video card and click the bookmark icon to queue videos.
              </p>
            </div>
          ) : (
            savedVideos.map((v) => (
              <div
                key={v.id}
                className="flex items-center justify-between gap-3 p-2 bg-[#0e1122] border border-neutral-800 hover:border-cyan-400 transition-all"
              >
                <div
                  onClick={() => {
                    onSelectVideo(v);
                    onClose();
                  }}
                  className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                >
                  <div className="w-16 aspect-video bg-black overflow-hidden relative shrink-0 border border-neutral-800">
                    <img
                      src={v.thumbnailUrl}
                      alt={v.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-0.5 right-0.5 bg-black/90 text-cyan-300 text-[7px] px-1 font-bold">
                      {v.duration}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate hover:text-cyan-300">
                      {v.title}
                    </div>
                    <div className="text-[10px] text-neutral-400 truncate jp-font">
                      {v.titleJp}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      onSelectVideo(v);
                      onClose();
                    }}
                    className="p-1.5 bg-cyan-500 text-black hover:bg-cyan-400 text-[10px] flex items-center gap-1 font-black cursor-pointer shadow-[0_0_8px_#05d9e8]"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>PLAY</span>
                  </button>
                  <button
                    onClick={() => onRemoveVideo(v.id)}
                    className="p-1.5 border border-neutral-700 text-neutral-400 hover:text-pink-400 hover:border-pink-500 text-[10px] cursor-pointer"
                    title="Remove"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {savedVideos.length > 0 && (
          <div className="border-t border-neutral-800 p-3 bg-[#070912] flex items-center justify-between text-xs">
            <button
              onClick={onClearQueue}
              className="text-neutral-500 hover:text-pink-400 text-[11px] underline cursor-pointer"
            >
              CLEAR_ALL // 全削除
            </button>
            <button
              onClick={() => {
                onSelectVideo(savedVideos[0]);
                onClose();
              }}
              className="px-3 py-1.5 bg-gradient-to-r from-pink-600 to-rose-600 text-white text-xs font-bold flex items-center gap-1.5 hover:opacity-90 cursor-pointer shadow-[0_0_10px_rgba(255,42,109,0.5)]"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>PLAY_FIRST // 先頭再生</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
