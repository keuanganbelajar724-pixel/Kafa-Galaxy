import React from 'react';
import { Trophy, Sparkles } from 'lucide-react';
import { Achievement } from '../game/types';

interface AchievementToastProps {
  achievement: Achievement | null;
  onDismiss: () => void;
}

export const AchievementToast: React.FC<AchievementToastProps> = ({ achievement, onDismiss }) => {
  if (!achievement) return null;

  return (
    <div
      onClick={onDismiss}
      className="fixed top-5 left-1/2 -translate-x-1/2 z-50 cursor-pointer animate-bounce"
    >
      <div className="px-5 py-3 rounded-2xl bg-slate-900/95 border-2 border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.6)] backdrop-blur-md flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-400 flex items-center justify-center text-xl flex-shrink-0 shadow-[0_0_10px_rgba(245,158,11,0.5)]">
          {achievement.icon}
        </div>
        <div className="text-left">
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-amber-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>PENCAPAIAN TERBUKA!</span>
          </div>
          <div className="text-sm font-black font-orbitron text-white">{achievement.title}</div>
          <div className="text-[11px] text-slate-300">{achievement.description}</div>
        </div>
      </div>
    </div>
  );
};
