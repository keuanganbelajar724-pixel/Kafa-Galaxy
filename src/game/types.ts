import { HijaiyahItem } from './hijaiyahData';
import { GalaxyWorld } from './worldData';

export type ScreenState = 
  | 'MENU' 
  | 'PLAYING' 
  | 'PAUSED' 
  | 'GAMEOVER' 
  | 'VICTORY' 
  | 'LEARN' 
  | 'HOW_TO_PLAY' 
  | 'ACHIEVEMENTS' 
  | 'HANGAR';

export type GameMode = 'campaign' | 'survival' | 'accuracy';

export type WeaponType = 'standard' | 'double' | 'spread' | 'energy_blast';

export type JurusId =
  | 'double_photon'
  | 'triple_nova'
  | 'homing_phoenix'
  | 'spiral_dragon'
  | 'thunder_rail'
  | 'orbital_guard'
  | 'cosmic_sword'
  | 'galaxy_breaker'
  | 'forest_roots'
  | 'solar_flare'
  | 'blizzard_freeze'
  | 'cyclone_vortex'
  | 'meteor_rain'
  | 'gaia_quake';

export type ArenaBiome = 'nebula' | 'forest' | 'crystal' | 'volcano' | 'sun' | 'moon' | 'aurora';

export type AlienType = 'scout' | 'fighter' | 'interceptor' | 'cruiser';

export interface AlienFighterEntity {
  id: string;
  type: AlienType;
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  shootCooldown: number;
  shootInterval: number;
  color: string;
  glowColor: string;
  tilt: number;
  enginePhase: number;
  hitFlash: number;
  pattern: 'swoop' | 'hover_strafe' | 'dive' | 'escort';
  patternPhase: number;
  scoreValue: number;
}

export interface JurusDefinition {
  id: JurusId;
  number: number;
  name: string;
  powerName: string;
  subtitle: string;
  description: string;
  energyCost: number;
  cooldown: number;
  hotkey: string;
  icon: string;
  color: string;
}

