import React from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX, Smartphone, Flame, Shield, Camera, Sparkles } from 'lucide-react';
import { sound } from '../game/sound';
import { haptics } from '../game/haptics';
import { CameraMode, PS5GraphicsMode } from '../game/types';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onHome: () => void;
  controlMode?: 'dpad' | 'touch_drag';
  onToggleControlMode?: () => void;
  autoShoot?: boolean;
  onToggleAutoShoot?: () => void;
  isGodMode?: boolean;
  onToggleGodMode?: () => void;
  cameraMode?: CameraMode;
  onCycleCamera?: () => void;
  ps5GraphicsMode?: PS5GraphicsMode;
  onTogglePS5Graphics?: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onHome,
  controlMode = 'touch_drag',
  onToggleControlMode,
  autoShoot = true,
  onToggleAutoShoot,
  isGodMode = true,
  onToggleGodMode,
  cameraMode = 'chase_3d',
  onCycleCamera,
  ps5GraphicsMode = 'rt_ultra',
  onTogglePS5Graphics,
}) => {
  const [isMuted, setIsMuted] = React.useState(sound.getIsMuted());

  const handleToggleSound = () => {
    haptics.trigger('button');
    const muted = sound.toggleMute();
    setIsMuted(muted);
    if (!muted) sound.playClick();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn safe-pb safe-pt">
      <div className="w-full max-w-sm max-h-[92dvh] overflow-y-auto rounded-3xl bg-slate-900/95 border-2 border-cyan-500/50 p-5 sm:p-7 flex flex-col items-center text-center shadow-[0_0_35px_rgba(6,182,212,0.4)]">
        {/* Header Icon */}
        <div className="w-14 h-14 rounded-2xl bg-cyan-950/80 border border-cyan-400/50 flex items-center justify-center text-cyan-300 mb-2 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
          <span className="text-xl font-black font-orbitron">||</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-sky-100">
          MISI DIJEDA
        </h2>
        <p className="text-[11px] text-slate-400 mt-0.5 mb-4">
          Sistem pesawat dalam kondisi siaga luar angkasa
        </p>

        {/* Mobile Controls Quick Switcher in Pause */}
        {onToggleControlMode && (
          <div className="w-full p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 mb-3 text-left">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              PENGATURAN KENDALI HP:
            </span>
            <div className="flex items-center justify-between gap-1 mb-1.5">
              <span className="text-xs text-slate-300 flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                Mode:
              </span>
              <button
                onClick={() => {
                  haptics.trigger('button');
                  sound.playClick();
                  onToggleControlMode();
                }}
                className="px-2 py-0.5 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-orbitron text-[10px] font-bold cursor-pointer"
              >
                {controlMode === 'touch_drag' ? '👆 Sentuh Layar' : '🎮 D-Pad'}
              </button>
            </div>
            {onToggleAutoShoot && (
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs text-slate-300 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  Auto-Tembak:
                </span>
                <button
                  onClick={() => {
                    haptics.trigger('button');
                    sound.playClick();
                    onToggleAutoShoot();
                  }}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold font-mono cursor-pointer ${
                    autoShoot
                      ? 'bg-emerald-950 border border-emerald-400 text-emerald-300'
                      : 'bg-slate-800 border border-slate-700 text-slate-400'
                  }`}
                >
                  {autoShoot ? 'ON' : 'OFF'}
                </button>
              </div>
            )}
            {onToggleGodMode && (
              <div className="flex items-center justify-between gap-1 mt-1.5 pt-1.5 border-t border-slate-800">
                <span className="text-xs text-amber-300 font-bold flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  Mode Dewa (Nyawa ∞):
                </span>
                <button
                  onClick={() => {
                    haptics.trigger('button');
                    sound.playClick();
                    onToggleGodMode();
                  }}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold font-orbitron cursor-pointer ${
                    isGodMode
                      ? 'bg-amber-400 text-slate-950 font-black shadow-[0_0_8px_#facc15]'
                      : 'bg-slate-800 border border-slate-700 text-slate-400'
                  }`}
                >
                  {isGodMode ? 'AKTIF (∞)' : 'OFF'}
                </button>
              </div>
            )}
            {onCycleCamera && (
              <div className="flex items-center justify-between gap-1 mt-1.5 pt-1.5 border-t border-slate-800">
                <span className="text-xs text-cyan-300 font-bold flex items-center gap-1">
                  <Camera className="w-3.5 h-3.5 text-cyan-400" />
                  Kamera 3D (K):
                </span>
                <button
                  onClick={() => {
                    haptics.trigger('button');
                    sound.playClick();
                    onCycleCamera();
                  }}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold font-orbitron cursor-pointer ${
                    cameraMode === 'cockpit_fpv'
                      ? 'bg-rose-950 border border-rose-400 text-rose-200'
                      : cameraMode === 'topdown'
                      ? 'bg-slate-800 border border-slate-700 text-slate-400'
                      : 'bg-cyan-950 border border-cyan-400 text-cyan-200'
                  }`}
                >
                  {cameraMode === 'cockpit_fpv' ? '🚀 KOKPIT FPV' : cameraMode === 'topdown' ? '🕹️ 2D TOP-DOWN' : '🎥 3D CHASE'}
                </button>
              </div>
            )}
            {onTogglePS5Graphics && (
              <div className="flex items-center justify-between gap-1 mt-1.5 pt-1.5 border-t border-slate-800">
                <span className="text-xs text-amber-300 font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Grafis PS5 (G):
                </span>
                <button
                  onClick={() => {
                    haptics.trigger('button');
                    sound.playClick();
                    onTogglePS5Graphics();
                  }}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold font-orbitron cursor-pointer ${
                    ps5GraphicsMode !== 'perf_60'
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black shadow-[0_0_8px_#facc15]'
                      : 'bg-slate-800 border border-slate-700 text-slate-300'
                  }`}
                >
                  {ps5GraphicsMode !== 'perf_60' ? '✨ RT ULTRA HDR' : '⚡ 60FPS SPEED'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Buttons List */}
        <div className="w-full flex flex-col gap-2">
          <button
            onClick={() => {
              haptics.trigger('button');
              sound.playClick();
              onResume();
            }}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black font-orbitron tracking-wider flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.5)] cursor-pointer transition-all active:scale-95 text-xs sm:text-sm"
          >
            <Play className="w-4 h-4 fill-slate-950 text-slate-950" />
            <span>LANJUTKAN MISI</span>
          </button>

          <button
            onClick={() => {
              haptics.trigger('button');
              sound.playClick();
              onRestart();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-600 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            <span>ULANGI PERMAINAN</span>
          </button>

          <button
            onClick={handleToggleSound}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-600 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
            <span>AUDIO: {isMuted ? 'NONAKTIF' : 'AKTIF'}</span>
          </button>

          <button
            onClick={() => {
              haptics.trigger('button');
              sound.playClick();
              onHome();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-rose-500/30 text-rose-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <Home className="w-3.5 h-3.5" />
            <span>MENU UTAMA</span>
          </button>
        </div>
      </div>
    </div>
  );
};
