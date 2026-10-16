import React from 'react';
import { RotateCcw, Home, Trophy, Target, Award, Zap, CheckCircle2, Clock, Flame } from 'lucide-react';
import { GameStats } from '../game/types';
import { sound } from '../game/sound';
import { haptics } from '../game/haptics';

interface GameOverModalProps {
  stats: GameStats;
  onRestart: () => void;
  onHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ stats, onRestart, onHome }) => {
  const isNewHighScore = stats.score > 0 && stats.score >= stats.highScore;

  const modeLabels = {
    campaign: 'Classic Campaign',
    survival: 'Survival Mode',
    accuracy: 'Accuracy Challenge',
  }[stats.mode];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto safe-pb safe-pt">
      <div className="w-full max-w-md max-h-[92dvh] overflow-y-auto rounded-3xl bg-slate-900/95 border-2 border-cyan-500/50 p-4 sm:p-7 flex flex-col items-center text-center shadow-[0_0_40px_rgba(6,182,212,0.4)] my-auto">
        {/* Top Badge: Game Over or New Record */}
        {isNewHighScore ? (
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 text-xs font-black uppercase tracking-wider mb-2.5 shadow-[0_0_15px_rgba(245,158,11,0.5)] animate-bounce">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>REKOR SKOR BARU ({stats.mode.toUpperCase()})!</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold uppercase tracking-wider mb-2.5">
            <span>PERISAI PESAWAT HANCUR</span>
          </div>
        )}

        {/* Title */}
        <h2 className="text-2xl sm:text-4xl font-black font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-100 to-blue-400">
          MISI BERAKHIR
        </h2>
        <p className="text-xs text-slate-400 mt-0.5 mb-4 font-orbitron">
          Mode: <span className="text-cyan-300 font-bold">{modeLabels}</span>
        </p>

        {/* Score Card Display */}
        <div className="w-full py-3.5 px-6 rounded-2xl bg-slate-950/80 border border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.2)] mb-4 flex flex-col items-center">
          <span className="text-[10px] font-bold text-cyan-300/80 uppercase tracking-widest">TOTAL SKOR AKHIR</span>
          <span className="text-3xl sm:text-5xl font-black font-orbitron text-transparent bg-clip-text bg-gradient-to-b from-white to-cyan-300 drop-shadow-[0_0_15px_rgba(6,182,212,0.6)] my-0.5">
            {stats.score.toLocaleString()}
          </span>
          <div className="flex items-center gap-1.5 text-xs text-amber-300 font-semibold mt-0.5">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Rekor Terbaik: {stats.highScore.toLocaleString()}</span>
          </div>
        </div>

        {/* 4-Stat Grid: Level / Time, Akurasi, Target Benar, Combo */}
        <div className="w-full grid grid-cols-2 gap-2 mb-5 text-left">
          {/* Level or Time */}
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 flex-shrink-0">
              {stats.mode === 'survival' ? <Clock className="w-4 h-4" /> : <Award className="w-4 h-4" />}
            </div>
            <div>
              <span className="text-[9px] text-slate-400 font-bold uppercase block">
                {stats.mode === 'survival' ? 'Waktu Bertahan' : 'Level Dicapai'}
              </span>
              <span className="text-sm font-black font-orbitron text-white">
                {stats.mode === 'survival' ? `${stats.survivalTime} Detik` : `Level ${stats.level}`}
              </span>
            </div>
          </div>

          {/* Akurasi */}
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] text-slate-400 font-bold uppercase block">Akurasi Tembak</span>
              <span className="text-sm font-black font-orbitron text-emerald-300">{stats.accuracy}%</span>
            </div>
          </div>

          {/* Target Benar */}
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-950/80 border border-sky-500/40 flex items-center justify-center text-sky-400 flex-shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] text-slate-400 font-bold uppercase block">Target Benar</span>
              <span className="text-sm font-black font-orbitron text-sky-300">{stats.targetsCorrect}</span>
            </div>
          </div>

          {/* Combo Terbaik */}
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400 flex-shrink-0">
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
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black font-orbitron tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.6)] cursor-pointer transition-all active:scale-95"
          >
            <RotateCcw className="w-5 h-5" />
            <span>MAIN LAGI</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onHome();
            }}
            className="w-full py-2.5 px-6 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-600 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <Home className="w-4 h-4 text-cyan-400" />
            <span>KEMBALI KE MENU UTAMA</span>
          </button>
        </div>
      </div>
    </div>
  );
};
