import React from 'react';
import { RotateCcw, Home, Trophy, Target, Award, Zap, CheckCircle2, Sparkles, Shield } from 'lucide-react';
import { GameStats } from '../game/types';
import { sound } from '../game/sound';
import { haptics } from '../game/haptics';

interface VictoryModalProps {
  stats: GameStats;
  onRestart: () => void;
  onHome: () => void;
  onOpenHangar: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({ stats, onRestart, onHome, onOpenHangar }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto safe-pb safe-pt">
      <div className="w-full max-w-md max-h-[92dvh] overflow-y-auto rounded-3xl bg-slate-900/95 border-2 border-cyan-400 p-4 sm:p-7 flex flex-col items-center text-center shadow-[0_0_50px_rgba(6,182,212,0.5)] my-auto relative overflow-hidden">
        {/* Holographic celebration background rays */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Badge: Victory Status */}
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-cyan-950 to-blue-950 border border-cyan-400 text-cyan-300 text-xs font-black uppercase tracking-wider mb-2.5 shadow-[0_0_20px_rgba(6,182,212,0.6)] animate-pulse">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>GALAKSI BERHASIL DISELAMATKAN!</span>
        </div>

        {/* Brand Logo & Subtitle */}
        <h2 className="text-3xl sm:text-4xl font-black font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-sky-300 to-amber-300 drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]">
          KAFA GALAXY
        </h2>
        <p className="text-xs font-black tracking-widest text-cyan-300 uppercase font-orbitron mt-0.5">
          LETTER STRIKE • MISSION COMPLETE
        </p>
        <p className="text-[11px] text-slate-400 italic mb-4">
          Master the Letters. Conquer the Galaxy.
        </p>

        {/* Score Card Display */}
        <div className="w-full py-4 px-6 rounded-2xl bg-slate-950/85 border border-cyan-500/50 shadow-[0_0_25px_rgba(6,182,212,0.3)] mb-4 flex flex-col items-center">
          <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-widest">SKOR KEMENANGAN</span>
          <span className="text-4xl sm:text-5xl font-black font-orbitron text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-100 to-amber-300 drop-shadow-[0_0_20px_rgba(6,182,212,0.7)] my-1">
            {stats.score.toLocaleString()}
          </span>
          <div className="flex items-center gap-1.5 text-xs text-amber-300 font-semibold">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Rekor Mode: {stats.highScore.toLocaleString()}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="w-full grid grid-cols-2 gap-2 mb-5 text-left">
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 flex-shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] text-slate-400 font-bold uppercase block">World Selesai</span>
              <span className="text-xs font-black font-orbitron text-white">{stats.currentWorld.name}</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] text-slate-400 font-bold uppercase block">Akurasi Tembak</span>
              <span className="text-sm font-black font-orbitron text-emerald-300">{stats.accuracy}%</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-950 border border-sky-500/40 flex items-center justify-center text-sky-400 flex-shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] text-slate-400 font-bold uppercase block">Target Benar</span>
              <span className="text-sm font-black font-orbitron text-sky-300">{stats.targetsCorrect}</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-950 border border-amber-500/40 flex items-center justify-center text-amber-400 flex-shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] text-slate-400 font-bold uppercase block">Combo Maks</span>
              <span className="text-sm font-black font-orbitron text-amber-300">{stats.maxCombo}x</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            onClick={() => {
              sound.playClick();
              onRestart();
            }}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-black font-orbitron tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.6)] cursor-pointer transition-all active:scale-95"
          >
            <RotateCcw className="w-5 h-5" />
            <span>LUNCURKAN MISI BARU</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                sound.playClick();
                onOpenHangar();
              }}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-cyan-500/30 text-cyan-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
            >
              <Shield className="w-4 h-4" />
              <span>Hangar Pesawat</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onHome();
              }}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
            >
              <Home className="w-4 h-4 text-cyan-400" />
              <span>Menu Utama</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
