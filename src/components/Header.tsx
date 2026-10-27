import React, { useState, useEffect } from 'react';
import { Search, Terminal, PlusCircle, Bookmark, Sparkles, Zap, Flame } from 'lucide-react';
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
    <header className="sticky top-0 z-30 bg-[#06070a]/92 backdrop-blur-md border-b border-cyan-500/25 shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
      {/* Top micro terminal telemetry status bar */}
      <div className="bg-[#090b14] border-b border-neutral-800/80 px-3 py-1 flex items-center justify-between text-[10px] text-neutral-400 font-mono tracking-wider overflow-x-auto">
        <div className="flex items-center gap-3 shrink-0">
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
            SYS.ONLINE // 首都高通信網
          </span>
          <span className="text-neutral-700">|</span>
          <span className="text-cyan-400 font-semibold">NET: TOKYO_C1_LOOP [10Gbps]</span>
          <span className="text-neutral-700">|</span>
          <span className="text-pink-400 font-semibold">ENCODING: AV1 // 4K60 HDR</span>
          <span className="text-neutral-700">|</span>
          <span className="text-yellow-400 font-bold flex items-center gap-1">
            <Flame className="w-2.5 h-2.5 text-orange-500" />
            RPM: 14,200
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-neutral-300 font-mono font-medium">{timeStr || '12:00:00 JST'}</span>
          <span className="text-neutral-700">|</span>
          <button
            onClick={() => onUpdateAmbient({ soundEnabled: !ambientSettings.soundEnabled })}
            className="hover:text-cyan-400 text-neutral-400 cursor-pointer flex items-center gap-1"
          >
            <Zap className="w-2.5 h-2.5 text-pink-500" />
            ENGINE_SOUND: {ambientSettings.soundEnabled ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Main navigation row with BIG UNCIRCLED LOGO */}
      <div className="max-w-[1920px] mx-auto px-4 py-2 flex items-center justify-between gap-4">
        {/* BIGGER LOGO - Primary Focus (No circle, raw transparent artwork) */}
        <div
          onClick={onNavigateHome}
          className="flex items-center gap-3.5 shrink-0 cursor-pointer group"
          title="Return to Kurogane Tube Home"
        >
          {/* Logo artwork: Big, uncropped, transparent background, subtle neon aura */}
          <div className="relative flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
            <img
              src="/assets/aistudio/Manga_racer_with_a_raised_visor_da073607.png"
              alt="Kurogane Racer Logo"
              className="h-16 sm:h-20 md:h-22 w-auto object-contain drop-shadow-[0_0_15px_rgba(255,42,109,0.5)] select-none"
            />
          </div>

          <div className="leading-tight select-none">
            <div className="flex items-center gap-2">
              <span className="font-black text-xl sm:text-2xl tracking-tighter text-white font-mono drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]">
                KUROGANE
              </span>
              <span className="text-xs bg-gradient-to-r from-pink-600 to-rose-600 text-white px-1.5 py-0.5 font-mono font-bold tracking-wider shadow-[0_0_10px_rgba(255,42,109,0.5)]">
                黒鉄
              </span>
              <span className="text-xs text-cyan-400 font-mono font-bold">
                TUBE.V1
              </span>
            </div>
            <div className="text-[11px] text-neutral-400 font-mono tracking-wider flex items-center gap-1.5 mt-0.5">
              <span className="font-bold text-cyan-300">単車疾走 // JAPAN MOTORCYCLE</span>
              <span className="text-neutral-600">/</span>
              <span className="text-pink-400 font-semibold">5-VIDEOS / ROW</span>
              <span className="text-neutral-600">/</span>
              <span className="text-emerald-400 text-[10px] font-bold">FEED: LIVE</span>
            </div>
          </div>
        </div>

        {/* Central Terminal Command / Search Input with Cyan Neon Border */}
        <div className="flex-1 max-w-2xl relative hidden sm:block">
          <div className="flex items-center border border-neutral-700/80 bg-[#0d0f1a]/80 focus-within:bg-[#0f1222] focus-within:border-cyan-400 focus-within:shadow-[0_0_15px_rgba(5,217,232,0.35)] transition-all">
            <div className="pl-3 pr-2 text-cyan-400 select-none font-mono text-xs font-bold">
              &gt;
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="grep 'c1 loop' or search '#bosozoku' / press '/' for CLI..."
              className="w-full py-2 pr-2 bg-transparent text-xs font-mono text-white placeholder:text-neutral-500 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="px-2 text-neutral-400 hover:text-white text-xs font-mono"
              >
                [ESC]
              </button>
            )}
            <button
              onClick={onOpenCli}
              className="px-3 py-1 bg-neutral-800 hover:bg-cyan-500 hover:text-black text-cyan-400 transition-colors text-[10px] font-mono font-bold flex items-center gap-1 shrink-0 border-l border-neutral-700"
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
            className="flex items-center gap-1.5 px-3 py-2 border border-neutral-700 hover:border-pink-500 bg-[#0d0f1a] hover:bg-pink-950/30 text-xs font-mono text-neutral-200 transition-all cursor-pointer"
            title="Saved Videos Queue"
          >
            <Bookmark className="w-3.5 h-3.5 text-pink-400" />
            <span className="hidden sm:inline font-semibold">QUEUE</span>
            <span className="bg-pink-500 text-white px-1.5 py-0.2 text-[9px] font-bold shadow-[0_0_8px_rgba(255,42,109,0.6)]">
              {savedCount}
            </span>
          </button>

          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black text-xs font-mono font-black transition-all border border-cyan-400 shadow-[0_0_15px_rgba(5,217,232,0.4)] cursor-pointer"
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
