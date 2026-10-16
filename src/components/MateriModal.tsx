import React, { useState } from 'react';
import { X, Check, Compass, Sparkles, BookOpen, Calculator, Microscope, Globe, LayoutGrid } from 'lucide-react';
import { MATERI_PRESETS, MateriPreset, ALL_EDUCATIONAL_QUESTIONS } from '../game/hijaiyahData';
import { sound } from '../game/sound';

interface MateriModalProps {
  currentMateriId: string;
  onSelectMateri: (id: string) => void;
  onClose: () => void;
}

export const MateriModal: React.FC<MateriModalProps> = ({ currentMateriId, onSelectMateri, onClose }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'matematika' | 'ipa' | 'inggris' | 'hijaiyah'>('all');

  const filteredPresets = MATERI_PRESETS.filter((p) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'matematika') return p.subjectCategory === 'matematika';
    if (activeTab === 'ipa') return p.subjectCategory === 'ipa';
    if (activeTab === 'inggris') return p.subjectCategory === 'inggris';
    if (activeTab === 'hijaiyah') return p.subjectCategory === 'hijaiyah';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn safe-pb safe-pt">
      <div className="w-full max-w-xl max-h-[90dvh] rounded-3xl bg-slate-900/95 border-2 border-cyan-500/50 p-4 sm:p-6 flex flex-col shadow-[0_0_40px_rgba(6,182,212,0.35)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-400/50 flex items-center justify-center text-cyan-400">
              <Compass className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-black font-orbitron text-white">PILIH MATA PELAJARAN & SEKTOR</h3>
              <p className="text-xs text-slate-400">Pilih materi Matematika, IPA, Bahasa Inggris, atau Huruf Hijaiyah</p>
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

        {/* Subject Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-2 border-b border-slate-800/80">
          {[
            { id: 'all', label: 'Semua', icon: '🌌' },
            { id: 'matematika', label: 'Matematika', icon: '🔢' },
            { id: 'ipa', label: 'IPA / Sains', icon: '🔬' },
            { id: 'inggris', label: 'B. Inggris', icon: '🇬🇧' },
            { id: 'hijaiyah', label: 'Hijaiyah', icon: '📖' },
          ].map((tab) => {
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  sound.playClick();
                  setActiveTab(tab.id as typeof activeTab);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold font-orbitron flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                  isTabActive
                    ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.5)] font-black'
                    : 'bg-slate-950/70 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Preset Cards List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2.5 pr-1 text-left">
          {filteredPresets.map((preset) => {
            const isSelected = preset.id === currentMateriId;
            const items = ALL_EDUCATIONAL_QUESTIONS.filter(preset.filter);
            const sampleItems = items.slice(0, 6);

            return (
              <div
                key={preset.id}
                onClick={() => {
                  sound.playClick();
                  onSelectMateri(preset.id);
                }}
                className={`group cursor-pointer p-3.5 sm:p-4 rounded-2xl border transition-all text-left relative overflow-hidden ${
                  isSelected
                    ? 'bg-cyan-950/70 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.35)]'
                    : 'bg-slate-950/60 border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900/90'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl sm:text-3xl">{preset.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm sm:text-base text-white group-hover:text-cyan-300 transition-colors">
                          {preset.name}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-cyan-300 font-mono">
                          {preset.levelBadge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">{preset.description}</p>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_#38bdf8]">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  )}
                </div>

                {/* Sample Target Items Preview Chips */}
                <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold uppercase text-slate-400 mr-1">Contoh Soal/Target:</span>
                  {sampleItems.map((item) => (
                    <span
                      key={item.id}
                      className={`px-2 py-0.5 rounded-lg border text-xs font-bold ${
                        item.subject === 'hijaiyah'
                          ? 'bg-cyan-950/80 border-cyan-500/40 text-cyan-300 font-arabic text-sm'
                          : item.subject === 'matematika'
                          ? 'bg-amber-950/80 border-amber-500/40 text-amber-300 font-orbitron'
                          : item.subject === 'ipa'
                          ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                          : 'bg-sky-950/80 border-sky-500/40 text-sky-300'
                      }`}
                      title={item.questionPrompt || item.hint}
                    >
                      {item.arabic}
                    </span>
                  ))}
                  {items.length > 6 && (
                    <span className="text-[10px] font-medium text-slate-400 ml-1">
                      +{items.length - 6} soal lainnya
                    </span>
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
            Terapkan & Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
