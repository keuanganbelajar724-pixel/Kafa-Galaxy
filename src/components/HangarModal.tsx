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
  isGodMode?: boolean;
}

export const HangarModal: React.FC<HangarModalProps> = ({ currentSkinId, onSelectSkin, onClose, isGodMode }) => {
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
            const isUnlocked = achievementManager.isSkinUnlocked(skin.id, isGodMode);
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

                  {/* Rendered SVG Fighter Silhouette based on skin */}
                  <svg viewBox="0 0 100 100" className="w-20 h-20 drop-shadow-[0_0_14px_rgba(255,255,255,0.4)]">
                    {skin.id === 'valkyrie' ? (
                      <>
                        {/* Valkyrie: Angelic Feather Wing Silhouette with Holy Halo */}
                        <circle cx="50" cy="18" r="9" fill="none" stroke="#facc15" strokeWidth="1.8" opacity="0.8" />
                        <polygon points="32,78 38,78 35,95" fill={skin.trailColor} />
                        <polygon points="47,80 53,80 50,98" fill="#ffffff" />
                        <polygon points="62,78 68,78 65,95" fill={skin.trailColor} />
                        {/* Holy Swept Wings */}
                        <path d="M 50,14 L 62,32 L 86,28 L 94,48 L 82,54 L 88,64 L 72,66 L 68,76 L 50,70 L 32,76 L 28,66 L 12,64 L 18,54 L 6,48 L 14,28 L 38,32 Z" fill={skin.secondaryColor} stroke={skin.primaryColor} strokeWidth="2" />
                        <path d="M 50,22 L 58,40 L 74,44 L 66,58 L 50,62 L 34,58 L 26,44 L 42,40 Z" fill={skin.trimColor} opacity="0.9" />
                        <ellipse cx="50" cy="42" rx="6" ry="12" fill={skin.cockpitColor} stroke={skin.primaryColor} strokeWidth="1.2" />
                        <polygon points="90,44 96,48 90,52" fill={skin.accentColor} />
                        <polygon points="10,44 4,48 10,52" fill={skin.accentColor} />
                      </>
                    ) : skin.id === 'apocalypse' ? (
                      <>
                        {/* Apocalypse: Dark Matter Dragonwing Silhouette */}
                        <polygon points="30,80 37,80 33,98" fill={skin.trailColor} />
                        <polygon points="63,80 70,80 67,98" fill={skin.trailColor} />
                        {/* Serrated Dragon Wings */}
                        <path d="M 50,8 L 58,26 L 66,24 L 92,42 L 84,52 L 96,62 L 78,68 L 84,78 L 64,74 L 58,82 L 50,76 L 42,82 L 36,74 L 16,78 L 22,68 L 4,62 L 16,52 L 8,42 L 34,24 L 42,26 Z" fill={skin.secondaryColor} stroke={skin.primaryColor} strokeWidth="2.2" />
                        {/* Blood Red Core Spine */}
                        <polygon points="50,14 56,38 64,56 50,68 36,56 44,38" fill={skin.primaryColor} opacity="0.8" />
                        <ellipse cx="50" cy="40" rx="5.5" ry="10" fill={skin.cockpitColor} stroke="#ffffff" strokeWidth="1" />
                        <circle cx="47" cy="38" r="1.5" fill="#ffffff" />
                        <circle cx="53" cy="38" r="1.5" fill="#ffffff" />
                      </>
                    ) : skin.id === 'phantom' ? (
                      <>
                        {/* Phantom: Sleek Forward-Swept Obsidian Batwing */}
                        <polygon points="36,78 42,78 39,94" fill={skin.trailColor} />
                        <polygon points="58,78 64,78 61,94" fill={skin.trailColor} />
                        <polygon points="50,10 64,30 94,40 86,66 74,60 66,74 50,68 34,74 26,60 14,66 6,40 36,30" fill={skin.secondaryColor} stroke={skin.primaryColor} strokeWidth="2.2" />
                        <polygon points="50,16 58,36 66,54 50,62 34,54 42,36" fill={skin.trimColor} opacity="0.75" />
                        <ellipse cx="50" cy="44" rx="6" ry="12" fill={skin.cockpitColor} stroke={skin.accentColor} strokeWidth="1.2" />
                      </>
                    ) : skin.id === 'nova' ? (
                      <>
                        {/* Nova: Solar Delta-Wing with Triple Boosters */}
                        <polygon points="28,78 34,78 31,94" fill={skin.trailColor} />
                        <polygon points="47,78 53,78 50,97" fill="#ffffff" />
                        <polygon points="66,78 72,78 69,94" fill={skin.trailColor} />
                        <polygon points="50,12 66,36 90,62 76,66 72,76 50,68 28,76 24,66 10,62 34,36" fill={skin.secondaryColor} stroke={skin.primaryColor} strokeWidth="2.2" />
                        <polygon points="50,18 60,38 70,58 50,62 30,58 40,38" fill={skin.accentColor} opacity="0.9" />
                        <ellipse cx="50" cy="42" rx="7" ry="13" fill={skin.cockpitColor} stroke={skin.primaryColor} strokeWidth="1.2" />
                      </>
                    ) : skin.id === 'titan' ? (
                      <>
                        {/* Titan: Heavy Armored Dreadwing with Quad Stabilizers */}
                        <polygon points="30,80 36,80 33,95" fill={skin.trailColor} />
                        <polygon points="40,80 46,80 43,95" fill={skin.trailColor} />
                        <polygon points="54,80 60,80 57,95" fill={skin.trailColor} />
                        <polygon points="64,80 70,80 67,95" fill={skin.trailColor} />
                        <polygon points="50,14 62,26 72,26 76,38 88,48 88,68 76,74 68,78 50,72 32,78 24,74 12,68 12,48 24,38 28,26 38,26" fill={skin.secondaryColor} stroke={skin.primaryColor} strokeWidth="2.4" />
                        <polygon points="50,18 60,32 68,54 50,64 32,54 40,32" fill={skin.trimColor} />
                        <rect x="44" y="32" width="12" height="18" rx="3" fill={skin.cockpitColor} stroke={skin.primaryColor} strokeWidth="1.4" />
                      </>
                    ) : (
                      <>
                        {/* Pioneer: Classic Aerodynamic Fighter */}
                        <polygon points="34,80 40,80 37,96" fill={skin.trailColor} opacity="0.9" />
                        <polygon points="35,80 39,80 37,90" fill="#ffffff" />
                        <polygon points="60,80 66,80 63,96" fill={skin.trailColor} opacity="0.9" />
                        <polygon points="61,80 65,80 63,90" fill="#ffffff" />
                        <polygon points="50,12 60,32 66,34 64,40 68,42 88,58 86,68 76,64 70,68 63,62 50,66 37,62 30,68 24,64 14,68 12,58 32,42 36,40 34,34 40,32" fill={skin.secondaryColor} stroke={skin.primaryColor} strokeWidth="2.2" />
                        <polygon points="85,56 90,58 87,69 83,67" fill={skin.primaryColor} />
                        <polygon points="15,56 10,58 13,69 17,67" fill={skin.primaryColor} />
                        <polygon points="50,16 57,36 64,52 60,60 50,62 40,60 36,52 43,36" fill={skin.trimColor || '#ffffff'} />
                        <polygon points="28,52 35,50 33,54 27,55" fill={skin.accentColor} />
                        <polygon points="72,52 65,50 67,54 73,55" fill={skin.accentColor} />
                        <rect x="25" y="32" width="3" height="18" fill="#334155" />
                        <rect x="72" y="32" width="3" height="18" fill="#334155" />
                        <ellipse cx="50" cy="42" rx="7.5" ry="14" fill={skin.cockpitColor} stroke={skin.primaryColor} strokeWidth="1.2" />
                        <path d="M 46,34 Q 50,30 54,34" stroke="#ffffff" strokeWidth="1.6" fill="none" />
                      </>
                    )}
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
