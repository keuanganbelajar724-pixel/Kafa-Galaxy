import { ShipSkinId } from './types';

export interface ShipSkin {
  id: ShipSkinId;
  name: string;
  subtitle: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  cockpitColor: string;
  trailColor: string;
  trimColor: string;
  description: string;
  unlockCondition: string;
}

export const SHIP_SKINS: ShipSkin[] = [
  {
    id: 'pioneer',
    name: 'KAFA STAR FIGHTER',
    subtitle: 'Signature Hero Spacecraft',
    primaryColor: '#00f0ff', // electric cyan
    secondaryColor: '#1e3a8a', // deep royal blue
    accentColor: '#f97316', // solar orange accents
    cockpitColor: '#67e8f9', // glowing electric cyan/blue
    trailColor: '#00f0ff',
    trimColor: '#ffffff', // titanium white
    description: 'Pesawat pahlawan animasi futuristis dengan siluet aerodinamis gagah, sayap canard bersudut neon, dan mesin plasma ganda.',
    unlockCondition: 'Terbuka Secara Default',
  },
  {
    id: 'phantom',
    name: 'KAFA PHANTOM',
    subtitle: 'Stealth Void Interceptor',
    primaryColor: '#a855f7', // royal violet
    secondaryColor: '#3b0764',
    accentColor: '#f43f5e', // neon rose accent
    cockpitColor: '#e9d5ff',
    trailColor: '#c084fc',
    trimColor: '#cbd5e1',
    description: 'Pesawat siluman berselubung obsidian dengan sayap tajam bermaterial penyerap radar kosmik.',
    unlockCondition: 'Raih Combo x4 atau Kalahkan Boss',
  },
  {
    id: 'nova',
    name: 'KAFA NOVA',
    subtitle: 'Solar Vanguard',
    primaryColor: '#f59e0b', // solar gold
    secondaryColor: '#7c2d12',
    accentColor: '#ef4444', // solar red accent
    cockpitColor: '#fef08a',
    trailColor: '#f59e0b',
    trimColor: '#ffffff',
    description: 'Fighter bertenaga fusi bintang dengan akselerasi tinggi dan knalpot plasma berdaya dorong dahsyat.',
    unlockCondition: 'Capai Skor 3.000 atau World 2',
  },
  {
    id: 'titan',
    name: 'KAFA TITAN',
    subtitle: 'Heavy Dreadwing',
    primaryColor: '#10b981', // emerald titan
    secondaryColor: '#064e3b',
    accentColor: '#84cc16', // lime accent
    cockpitColor: '#a7f3d0',
    trailColor: '#10b981',
    trimColor: '#f1f5f9',
    description: 'Pesawat tempur berzirah komposit tebal dengan kestabilan tembakan superior saat menghadapi rintangan berat.',
    unlockCondition: 'Capai Level 4 atau Akurasi 90%',
  },
];

export interface GalaxyWorld {
  id: number;
  name: string;
  subtitle: string;
  themeColor: string;
  bgGradStart: string;
  bgMidColor1?: string;
  bgMidColor2?: string;
  bgGradEnd: string;
  nebulaeColors: string[];
  planetColor: string;
  planetRingColor?: string;
  hasCelestialBody: boolean;
  celestialBodyType: 'ringed_planet' | 'crystal_planet' | 'giant_sun' | 'space_city' | 'cosmic_core' | 'cosmic_forest' | 'sahabat_kafa_planet';
  description: string;
  isBrightTheme?: boolean;
  biomeId?: string;
}

