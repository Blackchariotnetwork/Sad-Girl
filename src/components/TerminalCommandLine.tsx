import React, { useState, useRef, useEffect } from 'react';
import { VideoItem, AmbientSettings } from '../types';
import { Terminal as TerminalIcon, X, CornerDownLeft } from 'lucide-react';

interface TerminalCommandLineProps {
  isOpen: boolean;
  onClose: () => void;
  videos: VideoItem[];
  onSelectVideo: (video: VideoItem) => void;
  onFilterCategory: (category: string) => void;
  onSearch: (query: string) => void;
  onSort: (sort: string) => void;
  ambientSettings: AmbientSettings;
  onUpdateAmbient: (settings: Partial<AmbientSettings>) => void;
}

interface CommandLog {
  type: 'input' | 'output' | 'error' | 'success';
  text: string;
}

export const TerminalCommandLine: React.FC<TerminalCommandLineProps> = ({
  isOpen,
  onClose,
  videos,
  onSelectVideo,
  onFilterCategory,
  onSearch,
  onSort,
  ambientSettings,
  onUpdateAmbient,
}) => {
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<CommandLog[]>([
    { type: 'output', text: 'KUROGANE TERMINAL v1.4.0 [TOKYO_C1_LOOP]' },
    { type: 'output', text: "Type 'help' or 'man' to inspect available CLI commands." },
  ]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  if (!isOpen) return null;

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = inputVal.trim();
    if (!raw) return;

    const parts = raw.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1).join(' ').trim();

    const newLogs: CommandLog[] = [{ type: 'input', text: `> ${raw}` }];

    switch (cmd) {
      case 'help':
      case 'man':
      case '?':
        newLogs.push({
          type: 'output',
          text: `AVAILABLE TERMINAL COMMANDS:
  find <query>        - Search video index (e.g. 'find tunnel')
  tag <category>      - Filter by tag [MOTORCYCLE, TUNNEL, SHIBUYA, TOKYO_DRIFT, ALL]
  play <id>           - Immediately play video (e.g. 'play VID-001')
  sort <key>          - Sort matrix by 'views', 'newest', 'duration'
  bg <scene>          - Switch rider ambient [tunnel, city, expressway]
  mode <canvas|video> - Set rider background renderer
  opacity <0-30>      - Adjust faint grey rider opacity (e.g. 'opacity 12')
  sound <on|off>      - Toggle motorcycle engine ASMR rumble
  list                - Display all current video nodes
  logo                - Render Kurogane ASCII badge
  clear               - Clear terminal output
  exit / q            - Close terminal CLI`,
        });
        break;

      case 'find':
      case 'search':
      case 'grep':
        if (!args) {
          newLogs.push({ type: 'error', text: "Usage: find <keyword> (e.g. 'find motorcycle')" });
        } else {
          onSearch(args);
          newLogs.push({
            type: 'success',
            text: `[OK]: Filter applied: query="${args}". Close CLI or type 'exit' to view results.`,
          });
        }
        break;

      case 'tag':
      case 'cat':
      case 'category':
        const catUpper = args.toUpperCase();
        if (!catUpper) {
          newLogs.push({
            type: 'error',
            text: 'Usage: tag <MOTORCYCLE|TUNNEL|SHIBUYA|TOKYO_DRIFT|LOFI_BEATS|ALL>',
          });
        } else {
          onFilterCategory(catUpper);
          newLogs.push({
            type: 'success',
            text: `[OK]: Category filtered to ${catUpper}.`,
          });
        }
        break;

      case 'sort':
        if (['views', 'newest', 'duration'].includes(args.toLowerCase())) {
          onSort(args.toLowerCase());
          newLogs.push({ type: 'success', text: `[OK]: Matrix sorted by ${args}.` });
        } else {
          newLogs.push({ type: 'error', text: 'Usage: sort <views|newest|duration>' });
        }
        break;

      case 'play':
      case 'exec':
        const found = videos.find(
          (v) =>
            v.id.toLowerCase() === args.toLowerCase() ||
            v.title.toLowerCase().includes(args.toLowerCase())
        );
        if (found) {
          onSelectVideo(found);
          newLogs.push({
            type: 'success',
            text: `[LAUNCHING]: Initializing stream for [${found.id}] - ${found.title}`,
          });
          onClose();
        } else {
          newLogs.push({
            type: 'error',
            text: `[ERR]: Video matching '${args}' not found in active matrix.`,
          });
        }
        break;

      case 'bg':
      case 'scene':
        if (['tunnel', 'city', 'expressway'].includes(args.toLowerCase())) {
          onUpdateAmbient({ scene: args.toLowerCase() as any });
          newLogs.push({
            type: 'success',
            text: `[OK]: Ambient rider scene updated to ${args.toUpperCase()}.`,
          });
        } else {
          newLogs.push({ type: 'error', text: 'Usage: bg <tunnel|city|expressway>' });
        }
        break;

      case 'opacity':
        const opVal = parseInt(args, 10);
        if (!isNaN(opVal) && opVal >= 0 && opVal <= 50) {
          onUpdateAmbient({ opacity: opVal });
          newLogs.push({
            type: 'success',
            text: `[OK]: Ambient motorcycle layer opacity set to ${opVal}%.`,
          });
        } else {
          newLogs.push({ type: 'error', text: 'Usage: opacity <0-30>' });
        }
        break;

      case 'mode':
        if (args === 'canvas' || args === 'video') {
          onUpdateAmbient({ mode: args as any });
          newLogs.push({
            type: 'success',
            text: `[OK]: Ambient render mode set to ${args.toUpperCase()}.`,
          });
        } else {
          newLogs.push({ type: 'error', text: 'Usage: mode <canvas|video>' });
        }
        break;

      case 'sound':
        if (args === 'on' || args === '1') {
          onUpdateAmbient({ soundEnabled: true });
          newLogs.push({ type: 'success', text: '[OK]: Motorcycle engine ASMR sound enabled.' });
        } else if (args === 'off' || args === '0') {
          onUpdateAmbient({ soundEnabled: false });
          newLogs.push({ type: 'success', text: '[OK]: Motorcycle engine sound muted.' });
        } else {
          newLogs.push({ type: 'error', text: 'Usage: sound <on|off>' });
        }
        break;

      case 'list':
      case 'ls':
        const listStr = videos
          .map((v) => `  ${v.id}  ${v.duration}  ${v.resolution}  ${v.views.toLocaleString()}v  ${v.title.slice(0, 40)}...`)
          .join('\n');
        newLogs.push({
          type: 'output',
          text: `CURRENT NODES (${videos.length}):\n${listStr}`,
        });
        break;

      case 'logo':
        newLogs.push({
          type: 'output',
          text: `
  ╦╔═  ╦ ╦  ╦═╗  ╔═╗  ╔═╗  ╔═╗  ╔╗╔  ╔═╗
  ╠╩╗  ║ ║  ╠╦╝  ║ ║  ║ ╦  ╠═╣  ║║║  ║╣ 
  ╩ ╩  ╚═╝  ╩╚═  ╚═╝  ╚═╝  ╩ ╩  ╝╚╝  ╚═╝
  黒鉄 // KUROGANE TUBE - TOKYO HIGHWAY TERMINAL
          `,
        });
        break;

      case 'clear':
      case 'cls':
        setHistory([]);
        setInputVal('');
        return;

      case 'exit':
      case 'quit':
      case 'q':
        onClose();
        return;

      default:
        newLogs.push({
          type: 'error',
          text: `Command not recognized: '${cmd}'. Type 'help' for command syntax.`,
        });
        break;
    }

    setHistory((prev) => [...prev, ...newLogs]);
    setInputVal('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-mono">
      <div className="w-full max-w-2xl bg-neutral-950 border-2 border-neutral-700 shadow-2xl flex flex-col h-[520px] text-xs">
        {/* CLI Window Titlebar */}
        <div className="bg-neutral-900 border-b border-neutral-800 px-3 py-2 flex items-center justify-between text-neutral-300 select-none">
          <div className="flex items-center gap-2">
            <TerminalIcon className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-white tracking-wider">
              KUROGANE_CLI // 端末対話
            </span>
            <span className="text-neutral-500 text-[10px]">[TTY1]</span>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Console Log Area */}
        <div className="flex-1 p-3.5 overflow-y-auto space-y-2 text-neutral-300 font-mono scrollbar-thin">
          {history.map((log, idx) => (
            <div
              key={idx}
              className={`whitespace-pre-wrap leading-relaxed ${
                log.type === 'input'
                  ? 'text-white font-bold'
                  : log.type === 'error'
                  ? 'text-rose-400'
                  : log.type === 'success'
                  ? 'text-emerald-400'
                  : 'text-neutral-300'
              }`}
            >
              {log.text}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input Prompt */}
        <form
          onSubmit={handleCommand}
          className="border-t border-neutral-800 p-2.5 bg-neutral-900/90 flex items-center gap-2"
        >
          <span className="text-emerald-400 font-bold text-sm select-none">&gt;</span>
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Type command (e.g. 'find motorcycle', 'play VID-001', 'help')..."
            className="flex-1 bg-transparent text-white focus:outline-none text-xs font-mono"
          />
          <button
            type="submit"
            className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] flex items-center gap-1 border border-neutral-700"
          >
            <span>EXEC</span>
            <CornerDownLeft className="w-3 h-3" />
          </button>
        </form>
      </div>
    </div>
  );
};
