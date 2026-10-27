import React, { useEffect, useRef, useState } from 'react';
import { AmbientSettings } from '../types';
import { Sliders, Video, Sparkles, Volume2, VolumeX, Eye } from 'lucide-react';

interface AmbientMotorcycleBackgroundProps {
  settings: AmbientSettings;
  onUpdateSettings: (newSettings: Partial<AmbientSettings>) => void;
}

export const AmbientMotorcycleBackground: React.FC<AmbientMotorcycleBackgroundProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const engineGainRef = useRef<GainNode | null>(null);
  const [showControls, setShowControls] = useState(false);

  // High quality night tunnel & city video loop URLs
  const videoSources = {
    tunnel: 'https://assets.mixkit.co/videos/preview/mixkit-tunnel-of-futuristic-neon-lights-41564-large.mp4',
    city: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-city-traffic-at-night-41554-large.mp4',
    expressway: 'https://assets.mixkit.co/videos/preview/mixkit-highway-traffic-in-a-city-at-night-41551-large.mp4',
  };

  const activeVideoUrl = settings.customVideoUrl || videoSources[settings.scene] || videoSources.tunnel;

  // Handle ambient engine rumble audio (Web Audio API)
  useEffect(() => {
    if (settings.soundEnabled) {
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!audioCtxRef.current) {
          audioCtxRef.current = new AudioCtx();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') {
          ctx.resume();
        }

        // Sub oscillator for motorcycle engine low purr
        const osc = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(48, ctx.currentTime); // ~1400 RPM 4-cylinder idle/cruise rumble

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(96, ctx.currentTime);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(140, ctx.currentTime);

        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        engineGainRef.current = gain;

        osc.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc2.start();

        return () => {
          try {
            osc.stop();
            osc2.stop();
            gain.disconnect();
          } catch {
            // Ignore clean up errors
          }
        };
      } catch (err) {
        console.warn('AudioContext not permitted yet:', err);
      }
    } else {
      if (audioCtxRef.current && audioCtxRef.current.state === 'running') {
        audioCtxRef.current.suspend();
      }
    }
  }, [settings.soundEnabled]);

  // Procedural Canvas Animation: Cute Japanese Girl on Motorcycle in Tunnel & City
  useEffect(() => {
    if (settings.mode !== 'canvas') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    let tick = 0;

    // Road markings & perspective grid
    const roadLines: { z: number; xOffset: number }[] = [];
    for (let i = 0; i < 25; i++) {
      roadLines.push({ z: i * 35, xOffset: 0 });
    }

    // Tunnel rings
    const tunnelRings: { z: number }[] = [];
    for (let i = 0; i < 16; i++) {
      tunnelRings.push({ z: i * 80 });
    }

    // City skyline buildings
    const buildings: { x: number; w: number; h: number; windows: boolean[][] }[] = [];
    for (let i = 0; i < 30; i++) {
      const w = 40 + Math.random() * 70;
      const h = 80 + Math.random() * 220;
      const cols = Math.floor(w / 12);
      const rows = Math.floor(h / 16);
      const windows: boolean[][] = [];
      for (let r = 0; r < rows; r++) {
        windows[r] = [];
        for (let c = 0; c < cols; c++) {
          windows[r][c] = Math.random() > 0.4;
        }
      }
      buildings.push({ x: i * 90, w, h, windows });
    }

    // Light trails / particles
    const lightTrails: { x: number; y: number; speed: number; length: number; alpha: number }[] = [];
    for (let i = 0; i < 35; i++) {
      lightTrails.push({
        x: Math.random() * width,
        y: height * 0.4 + Math.random() * (height * 0.6),
        speed: 8 + Math.random() * 12,
        length: 30 + Math.random() * 70,
        alpha: 0.1 + Math.random() * 0.4,
      });
    }

    const render = () => {
      tick += 1 * settings.speed;

      // Clear with clean faint slate tone
      ctx.clearRect(0, 0, width, height);

      const horizonY = height * 0.54;
      const vanishingX = width * 0.5;

      // 1. SKY / UPPER BACKGROUND
      const isTunnel = settings.scene === 'tunnel' || (settings.scene === 'expressway' && Math.sin(tick * 0.003) > 0);

      if (!isTunnel) {
        // City skyline backdrop
        ctx.fillStyle = '#e2e8f0';
        for (let b of buildings) {
          b.x -= 2.2 * settings.speed;
          if (b.x + b.w < 0) {
            b.x = width + 40;
          }

          // Building silhouette
          const by = horizonY - b.h;
          ctx.fillRect(b.x, by, b.w, b.h);

          // Subtle windows
          ctx.fillStyle = '#ffffff';
          for (let r = 0; r < b.windows.length; r++) {
            for (let c = 0; c < b.windows[r].length; c++) {
              if (b.windows[r][c] && Math.sin(tick * 0.02 + r + c) > -0.6) {
                ctx.fillRect(b.x + 4 + c * 10, by + 6 + r * 14, 5, 7);
              }
            }
          }
          ctx.fillStyle = '#cbd5e1';
        }

        // Tokyo Tower / Telecom spire silhouette in background
        const towerX = ((tick * -0.8) % (width + 300)) + width;
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(towerX - 40, horizonY);
        ctx.lineTo(towerX, horizonY - 260);
        ctx.lineTo(towerX + 40, horizonY);
        ctx.moveTo(towerX - 25, horizonY - 100);
        ctx.lineTo(towerX + 25, horizonY - 100);
        ctx.moveTo(towerX - 15, horizonY - 180);
        ctx.lineTo(towerX + 15, horizonY - 180);
        ctx.stroke();

        // Kanji Highway Signs: 首都高速 // 渋谷出口
        ctx.fillStyle = '#64748b';
        ctx.font = '12px "Noto Sans JP", monospace';
        ctx.fillText('首都高速 C1 // 渋谷 GINZA TUNNEL 0.8km', 40, 60);
        ctx.fillText('速度落とせ // SPEED LIMIT: 80', 40, 80);
      } else {
        // TUNNEL MODE: Perspective Vaulted Arches
        ctx.strokeStyle = '#94a3b8';
        for (let i = 0; i < tunnelRings.length; i++) {
          tunnelRings[i].z -= 4.5 * settings.speed;
          if (tunnelRings[i].z <= 1) {
            tunnelRings[i].z += 80 * 16;
          }
          const scale = 500 / (tunnelRings[i].z + 100);
          const rx = vanishingX;
          const ry = horizonY - 40 * scale;
          const rw = (width * 0.9) * scale;
          const rh = (height * 0.95) * scale;

          ctx.lineWidth = Math.max(1, 2.5 * scale);
          ctx.strokeStyle = `rgba(148, 163, 184, ${Math.min(0.7, scale * 0.6)})`;

          // Curved arch
          ctx.beginPath();
          ctx.arc(rx, ry, Math.max(10, rw * 0.5), Math.PI, 0, false);
          ctx.stroke();

          // Overhead tunnel lights (sodium tubes)
          ctx.fillStyle = `rgba(100, 116, 139, ${Math.min(0.9, scale * 0.8)})`;
          ctx.fillRect(rx - 15 * scale, ry - rw * 0.5, 30 * scale, 5 * scale);
        }

        ctx.fillStyle = '#64748b';
        ctx.font = '12px "Noto Sans JP", monospace';
        ctx.fillText('山手トンネル // YAMATE DEEP TUBE [18.2km]', 40, 60);
        ctx.fillText('換気システム稼働中 // AIR FLOW: 100%', 40, 80);
      }

      // 2. ROAD PERSPECTIVE & ROAD DASHES
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(0, horizonY, width, height - horizonY);

      // Road boundary lines
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(vanishingX - 80, horizonY);
      ctx.lineTo(0, height);
      ctx.moveTo(vanishingX + 80, horizonY);
      ctx.lineTo(width, height);
      ctx.stroke();

      // Dashed lane lines
      for (let line of roadLines) {
        line.z -= 6 * settings.speed;
        if (line.z <= 0) {
          line.z += 25 * 35;
        }
        const scale = 300 / (line.z + 50);
        const y = horizonY + (height - horizonY) * (scale * 0.7);
        const lH = 18 * scale;
        const lW = 5 * scale;

        if (y < height) {
          ctx.fillStyle = `rgba(71, 85, 105, ${Math.min(0.8, scale)})`;
          ctx.fillRect(vanishingX - lW / 2, y, lW, lH);
          ctx.fillRect(vanishingX - 120 * scale, y, lW, lH);
          ctx.fillRect(vanishingX + 120 * scale, y, lW, lH);
        }
      }

      // Light streaks along the road
      for (let trail of lightTrails) {
        trail.x -= trail.speed * settings.speed;
        if (trail.x < -100) {
          trail.x = width + 100;
          trail.y = horizonY + Math.random() * (height - horizonY);
        }
        ctx.strokeStyle = `rgba(100, 116, 139, ${trail.alpha})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(trail.x, trail.y);
        ctx.lineTo(trail.x + trail.length, trail.y);
        ctx.stroke();
      }

      // 3. CUTE JAPANESE GIRL ON MOTORCYCLE (Silhouette & Anime Vector Line Art)
      // Motorcycle rider position: slightly bottom-center, smoothly swaying with highway curvature
      const swayX = Math.sin(tick * 0.04) * 14;
      const bounceY = Math.sin(tick * 0.25) * 2;
      const bikeX = width * 0.52 + swayX;
      const bikeY = height * 0.78 + bounceY;

      ctx.save();
      ctx.translate(bikeX, bikeY);

      // Wheel spinning spokes & tires
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = '#0f172a';
      ctx.fillStyle = '#334155';

      // Rear Wheel
      ctx.beginPath();
      ctx.arc(-70, 24, 28, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(-70, 24, 18, 0, Math.PI * 2);
      ctx.stroke();

      // Front Wheel
      ctx.beginPath();
      ctx.arc(70, 24, 28, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(70, 24, 18, 0, Math.PI * 2);
      ctx.stroke();

      // Spokes rotation
      const spokeAngle = tick * 0.3 * settings.speed;
      for (let a = 0; a < 6; a++) {
        const ang = spokeAngle + (a * Math.PI) / 3;
        // Front
        ctx.beginPath();
        ctx.moveTo(70, 24);
        ctx.lineTo(70 + Math.cos(ang) * 18, 24 + Math.sin(ang) * 18);
        ctx.stroke();
        // Rear
        ctx.beginPath();
        ctx.moveTo(-70, 24);
        ctx.lineTo(-70 + Math.cos(ang) * 18, 24 + Math.sin(ang) * 18);
        ctx.stroke();
      }

      // Motorcycle Frame & Fairings (Sports Superbike)
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(-70, 24); // Rear axle
      ctx.lineTo(-30, -5); // Swingarm pivot
      ctx.lineTo(15, -12); // Engine chassis
      ctx.lineTo(55, -28); // Handlebar triple clamp
      ctx.lineTo(70, 24); // Front axle
      ctx.lineTo(45, -8);
      ctx.lineTo(-20, 10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Aerodynamic aerodynamic fairing nose & windscreen
      ctx.beginPath();
      ctx.moveTo(10, -25);
      ctx.lineTo(75, -28); // Nose cone
      ctx.lineTo(82, -22); // Headlight beak
      ctx.lineTo(60, -2);
      ctx.lineTo(15, -10);
      ctx.closePath();
      ctx.fillStyle = '#0f172a';
      ctx.fill();

      // Exhaust pipe & muffler with heat trail
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-10, 8);
      ctx.lineTo(-55, 12);
      ctx.lineTo(-85, 2);
      ctx.stroke();

      // Exhaust particles
      for (let p = 0; p < 4; p++) {
        const px = -95 - p * 15 - (tick % 15);
        const py = 2 + Math.sin(tick * 0.3 + p) * 4;
        ctx.fillStyle = `rgba(148, 163, 184, ${0.4 - p * 0.08})`;
        ctx.beginPath();
        ctx.arc(px, py, 3 + p * 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Headlight high-beam cone
      const beamGrad = ctx.createLinearGradient(82, -22, 380, -10);
      beamGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
      beamGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(82, -22);
      ctx.lineTo(380, -60);
      ctx.lineTo(380, 50);
      ctx.closePath();
      ctx.fill();

      // Cute Japanese Girl Rider Body (Leaning forward in racing tuck)
      // Riding pants & legs
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(-35, -22); // Hip on seat
      ctx.lineTo(-5, 0); // Knee tucked
      ctx.lineTo(-25, 18); // Foot on rearset peg
      ctx.lineTo(-35, 12);
      ctx.lineTo(-20, -6);
      ctx.lineTo(-42, -18);
      ctx.closePath();
      ctx.fill();

      // Torso / Jacket (tucked forward over the fuel tank)
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(-38, -25);
      ctx.lineTo(5, -42); // Shoulder
      ctx.lineTo(25, -28); // Chest over tank
      ctx.lineTo(-10, -22);
      ctx.closePath();
      ctx.fill();

      // Arms reaching clip-on handlebars
      ctx.lineWidth = 5;
      ctx.strokeStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(5, -42); // Shoulder
      ctx.lineTo(32, -32); // Elbow
      ctx.lineTo(52, -28); // Hand on grip
      ctx.stroke();

      // Helmet & cute ponytail / long anime hair flowing in wind
      // Helmet base
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(16, -56, 15, 0, Math.PI * 2);
      ctx.fill();

      // Helmet Visor (sleek tinted mirror visor)
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.arc(22, -56, 12, -Math.PI * 0.25, Math.PI * 0.28);
      ctx.lineTo(22, -54);
      ctx.closePath();
      ctx.fill();

      // Flowing Hair & Ribbons whipping backward in speedwind
      const hairWave1 = Math.sin(tick * 0.4) * 8;
      const hairWave2 = Math.cos(tick * 0.35) * 10;

      ctx.fillStyle = '#111827';
      ctx.beginPath();
      ctx.moveTo(6, -56); // Hair root at helmet base
      ctx.bezierCurveTo(-25, -55 + hairWave1, -55, -45 + hairWave2, -90, -42 + hairWave1);
      ctx.bezierCurveTo(-55, -35, -20, -48, 8, -48);
      ctx.closePath();
      ctx.fill();

      // Hair Ribbon (fluttering red/silver accent)
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(8, -52);
      ctx.quadraticCurveTo(-30, -58 + hairWave1, -65, -50 + hairWave2);
      ctx.stroke();

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [settings.mode, settings.scene, settings.speed]);

  return (
    <>
      {/* Background Ambient Layer */}
      <div
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
        style={{
          opacity: settings.opacity / 100,
          filter: `blur(${settings.blur}px) grayscale(100%) contrast(115%) brightness(120%)`,
        }}
      >
        {settings.mode === 'canvas' ? (
          <canvas ref={canvasRef} className="w-full h-full object-cover" />
        ) : (
          <video
            ref={videoRef}
            src={activeVideoUrl}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover scale-105"
          />
        )}

        {/* Subtle Japanese watermarking in ambient layer */}
        <div className="absolute top-16 right-8 text-right pointer-events-none opacity-40">
          <div className="text-xs font-bold tracking-widest text-neutral-800">
            黒鉄 // KUROGANE MOTORCYCLE AMBIENT LAYER
          </div>
          <div className="text-[10px] tracking-wider text-neutral-600 font-mono">
            SYS.LOC: TOKYO_C1_LOOP // YAMATE_TUNNEL // SPEED: 142KM/H
          </div>
        </div>
      </div>

      {/* HUGE MOVING JAPANESE LETTERS IN GREY: "ごゆっくりお過ごしください" (Enjoy your stay) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none flex flex-col justify-around py-4">
        {/* Row 1: Leftward drifting huge kanji/hiragana */}
        <div className="overflow-hidden whitespace-nowrap">
          <div className="animate-bg-marquee-left text-[14vw] sm:text-[11vw] font-black tracking-widest text-neutral-900/[0.045] leading-none jp-font select-none">
            <span>ごゆっくりお過ごしください // ENJOY YOUR STAY ・ ごゆっくりお過ごしください // ENJOY YOUR STAY ・ </span>
            <span>ごゆっくりお過ごしください // ENJOY YOUR STAY ・ ごゆっくりお過ごしください // ENJOY YOUR STAY ・ </span>
          </div>
        </div>

        {/* Row 2: Rightward drifting huge Japanese letters */}
        <div className="overflow-hidden whitespace-nowrap">
          <div className="animate-bg-marquee-right text-[15vw] sm:text-[12vw] font-black tracking-widest text-neutral-900/[0.038] leading-none jp-font select-none">
            <span>滞在をお楽しみください // ENJOY YOUR STAY ・ 滞在をお楽しみください // ENJOY YOUR STAY ・ </span>
            <span>滞在をお楽しみください // ENJOY YOUR STAY ・ 滞在をお楽しみください // ENJOY YOUR STAY ・ </span>
          </div>
        </div>

        {/* Row 3: Leftward drifting huge Japanese letters */}
        <div className="overflow-hidden whitespace-nowrap">
          <div className="animate-bg-marquee-left-slow text-[13vw] sm:text-[10vw] font-black tracking-widest text-neutral-900/[0.04] leading-none jp-font select-none">
            <span>ごゆっくりどうぞ // ENJOY YOUR STAY ・ ごゆっくりどうぞ // ENJOY YOUR STAY ・ </span>
            <span>ごゆっくりどうぞ // ENJOY YOUR STAY ・ ごゆっくりどうぞ // ENJOY YOUR STAY ・ </span>
          </div>
        </div>
      </div>

      {/* Ambient Control Quick Trigger (Bottom-Right Floating HUD) */}
      <div className="fixed bottom-4 right-4 z-40">
        {showControls ? (
          <div className="bg-white/95 backdrop-blur-md border border-neutral-300 shadow-xl p-3.5 rounded-none text-xs w-72 space-y-3 font-mono">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
              <span className="font-bold flex items-center gap-1.5 text-neutral-900">
                <Sparkles className="w-3.5 h-3.5 text-neutral-700" />
                AMBIENT_RIDER // 雰囲気
              </span>
              <button
                onClick={() => setShowControls(false)}
                className="text-neutral-500 hover:text-black font-bold px-1"
              >
                [X]
              </button>
            </div>

            {/* Mode Selector */}
            <div>
              <label className="text-[10px] font-semibold text-neutral-600 block mb-1">
                RENDER_MODE // 映像方式
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => onUpdateSettings({ mode: 'canvas' })}
                  className={`px-2 py-1 border text-center text-[11px] ${
                    settings.mode === 'canvas'
                      ? 'border-black bg-black text-white font-bold'
                      : 'border-neutral-300 bg-neutral-50 text-neutral-700 hover:border-neutral-400'
                  }`}
                >
                  PROCEDURAL_CANVAS
                </button>
                <button
                  onClick={() => onUpdateSettings({ mode: 'video' })}
                  className={`px-2 py-1 border text-center text-[11px] ${
                    settings.mode === 'video'
                      ? 'border-black bg-black text-white font-bold'
                      : 'border-neutral-300 bg-neutral-50 text-neutral-700 hover:border-neutral-400'
                  }`}
                >
                  VIDEO_STREAM
                </button>
              </div>
            </div>

            {/* Scene Selector */}
            <div>
              <label className="text-[10px] font-semibold text-neutral-600 block mb-1">
                SCENE // 走行区間
              </label>
              <div className="grid grid-cols-3 gap-1">
                {(['tunnel', 'city', 'expressway'] as const).map((sc) => (
                  <button
                    key={sc}
                    onClick={() => onUpdateSettings({ scene: sc })}
                    className={`px-1.5 py-1 text-[10px] border uppercase text-center ${
                      settings.scene === sc
                        ? 'border-black bg-black text-white font-bold'
                        : 'border-neutral-300 bg-white text-neutral-700'
                    }`}
                  >
                    {sc === 'tunnel' ? 'TUNNEL 隧道' : sc === 'city' ? 'CITY 都心' : 'HIGHWAY 高速'}
                  </button>
                ))}
              </div>
            </div>

            {/* Opacity Slider */}
            <div>
              <div className="flex justify-between text-[10px] text-neutral-600 mb-1">
                <span>OPACITY // 濃度</span>
                <span className="font-bold text-neutral-900">{settings.opacity}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="1"
                value={settings.opacity}
                onChange={(e) => onUpdateSettings({ opacity: Number(e.target.value) })}
                className="w-full accent-black cursor-pointer h-1.5 bg-neutral-200"
              />
              <div className="flex justify-between text-[9px] text-neutral-400 mt-0.5">
                <span>0% (Off)</span>
                <span>8% (Default)</span>
                <span>30% (Vivid)</span>
              </div>
            </div>

            {/* Sound toggle (Subtle ASMR engine purr) */}
            <div className="flex items-center justify-between pt-1 border-t border-neutral-100">
              <span className="text-[11px] flex items-center gap-1.5 text-neutral-700">
                {settings.soundEnabled ? (
                  <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5 text-neutral-400" />
                )}
                MOTORCYCLE_ASMR
              </span>
              <button
                onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
                className={`text-[10px] px-2 py-0.5 border ${
                  settings.soundEnabled
                    ? 'border-emerald-600 text-emerald-700 bg-emerald-50'
                    : 'border-neutral-300 text-neutral-600'
                }`}
              >
                {settings.soundEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowControls(true)}
            className="flex items-center gap-2 bg-white/90 hover:bg-black hover:text-white transition-colors duration-150 border border-neutral-300 shadow-sm px-2.5 py-1.5 text-[11px] font-mono text-neutral-800"
            title="Configure Background Rider Layer"
          >
            <Video className="w-3.5 h-3.5" />
            <span>RIDER_BG: {settings.opacity}%</span>
            <Sliders className="w-3 h-3 text-neutral-400" />
          </button>
        )}
      </div>
    </>
  );
};
