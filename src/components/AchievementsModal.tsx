import React from 'react';
import { X, Trophy, Award, Lock, CheckCircle2 } from 'lucide-react';
import { Achievement } from '../game/types';
import { achievementManager } from '../game/achievements';
import { sound } from '../game/sound';

interface AchievementsModalProps {
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({ onClose }) => {
  const achievements = achievementManager.getAllAchievements();
  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn safe-pb safe-pt">
      <div className="w-full max-w-xl max-h-[90dvh] rounded-3xl bg-slate-900/95 border-2 border-cyan-500/50 p-4 sm:p-6 flex flex-col shadow-[0_0_40px_rgba(6,182,212,0.35)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-400/50 flex items-center justify-center text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-black font-orbitron text-white">AULA PENCAPAIAN GALAXY</h3>
              <p className="text-xs text-slate-400">
                Pencapaian Terbuka: <span className="text-amber-300 font-bold">{unlockedCount}</span> dari {achievements.length}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-950 rounded-full h-2 my-4 overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-cyan-400 rounded-full transition-all duration-500"
            style={{ width: `${(unlockedCount / achievements.length) * 100}%` }}
          />
        </div>

        {/* Achievements List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {achievements.map((ach) => {
            return (
              <div
                key={ach.id}
                className={`p-3.5 rounded-2xl border transition-all text-left flex items-start gap-3.5 ${
                  ach.isUnlocked
                    ? 'bg-slate-950/80 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                    : 'bg-slate-950/40 border-slate-800/80 opacity-60'
                }`}
              >
                {/* Icon Badge */}
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${
                    ach.isUnlocked
                      ? 'bg-amber-950/70 border border-amber-400/60 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                      : 'bg-slate-900 border border-slate-800 text-slate-600'
                  }`}
                >
                  {ach.isUnlocked ? ach.icon : <Lock className="w-5 h-5 text-slate-600" />}
                </div>

                {/* Details */}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4
                      className={`text-sm font-black font-orbitron ${
                        ach.isUnlocked ? 'text-amber-300' : 'text-slate-400'
                      }`}
                    >
                      {ach.title}
                    </h4>
                    {ach.isUnlocked && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" /> Terbuka
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{ach.description}</p>

                  {/* Progress bar if present */}
                  {ach.maxProgress && !ach.isUnlocked && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="h-full bg-cyan-500 rounded-full"
                          style={{
                            width: `${Math.min(100, ((ach.progress || 0) / ach.maxProgress) * 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {ach.progress || 0}/{ach.maxProgress}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="py-2.5 px-6 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
