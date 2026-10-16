import React, { useState } from 'react';
import { X, Volume2, Sparkles, BookOpen, Check } from 'lucide-react';
import { HIJAIYAH_LIST, HijaiyahItem } from '../game/hijaiyahData';
import { sound } from '../game/sound';

interface KamusModalProps {
  onClose: () => void;
}

export const KamusModal: React.FC<KamusModalProps> = ({ onClose }) => {
  const [selectedLetter, setSelectedLetter] = useState<HijaiyahItem>(HIJAIYAH_LIST[0]);

  const handleSelect = (item: HijaiyahItem) => {
    setSelectedLetter(item);
    sound.playCorrect(1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn safe-pb safe-pt">
      <div className="w-full max-w-3xl max-h-[90dvh] rounded-3xl bg-slate-900/95 border-2 border-cyan-500/50 p-4 sm:p-6 flex flex-col shadow-[0_0_40px_rgba(6,182,212,0.35)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-400/50 flex items-center justify-center text-cyan-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-black font-orbitron text-white">KAMUS HURUF HIJAIYAH</h3>
              <p className="text-xs text-slate-400">Pelajari bentuk, nama, makhraj, dan harakat setiap huruf</p>
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

        {/* Content Body: Split into Selected Detail & 30 Letter Grid */}
        <div className="flex-1 overflow-y-auto py-4 flex flex-col md:flex-row gap-4">
          {/* Left: Detail Card for Selected Letter */}
          <div className="w-full md:w-5/12 flex flex-col items-center p-5 rounded-2xl bg-slate-950/80 border border-cyan-500/40 text-center shadow-[0_0_20px_rgba(6,182,212,0.2)]">
            {/* Big Character Hologram */}
            <div className="relative my-2 w-28 h-28 rounded-2xl bg-gradient-to-b from-cyan-950/90 to-slate-900 border-2 border-cyan-400/70 flex items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.4)]">
              <span className="font-arabic text-6xl font-black text-cyan-200 drop-shadow-[0_0_12px_#38bdf8]">
                {selectedLetter.arabic}
              </span>
            </div>

            {/* Latin Name & Pronunciation */}
            <h4 className="text-2xl font-black font-orbitron text-white mt-1">
              {selectedLetter.latin}
            </h4>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 mt-1">
              Pelafalan: {selectedLetter.pronunciation}
            </span>

            {/* Makhraj & Visual Hint */}
            <div className="mt-4 p-3 rounded-xl bg-slate-900 border border-slate-800 text-left w-full">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Karakteristik & Ciri:
              </span>
              <p className="text-xs text-slate-200 leading-relaxed">
                {selectedLetter.hint}
              </p>
            </div>

            {/* Harakat Variations (A, I, U) */}
            {selectedLetter.harakat && (
              <div className="mt-3 w-full">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5 text-left">
                  Bentuk Harakat Dasar:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center">
                    <span className="font-arabic text-xl text-amber-300 font-bold">{selectedLetter.harakat.fathah.arabic}</span>
                    <span className="text-[11px] font-semibold text-slate-300">{selectedLetter.harakat.fathah.latin}</span>
                    <span className="text-[9px] text-slate-500">Fathah</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center">
                    <span className="font-arabic text-xl text-sky-300 font-bold">{selectedLetter.harakat.kasrah.arabic}</span>
                    <span className="text-[11px] font-semibold text-slate-300">{selectedLetter.harakat.kasrah.latin}</span>
                    <span className="text-[9px] text-slate-500">Kasrah</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center">
                    <span className="font-arabic text-xl text-rose-300 font-bold">{selectedLetter.harakat.dhammah.arabic}</span>
                    <span className="text-[11px] font-semibold text-slate-300">{selectedLetter.harakat.dhammah.latin}</span>
                    <span className="text-[9px] text-slate-500">Dhammah</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Grid of All 30 Letters */}
          <div className="w-full md:w-7/12 flex flex-col">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Pilih huruf untuk melihat detail ({HIJAIYAH_LIST.length} Huruf):
            </span>
            <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 overflow-y-auto max-h-[380px] p-1">
              {HIJAIYAH_LIST.map((item) => {
                const isSelected = item.id === selectedLetter.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className={`p-2 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-[0_0_12px_#38bdf8] scale-105'
                        : 'bg-slate-950/80 hover:bg-slate-800 text-slate-200 border-slate-800 hover:border-cyan-500/50'
                    }`}
                  >
                    <span className={`font-arabic text-2xl font-bold ${isSelected ? 'text-slate-950' : 'text-cyan-300'}`}>
                      {item.arabic}
                    </span>
                    <span className={`text-[10px] font-bold mt-0.5 ${isSelected ? 'text-slate-950 font-black' : 'text-slate-400'}`}>
                      {item.latin}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
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
            Tutup Kamus
          </button>
        </div>
      </div>
    </div>
  );
};
