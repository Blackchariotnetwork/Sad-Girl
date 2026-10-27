import React, { useEffect, useRef, useState } from 'react';
import { AmbientSettings } from '../types';
import { Sliders, Video, Sparkles, Volume2, VolumeX, Zap, Gauge } from 'lucide-react';

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
  const [showControls, setShowControls] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.8); // Fast by default!

  // High-octane Tokyo night highway video loops
  const videoSources = {
    tunnel: 'https://assets.mixkit.co/videos/preview/mixkit-tunnel-of-futuristic-neon-lights-41564-large.mp4',
    city: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-city-traffic-at-night-41554-large.mp4',
    expressway: 'https://assets.mixkit.co/videos/preview/mixkit-highway-traffic-in-a-city-at-night-41551-large.mp4',
  };

  const activeVideoUrl = settings.customVideoUrl || videoSources[settings.scene] || videoSources.tunnel;

  // Ambient motorcycle engine rumble audio
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

        const osc = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(55 * speedMultiplier, ctx.currentTime);

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(110 * speedMultiplier, ctx.currentTime);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(180, ctx.currentTime);

        gain.gain.setValueAtTime(0.05, ctx.currentTime);

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
          } catch {}
        };
      } catch (err) {
        console.warn('AudioContext not permitted yet:', err);
      }
    } else {
      if (audioCtxRef.current && audioCtxRef.current.state === 'running') {
        audioCtxRef.current.suspend();
      }
    }
  }, [settings.soundEnabled, speedMultiplier]);

  // High-Speed City Lights & Girl on Motorcycle Canvas Animation
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

    // Fast-moving highway road dashes
    const roadLines: { z: number; xOffset: number }[] = [];
    for (let i = 0; i < 30; i++) {
      roadLines.push({ z: i * 30, xOffset: 0 });
    }

    // Tokyo City Skyscrapers with colorful neon signs & windows
    const buildings: {
      x: number;
      w: number;
      h: number;
      color: string;
      neonSign?: { text: string; color: string; y: number };
      windows: { x: number; y: number; c: string }[];
    }[] = [];

    const neonPalettes = ['#05d9e8', '#ff2a6d', '#ffb703', '#7928ca', '#00f5d4', '#ff0055'];
    const kanjiSigns = ['ネオ東京', '首都高C1', '大黒夜会', '暴走最速', '湾岸特急', '黒鉄通信', '渋谷道玄坂', '速度落とせ'];

    for (let i = 0; i < 40; i++) {
      const w = 60 + Math.random() * 100;
      const h = 120 + Math.random() * 280;
      const buildingColor = '#0a0c14';
      const windows: { x: number; y: number; c: string }[] = [];

      // Generate colorful windows
      const cols = Math.floor(w / 14);
      const rows = Math.floor(h / 18);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (Math.random() > 0.35) {
            windows.push({
              x: 6 + c * 13,
              y: 8 + r * 16,
              c: neonPalettes[Math.floor(Math.random() * neonPalettes.length)],
            });
          }
        }
      }

      const hasSign = Math.random() > 0.45;
      const neonSign = hasSign
        ? {
            text: kanjiSigns[Math.floor(Math.random() * kanjiSigns.length)],
            color: neonPalettes[Math.floor(Math.random() * neonPalettes.length)],
            y: 20 + Math.random() * (h - 60),
          }
        : undefined;

      buildings.push({ x: i * 110, w, h, color: buildingColor, neonSign, windows });
    }

    // Fast-moving colorful city light streaks & traffic trails
    const fastLightStreaks: {
      x: number;
      y: number;
      speed: number;
      length: number;
      color: string;
      width: number;
    }[] = [];

    for (let i = 0; i < 75; i++) {
      fastLightStreaks.push({
        x: Math.random() * width * 1.5,
        y: height * 0.45 + Math.random() * (height * 0.55),
        speed: (14 + Math.random() * 22) * speedMultiplier,
        length: 80 + Math.random() * 220,
        color: neonPalettes[Math.floor(Math.random() * neonPalettes.length)],
        width: 1 + Math.random() * 3,
      });
    }

    // Exhaust flame backfire particles
    const exhaustSparks: { x: number; y: number; vx: number; vy: number; life: number; color: string }[] = [];

    const render = () => {
      tick += 1.2 * speedMultiplier;

      // Dark gradient city night backdrop
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#040508');
      grad.addColorStop(0.55, '#0b0d18');
      grad.addColorStop(1, '#06070a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      const horizonY = height * 0.53;
      const vanishingX = width * 0.5;

      // 1. FAST MOVING CITY LIGHTS & TOKYO SKYLINE
      for (let b of buildings) {
        b.x -= 4.5 * speedMultiplier;
        if (b.x + b.w < -100) {
          b.x = width + 100;
        }

        const by = horizonY - b.h;

        // Building silhouette
        ctx.fillStyle = '#080a12';
        ctx.fillRect(b.x, by, b.w, b.h);

        // Building top rim glow
        ctx.strokeStyle = 'rgba(255, 42, 109, 0.4)';
        ctx.lineWidth = 1;
        ctx.strokeRect(b.x, by, b.w, b.h);

        // Neon Windows with pulse
        for (let win of b.windows) {
          if (Math.sin(tick * 0.05 + win.x) > -0.7) {
            ctx.fillStyle = win.c;
            ctx.globalAlpha = 0.65;
            ctx.fillRect(b.x + win.x, by + win.y, 6, 8);
            ctx.globalAlpha = 1.0;
          }
        }

        // Japanese Neon Kanji Signs on Buildings
        if (b.neonSign) {
          ctx.save();
          ctx.font = 'bold 15px "Noto Sans JP", monospace';
          ctx.fillStyle = b.neonSign.color;
          ctx.shadowColor = b.neonSign.color;
          ctx.shadowBlur = 12;
          ctx.fillText(b.neonSign.text, b.x + 8, by + b.neonSign.y);
          ctx.restore();
        }
      }

      // Tokyo Tower Silhouette with pulsating red aviation beacon
      const towerX = ((tick * -1.8) % (width + 600)) + width;
      ctx.save();
      ctx.strokeStyle = '#ff0055';
      ctx.shadowColor = '#ff0055';
      ctx.shadowBlur = 10;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(towerX - 50, horizonY);
      ctx.lineTo(towerX, horizonY - 320);
      ctx.lineTo(towerX + 50, horizonY);
      ctx.moveTo(towerX - 30, horizonY - 120);
      ctx.lineTo(towerX + 30, horizonY - 120);
      ctx.moveTo(towerX - 18, horizonY - 220);
      ctx.lineTo(towerX + 18, horizonY - 220);
      ctx.stroke();

      // Flashing Tower Beacon
      if (Math.sin(tick * 0.15) > 0) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(towerX, horizonY - 320, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // 2. WET HIGHWAY ASPHALT & NEON ROAD REFLECTIONS
      const roadGrad = ctx.createLinearGradient(0, horizonY, 0, height);
      roadGrad.addColorStop(0, '#0c0e1a');
      roadGrad.addColorStop(0.5, '#121524');
      roadGrad.addColorStop(1, '#07080f');
      ctx.fillStyle = roadGrad;
      ctx.fillRect(0, horizonY, width, height - horizonY);

      // Neon road lane lines in bright cyan
      ctx.strokeStyle = '#05d9e8';
      ctx.shadowColor = '#05d9e8';
      ctx.shadowBlur = 8;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(vanishingX - 120, horizonY);
      ctx.lineTo(0, height);
      ctx.moveTo(vanishingX + 120, horizonY);
      ctx.lineTo(width, height);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Dashed Highway Lines streaming rapidly toward viewer
      for (let line of roadLines) {
        line.z -= 8 * speedMultiplier;
        if (line.z <= 0) {
          line.z += 30 * 30;
        }
        const scale = 360 / (line.z + 40);
        const y = horizonY + (height - horizonY) * (scale * 0.72);
        const lH = 24 * scale;
        const lW = 6 * scale;

        if (y < height) {
          ctx.fillStyle = `rgba(255, 183, 3, ${Math.min(0.9, scale * 1.2)})`;
          ctx.shadowColor = '#ffb703';
          ctx.shadowBlur = 6 * scale;
          ctx.fillRect(vanishingX - lW / 2, y, lW, lH);
          ctx.fillRect(vanishingX - 140 * scale, y, lW * 0.8, lH);
          ctx.fillRect(vanishingX + 140 * scale, y, lW * 0.8, lH);
          ctx.shadowBlur = 0;
        }
      }

      // Fast-moving colorful city light streaks (Headlights & Taillights speeding past)
      for (let trail of fastLightStreaks) {
        trail.x -= trail.speed;
        if (trail.x < -trail.length) {
          trail.x = width + 100;
          trail.y = horizonY + Math.random() * (height - horizonY);
        }
        ctx.strokeStyle = trail.color;
        ctx.shadowColor = trail.color;
        ctx.shadowBlur = 10;
        ctx.lineWidth = trail.width;
        ctx.beginPath();
        ctx.moveTo(trail.x, trail.y);
        ctx.lineTo(trail.x + trail.length, trail.y);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // 3. THE GIRL ON THE MOTORCYCLE (Japanese Motorcycle Culture: Bosozoku / C1 Midnight Racer)
      const swayX = Math.sin(tick * 0.05) * 16;
      const bounceY = Math.sin(tick * 0.3) * 2.5;
      const bikeX = width * 0.52 + swayX;
      const bikeY = height * 0.77 + bounceY;

      ctx.save();
      ctx.translate(bikeX, bikeY);

      // Neon Underglow Puddle Reflection on Wet Asphalt (Cyber Cyan / Pink)
      const underglow = ctx.createRadialGradient(0, 36, 10, 0, 36, 120);
      underglow.addColorStop(0, 'rgba(5, 217, 232, 0.75)');
      underglow.addColorStop(0.5, 'rgba(255, 42, 109, 0.45)');
      underglow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = underglow;
      ctx.beginPath();
      ctx.ellipse(0, 36, 110, 22, 0, 0, Math.PI * 2);
      ctx.fill();

      // Spinning Wheel Rims with glowing neon edge tape
      const spokeAngle = tick * 0.45 * speedMultiplier;

      // Rear Wheel
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#05d9e8';
      ctx.shadowColor = '#05d9e8';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(-72, 22, 29, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(-72, 22, 19, 0, Math.PI * 2);
      ctx.fill();

      // Front Wheel
      ctx.strokeStyle = '#ff2a6d';
      ctx.shadowColor = '#ff2a6d';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(72, 22, 29, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(72, 22, 19, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Wheel Spokes in rapid blur
      for (let a = 0; a < 6; a++) {
        const ang = spokeAngle + (a * Math.PI) / 3;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 2;
        // Front
        ctx.beginPath();
        ctx.moveTo(72, 22);
        ctx.lineTo(72 + Math.cos(ang) * 19, 22 + Math.sin(ang) * 19);
        ctx.stroke();
        // Rear
        ctx.beginPath();
        ctx.moveTo(-72, 22);
        ctx.lineTo(-72 + Math.cos(ang) * 19, 22 + Math.sin(ang) * 19);
        ctx.stroke();
      }

      // Motorcycle Frame & Superbike Fairings
      ctx.fillStyle = '#11131f';
      ctx.strokeStyle = '#05d9e8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-72, 22);
      ctx.lineTo(-32, -6);
      ctx.lineTo(16, -14);
      ctx.lineTo(58, -30);
      ctx.lineTo(72, 22);
      ctx.lineTo(46, -10);
      ctx.lineTo(-20, 8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Aerodynamic Racing Nose & Windscreen
      ctx.fillStyle = '#090a12';
      ctx.beginPath();
      ctx.moveTo(12, -26);
      ctx.lineTo(76, -30);
      ctx.lineTo(84, -22);
      ctx.lineTo(62, -2);
      ctx.lineTo(16, -12);
      ctx.closePath();
      ctx.fill();

      // High-intensity Xenon Headlight Beam cutting into darkness
      const beamGrad = ctx.createLinearGradient(84, -22, 450, -10);
      beamGrad.addColorStop(0, 'rgba(5, 217, 232, 0.9)');
      beamGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.4)');
      beamGrad.addColorStop(1, 'rgba(5, 217, 232, 0)');
      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(84, -22);
      ctx.lineTo(450, -70);
      ctx.lineTo(450, 60);
      ctx.closePath();
      ctx.fill();

      // Titanium Exhaust Pipe with heat bluing & glowing cherry tip
      ctx.strokeStyle = '#ff8800';
      ctx.shadowColor = '#ff2a6d';
      ctx.shadowBlur = 10;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(-10, 6);
      ctx.lineTo(-58, 12);
      ctx.lineTo(-90, 4);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Exhaust Backfire Flame Pops (Intermittent sparks)
      if (Math.random() > 0.4) {
        exhaustSparks.push({
          x: -94,
          y: 4 + (Math.random() - 0.5) * 6,
          vx: -(6 + Math.random() * 12) * speedMultiplier,
          vy: (Math.random() - 0.5) * 4,
          life: 1.0,
          color: Math.random() > 0.5 ? '#ff2a6d' : '#05d9e8',
        });
      }

      for (let i = exhaustSparks.length - 1; i >= 0; i--) {
        const s = exhaustSparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.life -= 0.08;
        if (s.life <= 0) {
          exhaustSparks.splice(i, 1);
        } else {
          ctx.fillStyle = s.color;
          ctx.beginPath();
          ctx.arc(s.x, s.y, 3 * s.life, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Girl Rider Body in Black Leather Racing Tuck with Neon Piping
      // Riding Leathers (Legs & Knees)
      ctx.fillStyle = '#0d0f1a';
      ctx.strokeStyle = '#ff2a6d';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-36, -24);
      ctx.lineTo(-4, 0);
      ctx.lineTo(-24, 18);
      ctx.lineTo(-34, 12);
      ctx.lineTo(-20, -6);
      ctx.lineTo(-44, -18);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Torso / Rider Jacket (leaning aggressively over the tank)
      ctx.fillStyle = '#080a12';
      ctx.beginPath();
      ctx.moveTo(-40, -26);
      ctx.lineTo(6, -44);
      ctx.lineTo(26, -30);
      ctx.lineTo(-12, -22);
      ctx.closePath();
      ctx.fill();

      // Arms reaching clip-ons
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#1e2438';
      ctx.beginPath();
      ctx.moveTo(6, -44);
      ctx.lineTo(34, -34);
      ctx.lineTo(54, -30);
      ctx.stroke();

      // Helmet (Sleek full-face racing helmet)
      ctx.fillStyle = '#06070a';
      ctx.strokeStyle = '#05d9e8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(18, -58, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Mirrored Rainbow Neon Visor reflecting city lights
      const visorGrad = ctx.createLinearGradient(20, -68, 32, -48);
      visorGrad.addColorStop(0, '#ff2a6d');
      visorGrad.addColorStop(0.5, '#05d9e8');
      visorGrad.addColorStop(1, '#ffb703');
      ctx.fillStyle = visorGrad;
      ctx.beginPath();
      ctx.arc(24, -58, 13, -Math.PI * 0.28, Math.PI * 0.3);
      ctx.lineTo(24, -56);
      ctx.closePath();
      ctx.fill();

      // Long anime hair streaming backward in wind with neon highlights
      const hairWave1 = Math.sin(tick * 0.45) * 12;
      const hairWave2 = Math.cos(tick * 0.4) * 14;

      ctx.fillStyle = '#0b0d18';
      ctx.strokeStyle = '#ff2a6d';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(8, -58);
      ctx.bezierCurveTo(-26, -58 + hairWave1, -60, -48 + hairWave2, -110, -44 + hairWave1);
      ctx.bezierCurveTo(-60, -36, -22, -50, 10, -50);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Fluttering Red Racing Ribbon
      ctx.strokeStyle = '#ff0055';
      ctx.shadowColor = '#ff0055';
      ctx.shadowBlur = 8;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(10, -54);
      ctx.quadraticCurveTo(-32, -62 + hairWave1, -78, -52 + hairWave2);
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [settings.mode, settings.scene, speedMultiplier]);

  return (
    <>
      {/* Background Layer: City lights going fast with girl on motorcycle */}
      <div
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
        style={{
          opacity: 0.95, // High visual presence in black colorful theme
          filter: `blur(${settings.blur}px)`,
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
            className="w-full h-full object-cover scale-105 opacity-80"
          />
        )}

        {/* Ambient Dark Scrim so video cards remain razor-sharp readable */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#06070a]/85 via-[#06070a]/70 to-[#06070a]/92 pointer-events-none" />
      </div>

      {/* HUGE MOVING JAPANESE LETTERS IN GREY: "ごゆっくりお過ごしください" (Enjoy your stay) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none flex flex-col justify-around py-6 opacity-35">
        {/* Row 1: Leftward drifting huge kanji/hiragana */}
        <div className="overflow-hidden whitespace-nowrap">
          <div className="animate-bg-marquee-left-fast text-[14vw] sm:text-[11vw] font-black tracking-widest text-cyan-400/20 leading-none jp-font select-none">
            <span>ごゆっくりお過ごしください // ENJOY YOUR STAY ・ ごゆっくりお過ごしください // ENJOY YOUR STAY ・ </span>
            <span>ごゆっくりお過ごしください // ENJOY YOUR STAY ・ ごゆっくりお過ごしください // ENJOY YOUR STAY ・ </span>
          </div>
        </div>

        {/* Row 2: Rightward drifting huge Japanese letters */}
        <div className="overflow-hidden whitespace-nowrap">
          <div className="animate-bg-marquee-right-fast text-[15vw] sm:text-[12vw] font-black tracking-widest text-pink-500/15 leading-none jp-font select-none">
            <span>滞在をお楽しみください // TOKYO C1 LOOP ・ 滞在をお楽しみください // TOKYO C1 LOOP ・ </span>
            <span>滞在をお楽しみください // TOKYO C1 LOOP ・ 滞在をお楽しみください // TOKYO C1 LOOP ・ </span>
          </div>
        </div>

        {/* Row 3: Leftward drifting huge Japanese letters */}
        <div className="overflow-hidden whitespace-nowrap">
          <div className="animate-bg-marquee-left-fast text-[13vw] sm:text-[10vw] font-black tracking-widest text-amber-400/15 leading-none jp-font select-none">
            <span>ごゆっくりどうぞ // ENJOY YOUR STAY ・ ごゆっくりどうぞ // ENJOY YOUR STAY ・ </span>
            <span>ごゆっくりどうぞ // ENJOY YOUR STAY ・ ごゆっくりどうぞ // ENJOY YOUR STAY ・ </span>
          </div>
        </div>
      </div>

      {/* Ambient Speed & Audio Quick Control (Bottom-Right Floating HUD) */}
      <div className="fixed bottom-4 right-4 z-40">
        {showControls ? (
          <div className="bg-[#0b0d18]/95 backdrop-blur-md border border-cyan-500/40 shadow-2xl p-3.5 text-xs w-72 space-y-3 font-mono text-neutral-200">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <span className="font-bold flex items-center gap-1.5 text-cyan-400">
                <Zap className="w-3.5 h-3.5 text-pink-500" />
                CITY_LIGHTS_SPEED // 速度制御
              </span>
              <button
                onClick={() => setShowControls(false)}
                className="text-neutral-400 hover:text-white font-bold px-1"
              >
                [X]
              </button>
            </div>

            {/* Speed Selector (Going fast!) */}
            <div>
              <label className="text-[10px] font-semibold text-neutral-400 block mb-1">
                CITY_LIGHTS_VELOCITY // 光速
              </label>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { label: 'CRUISE 1X', val: 1.0 },
                  { label: 'FAST 2X', val: 2.0 },
                  { label: 'HYPER 3.5X', val: 3.5 },
                ].map((s) => (
                  <button
                    key={s.label}
                    onClick={() => setSpeedMultiplier(s.val)}
                    className={`px-1.5 py-1 text-[10px] border text-center ${
                      speedMultiplier === s.val
                        ? 'border-cyan-400 bg-cyan-950/70 text-cyan-300 font-bold'
                        : 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mode Selector */}
            <div>
              <label className="text-[10px] font-semibold text-neutral-400 block mb-1">
                RENDER_MODE // 映像方式
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => onUpdateSettings({ mode: 'canvas' })}
                  className={`px-2 py-1 border text-center text-[11px] ${
                    settings.mode === 'canvas'
                      ? 'border-pink-500 bg-pink-950/60 text-pink-300 font-bold'
                      : 'border-neutral-800 bg-neutral-900/60 text-neutral-400'
                  }`}
                >
                  NEON_CANVAS
                </button>
                <button
                  onClick={() => onUpdateSettings({ mode: 'video' })}
                  className={`px-2 py-1 border text-center text-[11px] ${
                    settings.mode === 'video'
                      ? 'border-pink-500 bg-pink-950/60 text-pink-300 font-bold'
                      : 'border-neutral-800 bg-neutral-900/60 text-neutral-400'
                  }`}
                >
                  VIDEO_STREAM
                </button>
              </div>
            </div>

            {/* Engine Audio */}
            <div className="flex items-center justify-between pt-1 border-t border-neutral-800">
              <span className="text-[11px] flex items-center gap-1.5 text-neutral-300">
                {settings.soundEnabled ? (
                  <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5 text-neutral-500" />
                )}
                EXHAUST_RUMBLE
              </span>
              <button
                onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
                className={`text-[10px] px-2 py-0.5 border ${
                  settings.soundEnabled
                    ? 'border-cyan-400 text-cyan-300 bg-cyan-950/40'
                    : 'border-neutral-800 text-neutral-500'
                }`}
              >
                {settings.soundEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowControls(true)}
            className="flex items-center gap-2 bg-[#090b14]/90 hover:bg-neutral-900 text-cyan-300 border border-cyan-500/40 shadow-lg px-3 py-1.5 text-[11px] font-mono transition-colors"
            title="Configure City Lights & Rider"
          >
            <Gauge className="w-3.5 h-3.5 text-pink-500" />
            <span>CITY_SPEED: {speedMultiplier}X</span>
            <Sliders className="w-3 h-3 text-neutral-500" />
          </button>
        )}
      </div>
    </>
  );
};
