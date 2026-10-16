import React from 'react';
import { X, Check, Lock, Shield, Zap, Sparkles } from 'lucide-react';
import { SHIP_SKINS, ShipSkin } from '../game/worldData';
import { ShipSkinId } from '../game/types';
import { achievementManager } from '../game/achievements';
import { sound } from '../game/sound';

interface HangarModalProps {
  currentSkinId: ShipSkinId;
  onSelectSkin: (skinId: ShipSkinId) => void;
  onClose: () => void;
}

export const HangarModal: React.FC<HangarModalProps> = ({ currentSkinId, onSelectSkin, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn safe-pb safe-pt">
      <div className="w-full max-w-2xl max-h-[90dvh] rounded-3xl bg-slate-900/95 border-2 border-cyan-500/50 p-4 sm:p-6 flex flex-col shadow-[0_0_40px_rgba(6,182,212,0.35)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-400/50 flex items-center justify-center text-cyan-400">
              <Shield className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-black font-orbitron text-white">HANGAR PESAWAT KAFA</h3>
              <p className="text-xs text-slate-400">Pilih skin tempur futuristis untuk misi penjelajahan galaksi</p>
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

        {/* Skins Grid */}
        <div className="flex-1 overflow-y-auto py-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5 pr-1">
          {SHIP_SKINS.map((skin) => {
            const isUnlocked = achievementManager.isSkinUnlocked(skin.id);
            const isSelected = currentSkinId === skin.id;

            return (
              <div
                key={skin.id}
                onClick={() => {
                  if (isUnlocked) {
                    sound.playClick();
                    onSelectSkin(skin.id);
                  } else {
                    sound.playWrong();
                  }
                }}
                className={`p-4 rounded-2xl border transition-all text-left flex flex-col justify-between relative overflow-hidden ${
                  !isUnlocked
                    ? 'bg-slate-950/50 border-slate-800/80 opacity-60 cursor-not-allowed'
                    : isSelected
                    ? 'bg-cyan-950/70 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.35)] cursor-pointer'
                    : 'bg-slate-950/70 border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900 cursor-pointer'
                }`}
              >
                {/* Visual Ship SVG Silhouette Preview */}
                <div className="relative w-full h-28 rounded-xl bg-slate-950 flex items-center justify-center border border-slate-800/80 mb-3 overflow-hidden">
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      background: `radial-gradient(circle at center, ${skin.primaryColor} 0%, transparent 70%)`,
                    }}
                  />

                  {/* Rendered SVG Fighter Silhouette */}
                  <svg viewBox="0 0 100 100" className="w-20 h-20 drop-shadow-[0_0_14px_rgba(255,255,255,0.4)]">
                    {/* Twin Engines */}
                    <polygon points="34,80 40,80 37,96" fill={skin.trailColor} opacity="0.9" />
                    <polygon points="35,80 39,80 37,90" fill="#ffffff" />
                    <polygon points="60,80 66,80 63,96" fill={skin.trailColor} opacity="0.9" />
                    <polygon points="61,80 65,80 63,90" fill="#ffffff" />

                    {/* Main Chassis */}
                    <polygon
                      points="50,12 60,32 66,34 64,40 68,42 88,58 86,68 76,64 70,68 63,62 50,66 37,62 30,68 24,64 14,68 12,58 32,42 36,40 34,34 40,32"
                      fill={skin.secondaryColor}
                      stroke={skin.primaryColor}
                      strokeWidth="2.2"
                    />

                    {/* Wingtip Crystal Energy Foils */}
                    <polygon points="85,56 90,58 87,69 83,67" fill={skin.primaryColor} />
                    <polygon points="15,56 10,58 13,69 17,67" fill={skin.primaryColor} />

                    {/* Titanium White Dorsal Inset */}
                    <polygon points="50,16 57,36 64,52 60,60 50,62 40,60 36,52 43,36" fill={skin.trimColor || '#ffffff'} />

                    {/* Accents */}
                    <polygon points="28,52 35,50 33,54 27,55" fill={skin.accentColor} />
                    <polygon points="72,52 65,50 67,54 73,55" fill={skin.accentColor} />
                    <polygon points="50,26 53,34 50,32 47,34" fill={skin.accentColor} />

                    {/* Cannons */}
                    <rect x="25" y="32" width="3" height="18" fill="#334155" />
                    <rect x="25" y="30" width="3" height="3" fill={skin.primaryColor} />
                    <rect x="72" y="32" width="3" height="18" fill="#334155" />
                    <rect x="72" y="30" width="3" height="3" fill={skin.primaryColor} />

                    {/* Bubble Cockpit */}
                    <ellipse cx="50" cy="42" rx="7.5" ry="14" fill={skin.cockpitColor} stroke={skin.primaryColor} strokeWidth="1.2" />
                    <path d="M 46,34 Q 50,30 54,34" stroke="#ffffff" strokeWidth="1.6" fill="none" />
                  </svg>

                  {!isUnlocked && (
                    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center gap-1.5 text-xs font-bold text-slate-400">
                      <Lock className="w-4 h-4 text-slate-500" />
                      <span>Terkunci</span>
                    </div>
                  )}

                  {isSelected && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-cyan-400 text-slate-950 text-[10px] font-black uppercase shadow-[0_0_8px_#38bdf8] flex items-center gap-1">
                      <Check className="w-3 h-3 stroke-[3]" /> Aktif
                    </div>
                  )}
                </div>

                {/* Skin Info */}
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="font-black font-orbitron text-sm text-white">{skin.name}</h4>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-md border"
                      style={{ color: skin.accentColor, borderColor: `${skin.accentColor}40` }}
                    >
                      {skin.subtitle}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{skin.description}</p>
                </div>

                {/* Unlock condition hint */}
                <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] flex items-center gap-1.5 text-slate-400">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{skin.unlockCondition}</span>
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
            Terapkan & Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
