import React, { useState } from 'react';
import { VideoItem } from '../types';
import { CATEGORIES } from '../data/mockVideos';
import { PlusCircle, Upload, X, Check, Video as VideoIcon } from 'lucide-react';

interface UploadVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddVideo: (video: VideoItem) => void;
}

export const UploadVideoModal: React.FC<UploadVideoModalProps> = ({
  isOpen,
  onClose,
  onAddVideo,
}) => {
  const [title, setTitle] = useState('');
  const [titleJp, setTitleJp] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [category, setCategory] = useState('MOTORCYCLE');
  const [channelName, setChannelName] = useState('MyTerminal_Rider');
  const [duration, setDuration] = useState('04:30');
  const [resolution, setResolution] = useState<'4K' | '1080P' | '720P'>('4K');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setThumbnailUrl(url);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newVideo: VideoItem = {
      id: `VID-${Math.floor(100 + Math.random() * 900)}`,
      title: title.trim(),
      titleJp: titleJp.trim() || `${title.trim()} [自主制作]`,
      duration: duration.trim() || '05:00',
      durationSec: 300,
      views: Math.floor(1000 + Math.random() * 5000),
      uploadDate: 'Just now',
      channel: {
        name: channelName.trim() || 'Anon_Rider',
        handle: `@${channelName.toLowerCase().replace(/\s+/g, '_')}`,
        avatar: '/assets/aistudio/Circular_manga_emblem_on_transparent_background_9f6502e1.png',
        verified: false,
      },
      tags: [category.toLowerCase(), 'custom', 'kurogane'],
      category: category,
      videoUrl:
        videoUrl.trim() ||
        'https://assets.mixkit.co/videos/preview/mixkit-tunnel-of-futuristic-neon-lights-41564-large.mp4',
      thumbnailUrl:
        thumbnailUrl.trim() ||
        'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=800&auto=format&fit=crop',
      resolution: resolution,
      bitrate: '38.0 Mbps',
      fps: 60,
      likes: 12,
      commentsCount: 1,
      description: description.trim() || 'Custom video buffer submitted to Kurogane Tokyo matrix.',
      danmakuComments: [
        {
          id: 'dc-1',
          time: 1.0,
          text: '新規アップロード動画キタ！',
          user: 'watcher_jp',
          color: '#10b981',
        },
      ],
    };

    onAddVideo(newVideo);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-mono">
      <div className="w-full max-w-xl bg-white border-2 border-black shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-neutral-900 text-white px-3.5 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            <span className="font-bold tracking-wider">
              SUBMIT_VIDEO // 動画アップロード
            </span>
          </div>
          <button onClick={onClose} className="p-1 hover:text-neutral-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-3.5 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-neutral-800 mb-1">
              VIDEO_TITLE (English) *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Midnight Tunnel Sprint: Tokyo C1 Loop [Onboard]"
              className="w-full p-2 border border-neutral-300 focus:border-black focus:outline-none bg-neutral-50"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-neutral-800 mb-1">
              JAPANESE_TITLE // 日本語副題 (Optional)
            </label>
            <input
              type="text"
              value={titleJp}
              onChange={(e) => setTitleJp(e.target.value)}
              placeholder="e.g. 首都高環状線 トンネル単車疾走 [4K車載]"
              className="w-full p-2 border border-neutral-300 focus:border-black focus:outline-none bg-neutral-50 jp-font"
            />
          </div>

          {/* Video file or URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-neutral-800 mb-1">
                VIDEO_STREAM_URL (MP4)
              </label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://.../video.mp4"
                className="w-full p-2 border border-neutral-300 focus:border-black focus:outline-none bg-neutral-50 text-[11px]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-neutral-800 mb-1">
                OR UPLOAD LOCAL VIDEO
              </label>
              <label className="flex items-center justify-center p-2 border border-dashed border-neutral-400 hover:border-black cursor-pointer bg-neutral-50 text-[11px] gap-2">
                <Upload className="w-3.5 h-3.5 text-neutral-500" />
                <span className="truncate">
                  {videoUrl.startsWith('blob:') ? 'Local file selected' : 'Choose video file'}
                </span>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Thumbnail URL or Upload */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-neutral-800 mb-1">
                THUMBNAIL_IMAGE_URL
              </label>
              <input
                type="url"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="https://.../thumb.jpg"
                className="w-full p-2 border border-neutral-300 focus:border-black focus:outline-none bg-neutral-50 text-[11px]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-neutral-800 mb-1">
                OR UPLOAD THUMBNAIL
              </label>
              <label className="flex items-center justify-center p-2 border border-dashed border-neutral-400 hover:border-black cursor-pointer bg-neutral-50 text-[11px] gap-2">
                <Upload className="w-3.5 h-3.5 text-neutral-500" />
                <span className="truncate">
                  {thumbnailUrl.startsWith('blob:') ? 'Image selected' : 'Choose poster image'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Category & Resolution */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-neutral-800 mb-1">
                CATEGORY
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 border border-neutral-300 bg-neutral-50 focus:border-black"
              >
                {CATEGORIES.filter((c) => c.id !== 'ALL').map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-800 mb-1">
                DURATION [MM:SS]
              </label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="04:20"
                className="w-full p-2 border border-neutral-300 bg-neutral-50 focus:border-black"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-800 mb-1">
                ENCODED_RES
              </label>
              <select
                value={resolution}
                onChange={(e) => setResolution(e.target.value as any)}
                className="w-full p-2 border border-neutral-300 bg-neutral-50 focus:border-black"
              >
                <option value="4K">4K [AV1 HDR]</option>
                <option value="1080P">1080P [60FPS]</option>
                <option value="720P">720P [LITE]</option>
              </select>
            </div>
          </div>

          {/* Channel Name */}
          <div>
            <label className="block text-[11px] font-bold text-neutral-800 mb-1">
              CREATOR_CHANNEL
            </label>
            <input
              type="text"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              placeholder="Your handle or channel name"
              className="w-full p-2 border border-neutral-300 bg-neutral-50 focus:border-black"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-bold text-neutral-800 mb-1">
              DESCRIPTION // 概要
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add technical or route details..."
              className="w-full p-2 border border-neutral-300 bg-neutral-50 focus:border-black resize-none"
            />
          </div>

          {/* Submit footer */}
          <div className="pt-2 border-t border-neutral-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-neutral-300 hover:bg-neutral-100"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-black text-white hover:bg-neutral-800 font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              <span>PUBLISH_NODE // 公開</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
