import React, { useState, useEffect } from 'react';
import {
  Play,
  BookOpen,
  HelpCircle,
  Volume2,
  VolumeX,
  Trophy,
  Shield,
  Sparkles,
  Compass,
  Award,
  Rocket,
  Maximize,
  Minimize,
  Smartphone,
} from 'lucide-react';
import { sound } from '../game/sound';
import { haptics } from '../game/haptics';
import { MATERI_PRESETS } from '../game/hijaiyahData';
import { GameMode, ShipSkinId } from '../game/types';
import { achievementManager } from '../game/achievements';
import { SHIP_SKINS, GALAXY_WORLDS } from '../game/worldData';

interface MainMenuProps {
  onStartGame: () => void;
  onOpenMateri: () => void;
  onOpenHowToPlay: () => void;
  onOpenKamus: () => void;
  onOpenAchievements: () => void;
  onOpenHangar: () => void;
  currentMateriId: string;
  currentMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  currentSkinId: ShipSkinId;
  highScore: number;
  controlMode?: 'dpad' | 'touch_drag';
  onToggleControlMode?: () => void;
  onSelectWorld?: (worldId: number) => void;
  currentWorldId?: number;
  isGodMode?: boolean;
  onToggleGodMode?: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onStartGame,
  onOpenMateri,
  onOpenHowToPlay,
  onOpenKamus,
  onOpenAchievements,
  onOpenHangar,
  currentMateriId,
  currentMode,
  onSelectMode,
  currentSkinId,
  highScore,
  controlMode = 'touch_drag',
  onToggleControlMode,
  onSelectWorld,
  currentWorldId,
  isGodMode = true,
  onToggleGodMode,
}) => {
  const [isMuted, setIsMuted] = useState(sound.getIsMuted());
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const activePreset = MATERI_PRESETS.find((p) => p.id === currentMateriId) || MATERI_PRESETS[0];
  const activeSkin = SHIP_SKINS.find((s) => s.id === currentSkinId) || SHIP_SKINS[0];

  const achievements = achievementManager.getAllAchievements();
  const unlockedAchievementsCount = achievements.filter((a) => a.isUnlocked).length;

  const handleToggleSound = () => {
    haptics.trigger('button');
    const muted = sound.toggleMute();
    setIsMuted(muted);
    if (!muted) sound.playClick();
  };

  const handleToggleFullscreen = () => {
    haptics.trigger('button');
    sound.playClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  const modeDescriptions: Record<GameMode, { title: string; desc: string; icon: string }> = {
    campaign: {
      title: 'Classic Campaign',
      desc: '5 World bertahap, evolusi target, dan pertempuran Dreadnought Alien.',
      icon: '🚀',
    },
    survival: {
      title: 'Survival Mode',
      desc: 'Gelombang musuh kosmik tanpa henti! Uji ketahanan refleks dan kecepatan.',
      icon: '🔥',
    },
    accuracy: {
      title: 'Accuracy Challenge',
      desc: '20 peluang tembakan presisi tinggi. Tanpa boleh salah bidik.',
      icon: '🎯',
    },
  };

  return (
    <div className="relative z-20 flex flex-col items-center justify-between min-h-[100dvh] w-full px-3 py-3 sm:px-6 sm:py-6 text-center select-none overflow-y-auto safe-pt safe-pb">
      {/* Top Bar: High Score, Hangar Button, Trophy Hall, Fullscreen & Sound Toggle */}
      <div className="w-full max-w-4xl flex items-center justify-between gap-1.5 sm:gap-2">
        {/* High Score Widget */}
        <div className="flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-slate-900/85 border border-amber-500/30 backdrop-blur-md shadow-[0_0_15px_rgba(245,158,11,0.2)]">
          <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
          <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-amber-300/90 hidden xs:inline">
            Rekor:
          </span>
          <span className="text-xs sm:text-sm font-black font-orbitron text-amber-300">
            {highScore.toLocaleString()}
          </span>
        </div>

        {/* Right Badges: Hangar Skin, Fullscreen, Sound */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Fullscreen button for mobile smartphones */}
          <button
            onClick={handleToggleFullscreen}
            className="flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-slate-900/80 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 transition-all cursor-pointer backdrop-blur-md text-xs font-bold"
            title="Layar Penuh HP"
          >
            {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{isFullscreen ? 'Exit Full' : 'Fullscreen'}</span>
          </button>

          <button
            onClick={() => {
              haptics.trigger('button');
              sound.playClick();
              onOpenHangar();
            }}
            className="flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-slate-900/80 border border-cyan-500/40 hover:border-cyan-300 text-cyan-300 transition-all cursor-pointer backdrop-blur-md text-xs font-bold"
            title="Ganti Skin Pesawat"
          >
            <Rocket className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden xs:inline">{activeSkin.name}</span>
          </button>

          <button
            onClick={() => {
              haptics.trigger('button');
              sound.playClick();
              onOpenAchievements();
            }}
            className="flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-slate-900/80 border border-amber-500/30 hover:border-amber-400 text-amber-300 transition-all cursor-pointer backdrop-blur-md text-xs font-bold"
            title="Aula Pencapaian Galaxy"
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs">
              {unlockedAchievementsCount}/{achievements.length}
            </span>
          </button>

          <button
            onClick={handleToggleSound}
            className="flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-slate-900/80 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-white transition-all cursor-pointer backdrop-blur-md"
            title="Nyalakan / Matikan Suara"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
          </button>
        </div>
      </div>

      {/* Hero Center Section: Cinematic Brand Identity */}
      <div className="my-auto max-w-xl w-full flex flex-col items-center py-2 sm:py-4">
        {/* Mobile Compatible & PS5 Cinematic Badge */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-cyan-950/90 via-slate-900/90 to-purple-950/90 border border-cyan-400/70 text-cyan-200 text-[10px] sm:text-[11px] font-black tracking-widest uppercase mb-1.5 shadow-[0_0_20px_rgba(6,182,212,0.6)] animate-pulse">
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
          <span>PS5 PRO 3D ENGINE • CHASE & KOKPIT FPV • RAY-TRACING ULTRA</span>
        </div>

        {/* Master Brand Typography */}
        <div className="flex flex-col items-center">
          <h1 className="text-3xl xs:text-4xl sm:text-6xl md:text-7xl font-black font-orbitron tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-300 to-blue-600 drop-shadow-[0_0_35px_rgba(6,182,212,0.7)]">
            KAFA GALAXY
          </h1>
          <div className="flex items-center gap-2 sm:gap-3 w-full justify-center my-0.5 sm:my-1">
            <div className="h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent flex-1" />
            <span className="text-[11px] sm:text-sm font-black tracking-widest text-cyan-200 uppercase font-orbitron">
              LETTER STRIKE
            </span>
            <div className="h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent flex-1" />
          </div>
          <p className="text-[10px] sm:text-xs font-semibold tracking-wider text-slate-400 uppercase">
            Master the Letters. Conquer the Galaxy.
          </p>
        </div>

        {/* Fighter Preview Showcase */}
        <div className="relative my-2 sm:my-4 w-44 h-32 sm:w-60 sm:h-40 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-cyan-500/25 box-glow-cyan animate-[spin_24s_linear_infinite]" />
          <div className="absolute inset-3 rounded-full border border-dashed border-cyan-400/20 animate-[spin_16s_linear_infinite_reverse]" />

          {/* Floating Arabic Letter Drone Satellites */}
          <div className="absolute top-0 left-1 w-8 h-8 rounded-xl bg-slate-900/90 border border-cyan-400/60 shadow-[0_0_12px_rgba(6,182,212,0.4)] flex items-center justify-center text-cyan-300 font-arabic text-lg font-bold animate-bounce">
            ا
          </div>
          <div className="absolute top-1 right-1 w-8 h-8 rounded-xl bg-slate-900/90 border border-amber-400/60 shadow-[0_0_12px_rgba(245,158,11,0.4)] flex items-center justify-center text-amber-300 font-arabic text-lg font-bold animate-pulse">
            ب
          </div>
          <div className="absolute bottom-1 left-2 w-8 h-8 rounded-xl bg-slate-900/90 border border-emerald-400/60 shadow-[0_0_12px_rgba(16,185,129,0.4)] flex items-center justify-center text-emerald-300 font-arabic text-lg font-bold">
            ج
          </div>
          <div className="absolute bottom-1 right-2 w-8 h-8 rounded-xl bg-slate-900/90 border border-pink-400/60 shadow-[0_0_12px_rgba(244,114,182,0.4)] flex items-center justify-center text-pink-300 font-arabic text-lg font-bold animate-bounce">
            د
          </div>

          {/* Fighter Display */}
          <div
            onClick={() => {
              haptics.trigger('button');
              onOpenHangar();
            }}
            className="relative z-10 w-22 h-22 sm:w-26 sm:h-26 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-cyan-400/60 flex flex-col items-center justify-center shadow-[0_0_35px_rgba(6,182,212,0.5)] cursor-pointer hover:scale-105 active:scale-95 transition-all"
            title="Klik untuk membuka Hangar Pesawat"
          >
            <svg viewBox="0 0 100 100" className="w-16 h-16 sm:w-18 sm:h-18 drop-shadow-[0_0_16px_rgba(6,182,212,0.6)]">
              <polygon points="34,80 40,80 37,96" fill={activeSkin.trailColor} opacity="0.9" />
              <polygon points="35,80 39,80 37,90" fill="#ffffff" />
              <polygon points="60,80 66,80 63,96" fill={activeSkin.trailColor} opacity="0.9" />
              <polygon points="61,80 65,80 63,90" fill="#ffffff" />
              <polygon
                points="50,12 60,32 66,34 64,40 68,42 88,58 86,68 76,64 70,68 63,62 50,66 37,62 30,68 24,64 14,68 12,58 32,42 36,40 34,34 40,32"
                fill={activeSkin.secondaryColor}
                stroke={activeSkin.primaryColor}
                strokeWidth="2.2"
              />
              <polygon points="85,56 90,58 87,69 83,67" fill={activeSkin.primaryColor} />
              <polygon points="15,56 10,58 13,69 17,67" fill={activeSkin.primaryColor} />
              <polygon points="50,16 57,36 64,52 60,60 50,62 40,60 36,52 43,36" fill={activeSkin.trimColor || '#ffffff'} />
              <polygon points="28,52 35,50 33,54 27,55" fill={activeSkin.accentColor} />
              <polygon points="72,52 65,50 67,54 73,55" fill={activeSkin.accentColor} />
              <polygon points="50,26 53,34 50,32 47,34" fill={activeSkin.accentColor} />
              <ellipse cx="50" cy="42" rx="7.5" ry="14" fill={activeSkin.cockpitColor} stroke={activeSkin.primaryColor} strokeWidth="1.2" />
            </svg>
            <span className="text-[8px] sm:text-[9px] font-black font-orbitron text-cyan-300 mt-0.5">
              {activeSkin.name}
            </span>
          </div>
        </div>

        {/* Game Mode Selector Tabs */}
        <div className="w-full max-w-md mb-2 p-1 rounded-2xl bg-slate-950/80 border border-cyan-500/30 flex items-center gap-1">
          {(['campaign', 'survival', 'accuracy'] as GameMode[]).map((m) => {
            const isSelected = currentMode === m;
            const labels: Record<GameMode, { text: string; icon: string }> = {
              campaign: { text: 'Campaign', icon: '🚀' },
              survival: { text: 'Survival', icon: '🔥' },
              accuracy: { text: 'Accuracy', icon: '🎯' },
            };
            return (
              <button
                key={m}
                onClick={() => {
                  haptics.trigger('button');
                  sound.playClick();
                  onSelectMode(m);
                }}
                className={`flex-1 py-1.5 px-1 rounded-xl text-xs font-black font-orbitron flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.5)]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <span>{labels[m].icon}</span>
                <span>{labels[m].text}</span>
              </button>
            );
          })}
        </div>

        <div className="text-[10px] sm:text-[11px] text-slate-400 max-w-md mb-2 px-2">
          {modeDescriptions[currentMode].desc}
        </div>

        {/* Mobile Control Style Quick Switcher */}
        {onToggleControlMode && (
          <div className="w-full max-w-md mb-2.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
              Kendali HP:
            </span>
            <button
              onClick={() => {
                haptics.trigger('button');
                sound.playClick();
                onToggleControlMode();
              }}
              className="px-2.5 py-0.5 rounded-lg bg-cyan-950/90 border border-cyan-500/40 text-cyan-300 font-orbitron font-bold text-[10px] hover:border-cyan-300 transition-all cursor-pointer"
            >
              {controlMode === 'touch_drag' ? '👆 Sentuh & Geser Layar' : '🎮 Tombol D-Pad Kiri-Kanan'}
            </button>
          </div>
        )}

        {/* Mode Dewa / Infinite Lives & Anti-Plane Super Weapons Quick Switcher */}
        {onToggleGodMode && (
          <div className="w-full max-w-md mb-2.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-950/85 via-slate-950/90 to-amber-950/85 border border-amber-500/50 flex items-center justify-between text-xs backdrop-blur-md shadow-[0_0_15px_rgba(245,158,11,0.25)]">
            <div className="flex flex-col text-left">
              <span className="text-amber-300 font-black text-xs font-orbitron flex items-center gap-1.5">
                <span>🛡️</span>
                <span>MODE DEWA (NYAWA ∞)</span>
              </span>
              <span className="text-[10px] text-amber-200/80">
                Nyawa tak terbatas & peluru pintar memburu pesawat alien
              </span>
            </div>
            <button
              onClick={() => {
                haptics.trigger('button');
                sound.playClick();
                onToggleGodMode();
              }}
              className={`px-3 py-1 rounded-lg font-orbitron font-black text-xs transition-all cursor-pointer ${
                isGodMode
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.8)]'
                  : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              {isGodMode ? 'AKTIF (∞)' : 'OFF'}
            </button>
          </div>
        )}

        {/* Selected Subject / Materi Indicator Button */}
        <div
          onClick={() => {
            haptics.trigger('button');
            sound.playClick();
            onOpenMateri();
          }}
          className="group cursor-pointer flex items-center justify-between gap-2 sm:gap-3 px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl bg-slate-900/85 border border-cyan-500/40 hover:border-cyan-300 transition-all text-xs text-slate-300 mb-3 backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.2)] max-w-md w-full"
        >
          <div className="flex items-center gap-2 sm:gap-2.5 overflow-hidden">
            <span className="text-xl sm:text-2xl">{activePreset.icon}</span>
            <div className="flex flex-col text-left">
              <span className="text-[9px] uppercase font-bold text-slate-400">Mata Pelajaran Aktif:</span>
              <span className="font-bold text-xs sm:text-sm text-cyan-300 group-hover:underline truncate">
                {activePreset.name}
              </span>
            </div>
          </div>
          <span className="text-[9px] sm:text-[10px] font-black px-2 py-1 sm:px-2.5 rounded-xl bg-cyan-500 text-slate-950 font-orbitron shadow-[0_0_8px_#38bdf8] flex-shrink-0">
            PILIH MAPEL
          </span>
        </div>

        {/* World / Location Quick Carousel Selector */}
        {onSelectWorld && (
          <div className="w-full max-w-md mb-2.5 p-2 rounded-2xl bg-slate-950/85 border border-amber-500/40 backdrop-blur-md flex flex-col gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1 font-orbitron">
                🌍 Lokasi Arena:
              </span>
              <span className="text-[9px] text-slate-400">
                Pilih matahari, bulan, atau langit cerah
              </span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 w-full">
              {GALAXY_WORLDS.map((w) => {
                const isSelected = (currentWorldId || 1) === w.id;
                const icon =
                  w.id === 1 ? '☀️' : w.id === 2 ? '🌕' : w.id === 3 ? '🌅' : w.id === 4 ? '🪐' : w.id === 5 ? '🌲' : '🏙️';
                return (
                  <button
                    key={w.id}
                    onClick={() => {
                      haptics.trigger('button');
                      sound.playClick();
                      onSelectWorld(w.id);
                    }}
                    className={`py-1.5 px-0.5 rounded-xl text-[9px] font-bold flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 font-black shadow-[0_0_10px_rgba(245,158,11,0.6)] ring-1 ring-amber-300'
                        : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                    title={w.subtitle}
                  >
                    <span className="text-sm">{icon}</span>
                    <span className="truncate max-w-[48px] leading-tight text-center">{w.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Launch Mission / Play Now Button */}
        <div className="w-full max-w-sm flex flex-col gap-2">
          <button
            onClick={() => {
              haptics.trigger('levelUp');
              sound.playClick();
              onStartGame();
            }}
            className="w-full py-3 sm:py-4 px-4 sm:px-6 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-black text-base sm:text-lg font-orbitron tracking-wider flex items-center justify-center gap-2.5 shadow-[0_0_30px_rgba(6,182,212,0.7)] hover:shadow-[0_0_40px_rgba(6,182,212,1)] active:scale-95 transition-all cursor-pointer"
          >
            <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-slate-950 text-slate-950" />
            <span>PLAY NOW • LUNCURKAN MISI!</span>
          </button>

          {/* 5-Button Action Bar */}
          <div className="grid grid-cols-5 gap-1 sm:gap-1.5">
            <button
              onClick={() => {
                haptics.trigger('button');
                sound.playClick();
                onOpenHangar();
              }}
              className="py-1.5 sm:py-2 px-1 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 text-[9px] sm:text-[10px] font-bold flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer backdrop-blur-md"
            >
              <Rocket className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
              <span>Hangar</span>
            </button>

            <button
              onClick={() => {
                haptics.trigger('button');
                sound.playClick();
                onOpenMateri();
              }}
              className="py-1.5 sm:py-2 px-1 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 text-[9px] sm:text-[10px] font-bold flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer backdrop-blur-md"
            >
              <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
              <span>Mapel</span>
            </button>

            <button
              onClick={() => {
                haptics.trigger('button');
                sound.playClick();
                onOpenKamus();
              }}
              className="py-1.5 sm:py-2 px-1 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 text-[9px] sm:text-[10px] font-bold flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer backdrop-blur-md"
            >
              <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
              <span>Kamus</span>
            </button>

            <button
              onClick={() => {
                haptics.trigger('button');
                sound.playClick();
                onOpenAchievements();
              }}
              className="py-1.5 sm:py-2 px-1 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-amber-500/30 hover:border-amber-400 text-amber-300 text-[9px] sm:text-[10px] font-bold flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer backdrop-blur-md"
            >
              <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
              <span>Trophy</span>
            </button>

            <button
              onClick={() => {
                haptics.trigger('button');
                sound.playClick();
                onOpenHowToPlay();
              }}
              className="py-1.5 sm:py-2 px-1 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 text-[9px] sm:text-[10px] font-bold flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer backdrop-blur-md"
            >
              <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
              <span>Panduan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="w-full max-w-2xl text-[10px] text-slate-400/80 mt-2 flex items-center justify-between border-t border-slate-800/80 pt-2 px-1">
        <span className="flex items-center gap-1">
          <Shield className="w-3 h-3 text-cyan-400" /> KAFA GALAXY Combat Engine
        </span>
        <span>Sentuh Layar / D-Pad • 14 Jurus KAFA</span>
      </div>
    </div>
  );
};
