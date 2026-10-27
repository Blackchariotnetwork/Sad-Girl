export interface DanmakuComment {
  id: string;
  time: number; // in seconds
  text: string;
  user: string;
  color?: string;
}

export interface VideoChannel {
  name: string;
  handle: string;
  avatar: string;
  verified: boolean;
}

export interface VideoItem {
  id: string;
  title: string;
  titleJp: string;
  duration: string;
  durationSec: number;
  views: number;
  uploadDate: string;
  channel: VideoChannel;
  tags: string[];
  category: string;
  videoUrl: string;
  thumbnailUrl: string;
  resolution: '4K' | '1080P' | '720P';
  bitrate: string;
  fps: number;
  likes: number;
  commentsCount: number;
  description: string;
  danmakuComments: DanmakuComment[];
}

export type ViewMode = 'grid5' | 'compact' | 'cli';

export interface AmbientSettings {
  mode: 'canvas' | 'video' | 'custom';
  opacity: number; // 0 to 30
  blur: number; // 0 to 10
  scene: 'tunnel' | 'city' | 'expressway';
  speed: number;
  soundEnabled: boolean;
  customVideoUrl?: string;
}