export const JURUS_REGISTRY: JurusDefinition[] = [
  {
    id: 'double_photon',
    number: 1,
    name: 'DOUBLE PHOTON',
    powerName: 'Sahabat KAFA Photon Power!',
    subtitle: 'Dual Wing Laser Beams',
    description: 'Menembakkan dua laser photon berkecepatan tinggi sejajar dari kedua sayap dengan presisi ganda.',
    energyCost: 12,
    cooldown: 1.2,
    hotkey: '1 / Q',
    icon: '⚡',
    color: '#00f0ff',
  },
  {
    id: 'triple_nova',
    number: 2,
    name: 'TRIPLE NOVA',
    powerName: 'Sahabat KAFA Nova Power!',
    subtitle: 'Tri-Plasma Spread Burst',
    description: 'Melepaskan 3 bola plasma menyebar (cyan, biru, violet) yang memicu ledakan kecil pada tiap sasaran.',
    energyCost: 18,
    cooldown: 1.8,
    hotkey: '2 / W',
    icon: '✨',
    color: '#a855f7',
  },
  {
    id: 'homing_phoenix',
    number: 3,
    name: 'HOMING PHOENIX',
    powerName: 'Sahabat KAFA Phoenix Power!',
    subtitle: 'Guided Seeking Phoenix Missiles',
    description: 'Meluncurkan misil energi bersulur api kosmik yang meliuk otomatis memburu target soal aktif atau boss.',
    energyCost: 24,
    cooldown: 2.8,
    hotkey: '3 / E',
    icon: '🦅',
    color: '#f97316',
  },
  {
    id: 'spiral_dragon',
    number: 4,
    name: 'SPIRAL DRAGON',
    powerName: 'Sahabat KAFA Dragon Power!',
    subtitle: 'Cosmic Dragon Plasma Vortex',
    description: 'Proyektil naga kosmik berkepala plasma besar dengan dua pita energi berputar spiral cyan & magenta.',
    energyCost: 28,
    cooldown: 3.5,
    hotkey: '4 / R',
    icon: '🐉',
    color: '#ec4899',
  },
  {
    id: 'thunder_rail',
    number: 5,
    name: 'THUNDER RAIL',
    powerName: 'Sahabat KAFA Thunder Power!',
    subtitle: 'High-Velocity Piercing Railgun',
    description: 'Sinar laser rel hiper-cepat berdaya tembus tinggi yang menyengat segaris musuh dan boss rentan.',
    energyCost: 32,
    cooldown: 4.0,
    hotkey: '5 / Y',
    icon: '⚡',
    color: '#38bdf8',
  },
  {
    id: 'orbital_guard',
    number: 6,
    name: 'ORBITAL GUARD',
    powerName: 'Sahabat KAFA Shield Power!',
    subtitle: 'Tri-Orb Energy Sentinel Drones',
    description: 'Memanggil 3 drone energi berputar mengelilingi hero, menahan proyektil dan menembak otomatis.',
    energyCost: 30,
    cooldown: 5.0,
    hotkey: '6 / U',
    icon: '🛡️',
    color: '#10b981',
  },
  {
    id: 'cosmic_sword',
    number: 7,
    name: 'COSMIC SWORD',
    powerName: 'Sahabat KAFA Sword Power!',
    subtitle: 'Plasma Blade Dash & Crescent Slash',
    description: 'Hero membentuk pedang plasma raksasa di haluan, melakukan dash maju dan menebas target di depan!',
    energyCost: 34,
    cooldown: 4.5,
    hotkey: '7 / F',
    icon: '⚔️',
    color: '#facc15',
  },
  {
    id: 'galaxy_breaker',
    number: 8,
    name: 'GALAXY BREAKER',
    powerName: 'Sahabat KAFA Galaxy Power!',
    subtitle: 'Ultimate Cosmic Annihilation',
    description: 'Jurus pamungkas KAFA GALAXY! Mega-berkas kosmik dahsyat dengan gelombang kejut yang melenyapkan bahaya.',
    energyCost: 50,
    cooldown: 6.0,
    hotkey: '8 / X',
    icon: '🌌',
    color: '#00f0ff',
  },
  {
    id: 'forest_roots',
    number: 9,
    name: 'FOREST ROOTS',
    powerName: 'Sahabat KAFA Forest Power!',
    subtitle: 'Akar Hutan Kosmik Purba',
    description: 'Akar purba dan sulur hutan kosmik menjalar ke depan, menjerat proyektil musuh, memulihkan shield (+30), dan menembakkan duri zamrud!',
    energyCost: 28,
    cooldown: 4.0,
    hotkey: '9 / C',
    icon: '🌲',
    color: '#10b981',
  },
  {
    id: 'solar_flare',
    number: 10,
    name: 'SOLAR FLARE',
    powerName: 'Sahabat KAFA Solar Power!',
    subtitle: 'Badai Suar Surya Emas',
    description: 'Gelombang suar surya emas meledak meluas, membakar proyektil musuh dan memusnahkan rintangan beruntun!',
    energyCost: 30,
    cooldown: 4.5,
    hotkey: '0 / V',
    icon: '☀️',
    color: '#f59e0b',
  },
  {
    id: 'blizzard_freeze',
    number: 11,
    name: 'BLIZZARD FREEZE',
    powerName: 'Sahabat KAFA Blizzard Power!',
    subtitle: 'Badai Es Pembeku Kosmik',
    description: 'Pusaran es sub-zero membekukan musuh seketika selama 3 detik dan menghancurkan bola alien jadi kristal es!',
    energyCost: 26,
    cooldown: 3.8,
    hotkey: '- / B',
    icon: '❄️',
    color: '#38bdf8',
  },
  {
    id: 'cyclone_vortex',
    number: 12,
    name: 'CYCLONE VORTEX',
    powerName: 'Sahabat KAFA Cyclone Power!',
    subtitle: 'Topan Pusaran Angin Kosmik',
    description: 'Pusaran angin topan aerodinamis ganda yang memutar proyektil lawan dan melesatkan dua tornado energi kembar ke depan!',
    energyCost: 25,
    cooldown: 3.5,
    hotkey: '= / N',
    icon: '🌪️',
    color: '#06b6d4',
  },
  {
    id: 'meteor_rain',
    number: 13,
    name: 'METEOR RAIN',
    powerName: 'Sahabat KAFA Meteor Power!',
    subtitle: 'Hujan Meteor Kosmik Berapi Emas',
    description: 'Menghujani langit dengan 8 meteor plasma kosmik berapi emas yang meledak membakar seluruh target dan proyektil lawan!',
    energyCost: 32,
    cooldown: 4.2,
    hotkey: '[ / O',
    icon: '☄️',
    color: '#f97316',
  },
  {
    id: 'gaia_quake',
    number: 14,
    name: 'GAIA QUAKE',
    powerName: 'Sahabat KAFA Gaia Power!',
    subtitle: 'Gempa Hutan & Sulur Zamrud Kosmik',
    description: 'Menghentak gelombang seismik alam purba yang menumbuhkan sulur kristal hijau, melumpuhkan seluruh musuh dan memulihkan shield!',
    energyCost: 35,
    cooldown: 4.5,
    hotkey: '] / L',
    icon: '🌿',
    color: '#22c55e',
  },
];

