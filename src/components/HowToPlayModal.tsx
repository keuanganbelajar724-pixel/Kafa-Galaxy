import { X, HelpCircle, Gamepad2, Target, Flame, Zap, ShieldAlert, Award, Skull, Crosshair, Smartphone, Vibrate, Maximize } from 'lucide-react';
import { sound } from '../game/sound';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn safe-pb safe-pt">
      <div className="w-full max-w-xl max-h-[90dvh] rounded-3xl bg-slate-900/95 border-2 border-cyan-500/50 p-4 sm:p-6 flex flex-col shadow-[0_0_40px_rgba(6,182,212,0.35)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-400/50 flex items-center justify-center text-cyan-400">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-black font-orbitron text-white">PANDUAN GALAXY COMBAT</h3>
              <p className="text-xs text-slate-400">Kuasai kendali HP sentuh, jurus tempur, dan boss fight</p>
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

        {/* Scrollable Guide Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-1 text-left text-sm">
          {/* Section 0: Kendali Khusus HP / Smartphone */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/90 via-slate-900 to-sky-950/80 border-2 border-cyan-400/60 flex items-start gap-3 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 flex-shrink-0 mt-0.5">
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="w-full">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-cyan-200 text-sm">Kendali Nyaman di HP (Smartphone)</h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/40">100% HP READY</span>
              </div>
              <div className="mt-1.5 space-y-1.5 text-xs text-slate-200">
                <p>
                  • <b>Geser / Sentuh Layar Langsung:</b> Cukup sentuh dan geser jarimu di mana saja pada layar. Pesawat akan meluncur mengikuti jarimu secara instan dan bebas manuver!
                </p>
                <p>
                  • <b>Mode D-Pad Virtual:</b> Suka gaya arcade retro? Tekan tombol <b>🎮 D-PAD</b> untuk mengaktifkan tombol panah kiri/kanan di sudut kiri bawah.
                </p>
                <p>
                  • <b>Auto-Tembak & Overdrive Burst:</b> Fitur Auto-Tembak aktif secara otomatis. Ketuk tombol tembak kapan saja untuk melepaskan <b>⚡ OVERDRIVE BURST</b> (semburan 3 peluru plasma ekstra berdaya tinggi)!
                </p>
                <p>
                  • <b>Batu Raksasa Megalit & Planet Sahabat KAFA:</b> Di latar kosmik melayang Batu Megalit Raksasa dan Planet bertuliskan kaligrafi <b>SAHABAT KAFA (صَحَابَة كَافَا)</b>. Tembak batu megalit untuk memicu percikan energi kosmik rahasia!
                </p>
                <p>
                  • <b>Tiga Mode Kamera 3D Next-Gen [Tombol K]:</b> Pilih antara <b>🎥 3D CHASE CAM</b> (sudut pandang orang ketiga sinematik dengan kemiringan dinamis dan grid horizon melengkung), <b>🚀 KOKPIT FPV PILOT</b> (tampilan langsung dari dalam kokpit jet tempur dengan radar taktis 360°, kompas tajam, dan joystick 3D interaktif), atau <b>🕹️ 2D TOP-DOWN</b> (gaya arcade klasik retro).
                </p>
                <p>
                  • <b>Preset Grafis PS5 Pro [Tombol G]:</b> Beralih secara instan antara mode <b>✨ RAY-TRACING ULTRA HDR</b> (pantulan cahaya proyektil waktu nyata, suar anamorfik, bloom volumetrik, dan chromatic aberration sinematik) atau <b>⚡ 60FPS PERFORMANCE</b> untuk kelancaran visual tanpa tanding!
                </p>
                <p>
                  • <b>Getaran HP (Haptic Feedback):</b> Rasakan sensasi getaran taktil nyata saat menembak, kombo, terkena musuh, hingga mengaktifkan jurus pamungkas!
                </p>
                <p>
                  • <b>Mode Layar Penuh (Fullscreen):</b> Tekan ikon <Maximize className="w-3.5 h-3.5 inline text-cyan-300" /> di pojok atas untuk pengalaman bermain tanpa batas bar peramban.
                </p>
              </div>
            </div>
          </div>

          {/* Section 1: Objective & Mission */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-cyan-500/30 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 flex items-center justify-center text-cyan-400 flex-shrink-0 mt-0.5">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">1. Misi Utama: Tembak Huruf yang Benar</h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Perhatikan banner misi di atas (contoh: <span className="text-cyan-300 font-bold">TEMBAK HURUF BA (ب)</span>). Bidik target huruf yang benar untuk mendapatkan poin, memicu ledakan partikel, dan melipatgandakan combo hingga 8x!
              </p>
            </div>
          </div>

          {/* Section 2: Boss Fight */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-rose-500/40 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-950 flex items-center justify-center text-rose-400 flex-shrink-0 mt-0.5">
              <Skull className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-rose-300 text-sm">2. Boss Battle: Penjaga Galaksi</h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Di level tertentu, Kapal Induk Alien raksasa akan muncul! Boss dilindungi oleh perisai energi kebal. <span className="text-amber-300 font-bold">Tembak huruf kelemahan boss yang diminta</span> untuk merusak perisai, melumpuhkan serangannya, dan membuka inti boss agar dapat diserang secara langsung!
              </p>
            </div>
          </div>

          {/* Section 3: 8 Special Abilities (Jurus), Combat Combo, & Galaxy Breaker */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-sky-500/40 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-950 flex items-center justify-center text-sky-400 flex-shrink-0 mt-0.5">
              <Zap className="w-5 h-5" />
            </div>
            <div className="w-full">
              <h4 className="font-bold text-white text-sm">3. 14 Jurus Tempur Sahabat KAFA Power & Sistem Kombo</h4>
              <p className="text-xs text-slate-300 mt-1">
                Kumpulkan <b>Energy (⚡)</b> dengan menembak huruf benar, lalu aktifkan jurus tempur via tombol keyboard atau tap ikon HUD / layar sentuh:
              </p>
              <div className="grid grid-cols-2 gap-1.5 mt-2 text-[11px]">
                <div className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-800">
                  <span className="font-bold text-cyan-300 block">⚡ 1: DOUBLE PHOTON [1 / Q]</span>
                  <span className="text-[10px] text-slate-400">Sahabat KAFA Photon Power! Dua laser sayap berpresisi ganda.</span>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-800">
                  <span className="font-bold text-purple-300 block">✨ 2: TRIPLE NOVA [2 / W]</span>
                  <span className="text-[10px] text-slate-400">Sahabat KAFA Nova Power! 3 bola plasma menyebar berledakan.</span>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-800">
                  <span className="font-bold text-orange-300 block">🔥 3: HOMING PHOENIX [3 / E]</span>
                  <span className="text-[10px] text-slate-400">Sahabat KAFA Phoenix Power! Misil energi api pemburu sasaran.</span>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-800">
                  <span className="font-bold text-pink-300 block">🌀 4: SPIRAL DRAGON [4 / R]</span>
                  <span className="text-[10px] text-slate-400">Sahabat KAFA Dragon Power! Naga kosmik heliks ganda magenta.</span>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-800">
                  <span className="font-bold text-sky-300 block">⚡ 5: THUNDER RAIL [5 / Y]</span>
                  <span className="text-[10px] text-slate-400">Sahabat KAFA Thunder Power! Rel laser penembus segaris sasaran.</span>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-800">
                  <span className="font-bold text-emerald-300 block">🛡️ 6: ORBITAL GUARD [6 / U]</span>
                  <span className="text-[10px] text-slate-400">Sahabat KAFA Shield Power! 3 drone pelindung & penembak otomatis.</span>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-800">
                  <span className="font-bold text-amber-300 block">⚔️ 7: COSMIC SWORD [7 / F]</span>
                  <span className="text-[10px] text-slate-400">Sahabat KAFA Sword Power! Pedang plasma raksasa & dash tebasan sabit.</span>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-800">
                  <span className="font-bold text-cyan-300 block">🌌 8: GALAXY BREAKER [8 / X]</span>
                  <span className="text-[10px] text-slate-400">Sahabat KAFA Galaxy Power! Mega-berkas pamungkas penyapu proyektil.</span>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-800">
                  <span className="font-bold text-emerald-400 block">🌲 9: FOREST ROOTS [9 / C]</span>
                  <span className="text-[10px] text-slate-400">Sahabat KAFA Forest Power! Akar purba penjerat lawan & duri zamrud.</span>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-800">
                  <span className="font-bold text-yellow-400 block">☀️ 10: SOLAR FLARE [0 / V]</span>
                  <span className="text-[10px] text-slate-400">Sahabat KAFA Solar Power! Ledakan suar surya pembakar rintangan.</span>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-800">
                  <span className="font-bold text-sky-400 block">❄️ 11: BLIZZARD FREEZE [- / B]</span>
                  <span className="text-[10px] text-slate-400">Sahabat KAFA Blizzard Power! Badai sub-zero pembeku musuh seketika.</span>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-800">
                  <span className="font-bold text-teal-300 block">🌪️ 12: CYCLONE VORTEX [= / N]</span>
                  <span className="text-[10px] text-slate-400">Sahabat KAFA Cyclone Power! Pusaran topan ganda pelontar musuh.</span>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-800">
                  <span className="font-bold text-orange-400 block">☄️ 13: METEOR RAIN [[ / O]</span>
                  <span className="text-[10px] text-slate-400">Sahabat KAFA Meteor Power! Hujan 8 meteor plasma berapi emas.</span>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-800">
                  <span className="font-bold text-green-400 block">🌿 14: GAIA QUAKE [] / L]</span>
                  <span className="text-[10px] text-slate-400">Sahabat KAFA Gaia Power! Gempa seismik purba & 10 duri kristal zamrud.</span>
                </div>
              </div>

              {/* Special Vocal Shout: SAHABAT KAFA POWER! */}
              <div className="mt-2.5 p-2.5 rounded-xl bg-gradient-to-r from-amber-950/80 via-yellow-950/70 to-cyan-950/80 border border-amber-400/50 flex items-start gap-2">
                <span className="text-xl">⚡</span>
                <div>
                  <span className="font-bold text-amber-300 text-xs block">
                    SERUAN VOKAL HEROIK: &quot;SAHABAT KAFA [NAMA] POWER!&quot;
                  </span>
                  <p className="text-[11px] text-slate-200 mt-0.5 leading-relaxed">
                    Setiap jurus memiliki nama jurus tersendiri berawalan <span className="text-yellow-300 font-bold">&quot;Sahabat KAFA&quot;</span>. Saat diaktifkan, suara vokal heroik akan mengumandangkan namanya dengan akord sintetis dan spanduk hologram beraura emas!
                  </p>
                </div>
              </div>

              {/* Dynamic Forest Biome & Challenge Mode */}
              <div className="mt-2.5 p-2.5 rounded-xl bg-gradient-to-r from-emerald-950/90 via-teal-950/80 to-emerald-950/90 border-2 border-emerald-400/60 flex items-start gap-2">
                <span className="text-xl">🌲</span>
                <div>
                  <span className="font-bold text-emerald-300 text-xs block">
                    TANTANGAN ARENA: LATAR BERUBAH JADI HUTAN PURBA KAFA [Tombol H]
                  </span>
                  <p className="text-[11px] text-slate-200 mt-0.5 leading-relaxed">
                    Saat menghadapi <b>Tantangan Khusus</b> atau <b>Pertarungan Boss</b>, latar galaksi luar angkasa akan berubah secara magis menjadi <b>Belantara Hutan Kosmik Purba</b> dengan pohon-pohon raksasa bercahaya, sulur neon bioluminescent, dan spora kuno yang melayang. Kamu juga bisa mengaktifkannya kapan saja lewat tombol <b className="text-emerald-300">HUTAN</b> di HUD atau tombol keyboard <b>[H]</b>!
                  </p>
                </div>
              </div>

              {/* Robot Transformation */}
              <div className="mt-2.5 p-2 rounded-xl bg-slate-900/90 border border-cyan-500/40 text-xs flex items-center gap-2">
                <span className="text-xl">🤖</span>
                <div>
                  <span className="font-bold text-cyan-300 block">TRANSFORMASI PESAWAT ⟷ ROBOT MECHA KAFA [Tombol T]</span>
                  <span className="text-[11px] text-slate-300">
                    Tekan tombol <b className="text-white">T</b> atau tombol robot di layar untuk bertransformasi kapan saja. Mode Robot Mecha dilengkapi Twin Arm Buster Cannons berdaya hancur tinggi!
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Game Modes */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-amber-500/30 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-950 flex items-center justify-center text-amber-400 flex-shrink-0 mt-0.5">
              <Crosshair className="w-5 h-5" />
            </div>
            <div className="w-full">
              <h4 className="font-bold text-white text-sm">4. Tiga Pilihan Mode Permainan</h4>
              <div className="space-y-1.5 mt-1.5 text-xs text-slate-300">
                <p>• <b>Campaign:</b> Mode bertingkat dengan kenaikan level dan boss battle.</p>
                <p>• <b>Survival:</b> Bertahan dari gelombang target tanpa henti sekuat mungkin.</p>
                <p>• <b>Accuracy Challenge:</b> 20 peluang tembak! Uji ketepatan 100% tanpa salah.</p>
              </div>
            </div>
          </div>

          {/* Section 5: Power-ups */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-emerald-500/30 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 flex items-center justify-center text-emerald-400 flex-shrink-0 mt-0.5">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">5. Kapsul Power-Up Kosmik</h4>
              <div className="grid grid-cols-2 gap-1.5 mt-1.5 text-[11px] text-slate-300">
                <span>❤️ <b>Heart:</b> Tambah 1 nyawa</span>
                <span>🛡️ <b>Shield:</b> Perisai anti-benturan</span>
                <span>⚡ <b>Rapid Fire:</b> Tembak turbo 2x</span>
                <span>2X <b>Double Score:</b> Skor ganda</span>
                <span>🧲 <b>Magnet:</b> Tarik power-up</span>
                <span>🔋 <b>Energy:</b> Isi ulang energi senjata</span>
              </div>
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
            Siap Tempur!
          </button>
        </div>
      </div>
    </div>
  );
};
