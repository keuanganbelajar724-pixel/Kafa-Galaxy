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
  bgGradEnd: string;
  nebulaeColors: string[];
  planetColor: string;
  planetRingColor?: string;
  hasCelestialBody: boolean;
  celestialBodyType: 'ringed_planet' | 'crystal_planet' | 'giant_sun' | 'space_city' | 'cosmic_core' | 'cosmic_forest' | 'sahabat_kafa_planet';
  description: string;
}

export const GALAXY_WORLDS: GalaxyWorld[] = [
  {
    id: 1,
    name: 'PLANET SAHABAT KAFA',
    subtitle: 'Lembah Kosmik & Planet Utama KAFA',
    themeColor: '#00f0ff',
    bgGradStart: '#091026',
    bgGradEnd: '#1a0b2e',
    nebulaeColors: ['rgba(6, 182, 212, 0.45)', 'rgba(192, 132, 252, 0.4)', 'rgba(244, 114, 182, 0.35)', 'rgba(56, 189, 248, 0.3)'],
    planetColor: '#0284c7',
    planetRingColor: '#38bdf8',
    hasCelestialBody: true,
    celestialBodyType: 'sahabat_kafa_planet',
    description: 'Planet megah Sahabat KAFA dengan cincin orbital bercahaya neon, atmosfer safir, dan stasiun luar angkasa legendaris.',
  },
  {
    id: 2,
    name: 'CRYSTAL PLANET',
    subtitle: 'Dunia Kristal Bercahaya',
    themeColor: '#2dd4bf',
    bgGradStart: '#041f2a',
    bgGradEnd: '#0f172a',
    nebulaeColors: ['rgba(45, 212, 191, 0.4)', 'rgba(16, 185, 129, 0.35)', 'rgba(14, 165, 233, 0.3)'],
    planetColor: '#0d9488',
    planetRingColor: '#5eead4',
    hasCelestialBody: true,
    celestialBodyType: 'crystal_planet',
    description: 'Gugusan kristal raksasa bercahaya turquoise dan asteroid kristalin mengambang di kedalaman ruang hampa.',
  },
  {
    id: 3,
    name: 'SOLAR STORM',
    subtitle: 'Badai Suar Surya',
    themeColor: '#f97316',
    bgGradStart: '#20081a',
    bgGradEnd: '#270e04',
    nebulaeColors: ['rgba(249, 115, 22, 0.45)', 'rgba(236, 72, 153, 0.4)', 'rgba(245, 158, 11, 0.35)', 'rgba(99, 102, 241, 0.25)'],
    planetColor: '#ea580c',
    planetRingColor: '#fbbf24',
    hasCelestialBody: true,
    celestialBodyType: 'giant_sun',
    description: 'Matahari raksasa berkobar di kejauhan dengan semburan korona jingga, magenta, dan gelombang plasma.',
  },
  {
    id: 4,
    name: 'GALAXY CITY',
    subtitle: 'Metropolis Antariksa',
    themeColor: '#38bdf8',
    bgGradStart: '#060f24',
    bgGradEnd: '#130e2c',
    nebulaeColors: ['rgba(56, 189, 248, 0.35)', 'rgba(129, 140, 248, 0.35)', 'rgba(6, 182, 212, 0.3)'],
    planetColor: '#312e81',
    planetRingColor: '#818cf8',
    hasCelestialBody: true,
    celestialBodyType: 'space_city',
    description: 'Stasiun luar angkasa megah dengan menara bercahaya dan alur kapal futuristis di kejauhan.',
  },
  {
    id: 5,
    name: 'COSMIC KINGDOM',
    subtitle: 'Singgasana Inti Galaksi',
    themeColor: '#fbbf24',
    bgGradStart: '#1e052a',
    bgGradEnd: '#090918',
    nebulaeColors: ['rgba(168, 85, 247, 0.45)', 'rgba(251, 191, 36, 0.4)', 'rgba(236, 72, 153, 0.35)'],
    planetColor: '#c026d3',
    planetRingColor: '#fde047',
    hasCelestialBody: true,
    celestialBodyType: 'cosmic_core',
    description: 'Pusat galaksi bertekanan gravitasi tinggi dengan gerbang energi kosmik dan singgasana dreadnought.',
  },
  {
    id: 6,
    name: 'COSMIC FOREST',
    subtitle: 'Hutan Kosmik Bercahaya',
    themeColor: '#10b981',
    bgGradStart: '#021a13',
    bgGradEnd: '#064e3b',
    nebulaeColors: ['rgba(16, 185, 129, 0.45)', 'rgba(52, 211, 153, 0.35)', 'rgba(6, 182, 212, 0.3)'],
    planetColor: '#059669',
    planetRingColor: '#6ee7b7',
    hasCelestialBody: true,
    celestialBodyType: 'cosmic_forest',
    description: 'Hutan belantara alien purba dengan pohon raksasa bioluminescent, spora bercahaya, sulur neon, dan kunang-kunang energi.',
  },
];

export const COSMIC_FOREST_WORLD = GALAXY_WORLDS[5];

export function getWorldForLevel(level: number): GalaxyWorld {
  if (level <= 2) return GALAXY_WORLDS[0];
  if (level <= 4) return GALAXY_WORLDS[1];
  if (level <= 6) return GALAXY_WORLDS[2];
  if (level <= 8) return GALAXY_WORLDS[3];
  return GALAXY_WORLDS[4];
}
