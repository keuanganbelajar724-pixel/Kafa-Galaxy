import React, { useState, useEffect, useRef } from 'react';
import { Camera, Download, X, Sparkles, Sliders, Palette, Check, ShieldCheck } from 'lucide-react';
import { sound } from '../game/sound';
import { haptics } from '../game/haptics';

interface PhotoModeModalProps {
  gameCanvas: HTMLCanvasElement | null;
  onClose: () => void;
}

type PhotoFilter = 'ps5_cyberpunk' | 'noor_gold' | 'void_obsidian' | 'emerald_matrix' | 'crimson_dragon' | 'vintage_arcade';
type PhotoStamp = 'ps5_pro' | 'kafa_aces' | 'hijaiyah_master' | 'sahabat_kafa';

export const PhotoModeModal: React.FC<PhotoModeModalProps> = ({ gameCanvas, onClose }) => {
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [filter, setFilter] = useState<PhotoFilter>('ps5_cyberpunk');
  const [stamp, setStamp] = useState<PhotoStamp>('ps5_pro');
  const [brightness, setBrightness] = useState<number>(105);
  const [contrast, setContrast] = useState<number>(115);
  const [saturation, setSaturation] = useState<number>(120);
  const [vignette, setVignette] = useState<number>(50);
  const [showScanlines, setShowScanlines] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const filters: { id: PhotoFilter; name: string; color: string; desc: string }[] = [
    { id: 'ps5_cyberpunk', name: 'PS5 Cyberpunk', color: '#00f0ff', desc: 'Kontras tinggi, saturasi cyan & magenta tajam' },
    { id: 'noor_gold', name: 'Noor Golden', color: '#facc15', desc: 'Sinar keemasan suci & hangat' },
    { id: 'void_obsidian', name: 'Void Obsidian', color: '#94a3b8', desc: 'Hitam pekat monokromatik dengan aksen neon' },
    { id: 'emerald_matrix', name: 'Emerald Matrix', color: '#34d399', desc: 'Nuansa hijau bioluminesen hutan purba' },
    { id: 'crimson_dragon', name: 'Crimson Dragon', color: '#f43f5e', desc: 'Aura merah menyala pertarungan luar angkasa' },
    { id: 'vintage_arcade', name: 'Retro Arcade 1995', color: '#f97316', desc: 'Warna nostalgia CRT arcade klasik' },
  ];

  const stamps: { id: PhotoStamp; title: string; subtitle: string }[] = [
    { id: 'ps5_pro', title: '🎮 PS5 PRO ENHANCED', subtitle: '4K HDR • 60 FPS • RAY-TRACING' },
    { id: 'kafa_aces', title: '★ KAFA GALAXY ACES ★', subtitle: 'MASTER OF SPACE & FLIGHT' },
    { id: 'hijaiyah_master', title: '🌙 محترف حروف الهجائية', subtitle: 'MASTER OF HIJAIYAH LETTERS' },
    { id: 'sahabat_kafa', title: '⚡ SAHABAT KAFA POWER', subtitle: 'GALACTIC GUARDIAN' },
  ];

  // Render processed photo on preview canvas
  const renderPhoto = (targetCanvas: HTMLCanvasElement, isHighRes: boolean = false) => {
    if (!gameCanvas) return;
    const ctx = targetCanvas.getContext('2d');
    if (!ctx) return;

    targetCanvas.width = gameCanvas.width;
    targetCanvas.height = gameCanvas.height;

    ctx.save();

    // 1. Draw base frozen game frame
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
    ctx.drawImage(gameCanvas, 0, 0);
    ctx.filter = 'none';

    // 2. Color Grading Tints
    ctx.globalCompositeOperation = 'overlay';
    if (filter === 'ps5_cyberpunk') {
      const grad = ctx.createLinearGradient(0, 0, targetCanvas.width, targetCanvas.height);
      grad.addColorStop(0, 'rgba(0, 240, 255, 0.22)');
      grad.addColorStop(1, 'rgba(236, 72, 153, 0.2)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, targetCanvas.width, targetCanvas.height);
    } else if (filter === 'noor_gold') {
      ctx.fillStyle = 'rgba(250, 204, 21, 0.25)';
      ctx.fillRect(0, 0, targetCanvas.width, targetCanvas.height);
    } else if (filter === 'void_obsidian') {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
      ctx.fillRect(0, 0, targetCanvas.width, targetCanvas.height);
    } else if (filter === 'emerald_matrix') {
      ctx.fillStyle = 'rgba(16, 185, 129, 0.28)';
      ctx.fillRect(0, 0, targetCanvas.width, targetCanvas.height);
    } else if (filter === 'crimson_dragon') {
      ctx.fillStyle = 'rgba(244, 63, 94, 0.28)';
      ctx.fillRect(0, 0, targetCanvas.width, targetCanvas.height);
    } else if (filter === 'vintage_arcade') {
      ctx.fillStyle = 'rgba(249, 115, 22, 0.2)';
      ctx.fillRect(0, 0, targetCanvas.width, targetCanvas.height);
    }
    ctx.globalCompositeOperation = 'source-over';

    // 3. Vignette
    if (vignette > 0) {
      const cx = targetCanvas.width / 2;
      const cy = targetCanvas.height / 2;
      const radius = Math.max(targetCanvas.width, targetCanvas.height) * 0.72;
      const vig = ctx.createRadialGradient(cx, cy, targetCanvas.height * 0.3, cx, cy, radius);
      vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vig.addColorStop(1, `rgba(2, 6, 23, ${vignette / 100})`);
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, targetCanvas.width, targetCanvas.height);
    }

    // 4. CRT Scanlines (if active or vintage filter)
    if (showScanlines || filter === 'vintage_arcade') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      for (let y = 0; y < targetCanvas.height; y += 4) {
        ctx.fillRect(0, y, targetCanvas.width, 1.5);
      }
    }

    // 5. Watermark Stamp
    const stampData = stamps.find((s) => s.id === stamp) || stamps[0];
    const stampW = Math.min(320, targetCanvas.width * 0.42);
    const stampH = 50;
    const stampX = targetCanvas.width - stampW - 24;
    const stampY = targetCanvas.height - stampH - 24;

    // Stamp container badge
    ctx.fillStyle = 'rgba(2, 6, 23, 0.85)';
    ctx.strokeStyle = filter === 'noor_gold' ? '#facc15' : '#00f0ff';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.roundRect(stampX, stampY, stampW, stampH, 8);
    ctx.fill();
    ctx.stroke();

    // Stamp Title
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 13px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(stampData.title, stampX + stampW / 2, stampY + 22);

    // Stamp Subtitle
    ctx.fillStyle = filter === 'noor_gold' ? '#facc15' : '#38bdf8';
    ctx.font = 'bold 9px Orbitron, sans-serif';
    ctx.fillText(stampData.subtitle, stampX + stampW / 2, stampY + 38);

    ctx.restore();
  };

  useEffect(() => {
    if (previewCanvasRef.current && gameCanvas) {
      renderPhoto(previewCanvasRef.current, false);
    }
  }, [filter, stamp, brightness, contrast, saturation, vignette, showScanlines, gameCanvas]);

  const handleDownloadPhoto = () => {
    if (!gameCanvas) return;
    setIsExporting(true);
    haptics.trigger('ultimate');
    sound.playPowerup();

    const exportCanvas = document.createElement('canvas');
    renderPhoto(exportCanvas, true);

    try {
      const dataUrl = exportCanvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `KAFA-GALAXY-PS5-PHOTO-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      // fallback
    }

    setTimeout(() => {
      setIsExporting(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-xl animate-fade-in select-none">
      <div className="relative w-full max-w-4xl max-h-[95dvh] flex flex-col rounded-3xl bg-slate-900/95 border border-cyan-500/50 shadow-[0_0_50px_rgba(6,182,212,0.4)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white shadow-[0_0_12px_#00f0ff]">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black font-orbitron tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-blue-400">
                MODE FOTO SINEMATIK PS5
              </h2>
              <p className="text-[10px] text-cyan-300/80 font-medium">
                Abadikan Momen Pertarungan 3D & Simpan Foto HD
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-rose-500/80 hover:text-white text-slate-300 flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col lg:flex-row gap-5">
          {/* Photo Canvas Preview */}
          <div className="flex-1 flex flex-col items-center justify-center min-h-[260px] sm:min-h-[360px] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden relative shadow-inner">
            <canvas
              ref={previewCanvasRef}
              className="max-w-full max-h-[380px] object-contain rounded-lg shadow-[0_0_25px_rgba(0,0,0,0.8)]"
            />
            <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-slate-950/80 border border-cyan-500/40 text-[9.5px] font-orbitron font-bold text-cyan-300 flex items-center gap-1.5 backdrop-blur-md">
              <Sparkles className="w-3 h-3 text-amber-300 animate-spin" />
              <span>PS5 PRO PHOTO STUDIO</span>
            </div>
          </div>

          {/* Controls Panel */}
          <div className="w-full lg:w-72 flex flex-col gap-4">
            {/* Filter Presets */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold font-orbitron text-cyan-300 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5" />
                <span>FILTER WARNA SINEMATIK</span>
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {filters.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => {
                      haptics.trigger('button');
                      sound.playClick();
                      setFilter(f.id);
                    }}
                    style={{ borderColor: filter === f.id ? f.color : 'rgba(51, 65, 85, 0.6)' }}
                    className={`px-2.5 py-2 rounded-xl border text-[10px] font-bold font-orbitron text-left transition-all cursor-pointer backdrop-blur-md ${
                      filter === f.id
                        ? 'bg-slate-800/90 text-white shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                        : 'bg-slate-950/60 hover:bg-slate-800/60 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">{f.name}</span>
                      {filter === f.id && <Check className="w-3 h-3 text-cyan-400" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders */}
            <div className="flex flex-col gap-2.5 p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div className="text-[10px] font-bold font-orbitron text-slate-300 flex items-center gap-1">
                <Sliders className="w-3 h-3 text-cyan-400" />
                <span>PENYESUAIAN SINEMATIK</span>
              </div>

              {/* Brightness */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[9px] font-mono text-slate-400">
                  <span>Kecerahan</span>
                  <span>{brightness}%</span>
                </div>
                <input
                  type="range"
                  min="70"
                  max="140"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Contrast */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[9px] font-mono text-slate-400">
                  <span>Kontras</span>
                  <span>{contrast}%</span>
                </div>
                <input
                  type="range"
                  min="70"
                  max="150"
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Vignette */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[9px] font-mono text-slate-400">
                  <span>Vignette Kegelapan Sudut</span>
                  <span>{vignette}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="90"
                  value={vignette}
                  onChange={(e) => setVignette(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* CRT Scanline Toggle */}
              <label className="flex items-center gap-2 mt-1 cursor-pointer text-[10px] text-slate-300">
                <input
                  type="checkbox"
                  checked={showScanlines}
                  onChange={(e) => setShowScanlines(e.target.checked)}
                  className="w-3.5 h-3.5 accent-cyan-400 rounded"
                />
                <span>Efek Garis Layar CRT Retro</span>
              </label>
            </div>

            {/* Stamp Badge */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold font-orbitron text-cyan-300 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-amber-300" />
                <span>STEMPEL WATERMARK RESMI</span>
              </label>
              <select
                value={stamp}
                onChange={(e) => setStamp(e.target.value as PhotoStamp)}
                className="w-full px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-[10px] font-bold font-orbitron text-amber-300 focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                {stamps.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-4 py-2 rounded-xl border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white text-xs font-bold font-orbitron transition-all cursor-pointer"
          >
            KEMBALI KE GAME
          </button>

          <button
            onClick={handleDownloadPhoto}
            disabled={isExporting}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-500 hover:brightness-125 text-slate-950 font-black font-orbitron text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.6)] transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'MENYIMPAN...' : 'SIMPAN FOTO HD (DOWNLOAD)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