export const GALAXY_WORLDS: GalaxyWorld[] = [
  {
    id: 1,
    name: 'MATAHARI (SOLAR RADIANCE)',
    subtitle: 'Lautan Api & Suar Surya Membara (Cerah Terik)',
    themeColor: '#f59e0b',
    isBrightTheme: true,
    bgGradStart: '#fffbeb', // Brilliant solar white-gold daylight
    bgMidColor1: '#fef08a',
    bgMidColor2: '#f59e0b',
    bgGradEnd: '#ea580c',
    nebulaeColors: ['rgba(254, 240, 138, 0.75)', 'rgba(245, 158, 11, 0.65)', 'rgba(249, 115, 22, 0.55)', 'rgba(255, 255, 255, 0.8)'],
    planetColor: '#fef08a',
    planetRingColor: '#ffffff',
    hasCelestialBody: true,
    celestialBodyType: 'giant_sun',
    biomeId: 'sun',
    description: 'Suasana siang terang benderang di mahkota matahari raksasa! Langit emas berpendar menyilaukan dengan badai suar plasma dan lidah api surya.',
  },
  {
    id: 2,
    name: 'BULAN (LUNAR DAYLIGHT)',
    subtitle: 'Dataran Kawah Perak & Bumi Biru Cerah',
    themeColor: '#0ea5e9',
    isBrightTheme: true,
    bgGradStart: '#f8fafc', // Brilliant lunar platinum silver
    bgMidColor1: '#e2e8f0',
    bgMidColor2: '#94a3b8',
    bgGradEnd: '#38bdf8', // Luminous azure Earth-rise horizon
    nebulaeColors: ['rgba(226, 232, 240, 0.65)', 'rgba(56, 189, 248, 0.55)', 'rgba(148, 163, 184, 0.45)', 'rgba(255, 255, 255, 0.85)'],
    planetColor: '#0284c7', // Earth blue
    planetRingColor: '#67e8f9',
    hasCelestialBody: true,
    celestialBodyType: 'space_city',
    biomeId: 'moon',
    description: 'Siang terang di permukaan bulan berpasir perak! Pemandangan menakjubkan planet Bumi biru bersinar megah di cakrawala kawah.',
  },
  {
    id: 3,
    name: 'LANGIT FAJAR (CELESTIAL DAWN)',
    subtitle: 'Cakrawala Cerah Zamrud & Fajar Emas',
    themeColor: '#10b981',
    isBrightTheme: true,
    bgGradStart: '#ecfdf5', // Soft morning emerald daylight
    bgMidColor1: '#a7f3d0',
    bgMidColor2: '#34d399',
    bgGradEnd: '#0284c7',
    nebulaeColors: ['rgba(167, 243, 208, 0.65)', 'rgba(52, 211, 153, 0.55)', 'rgba(6, 182, 212, 0.45)'],
    planetColor: '#10b981',
    planetRingColor: '#fef08a',
    hasCelestialBody: true,
    celestialBodyType: 'cosmic_forest',
    biomeId: 'aurora',
    description: 'Atmosfer fajar cerah bernuansa zamrud dan pirus, dipenuhi sulur aurora hijau bercahaya dan sinar matahari pagi kosmik.',
  },
  {
    id: 4,
    name: 'PLANET SAHABAT KAFA',
    subtitle: 'Lembah Kosmik & Megalit Sahabat KAFA',
    themeColor: '#00f0ff',
    isBrightTheme: false,
    bgGradStart: '#091026',
    bgMidColor1: '#0c1435',
    bgMidColor2: '#180a2e',
    bgGradEnd: '#042238',
    nebulaeColors: ['rgba(6, 182, 212, 0.45)', 'rgba(192, 132, 252, 0.4)', 'rgba(244, 114, 182, 0.35)', 'rgba(56, 189, 248, 0.3)'],
    planetColor: '#0284c7',
    planetRingColor: '#38bdf8',
    hasCelestialBody: true,
    celestialBodyType: 'sahabat_kafa_planet',
    biomeId: 'nebula',
    description: 'Planet megah Sahabat KAFA dengan cincin orbital bercahaya neon, atmosfer safir, dan batu megalit raksasa legendaris.',
  },
  {
    id: 5,
    name: 'HUTAN PURBA KAFA',
    subtitle: 'Belantara Alien Zamrud Cerah',
    themeColor: '#34d399',
    isBrightTheme: true,
    bgGradStart: '#d1fae5', // Bright emerald canopy
    bgMidColor1: '#6ee7b7',
    bgMidColor2: '#10b981',
    bgGradEnd: '#064e3b',
    nebulaeColors: ['rgba(110, 231, 183, 0.6)', 'rgba(52, 211, 153, 0.5)', 'rgba(6, 182, 212, 0.4)'],
    planetColor: '#059669',
    planetRingColor: '#a7f3d0',
    hasCelestialBody: true,
    celestialBodyType: 'cosmic_forest',
    biomeId: 'forest',
    description: 'Hutan belantara alien purba bertabur spora cahaya bioluminescent dan dedaunan zamrud berpendar hangat.',
  },
  {
    id: 6,
    name: 'METROPOLIS ANGKASA',
    subtitle: 'Kota Antariksa Emas Cyber',
    themeColor: '#facc15',
    isBrightTheme: true,
    bgGradStart: '#fefce8', // Bright ivory gold daylight
    bgMidColor1: '#fde047',
    bgMidColor2: '#eab308',
    bgGradEnd: '#3b0764',
    nebulaeColors: ['rgba(253, 224, 71, 0.6)', 'rgba(234, 179, 8, 0.5)', 'rgba(236, 72, 153, 0.4)'],
    planetColor: '#ca8a04',
    planetRingColor: '#fef08a',
    hasCelestialBody: true,
    celestialBodyType: 'space_city',
    biomeId: 'crystal',
    description: 'Metropolis mengambang emas dengan menara prisma bercahaya dan armada pesawat tempur futuristis.',
  },
];

export const COSMIC_FOREST_WORLD = GALAXY_WORLDS[4];

export function getWorldForLevel(level: number): GalaxyWorld {
  const index = (level - 1) % GALAXY_WORLDS.length;
  return GALAXY_WORLDS[index];
}
