import React, { useState, useMemo, useEffect } from 'react';
import { VideoItem, ViewMode, AmbientSettings } from './types';
import { INITIAL_VIDEOS } from './data/mockVideos';
import { Header } from './components/Header';
import { VideoGrid } from './components/VideoGrid';
import { WatchPage } from './components/WatchPage';
import { AmbientMotorcycleBackground } from './components/AmbientMotorcycleBackground';
import { TerminalCommandLine } from './components/TerminalCommandLine';
import { SavedQueueModal } from './components/SavedQueueModal';
import { UploadVideoModal } from './components/UploadVideoModal';
import { Terminal, Shield, ArrowUpRight, Flame, Radio } from 'lucide-react';

export default function App() {
  const [videos, setVideos] = useState<VideoItem[]>(INITIAL_VIDEOS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [sortBy, setSortBy] = useState('views');
  const [viewMode, setViewMode] = useState<ViewMode>('grid5');

  // Page Routing: 'home' | 'watch'
  const [activeVideoId, setActiveVideoId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('v');
    }
    return null;
  });

  // Saved / Queue videos
  const [savedVideoIds, setSavedVideoIds] = useState<Set<string>>(new Set(['VID-001', 'VID-003']));

  // Modals
  const [isCliOpen, setIsCliOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Ambient Motorcycle Background settings (faint grey layer)
  const [ambientSettings, setAmbientSettings] = useState<AmbientSettings>({
    mode: 'canvas', // procedural vector anime rider canvas layer
    opacity: 8, // faint grey 8% opacity as requested
    blur: 0,
    scene: 'tunnel', // starts in Tokyo Yamate Tunnel
    speed: 1,
    soundEnabled: false,
  });

  // Listen to popstate for browser Back/Forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setActiveVideoId(params.get('v'));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleUpdateAmbient = (newSettings: Partial<AmbientSettings>) => {
    setAmbientSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const handleToggleSave = (video: VideoItem) => {
    setSavedVideoIds((prev) => {
      const next = new Set(prev);
      if (next.has(video.id)) {
        next.delete(video.id);
      } else {
        next.add(video.id);
      }
      return next;
    });
  };

  const handleAddVideo = (newVideo: VideoItem) => {
    setVideos((prev) => [newVideo, ...prev]);
  };

  // Navigate to New Watch Page
  const handleSelectVideo = (video: VideoItem, e?: React.MouseEvent) => {
    if (e && (e.metaKey || e.ctrlKey)) {
      // Allow browser native new tab behavior
      return;
    }
    setActiveVideoId(video.id);
    const newUrl = `${window.location.pathname}?v=${video.id}`;
    window.history.pushState({ videoId: video.id }, '', newUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navigate Back to Home Page
  const handleNavigateHome = () => {
    setActiveVideoId(null);
    window.history.pushState({}, '', window.location.pathname);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Keyboard shortcut listener for CLI '/'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        setIsCliOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filtered & Sorted Videos for Home Page
  const filteredVideos = useMemo(() => {
    return videos
      .filter((video) => {
        const matchesCategory =
          selectedCategory === 'ALL' || video.category === selectedCategory;
        const matchesQuery =
          searchQuery.trim() === '' ||
          video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          video.titleJp.toLowerCase().includes(searchQuery.toLowerCase()) ||
          video.channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          video.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
          video.id.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesQuery;
      })
      .sort((a, b) => {
        if (sortBy === 'views') return b.views - a.views;
        if (sortBy === 'newest') return b.durationSec - a.durationSec;
        if (sortBy === 'duration') return b.durationSec - a.durationSec;
        return 0;
      });
  }, [videos, searchQuery, selectedCategory, sortBy]);

  const activeVideo = useMemo(() => {
    if (!activeVideoId) return null;
    return videos.find((v) => v.id === activeVideoId) || null;
  }, [videos, activeVideoId]);

  const savedVideosList = useMemo(() => {
    return videos.filter((v) => savedVideoIds.has(v.id));
  }, [videos, savedVideoIds]);

  return (
    <div className="relative min-h-screen bg-[#06070a] text-neutral-100 font-mono flex flex-col selection:bg-pink-500 selection:text-white">
      {/* 1. FAST MOVING CITY LIGHTS & MOTORCYCLE GIRL AMBIENT LAYER */}
      <AmbientMotorcycleBackground
        settings={ambientSettings}
        onUpdateSettings={handleUpdateAmbient}
      />

      {/* 2. MAIN APP CONTENT LAYER (Z-10) */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Header with BIG UNCIRCLED LOGO */}
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenCli={() => setIsCliOpen(true)}
          onOpenUpload={() => setIsUploadOpen(true)}
          savedCount={savedVideoIds.size}
          onOpenSaved={() => setIsQueueOpen(true)}
          ambientSettings={ambientSettings}
          onUpdateAmbient={handleUpdateAmbient}
          onNavigateHome={handleNavigateHome}
        />

        {/* CONDITIONAL ROUTE: Dedicated Watch Page VS Home Matrix */}
        {activeVideo ? (
          /* ============ DEDICATED WATCH PAGE ============ */
          <WatchPage
            video={activeVideo}
            onBackToHome={handleNavigateHome}
            onSelectRelated={(rel) => handleSelectVideo(rel)}
            allVideos={videos}
            isSaved={savedVideoIds.has(activeVideo.id)}
            onToggleSave={handleToggleSave}
          />
        ) : (
          /* ============ HOME PAGE: 5-COL VIDEO MATRIX DIRECTLY UNDER HEADER ============ */
          <main className="max-w-[1920px] mx-auto w-full px-4 py-4 flex-1">
            <VideoGrid
              videos={filteredVideos}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              sortBy={sortBy}
              onSortChange={setSortBy}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onSelectVideo={(v, e) => handleSelectVideo(v, e)}
              savedVideoIds={savedVideoIds}
              onToggleSave={handleToggleSave}
              onResetFilters={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
                setSortBy('views');
              }}
            />
          </main>
        )}

        {/* Minimal Dark Cyberpunk Terminal Footer */}
        <footer className="border-t border-neutral-800/80 bg-[#070912]/95 backdrop-blur-md py-8 px-4 text-xs font-mono text-neutral-400 mt-auto">
          <div className="max-w-[1920px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div
              onClick={handleNavigateHome}
              className="flex items-center gap-4 cursor-pointer select-none"
            >
              <img
                src="/assets/aistudio/Manga_racer_with_a_raised_visor_da073607.png"
                alt="Kurogane Racer Logo"
                className="h-16 w-auto object-contain drop-shadow-[0_0_12px_rgba(255,42,109,0.4)]"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base text-white">
                    KUROGANE // 黒鉄 TUBE SYSTEM
                  </span>
                  <span className="text-[10px] bg-pink-950/80 border border-pink-700 text-pink-300 px-1 font-bold">
                    [TOKYO_C1]
                  </span>
                </div>
                <div className="text-[11px] text-neutral-400">
                  JAPANESE MOTORCYCLE MATRIX // YAMATE DEEP TUNNEL NODE
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-neutral-400">
              <span className="text-cyan-400">ENCODING: AV1-HDR</span>
              <span>•</span>
              <span className="text-pink-400">5-VIDEOS / LINE</span>
              <span>•</span>
              <button
                onClick={() =>
                  handleUpdateAmbient({
                    soundEnabled: !ambientSettings.soundEnabled,
                  })
                }
                className="hover:text-cyan-400 text-neutral-300 underline cursor-pointer"
              >
                EXHAUST_ASMR: {ambientSettings.soundEnabled ? 'ACTIVE' : 'MUTED'}
              </button>
              <span>•</span>
              <button
                onClick={() => setIsCliOpen(true)}
                className="hover:text-pink-400 text-neutral-300 underline cursor-pointer"
              >
                CLI: PRESS [/]
              </button>
              <span>•</span>
              <span>© 2026 KUROGANE CORP</span>
            </div>
          </div>
        </footer>
      </div>

      {/* 3. MODALS & TOOLS */}
      {/* Terminal CLI Modal */}
      <TerminalCommandLine
        isOpen={isCliOpen}
        onClose={() => setIsCliOpen(false)}
        videos={videos}
        onSelectVideo={(v) => handleSelectVideo(v)}
        onFilterCategory={(c) => setSelectedCategory(c)}
        onSearch={(q) => setSearchQuery(q)}
        onSort={(s) => setSortBy(s)}
        ambientSettings={ambientSettings}
        onUpdateAmbient={handleUpdateAmbient}
      />

      {/* Saved / Queue Drawer */}
      <SavedQueueModal
        isOpen={isQueueOpen}
        onClose={() => setIsQueueOpen(false)}
        savedVideos={savedVideosList}
        onSelectVideo={(v) => handleSelectVideo(v)}
        onRemoveVideo={(id) => {
          setSavedVideoIds((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        }}
        onClearQueue={() => setSavedVideoIds(new Set())}
      />

      {/* Video Submission Modal */}
      <UploadVideoModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onAddVideo={handleAddVideo}
      />
    </div>
  );
}