export const GALAXY_BREAKER_DEFINITION = {
  id: 'galaxy_breaker',
  name: 'GALAXY BREAKER',
  subtitle: 'Jurus Pamungkas KAFA GALAXY',
  description: 'Jurus pamungkas kosmik! Layar meredup, inti kosmik terbentuk di haluan, lalu mega-berkas raksasa melesat dengan gelombang kejut spektakuler!',
  hotkey: 'X / Ultimate',
  icon: '🌌',
  color: '#00f0ff',
};

export const NOVA_STRIKE_DEFINITION = GALAXY_BREAKER_DEFINITION;

export type MovementPattern = 'straight' | 'sine' | 'bounce' | 'zigzag';

export type TargetStyle = 'drone' | 'core' | 'asteroid' | 'sentinel';

export type ShipSkinId = 'pioneer' | 'phantom' | 'nova' | 'titan' | 'valkyrie' | 'apocalypse';

export interface TargetEntity {
  id: string;
  letter: HijaiyahItem;
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseVx: number;
  radius: number;
  pattern: MovementPattern;
  style: TargetStyle;
  sinePhase: number;
  sineSpeed: number;
  angle: number;
  rotSpeed: number;
  isCorrect: boolean;
  hp: number;
  maxHp: number;
  hitFlash: number;
  pulseTimer: number;
  floatTimer: number;
}

export interface ProjectileEntity {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  length: number;
  color: string;
  glowColor: string;
  power: number;
  weaponType: WeaponType | JurusId;
  isSplash?: boolean;
  piercing?: boolean;
  isHoming?: boolean;
  targetId?: string;
  turnRate?: number;
  isSpiral?: boolean;
  spiralPhase?: number;
  isDragon?: boolean;
  dragonPhase?: number;
  isRail?: boolean;
  isSwordWave?: boolean;
  isMeteor?: boolean;
  isOvercharge?: boolean;
  blastRadius?: number;
  trailHistory?: { x: number; y: number }[];
  life?: number;
  maxLife?: number;
}

export interface EnemyProjectileEntity {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  glowColor: string;
}

export interface ParticleEntity {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
  alpha: number;
  type: 'spark' | 'smoke' | 'shockwave' | 'ring' | 'trail' | 'debris';
}

export interface FloatingTextEntity {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
  vy: number;
  scale: number;
}

export type PowerUpType = 
  | 'shield' 
  | 'multishot' 
  | 'slowmo' 
  | 'nuke' 
  | 'heart' 
  | 'rapid_fire' 
  | 'double_score' 
  | 'magnet' 
  | 'energy';

export interface PowerUpEntity {
  id: string;
  x: number;
  y: number;
  vy: number;
  type: PowerUpType;
  radius: number;
  angle: number;
  pulse: number;
}

export interface ActivePowerUps {
  multishotTimer: number;
  slowmoTimer: number;
  rapidFireTimer: number;
  doubleScoreTimer: number;
  magnetTimer: number;
  shieldActive: boolean;
}

export interface OrbitalDroneEntity {
  id: string;
  angle: number;
  orbitRadius: number;
  speed: number;
  fireCooldown: number;
  color: string;
}

export interface CombatComboInfo {
  chainTitle: string | null;
  chainCount: number;
  timer: number;
  bonusPoints: number;
}

export interface PlayerEntity {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  speed: number;
  tilt: number;
  recoilOffset: number;
  idleHoverPhase: number;
  fireCooldown: number;
  fireRate: number;
  invulnerableTimer: number;
  activeWeapon: WeaponType;
  specialEnergy: number;
  ultimateEnergy: number;
  shieldHp: number;
  skin: ShipSkinId;
  dashTimer: number;
  cosmicSwordTimer: number;
  cosmicSwordActive: boolean;
  thunderRailCharging: boolean;
  thunderRailTimer: number;
  galaxyBreakerCharging: boolean;
  galaxyBreakerTimer: number;
  orbitalGuards: OrbitalDroneEntity[];
  orbitalGuardDuration: number;
  quantumBeamActive: boolean;
  quantumBeamTimer: number;
  shieldBurstActive: boolean;
  shieldBurstRadius: number;
  novaStrikeActive: boolean;
  novaStrikeTimer: number;
  jurusCooldowns: Record<JurusId, number>;
  isRobotMode: boolean;
  transformTimer: number;
  voiceShoutText: string | null;
  voiceShoutTimer: number;
}

export interface StarEntity {
  x: number;
  y: number;
  z: number;
  size: number;
  brightness: number;
  twinklePhase: number;
  twinkleSpeed: number;
  color: string;
}

export interface NebulaEntity {
  x: number;
  y: number;
  radius: number;
  color: string;
  vy: number;
  vx: number;
  alpha: number;
  driftPhase: number;
}

