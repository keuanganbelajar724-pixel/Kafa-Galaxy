import React from 'react';
import {
  Pause,
  Volume2,
  VolumeX,
  Shield,
  Zap,
  Clock,
  Flame,
  BatteryCharging,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Maximize,
  Minimize,
  Globe,
  X,
} from 'lucide-react';
import { GameStats, ActivePowerUps, WeaponType, JurusId, JURUS_REGISTRY } from '../game/types';
import { GALAXY_WORLDS, GalaxyWorld } from '../game/worldData';
import { sound } from '../game/sound';
import { haptics } from '../game/haptics';

interface GameHUDProps {
  stats: GameStats;
  activePowerUps: ActivePowerUps;
  onPause: () => void;
  onSelectWeapon?: (weapon: WeaponType) => void;
  onTriggerJurus?: (id: JurusId) => void;
  onTriggerNovaStrike?: () => void;
  onToggleRobotMode?: () => void;
  onToggleForestBiome?: () => void;
  onToggle3D?: () => void;
  onSelectWorld?: (worldId: number) => void;
  onToggleGodMode?: () => void;
  onCycleShip?: () => void;
  onOpenHangar?: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  stats,
  activePowerUps,
  onPause,
  onSelectWeapon,
  onTriggerJurus,
  onTriggerNovaStrike,
  onToggleRobotMode,
  onToggleForestBiome,
  onToggle3D,
  onSelectWorld,
  onToggleGodMode,
  onCycleShip,
  onOpenHangar,
}) => {
  const [isMuted, setIsMuted] = React.useState(sound.getIsMuted());
  const [isJurusDeckExpanded, setIsJurusDeckExpanded] = React.useState(true);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [jurusFeedbackNotice, setJurusFeedbackNotice] = React.useState<string | null>(null);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = React.useState(false);

  const showJurusFeedback = (msg: string) => {
    setJurusFeedbackNotice(msg);
    setTimeout(() => {
      setJurusFeedbackNotice((curr) => (curr === msg ? null : curr));
    }, 2800);
  };

  React.useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
    haptics.trigger('button');
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

  const comboMultiplier = Math.min(stats.combo, 8);

  const modeBadge = {
    campaign: { label: 'CAMPAIGN', color: 'border-cyan-500/40 text-cyan-300' },
    survival: { label: 'SURVIVAL', color: 'border-rose-500/40 text-rose-300' },
    accuracy: { label: 'ACCURACY', color: 'border-amber-500/40 text-amber-300' },
  }[stats.mode];

  // Prepare Mission Card details
  const renderMissionCard = (isMobile: boolean = false) => {
    if (!stats.activeMission) return null;
    const m = stats.activeMission;
    const subject = m.subject || 'hijaiyah';

    let subjectBadge = {
      title: 'HURUF HIJAIYAH',
      icon: '📖',
      border: 'border-cyan-400',
      glow: 'shadow-[0_0_20px_rgba(6,182,212,0.4)]',
      accent: 'text-cyan-300',
      bg: 'from-cyan-900/60 to-slate-900',
    };

    if (subject === 'matematika') {
      subjectBadge = {
        title: 'SOAL MATEMATIKA',
        icon: '🔢',
        border: 'border-amber-400',
        glow: 'shadow-[0_0_20px_rgba(245,158,11,0.4)]',
        accent: 'text-amber-300',
        bg: 'from-amber-900/60 to-slate-900',
      };
    } else if (subject === 'ipa') {
      subjectBadge = {
        title: 'SOAL IPA & SAINS',
        icon: '🔬',
        border: 'border-emerald-400',
        glow: 'shadow-[0_0_20px_rgba(52,211,153,0.4)]',
        accent: 'text-emerald-300',
        bg: 'from-emerald-900/60 to-slate-900',
      };
    } else if (subject === 'inggris') {
      subjectBadge = {
        title: 'BAHASA INGGRIS',
        icon: '🇬🇧',
        border: 'border-sky-400',
        glow: 'shadow-[0_0_20px_rgba(56,189,248,0.4)]',
        accent: 'text-sky-300',
        bg: 'from-sky-900/60 to-slate-900',
      };
    }

    const promptText = m.questionPrompt || `TEMBAK HURUF ${m.latin.toUpperCase()}`;

    return (
      <div
        className={`pointer-events-auto flex flex-col items-center w-full ${
          isMobile ? 'max-w-md mx-auto mt-1' : 'max-w-[290px] sm:max-w-md mx-auto'
        }`}
      >
        <div
          className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl bg-slate-950/90 border-2 ${
            subjectBadge.border
          } ${subjectBadge.glow} backdrop-blur-md flex items-center justify-between gap-2.5 sm:gap-4 w-full`}
        >
          {/* Mission Text */}
          <div className="flex flex-col text-left overflow-hidden">
            <div className="flex items-center gap-1.5">
              <span className="text-xs">{subjectBadge.icon}</span>
              <span
                className={`text-[9px] sm:text-[10px] font-black uppercase tracking-wider ${subjectBadge.accent}`}
              >
                {subjectBadge.title}
              </span>
            </div>
            <span className="text-xs sm:text-base font-black font-orbitron text-white leading-tight truncate">
              {promptText}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-300 font-medium truncate max-w-[190px] sm:max-w-[240px]">
              {m.hint}
            </span>
          </div>

          {/* Target Answer Badge */}
          <div
            className={`w-11 h-11 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-b ${subjectBadge.bg} border ${subjectBadge.border} flex items-center justify-center flex-shrink-0 shadow-[0_0_12px_rgba(255,255,255,0.15)] px-1`}
          >
            {subject === 'hijaiyah' ? (
              <span className="font-arabic text-2xl sm:text-3xl font-black text-cyan-200 drop-shadow-[0_0_8px_#38bdf8]">
                {m.arabic}
              </span>
            ) : (
              <span className="font-orbitron font-black text-xs sm:text-sm text-center text-white drop-shadow-[0_0_6px_currentColor] truncate">
                {m.arabic}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-20 pointer-events-none p-1.5 sm:p-3 flex flex-col gap-1 safe-pt">
        {/* Heroic Voice Shout Announcement Banner */}
        {stats.voiceShoutText && (
          <div className="pointer-events-none mx-auto px-4 py-1 rounded-full bg-gradient-to-r from-amber-500/95 via-yellow-300 to-cyan-400 text-slate-950 font-orbitron font-black text-xs sm:text-sm tracking-wider uppercase shadow-[0_0_25px_rgba(245,158,11,0.9)] border-2 border-white flex items-center gap-2 animate-bounce">
            <span>⚡</span>
            <span>{stats.voiceShoutText.replace(/⚡|🌌/g, '').trim()}</span>
            <span>⚡</span>
          </div>
        )}

        {/* Active Challenge Alert Banner */}
        {stats.challengeActive && (
          <div className="pointer-events-auto mx-auto w-full max-w-lg px-3 py-1 rounded-2xl bg-gradient-to-r from-emerald-950/95 via-teal-950/90 to-emerald-950/95 border-2 border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.5)] backdrop-blur-md flex items-center justify-between gap-2 animate-fadeIn">
            <div className="flex items-center gap-1.5">
              <span className="text-sm sm:text-lg animate-pulse">🌲</span>
              <div className="flex flex-col text-left">
                <span className="text-[10px] sm:text-xs font-black font-orbitron text-emerald-300 uppercase leading-tight">
                  {stats.challengeTitle || 'TANTANGAN: HUTAN PURBA KAFA!'}
                </span>
                <span className="text-[9px] sm:text-[10px] text-emerald-100/90 font-medium">
                  🎯 Target:{' '}
                  <span className="text-amber-300 font-bold">
                    {stats.challengeProgress || 0}/{stats.challengeGoal || 5}
                  </span>{' '}
                  Soal (+250 Bonus/Soal)
                </span>
              </div>
            </div>
            <div className="px-2 py-0.5 rounded-xl bg-emerald-900/90 border border-emerald-400/60 flex items-center gap-1 font-mono font-black text-amber-300 text-xs">
              <span>⏱️</span>
              <span>{Math.max(0, Math.ceil(stats.challengeTimer || 0))}s</span>
            </div>
          </div>
        )}

        {/* Boss Health Bar (When Boss is Active) */}
        {stats.bossActive && (
          <div className="pointer-events-auto w-full max-w-xl mx-auto px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl bg-slate-950/90 border-2 border-rose-500/80 shadow-[0_0_25px_rgba(244,63,94,0.5)] backdrop-blur-md animate-fadeIn flex flex-col gap-1">
            <div className="flex items-center justify-between text-[11px] sm:text-xs font-black font-orbitron">
              <span className="text-rose-400 flex items-center gap-1">⚠️ {stats.bossName}</span>
              <span className="text-slate-300">
                HP: {stats.bossHp}/{stats.bossMaxHp}
              </span>
            </div>

            {/* Boss HP Bar */}
            <div className="w-full h-2.5 sm:h-3 bg-slate-900 rounded-full overflow-hidden border border-rose-900/60 p-0.5">
              <div
                className="h-full bg-gradient-to-r from-rose-600 via-red-500 to-amber-400 rounded-full transition-all duration-200"
                style={{ width: `${(stats.bossHp / stats.bossMaxHp) * 100}%` }}
              />
            </div>

            {/* Boss Shield Weakness Reminder */}
            {stats.bossShielded && stats.bossShieldLetter && (
              <div className="flex items-center justify-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-cyan-300 bg-cyan-950/60 rounded-lg py-0.5 border border-cyan-500/30">
                <span>HANCURKAN HURUF</span>
                <span className="font-arabic text-base sm:text-lg text-white font-black">
                  {stats.bossShieldLetter.arabic}
                </span>
                <span>({stats.bossShieldLetter.latin}) BUKA PERISAI!</span>
              </div>
            )}
          </div>
        )}

        {/* ==================== DESKTOP TOP BAR (Wide screen) ==================== */}
        <div className="hidden sm:flex items-start justify-between gap-2 w-full">
          {/* Left Widget: Score, Mode & Combo */}
          <div className="pointer-events-auto flex flex-col gap-1.5 min-w-[140px]">
            <div className="px-3 py-1.5 rounded-xl bg-slate-950/85 border border-cyan-500/40 backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.25)] flex flex-col">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300/80">
                  SKOR
                </span>
                <span
                  className={`text-[9px] font-black px-1.5 py-0.2 rounded-full border ${modeBadge.color}`}
                >
                  {modeBadge.label}
                </span>
              </div>
              <span className="text-2xl font-black font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-white leading-tight">
                {stats.score.toLocaleString()}
              </span>
              {stats.mode === 'survival' && (
                <span className="text-[10px] font-bold text-amber-300 font-mono">
                  Waktu: {stats.survivalTime}s
                </span>
              )}
              {stats.mode === 'accuracy' && (
                <span className="text-[10px] font-bold text-amber-300 font-mono">
                  Sisa Peluang: {stats.accuracyRemainingChances}
                </span>
              )}
            </div>

            {stats.combo > 1 && (
              <div className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-950/90 to-orange-950/90 border border-amber-500/50 backdrop-blur-md flex items-center gap-1.5 animate-pulse">
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="text-xs font-black font-orbitron text-amber-300">
                  COMBO x{comboMultiplier}!
                </span>
                <span className="text-[10px] font-bold text-amber-200/80 ml-auto">
                  +{stats.combo * 100}
                </span>
              </div>
            )}
          </div>

          {/* Center Widget: Target Mission Card */}
          {renderMissionCard(false)}

          {/* Right Widget: Controls, Level & Lives */}
          <div className="pointer-events-auto flex flex-col items-end gap-1.5 min-w-[140px]">
            <div className="flex items-center gap-1.5">
              {onSelectWorld && (
                <button
                  onClick={() => {
                    haptics.trigger('button');
                    sound.playClick();
                    setIsLocationPickerOpen(!isLocationPickerOpen);
                  }}
                  className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 text-[10px] font-bold font-orbitron transition-all cursor-pointer backdrop-blur-md ${
                    isLocationPickerOpen
                      ? 'bg-amber-400 border-amber-200 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.6)]'
                      : 'bg-amber-950/80 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.4)] hover:brightness-125'
                  }`}
                  title="Ganti Lokasi Permainan (Matahari, Bulan, Fajar, Planet KAFA)"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">LOKASI:</span>
                  <span className="truncate max-w-[80px] sm:max-w-[105px]">
                    {stats.currentWorld?.name.split(' ')[0] || 'DUNIA'}
                  </span>
                </button>
              )}
              {onToggleForestBiome && (
                <button
                  onClick={() => {
                    haptics.trigger('button');
                    sound.playClick();
                    onToggleForestBiome();
                  }}
                  className={`px-2 py-1.5 rounded-xl border flex items-center gap-1 text-[10px] font-bold font-orbitron transition-all cursor-pointer backdrop-blur-md ${
                    stats.activeArenaBiome === 'forest'
                      ? 'bg-emerald-950/90 border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.5)]'
                      : 'bg-slate-950/80 border-slate-700 hover:border-emerald-500/60 text-slate-300'
                  }`}
                  title="Ganti Latar / Mulai Tantangan Hutan Purba (H)"
                >
                  <span>{stats.activeArenaBiome === 'forest' ? '🌲' : '🌌'}</span>
                  <span>{stats.activeArenaBiome === 'forest' ? 'HUTAN' : 'ARENA'}</span>
                </button>
              )}
              {onToggle3D && (
                <button
                  onClick={() => {
                    haptics.trigger('button');
                    sound.playClick();
                    onToggle3D();
                  }}
                  className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 text-[10px] font-bold font-orbitron transition-all cursor-pointer backdrop-blur-md ${
                    stats.is3DVisual !== false
                      ? 'bg-gradient-to-r from-cyan-950/90 via-slate-900/90 to-cyan-950/90 border-cyan-400 text-cyan-200 shadow-[0_0_16px_rgba(6,182,212,0.55)] font-black'
                      : 'bg-slate-950/80 border-slate-700 hover:border-cyan-500/60 text-slate-400'
                  }`}
                  title="PS5 Next-Gen 3D Engine: 6DOF Camera, 3D Curved Arena, Shaded Airframe & Polyhedral Crystals"
                >
                  <span className="text-xs">🎮</span>
                  <span>{stats.is3DVisual !== false ? 'PS5 3D' : '2D RETRO'}</span>
                  {stats.is3DVisual !== false && (
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping shadow-[0_0_6px_#00f0ff]" />
                  )}
                </button>
              )}
              {(onCycleShip || onOpenHangar) && (
                <button
                  onClick={() => {
                    haptics.trigger('button');
                    sound.playClick();
                    if (onCycleShip) onCycleShip();
                    else if (onOpenHangar) onOpenHangar();
                  }}
                  className="px-2.5 py-1.5 rounded-xl border border-cyan-500/50 bg-slate-950/80 hover:bg-cyan-950/70 text-cyan-300 flex items-center gap-1.5 text-[10px] font-bold font-orbitron transition-all cursor-pointer backdrop-blur-md"
                  title="Ganti Model Pesawat Tempur (Pioneer, Phantom, Nova, Titan, Valkyrie, Apocalypse)"
                >
                  <span>✈️</span>
                  <span className="hidden sm:inline">PESAWAT:</span>
                  <span className="uppercase text-amber-300 truncate max-w-[70px]">
                    {stats.shipSkin || 'PIONEER'}
                  </span>
                </button>
              )}
              {onToggleGodMode && (
                <button
                  onClick={() => {
                    haptics.trigger('button');
                    sound.playClick();
                    onToggleGodMode();
                  }}
                  className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1 text-[10px] font-bold font-orbitron transition-all cursor-pointer backdrop-blur-md ${
                    stats.isGodMode
                      ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 border-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.7)] font-black'
                      : 'bg-slate-950/80 border-slate-700 hover:border-amber-400/50 text-slate-400'
                  }`}
                  title="Aktifkan / Matikan Mode Dewa (Nyawa ∞ & Peluru Pintar Anti-Pesawat)"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>{stats.isGodMode ? 'DEWA: ∞' : 'NORMAL'}</span>
                </button>
              )}
              <button
                onClick={handleToggleFullscreen}
                className="p-1.5 sm:p-2 rounded-xl bg-slate-950/80 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-white transition-all cursor-pointer backdrop-blur-md"
                title="Layar Penuh"
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </button>
              <button
                onClick={handleToggleSound}
                className="p-1.5 sm:p-2 rounded-xl bg-slate-950/80 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-white transition-all cursor-pointer backdrop-blur-md"
                title="Suara"
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                )}
              </button>
              <button
                onClick={() => {
                  haptics.trigger('button');
                  sound.playClick();
                  onPause();
                }}
                className="p-1.5 sm:p-2 rounded-xl bg-slate-950/80 border border-slate-700 hover:border-amber-400 text-amber-400 hover:text-white transition-all cursor-pointer backdrop-blur-md"
                title="Jeda Permainan (P / Esc)"
              >
                <Pause className="w-4 h-4 fill-amber-400 text-amber-400" />
              </button>
            </div>

            {stats.mode !== 'survival' && (
              <div className="px-2.5 py-1 rounded-xl bg-slate-950/85 border border-cyan-500/40 backdrop-blur-md flex flex-col items-end w-full">
                <div className="flex items-center justify-between w-full text-[11px] font-bold">
                  <span className="text-cyan-400 uppercase font-orbitron">LVL {stats.level}</span>
                  <span className="text-slate-400 text-[10px]">
                    {stats.levelProgress}/{stats.levelTargetGoal}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-sky-400 rounded-full transition-all duration-300"
                    style={{ width: `${(stats.levelProgress / stats.levelTargetGoal) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {stats.isGodMode || stats.lives >= 99 ? (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-amber-950/95 via-yellow-950/90 to-amber-950/95 border border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)] backdrop-blur-md animate-pulse">
                <Shield className="w-3.5 h-3.5 text-amber-400 fill-amber-400/40" />
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 font-orbitron">
                  NYAWA: ∞ TAK TERBATAS
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-950/85 border border-rose-500/30 backdrop-blur-md">
                <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">NYAWA:</span>
                {Array.from({ length: Math.min(10, stats.maxLives) }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-4 h-4 rounded-md flex items-center justify-center ${
                      idx < stats.lives
                        ? 'text-cyan-400 drop-shadow-[0_0_6px_#38bdf8]'
                        : 'text-slate-700 opacity-40'
                    }`}
                  >
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
                      <path d="M12 2L6 14L8 16L12 14L16 16L18 14L12 2Z" />
                    </svg>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ==================== MOBILE PHONE ADAPTIVE TOP BAR (< 640px) ==================== */}
        <div className="flex sm:hidden flex-col gap-1 w-full pointer-events-auto">
          {/* Row 1: Score & Quick Control Icons */}
          <div className="flex items-center justify-between gap-1 w-full">
            {/* Score pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950/90 border border-cyan-500/40 backdrop-blur-md">
              <span className="text-[9px] font-black font-orbitron text-cyan-300 uppercase">
                {modeBadge.label}
              </span>
              <span className="text-base font-black font-orbitron text-white leading-none">
                {stats.score.toLocaleString()}
              </span>
              {stats.combo > 1 && (
                <span className="text-[9px] font-black text-amber-300 px-1 rounded bg-amber-950/80 border border-amber-500/40">
                  x{comboMultiplier}!
                </span>
              )}
            </div>

            {/* Right Controls: Lives + Arena/Forest + Fullscreen + Audio + Pause */}
            <div className="flex items-center gap-1">
              {/* Lives */}
              {stats.isGodMode || stats.lives >= 99 ? (
                <div className="flex items-center gap-1 px-1.5 py-1 rounded-lg bg-amber-950/90 border border-amber-400 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.5)]">
                  <Shield className="w-3 h-3 text-amber-400 fill-amber-400/40" />
                  <span className="text-[10px] font-black font-orbitron">∞</span>
                </div>
              ) : (
                <div className="flex items-center gap-0.5 px-1.5 py-1 rounded-lg bg-slate-950/80 border border-rose-500/30">
                  <span className="text-[10px] font-black text-rose-400">❤️ {stats.lives}</span>
                </div>
              )}

              {onToggleGodMode && (
                <button
                  onClick={() => {
                    haptics.trigger('button');
                    sound.playClick();
                    onToggleGodMode();
                  }}
                  className={`p-1 rounded-lg border text-xs font-bold font-orbitron ${
                    stats.isGodMode
                      ? 'bg-amber-400 border-amber-200 text-slate-950 shadow-[0_0_10px_rgba(245,158,11,0.8)]'
                      : 'bg-slate-950/80 border-slate-700 text-slate-400'
                  }`}
                  title="Toggle Mode Dewa (Nyawa ∞ & Senjata Super)"
                >
                  🛡️
                </button>
              )}

              {onSelectWorld && (
                <button
                  onClick={() => {
                    haptics.trigger('button');
                    sound.playClick();
                    setIsLocationPickerOpen(!isLocationPickerOpen);
                  }}
                  className={`p-1 rounded-lg border text-xs font-bold font-orbitron ${
                    isLocationPickerOpen
                      ? 'bg-amber-400 border-amber-200 text-slate-950'
                      : 'bg-slate-950/80 border-amber-500/50 text-amber-300'
                  }`}
                  title="Ganti Lokasi Permainan"
                >
                  <Globe className="w-3.5 h-3.5" />
                </button>
              )}

              {(onCycleShip || onOpenHangar) && (
                <button
                  onClick={() => {
                    haptics.trigger('button');
                    sound.playClick();
                    if (onCycleShip) onCycleShip();
                    else if (onOpenHangar) onOpenHangar();
                  }}
                  className="p-1 rounded-lg bg-slate-950/80 border border-cyan-500/50 text-cyan-300 text-xs"
                  title="Ganti Model Pesawat"
                >
                  ✈️
                </button>
              )}

              {onToggleForestBiome && (
                <button
                  onClick={() => {
                    haptics.trigger('button');
                    sound.playClick();
                    onToggleForestBiome();
                  }}
                  className="p-1 rounded-lg bg-slate-950/80 border border-slate-700 text-xs"
                  title="Ganti Biome / Tantangan Hutan"
                >
                  {stats.activeArenaBiome === 'forest' ? '🌲' : '🌌'}
                </button>
              )}

              {onToggle3D && (
                <button
                  onClick={() => {
                    haptics.trigger('button');
                    sound.playClick();
                    onToggle3D();
                  }}
                  className={`p-1 rounded-lg border text-xs font-bold font-orbitron ${
                    stats.is3DVisual !== false
                      ? 'bg-cyan-950/90 border-cyan-400 text-cyan-300'
                      : 'bg-slate-950/80 border-slate-700 text-slate-500'
                  }`}
                  title="PS5 3D Cinematic Engine"
                >
                  🎬
                </button>
              )}

              <button
                onClick={handleToggleFullscreen}
                className="p-1 rounded-lg bg-slate-950/80 border border-slate-700 text-slate-300"
                title="Layar Penuh HP"
              >
                {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={handleToggleSound}
                className="p-1 rounded-lg bg-slate-950/80 border border-slate-700 text-slate-300"
                title="Suara"
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
              </button>

              <button
                onClick={() => {
                  haptics.trigger('button');
                  sound.playClick();
                  onPause();
                }}
                className="p-1 rounded-lg bg-slate-950/80 border border-amber-500/50 text-amber-400"
                title="Jeda"
              >
                <Pause className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              </button>
            </div>
          </div>

          {/* Row 2: Prominent Full-Width Mission Prompt on Mobile */}
          {renderMissionCard(true)}

          {/* Row 2b: Mobile Level Progress Bar */}
          {stats.mode !== 'survival' && (
            <div className="flex items-center justify-between gap-2 px-2.5 py-0.5 rounded-lg bg-slate-950/80 border border-cyan-500/30 text-[9px] font-mono">
              <span className="text-cyan-400 font-bold">LEVEL {stats.level}</span>
              <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-sky-300 rounded-full"
                  style={{ width: `${(stats.levelProgress / stats.levelTargetGoal) * 100}%` }}
                />
              </div>
              <span className="text-slate-400">
                {stats.levelProgress}/{stats.levelTargetGoal}
              </span>
            </div>
          )}
        </div>

        {/* ==================== ENERGY & ACTIVE POWER-UPS ==================== */}
        <div className="flex items-center justify-between gap-2 pointer-events-auto w-full pt-0.5">
          {/* Energy gauge */}
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 rounded-xl bg-slate-950/90 border border-cyan-500/40 backdrop-blur-md">
            <BatteryCharging className="w-3 h-3 text-cyan-400" />
            <div className="flex flex-col">
              <div className="flex items-center justify-between gap-1 text-[8px] sm:text-[9px] font-bold font-orbitron">
                <span className="text-cyan-300">ENERGI</span>
                <span className="text-white">{stats.specialEnergy}%</span>
              </div>
              <div className="w-16 sm:w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-amber-300 rounded-full"
                  style={{ width: `${stats.specialEnergy}%` }}
                />
              </div>
            </div>
          </div>

          {/* Active Power-up Badges */}
          <div className="flex items-center gap-1 overflow-x-auto max-w-[220px] sm:max-w-none">
            {activePowerUps.shieldActive && (
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-emerald-950/90 border border-emerald-400/60 text-[9px] font-bold text-emerald-300">
                <Shield className="w-2.5 h-2.5 text-emerald-400" />
                <span>PERISAI</span>
              </div>
            )}
            {activePowerUps.rapidFireTimer > 0 && (
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-amber-950/90 border border-amber-400/60 text-[9px] font-bold text-amber-300 animate-pulse">
                <Zap className="w-2.5 h-2.5 text-amber-400" />
                <span>RAPID</span>
              </div>
            )}
            {activePowerUps.doubleScoreTimer > 0 && (
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-yellow-950/90 border border-yellow-400/60 text-[9px] font-bold text-yellow-300 animate-pulse">
                <Flame className="w-2.5 h-2.5 text-yellow-400" />
                <span>2X</span>
              </div>
            )}
            {activePowerUps.multishotTimer > 0 && (
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-sky-950/90 border border-sky-400/60 text-[9px] font-bold text-sky-300">
                <span>DUAL</span>
              </div>
            )}
            {activePowerUps.slowmoTimer > 0 && (
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-purple-950/90 border border-purple-400/60 text-[9px] font-bold text-purple-300">
                <Clock className="w-2.5 h-2.5 text-purple-400" />
                <span>SLOW</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ==================== DESKTOP BOTTOM COMBAT DOCK ==================== */}
      <div className="fixed bottom-2 left-1/2 -translate-x-1/2 z-40 pointer-events-auto hidden md:flex flex-col items-center gap-1.5 select-none">
        {/* Real-time Feedback Banner for Cooldown / Insufficient Energy */}
        {jurusFeedbackNotice && (
          <div className="px-4 py-1.5 rounded-xl bg-slate-950/95 border-2 border-amber-400 text-amber-300 font-orbitron font-bold text-xs shadow-[0_0_20px_rgba(245,158,11,0.7)] animate-bounce backdrop-blur-xl">
            {jurusFeedbackNotice}
          </div>
        )}

        {/* Toggle Collapse/Expand Header */}
        <button
          onClick={() => {
            sound.playClick();
            setIsJurusDeckExpanded((prev) => !prev);
          }}
          className="px-4 py-1 rounded-t-xl bg-slate-900/95 border-t border-x border-cyan-500/50 text-cyan-300 hover:text-white text-[11px] font-orbitron font-black flex items-center gap-2 shadow-[0_-4px_15px_rgba(6,182,212,0.35)] transition-all cursor-pointer backdrop-blur-md hover:bg-slate-800"
        >
          <span className="text-amber-300 animate-pulse">⚡</span>
          <span>ARSENAL 14 JURUS TEMPUR SAHABAT KAFA</span>
          <span className="text-[9px] font-mono text-cyan-400 font-normal">
            (Klik jurus atau tekan tombol 1-9, 0, -, =)
          </span>
          {isJurusDeckExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>

        {isJurusDeckExpanded && (
          <div className="p-2 rounded-2xl bg-slate-950/95 border-2 border-cyan-500/60 backdrop-blur-xl shadow-[0_0_35px_rgba(6,182,212,0.45)] flex items-center gap-1.5 max-w-[96vw] overflow-x-auto">
            {JURUS_REGISTRY.map((jurus) => {
              const cd = stats.activeJurusCooldowns[jurus.id] || 0;
              const hasEnergy = stats.specialEnergy >= jurus.energyCost;
              const isReady = cd <= 0 && hasEnergy;

              const handleButtonClick = () => {
                if (cd > 0) {
                  sound.playWrong();
                  haptics.trigger('error');
                  showJurusFeedback(`⏱️ Jurus #${jurus.number} (${jurus.name}) Cooldown (${cd.toFixed(1)}s)!`);
                  return;
                }
                if (!hasEnergy) {
                  sound.playWrong();
                  haptics.trigger('error');
                  showJurusFeedback(
                    `⚡ Butuh ${jurus.energyCost}⚡ Energi! (Energi saat ini: ${stats.specialEnergy}⚡) — Tembak huruf benar untuk isi energi!`
                  );
                  return;
                }
                if (onTriggerJurus) {
                  haptics.trigger('jurus');
                  onTriggerJurus(jurus.id);
                  showJurusFeedback(`⚡ ${jurus.powerName} DIAKTIFKAN!`);
                }
              };

              return (
                <button
                  key={jurus.id}
                  onClick={handleButtonClick}
                  className={`group relative flex flex-col items-center justify-between p-1.5 rounded-xl border transition-all cursor-pointer w-[68px] h-[58px] flex-shrink-0 select-none ${
                    isReady
                      ? 'bg-slate-900/95 hover:bg-cyan-950/90 border-cyan-400 hover:border-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.35)] hover:scale-105 active:scale-95'
                      : 'bg-slate-950/80 hover:bg-slate-900/90 border-slate-700/80 hover:border-amber-500/60 opacity-80'
                  }`}
                  title={`${jurus.powerName} (${jurus.name}): ${jurus.description}. Tombol: [${jurus.hotkey}]`}
                >
                  {/* Top Bar: Number & Keyboard shortcut key */}
                  <div className="flex items-center justify-between w-full text-[8.5px] font-mono leading-none">
                    <span className="text-amber-400 font-bold">#{jurus.number}</span>
                    <span className="px-1 py-0.2 rounded bg-cyan-950/90 border border-cyan-500/40 text-cyan-300 font-black text-[7.5px]">
                      {jurus.hotkey.split('/')[0].trim()}
                    </span>
                  </div>

                  {/* Icon */}
                  <span className="text-xl my-auto group-hover:scale-115 transition-transform drop-shadow-[0_0_6px_currentColor]">
                    {jurus.icon}
                  </span>

                  {/* Bottom: Name & Cost */}
                  <div className="flex items-center justify-between w-full text-[8px] font-orbitron font-bold leading-none">
                    <span className="text-slate-200 truncate max-w-[38px]">
                      {jurus.name.split(' ')[0]}
                    </span>
                    <span
                      className={`font-mono text-[8px] font-bold ${
                        hasEnergy ? 'text-amber-300' : 'text-rose-400'
                      }`}
                    >
                      {jurus.energyCost}⚡
                    </span>
                  </div>

                  {/* Cooldown Overlay */}
                  {cd > 0 && (
                    <div className="absolute inset-0 rounded-xl bg-slate-950/90 backdrop-blur-[2px] flex flex-col items-center justify-center font-mono font-black text-amber-300 text-xs">
                      <span>⏱️</span>
                      <span>{cd.toFixed(1)}s</span>
                    </div>
                  )}

                  {/* Low Energy Hint Indicator on hover if not enough energy */}
                  {!hasEnergy && cd <= 0 && (
                    <div className="absolute inset-0 rounded-xl bg-slate-950/40 hover:bg-slate-950/80 transition-colors flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 text-[8px] text-rose-300 font-mono font-bold">
                      Kurang {jurus.energyCost - stats.specialEnergy}⚡
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ==================== QUICK LOCATION / WORLD SELECTOR MODAL ==================== */}
      {isLocationPickerOpen && onSelectWorld && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md pointer-events-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl bg-gradient-to-b from-slate-900/95 to-slate-950 border border-amber-400/50 p-4 sm:p-6 shadow-[0_0_40px_rgba(245,158,11,0.35)] flex flex-col gap-3">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black font-orbitron text-amber-300 uppercase tracking-wide">
                    Pilih Lokasi & Latar Arena
                  </h3>
                  <p className="text-[10px] sm:text-xs text-slate-400">
                    Ubah seketika ke matahari cerah terik, bulan perak, atau fajar!
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  haptics.trigger('button');
                  sound.playClick();
                  setIsLocationPickerOpen(false);
                }}
                className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Grid of 6 Worlds */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto pr-1">
              {GALAXY_WORLDS.map((w) => {
                const isActive = stats.currentWorld?.id === w.id;
                const icon =
                  w.id === 1
                    ? '☀️'
                    : w.id === 2
                    ? '🌕'
                    : w.id === 3
                    ? '🌅'
                    : w.id === 4
                    ? '🪐'
                    : w.id === 5
                    ? '🌲'
                    : '🏙️';

                return (
                  <button
                    key={w.id}
                    onClick={() => {
                      haptics.trigger('button');
                      onSelectWorld(w.id);
                      setIsLocationPickerOpen(false);
                    }}
                    className={`relative p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-amber-950/60 border-amber-400 shadow-[0_0_18px_rgba(245,158,11,0.5)] ring-2 ring-amber-400/60'
                        : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{icon}</span>
                        <span className="text-xs font-black font-orbitron text-white leading-tight">
                          {w.name}
                        </span>
                      </div>
                      {w.isBrightTheme ? (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          CERAH SIANG
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                          KOSMIK
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-1">{w.subtitle}</p>
                    {isActive && (
                      <span className="text-[9px] font-bold text-amber-400 flex items-center gap-1 mt-0.5">
                        ✓ SEDANG AKTIF
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Footer tip */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
              <span>💡 Tombol ini mengubah pemandangan secara real-time!</span>
              <button
                onClick={() => {
                  haptics.trigger('button');
                  sound.playClick();
                  setIsLocationPickerOpen(false);
                }}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
