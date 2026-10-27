import React, { useState, useEffect } from 'react';
import { Search, Terminal, PlusCircle, Bookmark, Eye, Sparkles } from 'lucide-react';
import { AmbientSettings } from '../types';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenCli: () => void;
  onOpenUpload: () => void;
  savedCount: number;
  onOpenSaved: () => void;
  ambientSettings: AmbientSettings;
  onUpdateAmbient: (settings: Partial<AmbientSettings>) => void;
  onNavigateHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onOpenCli,
  onOpenUpload,
  savedCount,
  onOpenSaved,
  ambientSettings,
  onUpdateAmbient,
  onNavigateHome,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('ja-JP', {
          timeZone: 'Asia/Tokyo',
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }) + ' JST'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200">
      {/* Top micro terminal telemetry status bar */}
      <div className="bg-neutral-100 border-b border-neutral-200 px-3 py-1 flex items-center justify-between text-[10px] text-neutral-600 font-mono tracking-wider overflow-x-auto">
        <div className="flex items-center gap-3 shrink-0">
          <span className="flex items-center gap-1.5 text-neutral-900 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            SYS.ONLINE
          </span>
          <span className="text-neutral-400">|</span>
          <span>NET: TOKYO_C1_FIBER [10Gbps]</span>
          <span className="text-neutral-400">|</span>
          <span>ENCODING: AV1 // 4K60</span>
          <span className="text-neutral-400">|</span>
          <span className="text-neutral-900 font-medium">BUFFER: 100%</span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-neutral-700 font-mono">{timeStr || '12:00:00 JST'}</span>
          <span className="text-neutral-400">|</span>
          <button
            onClick={() => onUpdateAmbient({ opacity: ambientSettings.opacity > 0 ? 0 : 8 })}
            className="hover:text-black hover:underline cursor-pointer"
          >
            BG_RIDER: {ambientSettings.opacity}% [{ambientSettings.mode.toUpperCase()}]
          </button>
        </div>
      </div>

      {/* Main navigation row with BIGGER LOGO without circle container */}
      <div className="max-w-[1920px] mx-auto px-4 py-2 flex items-center justify-between gap-4">
        {/* BIGGER LOGO - Primary Focus (No circle, large commanding presence) */}
        <div
          onClick={onNavigateHome}
          className="flex items-center gap-4 shrink-0 cursor-pointer group"
          title="Return to Kurogane Tube Home"
        >
          {/* Logo artwork: Big, uncropped, no circle */}
          <div className="relative flex items-center justify-center p-0.5 transition-transform duration-200 group-hover:scale-102">
            <img
              src="/assets/aistudio/Circular_manga_emblem_on_transparent_background_9f6502e1.png"
              alt="Kurogane Logo"
              className="h-16 sm:h-20 md:h-24 w-auto object-contain drop-shadow-sm select-none"
            />
          </div>

          <div className="leading-tight select-none">
            <div className="flex items-center gap-2">
              <span className="font-black text-xl sm:text-2xl tracking-tighter text-neutral-950 font-mono">
                KUROGANE
              </span>
              <span className="text-xs bg-black text-white px-1.5 py-0.5 font-mono font-bold tracking-wider">
                黒鉄
              </span>
              <span className="text-xs text-neutral-500 font-mono font-bold">
                TUBE.V1
              </span>
            </div>
            <div className="text-[11px] text-neutral-600 font-mono tracking-wider flex items-center gap-1.5 mt-0.5">
              <span className="font-bold text-neutral-900">東京電脳映像管</span>
              <span className="text-neutral-300">/</span>
              <span>5-COL MATRIX</span>
              <span className="text-neutral-300">/</span>
              <span className="text-emerald-600 text-[10px] font-semibold">FEED: LIVE</span>
            </div>
          </div>
        </div>

        {/* Central Terminal Command / Search Input */}
        <div className="flex-1 max-w-2xl relative hidden sm:block">
          <div className="flex items-center border border-neutral-300 bg-neutral-50/80 focus-within:bg-white focus-within:border-black transition-all">
            <div className="pl-3 pr-2 text-neutral-400 select-none font-mono text-xs font-bold">
              &gt;
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="find --query 'tunnel' or grep '#motorcycle' / press '/' for CLI..."
              className="w-full py-2 pr-2 bg-transparent text-xs font-mono text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="px-2 text-neutral-400 hover:text-black text-xs font-mono"
              >
                [ESC]
              </button>
            )}
            <button
              onClick={onOpenCli}
              className="px-2.5 py-1 bg-neutral-200 hover:bg-neutral-900 hover:text-white transition-colors text-[10px] font-mono font-semibold flex items-center gap-1 shrink-0 border-l border-neutral-300"
              title="Launch Terminal CLI"
            >
              <Terminal className="w-3 h-3" />
              <span>:CLI</span>
            </button>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenSaved}
            className="flex items-center gap-1.5 px-3 py-2 border border-neutral-300 hover:border-black bg-white hover:bg-neutral-50 text-xs font-mono text-neutral-800 transition-colors"
            title="Saved Videos Queue"
          >
            <Bookmark className="w-3.5 h-3.5 text-neutral-600" />
            <span className="hidden sm:inline font-semibold">QUEUE</span>
            <span className="bg-black text-white px-1.5 py-0.2 text-[9px] font-bold">
              {savedCount}
            </span>
          </button>

          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-mono font-bold transition-colors border border-black shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden md:inline">SUBMIT_VID</span>
            <span className="md:hidden">ADD</span>
          </button>
        </div>
      </div>
    </header>
  );
};