export interface PlanetEntity {
  x: number;
  y: number;
  radius: number;
  color: string;
  ringColor?: string;
  type: 'ringed_planet' | 'crystal_planet' | 'giant_sun' | 'space_city' | 'cosmic_core' | 'cosmic_forest' | 'sahabat_kafa_planet';
  vy: number;
  alpha: number;
  label?: string;
  orbitalRingText?: string;
  rotation?: number;
}

export interface SpiralGalaxyEntity {
  x: number;
  y: number;
  radius: number;
  angle: number;
  rotSpeed: number;
  color: string;
  vy: number;
  alpha: number;
}

export interface MeteorEntity {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

export interface CosmicDustEntity {
  x: number;
  y: number;
  size: number;
  color: string;
  alpha: number;
  vy: number;
  vx: number;
}

export interface AsteroidEntity {
  x: number;
  y: number;
  radius: number;
  angle: number;
  rotSpeed: number;
  vy: number;
  vx: number;
  rimColor: string;
  baseColor: string;
  shapeOffsets: number[];
  isGiantMegalith?: boolean;
  label?: string;
  arabicLabel?: string;
  beaconLightTimer?: number;
  crystalVeinColor?: string;
  moonletAngle?: number;
  hitReactionTimer?: number;
}

export interface SpaceHazardEntity {
  id: string;
  type: 'laser_fence' | 'magma_asteroid' | 'gravity_vortex';
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  radius: number;
  hp: number;
  maxHp: number;
  hitFlash: number;
  angle: number;
  rotSpeed: number;
  phase: number;
  color: string;
  glowColor: string;
  scoreValue: number;
  // Laser fence specific
  fenceWidth?: number;
  leftEmitterHp?: number;
  rightEmitterHp?: number;
  leftAlive?: boolean;
  rightAlive?: boolean;
  overloadTimer?: number;
}

export interface CosmicGasRibbonEntity {
  yOffset: number;
  amplitude: number;
  frequency: number;
  speed: number;
  phase: number;
  colorStart: string;
  colorEnd: string;
  thickness: number;
  alpha: number;
}

export interface BossEntity {
  id: string;
  name: string;
  x: number;
  y: number;
  targetY: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  phase: 1 | 2 | 3;
  isShielded: boolean;
  shieldLetter: HijaiyahItem | null;
  attackCooldown: number;
  movePhase: number;
  entranceTimer: number;
  isDying: boolean;
  deathTimer: number;
  hitFlash: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
}

export interface SaveData {
  version: number;
  highScores: {
    campaign: number;
    survival: number;
    accuracy: number;
  };
  totalGamesPlayed: number;
  totalTargetsDestroyed: number;
  bossesDefeated: number;
  unlockedAchievements: string[];
  unlockedSkins: ShipSkinId[];
  selectedSkin: ShipSkinId;
  bestAccuracy: number;
}

export interface GameStats {
  score: number;
  highScore: number;
  mode: GameMode;
  level: number;
  currentWorld: GalaxyWorld;
  shipSkin: ShipSkinId;
  combo: number;
  maxCombo: number;
  comboMilestone: string | null;
  lives: number;
  maxLives: number;
  targetsHit: number;
  targetsCorrect: number;
  targetsWrong: number;
  targetsEscaped: number;
  accuracy: number;
  activeMission: HijaiyahItem | null;
  missionCorrectStreak: number;
  levelProgress: number;
  levelTargetGoal: number;
  survivalTime: number;
  accuracyTotalChances: number;
  accuracyRemainingChances: number;
  specialEnergy: number;
  ultimateEnergy: number;
  activeWeapon: WeaponType;
  activeJurusCooldowns: Record<JurusId, number>;
  combatCombo: CombatComboInfo;
  orbitalGuardActive: boolean;
  cosmicSwordActive: boolean;
  thunderRailCharging: boolean;
  galaxyBreakerCharging?: boolean;
  galaxyBreakerActive?: boolean;
  galaxyBreakerReady?: boolean;
  novaStrikeReady: boolean;
  novaStrikeActive?: boolean;
  quantumBeamActive?: boolean;
  starShieldBurstActive?: boolean;
  bossActive: boolean;
  bossHp: number;
  bossMaxHp: number;
  bossName: string;
  bossShielded: boolean;
  bossShieldLetter: HijaiyahItem | null;
  isRobotMode?: boolean;
  voiceShoutText?: string | null;
  activeArenaBiome?: ArenaBiome;
  challengeActive?: boolean;
  challengeTitle?: string | null;
  challengeTimer?: number;
  challengeGoal?: number;
  challengeProgress?: number;
  is3DVisual?: boolean;
  isGodMode?: boolean;
  isVictory?: boolean;
}
