import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Zap,
  Sparkles,
  Settings2,
  X,
  Vibrate,
  Crosshair,
  Flame,
  Shield,
  Layers,
} from 'lucide-react';
import { WeaponType, JurusId, JURUS_REGISTRY } from '../game/types';
import { sound } from '../game/sound';
import { haptics } from '../game/haptics';

interface TouchControlsProps {
  onVirtualKey: (key: string, isPressed: boolean) => void;
  onCycleWeapon?: () => void;
  activeWeapon?: WeaponType;
  specialEnergy?: number;
  ultimateEnergy?: number;
  novaStrikeReady?: boolean;
  onTriggerJurus?: (id: JurusId) => void;
  onTriggerNovaStrike?: () => void;
  activeJurusCooldowns?: Record<JurusId, number>;
  isRobotMode?: boolean;
  onToggleRobotMode?: () => void;
  controlMode?: 'dpad' | 'touch_drag';
  onToggleControlMode?: () => void;
  autoShoot?: boolean;
  onToggleAutoShoot?: () => void;
  hapticsEnabled?: boolean;
  onToggleHaptics?: () => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onVirtualKey,
  onCycleWeapon,
  activeWeapon = 'standard',
  specialEnergy = 100,
  ultimateEnergy = 0,
  novaStrikeReady = false,
  onTriggerJurus,
  onTriggerNovaStrike,
  activeJurusCooldowns = {} as Record<JurusId, number>,
  isRobotMode = false,
  onToggleRobotMode,
  controlMode = 'touch_drag',
  onToggleControlMode,
  autoShoot = true,
  onToggleAutoShoot,
  hapticsEnabled = true,
  onToggleHaptics,
}) => {
  const [selectedJurusIndex, setSelectedJurusIndex] = useState(0);
  const [isJurusDrawerOpen, setIsJurusDrawerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleTouchStart = (key: string) => (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    haptics.trigger('button');
    onVirtualKey(key, true);
  };

  const handleTouchEnd = (key: string) => (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    onVirtualKey(key, false);
  };

  const currentJurus = JURUS_REGISTRY[selectedJurusIndex] || JURUS_REGISTRY[0];
  const jurusCd = activeJurusCooldowns[currentJurus.id] || 0;
  const canFireSelectedJurus = jurusCd <= 0 && specialEnergy >= currentJurus.energyCost;

  const handleCastJurus = (jurusId: JurusId, index?: number) => {
    if (index !== undefined) setSelectedJurusIndex(index);
    const cd = activeJurusCooldowns[jurusId] || 0;
    const def = JURUS_REGISTRY.find((j) => j.id === jurusId);
    if (!def) return;
    if (cd <= 0 && specialEnergy >= def.energyCost) {
      haptics.trigger('jurus');
      if (onTriggerJurus) onTriggerJurus(jurusId);
      setIsJurusDrawerOpen(false);
    } else {
      sound.playWrong();
      haptics.trigger('error');
    }
  };

  return (
    <>
      {/* ==================== 1. MOBILE CONTROLS BAR ==================== */}
      <div className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none px-2 sm:px-4 pb-2 sm:pb-3 select-none flex flex-col justify-end safe-pb">
        {/* Top Control Accessory Pill: Switch Mode, Auto-Shoot status, Jurus Drawer button */}
        <div className="flex items-center justify-between w-full pointer-events-auto mb-1.5 px-0.5">
          {/* Left mini pills: Quick Dash & Robot transformation */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* Evasive Dash button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                haptics.trigger('button');
                onVirtualKey('ShiftLeft', true);
                setTimeout(() => onVirtualKey('ShiftLeft', false), 50);
              }}
              className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-slate-900/90 active:bg-cyan-900 border border-cyan-500/40 text-cyan-300 flex items-center gap-1 shadow-[0_0_12px_rgba(6,182,212,0.3)] active:scale-95 transition-all backdrop-blur-md cursor-pointer font-orbitron font-bold text-[10px] sm:text-xs"
              title="Dash Menghindar (Shift)"
            >
              <span>💨</span>
              <span className="font-mono text-[9px] sm:text-[10px] font-bold">DASH</span>
            </button>

            {/* Transform Robot <-> Jet */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                haptics.trigger('button');
                if (onToggleRobotMode) {
                  onToggleRobotMode();
                } else {
                  onVirtualKey('KeyT', true);
                  setTimeout(() => onVirtualKey('KeyT', false), 50);
                }
              }}
              className={`px-2 py-1.5 sm:px-3 sm:py-2 rounded-xl border flex items-center gap-1 active:scale-95 transition-all backdrop-blur-md cursor-pointer font-orbitron font-bold text-[10px] sm:text-xs ${
                isRobotMode
                  ? 'bg-amber-950/90 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                  : 'bg-slate-900/90 border-cyan-500/40 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
              }`}
              title="Transformasi Pesawat / Robot (T)"
            >
              <span>{isRobotMode ? '🤖' : '✈️'}</span>
              <span className="hidden xs:inline font-mono text-[9px] sm:text-[10px]">
                {isRobotMode ? 'ROBOT' : 'JET'}
              </span>
            </button>

            {/* Cycle Weapon Button */}
            {onCycleWeapon && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  haptics.trigger('button');
                  onCycleWeapon();
                }}
                className="px-2 py-1.5 sm:px-2.5 sm:py-2 rounded-xl bg-slate-900/90 active:bg-purple-950 border border-purple-500/40 text-purple-300 flex items-center gap-1 text-[9px] sm:text-[10px] font-mono font-bold backdrop-blur-md cursor-pointer active:scale-95 shadow-[0_0_10px_rgba(168,85,247,0.25)]"
                title="Ganti Senjata Laser (1-4)"
              >
                <span>🔫</span>
                <span className="hidden sm:inline uppercase">{activeWeapon}</span>
              </button>
            )}
          </div>

          {/* Right mini pills: ⚡ 14 Jurus KAFA Drawer & HP Controls Setting */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* Quick 14 Jurus Drawer Opener */}
            <button
              onClick={() => {
                sound.playClick();
                haptics.trigger('button');
                setIsJurusDrawerOpen(true);
              }}
              className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-gradient-to-r from-cyan-950/90 via-sky-950/90 to-blue-950/90 border border-cyan-400 text-cyan-300 flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.4)] active:scale-95 transition-all backdrop-blur-md cursor-pointer font-orbitron font-black text-[10px] sm:text-xs"
              title="Buka 14 Jurus Sahabat KAFA"
            >
              <span className="text-amber-300 text-xs sm:text-sm animate-pulse">⚡</span>
              <span className="text-white">JURUS KAFA</span>
              <span className="px-1 py-0.2 rounded bg-cyan-500/30 text-cyan-200 text-[8px] font-mono">
                14
              </span>
            </button>

            {/* HP Settings (Control Mode, Auto-Shoot, Haptics) */}
            <button
              onClick={() => {
                sound.playClick();
                haptics.trigger('button');
                setIsSettingsOpen(true);
              }}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-900/85 border border-slate-700 text-slate-300 active:text-cyan-300 active:border-cyan-400 transition-all cursor-pointer backdrop-blur-md"
              title="Pengaturan Kontrol HP"
            >
              <Settings2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Controls Row */}
        <div className="flex items-end justify-between w-full pointer-events-auto gap-2">
          {/* Left Side: D-Pad or Drag Instruction */}
          <div className="flex items-center gap-2">
            {controlMode === 'dpad' ? (
              /* D-PAD DIRECTION BUTTONS */
              <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-950/60 p-1 rounded-2xl border border-cyan-500/30 backdrop-blur-md">
                <button
                  onTouchStart={handleTouchStart('ArrowLeft')}
                  onTouchEnd={handleTouchEnd('ArrowLeft')}
                  onMouseDown={handleTouchStart('ArrowLeft')}
                  onMouseUp={handleTouchEnd('ArrowLeft')}
                  onMouseLeave={handleTouchEnd('ArrowLeft')}
                  className="w-13 h-13 sm:w-16 sm:h-16 rounded-xl bg-slate-900/90 active:bg-cyan-900 border-2 border-cyan-500/50 active:border-cyan-300 text-cyan-300 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)] active:scale-90 transition-all cursor-pointer"
                  aria-label="Gerak Kiri"
                >
                  <ChevronLeft className="w-7 h-7 sm:w-8 sm:h-8" />
                </button>

                <button
                  onTouchStart={handleTouchStart('ArrowRight')}
                  onTouchEnd={handleTouchEnd('ArrowRight')}
                  onMouseDown={handleTouchStart('ArrowRight')}
                  onMouseUp={handleTouchEnd('ArrowRight')}
                  onMouseLeave={handleTouchEnd('ArrowRight')}
                  className="w-13 h-13 sm:w-16 sm:h-16 rounded-xl bg-slate-900/90 active:bg-cyan-900 border-2 border-cyan-500/50 active:border-cyan-300 text-cyan-300 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)] active:scale-90 transition-all cursor-pointer"
                  aria-label="Gerak Kanan"
                >
                  <ChevronRight className="w-7 h-7 sm:w-8 sm:h-8" />
                </button>
              </div>
            ) : (
              /* TOUCH & DRAG TIP BADGE */
              <div className="hidden xs:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-cyan-500/30 backdrop-blur-md text-cyan-300 text-[10px] sm:text-xs">
                <span>👆</span>
                <span className="font-semibold text-slate-200">
                  {autoShoot ? 'Geser Layar Untuk Bermanuver' : 'Geser Untuk Gerak • Tahan Tembak'}
                </span>
              </div>
            )}
          </div>

          {/* Center-Right Side: Quick Active Jurus & Ultimate Galaxy Breaker */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Quick Active Jurus Trigger Button */}
            {onTriggerJurus && (
              <button
                onClick={() => handleCastJurus(currentJurus.id)}
                disabled={!canFireSelectedJurus}
                className={`h-13 sm:h-16 px-3 sm:px-4 rounded-2xl border flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-md font-orbitron font-bold text-xs ${
                  canFireSelectedJurus
                    ? 'bg-gradient-to-b from-slate-900/95 to-cyan-950/90 border-cyan-400 text-cyan-300 shadow-[0_0_18px_rgba(6,182,212,0.5)] active:scale-95'
                    : 'bg-slate-950/80 border-slate-800 text-slate-500 opacity-60'
                }`}
                title={`Gunakan Jurus #${currentJurus.number}: ${currentJurus.name}`}
              >
                <span className="text-xl sm:text-2xl">{currentJurus.icon}</span>
                <div className="flex flex-col items-start leading-tight">
                  <span className="text-[8px] text-amber-300 font-mono">
                    #{currentJurus.number} {currentJurus.energyCost}⚡
                  </span>
                  <span className="text-[10px] sm:text-xs text-white max-w-[70px] sm:max-w-[100px] truncate">
                    {jurusCd > 0 ? `${jurusCd.toFixed(1)}s` : currentJurus.name.split(' ')[0]}
                  </span>
                </div>
              </button>
            )}

            {/* Super Ultimate Galaxy Breaker Button */}
            {novaStrikeReady && onTriggerNovaStrike && (
              <button
                onClick={() => {
                  haptics.trigger('ultimate');
                  sound.playClick();
                  onTriggerNovaStrike();
                }}
                className="h-13 sm:h-16 px-3 sm:px-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-purple-600 to-rose-500 border-2 border-white text-white flex items-center gap-1.5 shadow-[0_0_30px_rgba(6,182,212,0.9)] active:scale-95 transition-all cursor-pointer animate-pulse font-orbitron font-black text-xs"
                title="GALAXY BREAKER ULTIMATE!"
              >
                <Sparkles className="w-5 h-5 text-amber-200 animate-spin" />
                <div className="flex flex-col items-start leading-tight text-left">
                  <span className="text-[8px] text-amber-200 uppercase tracking-widest font-mono">
                    ULTIMATE [X]
                  </span>
                  <span className="text-[11px] sm:text-xs font-black uppercase text-white drop-shadow-[0_0_6px_#ffffff]">
                    BREAKER!
                  </span>
                </div>
              </button>
            )}

            {/* Primary Shoot Button (Always accessible or manual fire in touch drag) */}
            <button
              onTouchStart={handleTouchStart('Space')}
              onTouchEnd={handleTouchEnd('Space')}
              onMouseDown={handleTouchStart('Space')}
              onMouseUp={handleTouchEnd('Space')}
              onMouseLeave={handleTouchEnd('Space')}
              className={`w-14 h-14 sm:w-17 sm:h-17 rounded-2xl flex flex-col items-center justify-center gap-0.5 active:scale-90 transition-all cursor-pointer font-black font-orbitron border-2 ${
                autoShoot
                  ? 'bg-gradient-to-tr from-cyan-600/90 via-sky-500/90 to-cyan-300/90 text-slate-950 border-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.6)]'
                  : 'bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 text-slate-950 border-white shadow-[0_0_25px_rgba(245,158,11,0.8)] animate-pulse'
              }`}
              aria-label="Tembak Laser"
              title="Tembak Laser (Spasi)"
            >
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 fill-slate-950" />
              <span className="text-[8px] sm:text-[9px] font-black tracking-wider uppercase">
                {autoShoot ? 'AUTO' : 'TEMBAK'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ==================== 2. POPUP 14 JURUS SAHABAT KAFA DRAWER ==================== */}
      {isJurusDrawerOpen && (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full sm:max-w-xl max-h-[85vh] sm:max-h-[80vh] rounded-t-3xl sm:rounded-3xl bg-slate-900/95 border-2 border-cyan-500/60 p-4 sm:p-5 flex flex-col shadow-[0_0_50px_rgba(6,182,212,0.4)] overflow-hidden safe-pb">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-2xl animate-pulse">⚡</span>
                <div className="text-left">
                  <h3 className="text-base sm:text-lg font-black font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-amber-300">
                    ARSENAL 14 JURUS SAHABAT KAFA
                  </h3>
                  <p className="text-[10px] sm:text-xs text-slate-400">
                    Pilih jurus tempur kosmik untuk langsung diaktifkan dengan vokal seruan!
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  sound.playClick();
                  setIsJurusDrawerOpen(false);
                }}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 active:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Special Energy Gauge in Drawer */}
            <div className="flex items-center justify-between px-3 py-2 my-2 rounded-xl bg-slate-950/80 border border-cyan-500/30 text-xs">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400 fill-cyan-400" />
                <span className="font-orbitron font-bold text-cyan-300">ENERGI TERSEDIA:</span>
              </div>
              <span className="font-orbitron font-black text-amber-300 text-sm">
                {specialEnergy}% / 100%
              </span>
            </div>

            {/* 14 Jurus Grid List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 py-1 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {JURUS_REGISTRY.map((jurus, idx) => {
                  const cd = activeJurusCooldowns[jurus.id] || 0;
                  const canFire = cd <= 0 && specialEnergy >= jurus.energyCost;
                  const isCurrent = currentJurus.id === jurus.id;

                  return (
                    <button
                      key={jurus.id}
                      onClick={() => handleCastJurus(jurus.id, idx)}
                      disabled={!canFire}
                      className={`p-2.5 rounded-2xl border text-left flex items-center justify-between gap-2.5 transition-all cursor-pointer ${
                        canFire
                          ? 'bg-slate-950/90 hover:bg-cyan-950/60 border-cyan-500/40 hover:border-cyan-400 active:scale-95 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                          : 'bg-slate-950/50 border-slate-800/80 opacity-50 cursor-not-allowed'
                      } ${isCurrent ? 'ring-2 ring-cyan-400' : ''}`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 border"
                          style={{ borderColor: jurus.color, backgroundColor: `${jurus.color}15` }}
                        >
                          {jurus.icon}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-mono font-bold text-amber-300">
                              #{jurus.number}
                            </span>
                            <span className="text-xs font-black font-orbitron text-white truncate">
                              {jurus.name}
                            </span>
                          </div>
                          <span className="text-[10px] text-cyan-200/90 font-medium truncate">
                            {jurus.powerName}
                          </span>
                          <span className="text-[9px] text-slate-400 truncate">
                            {jurus.subtitle}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end flex-shrink-0">
                        <span className="text-[10px] font-mono font-bold text-cyan-300">
                          {jurus.energyCost}⚡
                        </span>
                        {cd > 0 ? (
                          <span className="text-[9px] font-mono font-bold text-rose-400">
                            {cd.toFixed(1)}s
                          </span>
                        ) : (
                          <span className="text-[8px] font-orbitron font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                            SIAP!
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 3. MOBILE CONTROL PREFERENCES MODAL ==================== */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900/95 border-2 border-cyan-500/60 p-5 flex flex-col shadow-[0_0_40px_rgba(6,182,212,0.4)] safe-pb">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-cyan-400" />
                <h3 className="font-black font-orbitron text-white text-base">KONTROL HP (MOBILE)</h3>
              </div>
              <button
                onClick={() => {
                  sound.playClick();
                  setIsSettingsOpen(false);
                }}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3.5 text-left text-xs">
              {/* Option 1: Control Style */}
              <div>
                <label className="font-bold text-slate-300 uppercase tracking-wider text-[10px] block mb-1.5">
                  Tipe Kendali Kapal:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      sound.playClick();
                      if (onToggleControlMode && controlMode !== 'touch_drag') onToggleControlMode();
                    }}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      controlMode === 'touch_drag'
                        ? 'bg-cyan-950/90 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                        : 'bg-slate-950/80 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="text-xl">👆</span>
                    <span className="font-bold font-orbitron text-[11px]">Sentuh Layar</span>
                    <span className="text-[9px] text-center text-slate-400">
                      Geser jari langsung di layar
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      sound.playClick();
                      if (onToggleControlMode && controlMode !== 'dpad') onToggleControlMode();
                    }}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      controlMode === 'dpad'
                        ? 'bg-cyan-950/90 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                        : 'bg-slate-950/80 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="text-xl">🎮</span>
                    <span className="font-bold font-orbitron text-[11px]">Tombol D-Pad</span>
                    <span className="text-[9px] text-center text-slate-400">
                      Tombol panah kiri / kanan
                    </span>
                  </button>
                </div>
              </div>

              {/* Option 2: Auto-Shoot */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="font-bold text-white text-xs block">Tembak Otomatis (Auto-Shoot)</span>
                    <span className="text-[10px] text-slate-400">Menembak otomatis saat bergerak</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    sound.playClick();
                    if (onToggleAutoShoot) onToggleAutoShoot();
                  }}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    autoShoot ? 'bg-cyan-500' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                      autoShoot ? 'right-0.5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Option 3: Haptics Vibration */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <Vibrate className="w-4 h-4 text-cyan-400" />
                  <div>
                    <span className="font-bold text-white text-xs block">Getaran Haptik HP</span>
                    <span className="text-[10px] text-slate-400">Efek getar saat menembak & terkena hit</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    sound.playClick();
                    if (onToggleHaptics) onToggleHaptics();
                  }}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    hapticsEnabled ? 'bg-cyan-500' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                      hapticsEnabled ? 'right-0.5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                setIsSettingsOpen(false);
              }}
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-orbitron text-xs shadow-[0_0_15px_rgba(6,182,212,0.4)] cursor-pointer"
            >
              SIMPAN & KEMBALI
            </button>
          </div>
        </div>
      )}
    </>
  );
};
