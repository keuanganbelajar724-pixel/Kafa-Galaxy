import { HIJAIYAH_LIST, ALL_EDUCATIONAL_QUESTIONS, HijaiyahItem, MATERI_PRESETS, MateriPreset } from './hijaiyahData';
import { sound } from './sound';
import { haptics } from './haptics';
import { achievementManager } from './achievements';
import { GALAXY_WORLDS, GalaxyWorld, SHIP_SKINS, ShipSkin, getWorldForLevel } from './worldData';
import {
  ActivePowerUps,
  AlienFighterEntity,
  AlienType,
  ArenaBiome,
  AsteroidEntity,
  BossEntity,
  CosmicDustEntity,
  CosmicGasRibbonEntity,
  EnemyProjectileEntity,
  FloatingTextEntity,
  GameMode,
  GameStats,
  JurusId,
  JURUS_REGISTRY,
  MeteorEntity,
  MovementPattern,
  NebulaEntity,
  NOVA_STRIKE_DEFINITION,
  ParticleEntity,
  PlanetEntity,
  PlayerEntity,
  PowerUpEntity,
  PowerUpType,
  ProjectileEntity,
  CameraMode,
  PS5GraphicsMode,
  ShipSkinId,
  SpaceHazardEntity,
  SpiralGalaxyEntity,
  StarEntity,
  TargetEntity,
  TargetStyle,
  WeaponType,
} from './types';

export interface ForestSporeEntity {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  phase: number;
  pulseSpeed: number;
}

export interface GameEngineCallbacks {
  onStatsUpdate: (stats: GameStats) => void;
  onGameOver: (stats: GameStats) => void;
  onVictory: (stats: GameStats) => void;
  onLevelUp: (newLevel: number) => void;
  onMissionChange: (mission: HijaiyahItem) => void;
  onScoreEvent: (points: number, isCombo: boolean) => void;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animFrameId: number | null = null;
  private lastTime: number = 0;
  private isRunning: boolean = false;
  private isPaused: boolean = false;

  // Screen metrics
  private width: number = 800;
  private height: number = 600;
  private dpr: number = 1;

  // Selected curriculum preset & game mode
  private currentMateri: MateriPreset = MATERI_PRESETS[0];
  private availableLetters: HijaiyahItem[] = ALL_EDUCATIONAL_QUESTIONS;
  private mode: GameMode = 'campaign';

  // Game Entities
  private player: PlayerEntity;
  private targets: TargetEntity[] = [];
  private projectiles: ProjectileEntity[] = [];
  private enemyProjectiles: EnemyProjectileEntity[] = [];
  private particles: ParticleEntity[] = [];
  private floatingTexts: FloatingTextEntity[] = [];
  private powerUps: PowerUpEntity[] = [];

  // Colorful Universe 5-Layer Parallax Entities
  private stars: StarEntity[] = [];
  private nebulae: NebulaEntity[] = [];
  private spiralGalaxies: SpiralGalaxyEntity[] = [];
  private celestialPlanets: PlanetEntity[] = [];
  private meteors: MeteorEntity[] = [];
  private asteroids: AsteroidEntity[] = [];
  private cosmicDust: CosmicDustEntity[] = [];
  private gasRibbons: CosmicGasRibbonEntity[] = [];
  private meteorTimer: number = 2.0;

  // Bioluminescent Alien Forest Biome ("Hutan Purba KAFA") Entities
  private forestSpores: ForestSporeEntity[] = [];
  private biomeTransitionAlpha: number = 0; // 0 = standard cosmos, 1 = lush alien forest
  private targetBiomeAlpha: number = 0;

  // Living Ambient Mode (runs in Main Menu & Idle screens)
  private isMenuAmbient: boolean = true;

  private boss: BossEntity | null = null;

  // Active power-up states
  private activePowerUps: ActivePowerUps = {
    multishotTimer: 0,
    slowmoTimer: 0,
    rapidFireTimer: 0,
    doubleScoreTimer: 0,
    magnetTimer: 0,
    shieldActive: false,
  };

  // Screen shake
  private shakeTimer: number = 0;
  private shakeIntensity: number = 0;

  // Input states
  private keys: { [key: string]: boolean } = {};
  private pointerControl: { isTouching: boolean; targetX: number; targetY?: number } = { isTouching: false, targetX: 400 };
  private autoShoot: boolean = true;

  // Spawning & progression timers
  private spawnCooldown: number = 0;
  private activeMission: HijaiyahItem | null = null;
  private survivalTimer: number = 0;
  // Active Alien Fighter Squadrons
  private alienFighters: AlienFighterEntity[] = [];
  private alienSpawnTimer: number = 0;
  // Dynamic Space Hazards & Obstacles
  private spaceHazards: SpaceHazardEntity[] = [];
  private hazardSpawnTimer: number = 3.5;

  // Used weapons tracker for achievement
  private usedWeapons: Set<WeaponType> = new Set(['standard']);
  private lastJurusUsed: JurusId | null = null;
  private lastJurusTime: number = 0;
  // PS5 Cinematic 3D Depth Engine & 6DOF Camera System
  private gridPhase: number = 0;
  private gridScroll: number = 0;
  private is3DVisualEnabled: boolean = true;
  private cameraRoll: number = 0;
  private targetCameraRoll: number = 0;
  private cameraPitch: number = 0;
  private targetCameraPitch: number = 0;
  private cameraZoom: number = 1.0;
  private targetCameraZoom: number = 1.0;
  private cameraPanX: number = 0;
  private cameraMode: CameraMode = 'chase_3d';
  private ps5GraphicsMode: PS5GraphicsMode = 'rt_ultra';
  private fps: number = 60;
  private fpsSampleTime: number = 0;
  private fpsFrames: number = 0;
  private chromaticAberrationAlpha: number = 0;
  private speedLinesPhase: number = 0;
  private anamorphicFlareAlpha: number = 0;
  private warpDriveTimer: number = 0;
  private warpDriveCooldown: number = 0;
  private warpLaserCooldown: number = 0;
  private cosmicLightningTimer: number = 3.5;
  private cosmicLightningBolt: { x1: number; y1: number; x2: number; y2: number; alpha: number } | null = null;
  private auroraPhase: number = 0;
  private isGodMode: boolean = true; // Mode Dewa: Nyawa tak terbatas & kekuatan super

  // Game Stats
  private stats: GameStats = {
    score: 0,
    highScore: 0,
    mode: 'campaign',
    level: 1,
    currentWorld: GALAXY_WORLDS[0],
    shipSkin: 'pioneer',
    combo: 0,
    maxCombo: 0,
    comboMilestone: null,
    lives: 999,
    maxLives: 999,
    isGodMode: true,
    targetsHit: 0,
    targetsCorrect: 0,
    targetsWrong: 0,
    targetsEscaped: 0,
    accuracy: 100,
    activeMission: null,
    missionCorrectStreak: 0,
    levelProgress: 0,
    levelTargetGoal: 5,
    survivalTime: 0,
    accuracyTotalChances: 20,
    accuracyRemainingChances: 20,
    specialEnergy: 100,
    ultimateEnergy: 0,
    activeWeapon: 'standard',
    activeJurusCooldowns: {
      double_photon: 0,
      triple_nova: 0,
      homing_phoenix: 0,
      spiral_dragon: 0,
      thunder_rail: 0,
      orbital_guard: 0,
      cosmic_sword: 0,
      galaxy_breaker: 0,
      forest_roots: 0,
      solar_flare: 0,
      blizzard_freeze: 0,
      cyclone_vortex: 0,
      meteor_rain: 0,
      gaia_quake: 0,
    },
    combatCombo: { chainTitle: null, chainCount: 0, timer: 0, bonusPoints: 0 },
    orbitalGuardActive: false,
    cosmicSwordActive: false,
    thunderRailCharging: false,
    galaxyBreakerCharging: false,
    galaxyBreakerActive: false,
    galaxyBreakerReady: false,
    novaStrikeReady: false,
    novaStrikeActive: false,
    bossActive: false,
    bossHp: 0,
    bossMaxHp: 0,
    bossName: '',
    bossShielded: false,
    bossShieldLetter: null,
    isRobotMode: false,
    voiceShoutText: null,
    activeArenaBiome: 'nebula',
    challengeActive: false,
    challengeTitle: null,
    challengeTimer: 0,
    challengeGoal: 5,
    challengeProgress: 0,
    is3DVisual: true,
    cameraMode: 'chase_3d',
    ps5GraphicsMode: 'rt_ultra',
    fpsCounter: 60,
    isWarpDriveActive: false,
    warpDriveCooldown: 0,
    isVictory: false,
  };

  private callbacks: GameEngineCallbacks;

  constructor(canvas: HTMLCanvasElement, callbacks: GameEngineCallbacks) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get 2d canvas context');
    this.ctx = context;
    this.callbacks = callbacks;

    const initialSkin = achievementManager.getSelectedSkin();
    this.stats.highScore = achievementManager.getHighScore(this.mode);
    this.stats.shipSkin = initialSkin;

    // Initialize Hero Player Ship
    this.player = {
      x: 400,
      y: 520,
      width: 62,
      height: 52,
      vx: 0,
      speed: 490,
      tilt: 0,
      recoilOffset: 0,
      idleHoverPhase: 0,
      fireCooldown: 0,
      fireRate: 0.18,
      invulnerableTimer: 0,
      activeWeapon: 'standard',
      specialEnergy: 100,
      ultimateEnergy: 0,
      shieldHp: 0,
      skin: initialSkin,
      dashTimer: 0,
      cosmicSwordTimer: 0,
      cosmicSwordActive: false,
      thunderRailCharging: false,
      thunderRailTimer: 0,
      galaxyBreakerCharging: false,
      galaxyBreakerTimer: 0,
      quantumBeamActive: false,
      quantumBeamTimer: 0,
      shieldBurstActive: false,
      shieldBurstRadius: 0,
      novaStrikeActive: false,
      novaStrikeTimer: 0,
      orbitalGuards: [],
      orbitalGuardDuration: 0,
      jurusCooldowns: {
        double_photon: 0,
        triple_nova: 0,
        homing_phoenix: 0,
        spiral_dragon: 0,
        thunder_rail: 0,
        orbital_guard: 0,
        cosmic_sword: 0,
        galaxy_breaker: 0,
        forest_roots: 0,
        solar_flare: 0,
        blizzard_freeze: 0,
        cyclone_vortex: 0,
        meteor_rain: 0,
        gaia_quake: 0,
      },
      isRobotMode: false,
      transformTimer: 0,
      voiceShoutText: null,
      voiceShoutTimer: 0,
    };

    this.resizeCanvas();
    this.initCosmos();
    this.bindEvents();
  }

  public setMode(newMode: GameMode) {
    this.mode = newMode;
    this.stats.mode = newMode;
    this.stats.highScore = achievementManager.getHighScore(newMode);
  }

  public setMateri(presetId: string) {
    const found = MATERI_PRESETS.find((p) => p.id === presetId) || MATERI_PRESETS[0];
    this.currentMateri = found;
    this.availableLetters = ALL_EDUCATIONAL_QUESTIONS.filter(found.filter);
    if (this.availableLetters.length === 0) {
      this.availableLetters = ALL_EDUCATIONAL_QUESTIONS;
    }
  }

  public setWeapon(weapon: WeaponType) {
    this.player.activeWeapon = weapon;
    this.stats.activeWeapon = weapon;
    this.usedWeapons.add(weapon);
    if (this.usedWeapons.size >= 4) {
      achievementManager.checkUnlock('arsenal_master');
    }
    sound.playWeaponSwitch();
    this.callbacks.onStatsUpdate(this.stats);
  }

  public resizeCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = rect.width || 800;
    this.height = rect.height || 600;

    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);

    this.player.y = this.height - 90;
    if (this.player.x > this.width - 45) this.player.x = this.width - 45;
    if (this.player.x < 45) this.player.x = 45;
  }

  // ==================== 5-LAYER PARALLAX COSMOS INITIALIZATION ====================
  private initCosmos() {
    // Layer 1: Twinkling Colorful Stars with High Visual Depth
    this.stars = [];
    const count = 220;
    const colors = ['#67e8f9', '#a5f3fc', '#93c5fd', '#e0e7ff', '#fcd34d', '#f472b6', '#c084fc', '#ffffff', '#38bdf8'];
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        z: Math.random() * 2.8 + 0.5,
        size: Math.random() * 2.4 + 0.6,
        brightness: Math.random() * 0.7 + 0.3,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 3 + 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    // Layer 1b: Distant Rotating Spiral Galaxies
    this.spiralGalaxies = [
      {
        x: this.width * 0.16,
        y: this.height * 0.22,
        radius: 48,
        angle: 0.4,
        rotSpeed: 0.05,
        color: '#c084fc',
        vy: 3,
        alpha: 0.45,
      },
      {
        x: this.width * 0.86,
        y: this.height * 0.52,
        radius: 58,
        angle: -0.6,
        rotSpeed: -0.04,
        color: '#38bdf8',
        vy: 4,
        alpha: 0.4,
      },
      {
        x: this.width * 0.5,
        y: this.height * 0.85,
        radius: 40,
        angle: 1.2,
        rotSpeed: 0.06,
        color: '#f472b6',
        vy: 2.5,
        alpha: 0.35,
      },
    ];

    // Layer 2b: Undulating Cosmic Gas Ribbons
    this.gasRibbons = [
      {
        yOffset: this.height * 0.35,
        amplitude: 35,
        frequency: 0.005,
        speed: 0.4,
        phase: 0,
        colorStart: 'rgba(6, 182, 212, 0.25)',
        colorEnd: 'rgba(192, 132, 252, 0.15)',
        thickness: 55,
        alpha: 0.85,
      },
      {
        yOffset: this.height * 0.72,
        amplitude: 45,
        frequency: 0.004,
        speed: 0.3,
        phase: Math.PI,
        colorStart: 'rgba(236, 72, 153, 0.2)',
        colorEnd: 'rgba(56, 189, 248, 0.18)',
        thickness: 70,
        alpha: 0.75,
      },
    ];

    // Layer 4b: Floating Asteroid Belt Rocks with Directional Rim Glow
    this.asteroids = [];

    // 1. The Majestic Giant Megalith Asteroid of Sahabat KAFA ("Batu Raksasa Sahabat KAFA")
    const megalithOffsets: number[] = [];
    const megalithPts = 16;
    for (let p = 0; p < megalithPts; p++) {
      megalithOffsets.push(0.85 + Math.sin(p * 1.3) * 0.18 + (p % 2 === 0 ? 0.1 : -0.08));
    }
    const giantMegalithRadius = Math.max(65, Math.min(95, this.width * 0.17));
    this.asteroids.push({
      x: this.width * 0.35,
      y: this.height * 0.3,
      radius: giantMegalithRadius,
      angle: -0.15,
      rotSpeed: 0.04, // Very slow, majestic rotation
      vy: 6.5,
      vx: 1.2,
      rimColor: '#00f0ff',
      baseColor: '#0f172a',
      shapeOffsets: megalithOffsets,
      isGiantMegalith: true,
      label: 'SAHABAT KAFA',
      arabicLabel: 'صَحَابَة كَافَا',
      beaconLightTimer: 0,
      crystalVeinColor: '#38bdf8',
      moonletAngle: 0,
      hitReactionTimer: 0,
    });

    // 2. Regular field asteroids
    const asteroidCount = 5;
    for (let i = 0; i < asteroidCount; i++) {
      const offsets: number[] = [];
      const numPts = 8;
      for (let p = 0; p < numPts; p++) {
        offsets.push(0.8 + Math.random() * 0.4);
      }
      this.asteroids.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 14 + 10,
        angle: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.4,
        vy: Math.random() * 18 + 12,
        vx: (Math.random() - 0.5) * 6,
        rimColor: '#38bdf8',
        baseColor: '#1e293b',
        shapeOffsets: offsets,
      });
    }

    // Layer 5: Foreground Floating Cosmic Dust & Energy Motes
    this.cosmicDust = [];
    for (let i = 0; i < 45; i++) {
      this.cosmicDust.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 3.0 + 1.0,
        color: Math.random() > 0.5 ? '#38bdf8' : (Math.random() > 0.5 ? '#f472b6' : '#facc15'),
        alpha: Math.random() * 0.55 + 0.25,
        vy: Math.random() * 50 + 25,
        vx: (Math.random() - 0.5) * 15,
      });
    }

    this.meteors = [];
    this.initForestCosmos();
    this.updateWorldCosmos();
  }

  private updateWorldCosmos() {
    const world = this.stats.currentWorld;

    // Layer 2: Colorful Nebulae & Cosmic Gas Clouds
    this.nebulae = [];
    const positions = [
      { x: this.width * 0.18, y: this.height * 0.2, radius: 290 },
      { x: this.width * 0.82, y: this.height * 0.35, radius: 320 },
      { x: this.width * 0.42, y: this.height * 0.65, radius: 300 },
      { x: this.width * 0.85, y: this.height * 0.85, radius: 260 },
      { x: this.width * 0.15, y: this.height * 0.88, radius: 240 },
    ];

    for (let i = 0; i < positions.length; i++) {
      const color = world.nebulaeColors[i % world.nebulaeColors.length];
      this.nebulae.push({
        x: positions[i].x,
        y: positions[i].y,
        radius: positions[i].radius,
        color,
        vy: 8 + (i % 2) * 5,
        vx: (i % 2 === 0 ? 1 : -1) * 3,
        alpha: 0.4,
        driftPhase: Math.random() * Math.PI * 2,
      });
    }

    // Layer 3: Celestial Planetary Body with Edge Glow & Rings
    this.celestialPlanets = [
      {
        x: this.width * 0.82,
        y: this.height * 0.18,
        radius: Math.min(88, this.width * 0.14),
        color: world.planetColor,
        ringColor: world.planetRingColor,
        type: world.celestialBodyType,
        vy: 3.5,
        alpha: 0.95,
        label: 'PLANET SAHABAT KAFA',
        orbitalRingText: '★ SAHABAT KAFA ★',
        rotation: 0,
      },
      // Smaller secondary planet
      {
        x: this.width * 0.14,
        y: this.height * 0.62,
        radius: Math.min(44, this.width * 0.07),
        color: world.planetRingColor || '#f472b6',
        type: 'crystal_planet',
        vy: 5,
        alpha: 0.8,
        label: 'MOON KAFA',
      },
    ];

    // Update asteroid rim colors to match world aesthetic (keep giant megalith with glowing signature cyan)
    for (const a of this.asteroids) {
      if (!a.isGiantMegalith) {
        a.rimColor = world.themeColor;
      }
    }
  }

  private bindEvents() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('resize', this.handleResize);
  }

  public destroy() {
    this.stop();
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('resize', this.handleResize);
  }

  private handleResize = () => {
    this.resizeCanvas();
    this.updateWorldCosmos();
  };

  private handleKeyDown = (e: KeyboardEvent) => {
    if (['ArrowLeft', 'ArrowRight', 'Space', 'ArrowUp', 'KeyA', 'KeyD'].includes(e.code)) {
      e.preventDefault();
    }
    this.keys[e.code] = true;

    // 12 Jurus Hotkeys:
    if (e.code === 'Digit1' || e.code === 'KeyQ') this.triggerJurus('double_photon');
    if (e.code === 'Digit2' || e.code === 'KeyW') this.triggerJurus('triple_nova');
    if (e.code === 'Digit3' || e.code === 'KeyE') this.triggerJurus('homing_phoenix');
    if (e.code === 'Digit4' || e.code === 'KeyR') this.triggerJurus('spiral_dragon');
    if (e.code === 'Digit5' || e.code === 'KeyY') this.triggerJurus('thunder_rail');
    if (e.code === 'Digit6' || e.code === 'KeyU') this.triggerJurus('orbital_guard');
    if (e.code === 'Digit7' || e.code === 'KeyF') this.triggerJurus('cosmic_sword');
    if (e.code === 'Digit8') this.triggerJurus('galaxy_breaker');
    if (e.code === 'Digit9' || e.code === 'KeyC') this.triggerJurus('forest_roots');
    if (e.code === 'Digit0' || e.code === 'KeyV') this.triggerJurus('solar_flare');
    if (e.code === 'Minus' || e.code === 'KeyB') this.triggerJurus('blizzard_freeze');
    if (e.code === 'Equal' || e.code === 'KeyN') this.triggerJurus('cyclone_vortex');
    if (e.code === 'BracketLeft' || e.code === 'KeyO') this.triggerJurus('meteor_rain');
    if (e.code === 'BracketRight' || e.code === 'KeyL') this.triggerJurus('gaia_quake');

    // Shift: Dash / Evasive Maneuver
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
      this.triggerDash();
    }

    // X: Galaxy Breaker Ultimate
    if (e.code === 'KeyX') {
      this.triggerGalaxyBreaker();
    }

    // T: Transform between Fighter Jet and Mecha Robot mode!
    if (e.code === 'KeyT') {
      this.toggleRobotMode();
    }

    // H: Toggle Forest Biome / Tantangan Hutan Purba!
    if (e.code === 'KeyH') {
      this.toggleForestBiome();
    }

    // K: Cycle 3D Camera Mode (Chase 3D -> Cockpit FPV -> 2D Top-Down)
    if (e.code === 'KeyK') {
      this.cycleCameraMode();
    }

    // G: Toggle PS5 Ray-Tracing / Performance Mode
    if (e.code === 'KeyG') {
      this.togglePS5GraphicsMode();
    }

    if (e.code === 'KeyP' || e.code === 'Escape') {
      this.togglePause();
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    this.keys[e.code] = false;
  };

  public setVirtualKey(code: string, isPressed: boolean) {
    this.keys[code] = isPressed;
    if (isPressed) {
      if (code === 'ShiftLeft' || code === 'ShiftRight') {
        this.triggerDash();
      } else if (code === 'KeyX') {
        this.triggerGalaxyBreaker();
      } else if (code === 'KeyT') {
        this.toggleRobotMode();
      }
    }
  }

  public setPointerTarget(x: number, isTouching: boolean, y?: number) {
    this.pointerControl.isTouching = isTouching;
    this.pointerControl.targetX = Math.max(35, Math.min(this.width - 35, x));
    if (y !== undefined) {
      const minY = Math.max(80, this.height * 0.35);
      const maxY = this.height - 65;
      this.pointerControl.targetY = Math.max(minY, Math.min(maxY, y));
    }
  }

  public setAutoShoot(enabled: boolean) {
    this.autoShoot = enabled;
  }

  public toggle3DVisual(): boolean {
    return this.cycleCameraMode() !== 'topdown';
  }

  public cycleCameraMode(): CameraMode {
    const modes: CameraMode[] = ['chase_3d', 'cockpit_fpv', 'topdown'];
    const curIdx = modes.indexOf(this.cameraMode);
    const nextMode = modes[(curIdx + 1) % modes.length];
    this.setCameraMode(nextMode);
    return nextMode;
  }

  public setCameraMode(mode: CameraMode) {
    this.cameraMode = mode;
    this.stats.cameraMode = mode;
    this.is3DVisualEnabled = mode !== 'topdown';
    this.stats.is3DVisual = this.is3DVisualEnabled;

    const names: Record<CameraMode, string> = {
      chase_3d: '🎥 KAMERA 3D: CHASE CAM (PERSPEKTIF PS5)',
      cockpit_fpv: '🚀 KAMERA 3D: KOKPIT FPV PILOT',
      topdown: '🕹️ KAMERA 2D: TOP-DOWN RETRO',
    };
    this.addFloatingText(this.width / 2, 140, names[mode] || mode, '#38bdf8', 1.5);
    sound.playClick();
    this.callbacks.onStatsUpdate(this.stats);
  }

  public getCameraMode(): CameraMode {
    return this.cameraMode;
  }

  public togglePS5GraphicsMode(): PS5GraphicsMode {
    this.ps5GraphicsMode = this.ps5GraphicsMode === 'rt_ultra' ? 'perf_60' : 'rt_ultra';
    this.stats.ps5GraphicsMode = this.ps5GraphicsMode;
    const txt = this.ps5GraphicsMode === 'rt_ultra'
      ? '✨ GRAFIS PS5: RAY-TRACING ULTRA HDR'
      : '⚡ GRAFIS PS5: 60FPS PERFORMANCE';
    this.addFloatingText(this.width / 2, 160, txt, '#facc15', 1.5);
    sound.playPowerup();
    this.callbacks.onStatsUpdate(this.stats);
    return this.ps5GraphicsMode;
  }

  public getPS5GraphicsMode(): PS5GraphicsMode {
    return this.ps5GraphicsMode;
  }

  public getIs3DVisual(): boolean {
    return this.is3DVisualEnabled;
  }

  public setWorld(worldId: number) {
    const world = GALAXY_WORLDS.find((w) => w.id === worldId) || GALAXY_WORLDS[0];
    this.stats.currentWorld = world;
    this.updateWorldCosmos();
    this.addFloatingText(this.width / 2, this.height * 0.35, `LOKASI: ${world.name}!`, world.themeColor, 1.8);
    sound.playLevelUp();
    this.callbacks.onStatsUpdate(this.stats);
  }

  public nextWorld() {
    const currentIndex = GALAXY_WORLDS.findIndex((w) => w.id === this.stats.currentWorld.id);
    const nextIndex = (currentIndex + 1) % GALAXY_WORLDS.length;
    this.setWorld(GALAXY_WORLDS[nextIndex].id);
  }

  public toggleGodMode(): boolean {
    this.isGodMode = !this.isGodMode;
    this.stats.isGodMode = this.isGodMode;
    if (this.isGodMode) {
      this.stats.lives = 999;
      this.stats.maxLives = 999;
      this.player.specialEnergy = 100;
      this.stats.specialEnergy = 100;
      this.addFloatingText(this.width / 2, 140, '🛡️ MODE DEWA AKTIF: NYAWA ∞ & SENJATA SUPER PEMBASMI PESAWAT! ⚡', '#facc15', 1.6);
      sound.playPowerup();
    } else {
      this.stats.lives = 10;
      this.stats.maxLives = 10;
      this.addFloatingText(this.width / 2, 140, '🎮 MODE NORMAL: 10 NYAWA', '#94a3b8', 1.3);
      sound.playClick();
    }
    this.callbacks.onStatsUpdate(this.stats);
    return this.isGodMode;
  }

  public getIsGodMode(): boolean {
    return this.isGodMode;
  }

  public setSkin(skinId: ShipSkinId) {
    this.player.skin = skinId;
    this.stats.shipSkin = skinId;
    achievementManager.selectSkin(skinId);
    const skinData = SHIP_SKINS.find((s) => s.id === skinId);
    if (skinData) {
      this.addFloatingText(this.player.x, this.player.y - 45, `✈️ PESAWAT: ${skinData.name}!`, skinData.primaryColor, 1.5);
      this.createSparks(this.player.x, this.player.y, skinData.primaryColor, 20);
      sound.playClick();
    }
    this.callbacks.onStatsUpdate(this.stats);
  }

  public cycleNextSkin(): ShipSkinId {
    const allSkins = SHIP_SKINS.map((s) => s.id);
    const currentIdx = allSkins.indexOf(this.player.skin);
    const nextSkin = allSkins[(currentIdx + 1) % allSkins.length];
    this.setSkin(nextSkin);
    return nextSkin;
  }

  public triggerOverchargeBurst() {
    if (!this.isRunning || this.isPaused) return;
    const p = this.player;
    sound.playLaser('plasma');
    haptics.trigger('hit');
    this.anamorphicFlareAlpha = Math.min(1.0, this.anamorphicFlareAlpha + 0.45);
    this.createSparks(p.x, p.y - 30, '#00f0ff', 16);
    this.createSparks(p.x, p.y - 30, '#ffffff', 8);

    const angles = [-0.18, 0, 0.18];
    for (const ang of angles) {
      this.projectiles.push({
        id: Math.random().toString(),
        x: p.x + Math.sin(ang) * 16,
        y: p.y - 25,
        vx: Math.sin(ang) * 520,
        vy: -Math.cos(ang) * 780,
        radius: 6.5,
        length: 22,
        color: '#00f0ff',
        glowColor: '#38bdf8',
        power: 2.5,
        weaponType: 'energy_blast',
        isOvercharge: true,
      });
    }
    this.addFloatingText(p.x, p.y - 50, '⚡ OVERDRIVE BURST!', '#38bdf8', 1.25);
  }

  public startAmbientMode() {
    this.isMenuAmbient = true;
    this.isRunning = true;
    this.isPaused = false;
    this.lastTime = performance.now();
    this.player.x = this.width / 2;
    this.player.y = this.height - 100;
    this.player.vx = 0;
    this.player.tilt = 0;
    if (this.animFrameId === null) {
      this.loop(this.lastTime);
    }
  }

  public returnToMenu() {
    this.isMenuAmbient = true;
    this.isRunning = true;
    this.isPaused = false;
    this.targets = [];
    this.projectiles = [];
    this.enemyProjectiles = [];
    this.boss = null;
    this.player.x = this.width / 2;
    this.player.y = this.height - 100;
    this.player.vx = 0;
    this.player.tilt = 0;
    sound.stopBgm();
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    this.lastTime = performance.now();
    this.animFrameId = requestAnimationFrame(this.loop);
  }

  public start() {
    this.isMenuAmbient = false;
    this.resetGame();
    this.isRunning = true;
    this.isPaused = false;
    this.lastTime = performance.now();
    sound.startBgm();
    achievementManager.incrementGamesPlayed();
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    this.animFrameId = requestAnimationFrame(this.loop);
  }

  public stop() {
    this.isRunning = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    sound.stopBgm();
  }

  public togglePause(): boolean {
    if (!this.isRunning) return false;
    this.isPaused = !this.isPaused;
    if (!this.isPaused) {
      this.lastTime = performance.now();
      if (this.animFrameId !== null) {
        cancelAnimationFrame(this.animFrameId);
        this.animFrameId = null;
      }
      this.animFrameId = requestAnimationFrame(this.loop);
      sound.startBgm();
    } else {
      sound.stopBgm();
      if (this.animFrameId !== null) {
        cancelAnimationFrame(this.animFrameId);
        this.animFrameId = null;
      }
    }
    return this.isPaused;
  }

  public getIsPaused(): boolean {
    return this.isPaused;
  }

  public resetGame() {
    this.targets = [];
    this.projectiles = [];
    this.enemyProjectiles = [];
    this.particles = [];
    this.floatingTexts = [];
    this.powerUps = [];
    this.meteors = [];
    this.alienFighters = [];
    this.spaceHazards = [];
    this.hazardSpawnTimer = 3.0;
    this.boss = null;
    this.survivalTimer = 0;

    this.activePowerUps = {
      multishotTimer: 0,
      slowmoTimer: 0,
      rapidFireTimer: 0,
      doubleScoreTimer: 0,
      magnetTimer: 0,
      shieldActive: false,
    };

    const currentSkin = achievementManager.getSelectedSkin();

    this.stats = {
      score: 0,
      highScore: achievementManager.getHighScore(this.mode),
      mode: this.mode,
      level: 1,
      currentWorld: GALAXY_WORLDS[0],
      shipSkin: currentSkin,
      combo: 0,
      maxCombo: 0,
      comboMilestone: null,
      lives: this.isGodMode ? 999 : 10,
      maxLives: this.isGodMode ? 999 : 10,
      isGodMode: this.isGodMode,
      targetsHit: 0,
      targetsCorrect: 0,
      targetsWrong: 0,
      targetsEscaped: 0,
      accuracy: 100,
      activeMission: null,
      missionCorrectStreak: 0,
      levelProgress: 0,
      levelTargetGoal: this.mode === 'survival' ? 9999 : 5,
      survivalTime: 0,
      accuracyTotalChances: 20,
      accuracyRemainingChances: 20,
      specialEnergy: 100,
      ultimateEnergy: 0,
      activeWeapon: 'standard',
      activeJurusCooldowns: {
        double_photon: 0,
        triple_nova: 0,
        homing_phoenix: 0,
        spiral_dragon: 0,
        thunder_rail: 0,
        orbital_guard: 0,
        cosmic_sword: 0,
        galaxy_breaker: 0,
        forest_roots: 0,
        solar_flare: 0,
        blizzard_freeze: 0,
        cyclone_vortex: 0,
        meteor_rain: 0,
        gaia_quake: 0,
      },
      combatCombo: { chainTitle: null, chainCount: 0, timer: 0, bonusPoints: 0 },
      orbitalGuardActive: false,
      cosmicSwordActive: false,
      thunderRailCharging: false,
      galaxyBreakerCharging: false,
      galaxyBreakerActive: false,
      galaxyBreakerReady: false,
      novaStrikeReady: false,
      novaStrikeActive: false,
      bossActive: false,
      bossHp: 0,
      bossMaxHp: 0,
      bossName: '',
      bossShielded: false,
      bossShieldLetter: null,
      is3DVisual: this.is3DVisualEnabled,
      cameraMode: this.cameraMode,
      ps5GraphicsMode: this.ps5GraphicsMode,
      fpsCounter: this.fps,
      isWarpDriveActive: false,
      warpDriveCooldown: 0,
      isVictory: false,
    };

    this.warpDriveTimer = 0;
    this.warpDriveCooldown = 0;

    this.player.x = this.width / 2;
    this.player.y = this.height - 90;
    this.player.vx = 0;
    this.player.tilt = 0;
    this.player.recoilOffset = 0;
    this.player.idleHoverPhase = 0;
    this.player.fireCooldown = 0;
    this.player.invulnerableTimer = 0;
    this.player.activeWeapon = 'standard';
    this.player.specialEnergy = 100;
    this.player.ultimateEnergy = 0;
    this.player.shieldHp = 0;
    this.player.skin = currentSkin;
    this.player.dashTimer = 0;
    this.player.cosmicSwordTimer = 0;
    this.player.cosmicSwordActive = false;
    this.player.thunderRailCharging = false;
    this.player.thunderRailTimer = 0;
    this.player.galaxyBreakerCharging = false;
    this.player.galaxyBreakerTimer = 0;
    this.player.orbitalGuards = [];
    this.player.orbitalGuardDuration = 0;
    this.player.quantumBeamActive = false;
    this.player.quantumBeamTimer = 0;
    this.player.shieldBurstActive = false;
    this.player.shieldBurstRadius = 0;
    this.player.novaStrikeActive = false;
    this.player.novaStrikeTimer = 0;
    this.player.isRobotMode = false;
    this.stats.isRobotMode = false;
    this.stats.activeArenaBiome = 'nebula';
    this.keys = {};
    this.pointerControl = { isTouching: false, targetX: this.width / 2, targetY: this.height - 90 };
    this.shakeTimer = 0;
    this.shakeIntensity = 0;
    this.cameraRoll = 0;
    this.targetCameraRoll = 0;
    this.cameraPitch = 0;
    this.targetCameraPitch = 0;
    this.cameraZoom = 1.0;
    this.targetCameraZoom = 1.0;
    this.cameraPanX = 0;
    this.chromaticAberrationAlpha = 0;
    this.anamorphicFlareAlpha = 0;
    this.player.jurusCooldowns = {
      double_photon: 0,
      triple_nova: 0,
      homing_phoenix: 0,
      spiral_dragon: 0,
      thunder_rail: 0,
      orbital_guard: 0,
      cosmic_sword: 0,
      galaxy_breaker: 0,
      forest_roots: 0,
      solar_flare: 0,
      blizzard_freeze: 0,
      cyclone_vortex: 0,
      meteor_rain: 0,
      gaia_quake: 0,
    };
    this.lastJurusUsed = null;
    this.lastJurusTime = 0;
    this.alienFighters = [];
    this.alienSpawnTimer = 2.0;

    this.updateWorldCosmos();
    this.pickNewMission();
    this.spawnInitialWave();
    this.callbacks.onStatsUpdate(this.stats);
  }

  private pickNewMission() {
    const pool = this.availableLetters.length > 0 ? this.availableLetters : ALL_EDUCATIONAL_QUESTIONS;
    let chosen: HijaiyahItem | undefined;
    if (pool.length > 1 && this.activeMission) {
      const candidates = pool.filter((l) => l.id !== this.activeMission?.id);
      chosen = candidates[Math.floor(Math.random() * candidates.length)];
    } else {
      chosen = pool[Math.floor(Math.random() * pool.length)];
    }

    if (!chosen) {
      chosen = pool[0] || ALL_EDUCATIONAL_QUESTIONS[0];
    }

    this.activeMission = chosen;
    this.stats.activeMission = chosen;
    this.callbacks.onMissionChange(chosen);

    if (this.boss && this.boss.isShielded) {
      this.boss.shieldLetter = chosen;
      this.stats.bossShieldLetter = chosen;
    }

    const missionPrompt = chosen.questionPrompt || `TEMBAK: ${chosen.latin.toUpperCase()} (${chosen.arabic})`;
    this.addFloatingText(
      this.width / 2,
      130,
      `🎯 ${missionPrompt.toUpperCase()}`,
      '#38bdf8',
      1.6
    );
  }

  private spawnInitialWave() {
    if (!this.activeMission) return;
    this.spawnTarget(this.activeMission, true);
    this.spawnDistractors(2);
  }

  private spawnDistractors(count: number) {
    if (!this.activeMission) return;
    const distractors = this.availableLetters.filter((l) => l.id !== this.activeMission?.id);
    for (let i = 0; i < count; i++) {
      if (distractors.length === 0) break;
      const letter = distractors[Math.floor(Math.random() * distractors.length)];
      this.spawnTarget(letter, false);
    }
  }

  private spawnTarget(letter: HijaiyahItem, isCorrect: boolean) {
    const radius = Math.min(36, Math.max(28, this.width * 0.05));
    let x = radius + Math.random() * (this.width - radius * 2);
    let attempts = 0;
    while (attempts < 10) {
      let overlaps = false;
      for (const t of this.targets) {
        if (Math.abs(t.x - x) < radius * 2.5 && t.y < radius * 3) {
          overlaps = true;
          break;
        }
      }
      if (!overlaps) break;
      x = radius + Math.random() * (this.width - radius * 2);
      attempts++;
    }

    let baseSpeed = 45 + this.stats.level * 10;
    if (this.mode === 'survival') {
      baseSpeed = 55 + Math.floor(this.survivalTimer * 1.5);
    }
    const speedVariation = (Math.random() * 0.4 + 0.8) * baseSpeed;

    const patterns: MovementPattern[] = ['straight'];
    if (this.stats.level >= 2) patterns.push('sine');
    if (this.stats.level >= 4) patterns.push('bounce');
    if (this.stats.level >= 6) patterns.push('zigzag');
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];

    const styles: TargetStyle[] = ['drone', 'core', 'asteroid', 'sentinel'];
    const styleIndex = (this.stats.level - 1) % styles.length;
    const style = isCorrect ? 'drone' : styles[styleIndex];

    const target: TargetEntity = {
      id: Math.random().toString(36).substring(2, 9),
      letter,
      x,
      y: -radius - Math.random() * 80,
      vx: (Math.random() - 0.5) * 60,
      vy: speedVariation,
      baseVx: (Math.random() > 0.5 ? 1 : -1) * (40 + this.stats.level * 8),
      radius,
      pattern,
      style,
      sinePhase: Math.random() * Math.PI * 2,
      sineSpeed: 2 + Math.random() * 1.5,
      angle: 0,
      rotSpeed: (Math.random() - 0.5) * 0.03,
      isCorrect,
      hp: 1,
      maxHp: 1,
      hitFlash: 0,
      pulseTimer: 0,
      floatTimer: Math.random() * Math.PI * 2,
    };

    this.targets.push(target);
  }

  private spawnPowerUp(x: number, y: number) {
    const types: PowerUpType[] = [
      'multishot',
      'slowmo',
      'heart',
      'shield',
      'rapid_fire',
      'double_score',
      'magnet',
      'energy',
    ];
    if (this.stats.level >= 3) types.push('nuke');
    const type = types[Math.floor(Math.random() * types.length)];

    this.powerUps.push({
      id: Math.random().toString(36).substring(2, 9),
      x,
      y,
      vy: 85,
      type,
      radius: 20,
      angle: 0,
      pulse: 0,
    });
  }

  // ==================== BOSS SYSTEM ====================
  private triggerBossFight() {
    if (this.boss) return;
    sound.playBossAlarm();
    this.triggerScreenShake(8, 0.8);

    const targetLetter = this.activeMission || this.availableLetters[0];
    const bossName = this.stats.level >= 5 ? 'KAFA OVERLORD DREADNOUGHT' : 'PENJAGA GALAKSI: SEKTOR BETA';

    this.boss = {
      id: 'galaxy_guardian_1',
      name: bossName,
      x: this.width / 2,
      y: -150,
      targetY: 130,
      width: Math.min(270, this.width * 0.65),
      height: 95,
      hp: this.stats.level >= 5 ? 140 : 100,
      maxHp: this.stats.level >= 5 ? 140 : 100,
      phase: 1,
      isShielded: true,
      shieldLetter: targetLetter,
      attackCooldown: 2.0,
      movePhase: 0,
      entranceTimer: 2.5,
      isDying: false,
      deathTimer: 0,
      hitFlash: 0,
    };

    this.stats.bossActive = true;
    this.stats.bossHp = this.boss.hp;
    this.stats.bossMaxHp = this.boss.maxHp;
    this.stats.bossName = this.boss.name;
    this.stats.bossShielded = true;
    this.stats.bossShieldLetter = targetLetter;

    this.addFloatingText(this.width / 2, 220, `PERINGATAN: ${bossName} MENDEKAT!`, '#ef4444', 1.8);

    // Dynamic Forest Biome Arena Challenge during Level 3 Boss
    if (this.stats.level === 3) {
      this.startChallenge('forest', 'TANTANGAN BOSS: PERTEMPURAN DI BELANTARA HUTAN PURBA!', 60, 8);
    }

    this.callbacks.onStatsUpdate(this.stats);
  }

  private updateBoss(dt: number) {
    if (!this.boss) return;
    const b = this.boss;

    if (b.hitFlash > 0) b.hitFlash -= dt * 5;

    if (b.isDying) {
      b.deathTimer -= dt;
      if (Math.random() < 0.45) {
        this.createExplosion(
          b.x + (Math.random() - 0.5) * b.width,
          b.y + (Math.random() - 0.5) * b.height,
          '#f59e0b',
          20
        );
      }
      if (b.deathTimer <= 0) {
        this.finishBossDefeat();
      }
      return;
    }

    if (b.y < b.targetY) {
      b.y += (b.targetY - b.y) * Math.min(dt * 2.5, 1);
      return;
    }

    b.movePhase += dt * (b.phase === 1 ? 1.2 : 2.0);
    b.x = this.width / 2 + Math.sin(b.movePhase) * (this.width * 0.35);

    b.attackCooldown -= dt;
    if (b.attackCooldown <= 0) {
      this.fireBossAttack();
      b.attackCooldown = b.phase === 1 ? 2.3 : 1.5;
    }
  }

  private fireBossAttack() {
    if (!this.boss || this.boss.isDying) return;
    sound.playBossShoot();

    if (this.boss.phase === 1) {
      this.enemyProjectiles.push(
        {
          id: Math.random().toString(),
          x: this.boss.x - 45,
          y: this.boss.y + 40,
          vx: (Math.random() - 0.5) * 40,
          vy: 240,
          radius: 8,
          color: '#f43f5e',
          glowColor: '#e11d48',
        },
        {
          id: Math.random().toString(),
          x: this.boss.x + 45,
          y: this.boss.y + 40,
          vx: (Math.random() - 0.5) * 40,
          vy: 240,
          radius: 8,
          color: '#f43f5e',
          glowColor: '#e11d48',
        }
      );
    } else {
      const angles = [-0.35, 0, 0.35];
      for (const ang of angles) {
        this.enemyProjectiles.push({
          id: Math.random().toString(),
          x: this.boss.x,
          y: this.boss.y + 40,
          vx: Math.sin(ang) * 260,
          vy: Math.cos(ang) * 260,
          radius: 9,
          color: '#fbbf24',
          glowColor: '#f59e0b',
        });
      }
    }
  }

  private breakBossShield() {
    if (!this.boss || !this.boss.isShielded) return;
    this.boss.isShielded = false;
    this.stats.bossShielded = false;
    sound.playBossShieldBreak();
    this.triggerScreenShake(7, 0.4);

    this.damageBoss(25);
    this.addFloatingText(this.boss.x, this.boss.y - 20, 'PERISAI BOSS HANCUR! SERANG INTI!', '#34d399', 1.6);
    this.callbacks.onStatsUpdate(this.stats);
  }

  private damageBoss(amount: number) {
    if (!this.boss || this.boss.isDying) return;
    this.boss.hp = Math.max(0, this.boss.hp - amount);
    this.boss.hitFlash = 1;
    this.stats.bossHp = this.boss.hp;

    if (this.boss.hp <= this.boss.maxHp * 0.5 && this.boss.phase === 1) {
      this.boss.phase = 2;
      this.addFloatingText(this.boss.x, this.boss.y, 'FASE 2: ENERGI MAKSIMAL!', '#f59e0b', 1.6);
      sound.playBossAlarm();
    }

    if (this.boss.hp <= 0) {
      this.boss.isDying = true;
      this.boss.deathTimer = 1.8;
      sound.playBossDefeat();
      this.triggerScreenShake(10, 1.2);
    }

    this.callbacks.onStatsUpdate(this.stats);
  }

  private finishBossDefeat() {
    if (!this.boss) return;
    achievementManager.recordBossDefeated();

    const reward = 3000;
    this.stats.score += reward;
    this.addFloatingText(this.width / 2, this.height * 0.4, `BOSS DIKALAHKAN! +${reward} SKOR!`, '#fbbf24', 2.2);

    this.boss = null;
    this.stats.bossActive = false;

    if (this.stats.challengeActive) {
      this.endChallenge(true);
    }

    this.spawnPowerUp(this.width * 0.35, 180);
    this.spawnPowerUp(this.width * 0.65, 180);

    if (this.stats.level >= 5) {
      this.victory();
    } else {
      this.levelUp();
    }
  }

  private victory() {
    this.isRunning = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    sound.stopBgm();
    sound.playLevelUp();
    this.stats.isVictory = true;
    achievementManager.updateHighScore(this.mode, this.stats.score);
    this.callbacks.onVictory(this.stats);
  }

  // ==================== 60FPS LOOP ====================
  private loop = (timestamp: number) => {
    if (!this.isRunning || this.isPaused) {
      this.animFrameId = null;
      return;
    }

    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
    this.lastTime = timestamp;

    this.fpsFrames++;
    this.fpsSampleTime += dt;
    if (this.fpsSampleTime >= 0.5) {
      this.fps = Math.max(30, Math.min(60, Math.round(this.fpsFrames / this.fpsSampleTime)));
      this.stats.fpsCounter = this.fps;
      this.fpsFrames = 0;
      this.fpsSampleTime = 0;
    }

    this.update(dt);
    this.render();

    this.animFrameId = requestAnimationFrame(this.loop);
  };

  private update(dt: number) {
    if (this.shakeTimer > 0) this.shakeTimer -= dt;

    if (this.isMenuAmbient) {
      this.updateCosmos(dt);
      const p = this.player;
      p.idleHoverPhase += dt * 3.0;
      p.x = this.width / 2 + Math.sin(p.idleHoverPhase * 0.7) * 40;
      p.y = this.height - 100 + Math.sin(p.idleHoverPhase * 2.5) * 5;
      p.tilt = Math.sin(p.idleHoverPhase * 0.7) * 0.12;

      const currentSkin = SHIP_SKINS.find((s) => s.id === p.skin) || SHIP_SKINS[0];
      if (Math.random() < 0.85) {
        this.particles.push({
          x: p.x - 14 + (Math.random() - 0.5) * 4,
          y: p.y + 18,
          vx: (Math.random() - 0.5) * 15,
          vy: Math.random() * 65 + 65,
          size: Math.random() * 2.5 + 1.2,
          color: currentSkin.trailColor,
          life: 0,
          maxLife: 0.32,
          alpha: 0.85,
          type: 'trail',
        });
        this.particles.push({
          x: p.x + 14 + (Math.random() - 0.5) * 4,
          y: p.y + 18,
          vx: (Math.random() - 0.5) * 15,
          vy: Math.random() * 65 + 65,
          size: Math.random() * 2.5 + 1.2,
          color: currentSkin.accentColor,
          life: 0,
          maxLife: 0.32,
          alpha: 0.85,
          type: 'trail',
        });
      }
      this.updateParticles(dt);
      return;
    }

    if (this.mode === 'survival') {
      this.survivalTimer += dt;
      this.stats.survivalTime = Math.floor(this.survivalTimer);
      achievementManager.recordSurvivalTime(this.stats.survivalTime);
    }

    if (this.activePowerUps.multishotTimer > 0) this.activePowerUps.multishotTimer -= dt;
    if (this.activePowerUps.slowmoTimer > 0) this.activePowerUps.slowmoTimer -= dt;
    if (this.activePowerUps.rapidFireTimer > 0) this.activePowerUps.rapidFireTimer -= dt;
    if (this.activePowerUps.doubleScoreTimer > 0) this.activePowerUps.doubleScoreTimer -= dt;
    if (this.activePowerUps.magnetTimer > 0) this.activePowerUps.magnetTimer -= dt;

    if (this.isGodMode) {
      this.player.specialEnergy = 100;
      this.stats.specialEnergy = 100;
      this.stats.lives = 999;
      this.stats.maxLives = 999;
      this.player.ultimateEnergy = Math.min(100, this.player.ultimateEnergy + dt * 10);
      this.stats.ultimateEnergy = Math.floor(this.player.ultimateEnergy);
      this.stats.novaStrikeReady = this.player.ultimateEnergy >= 100;
      this.stats.galaxyBreakerReady = this.player.ultimateEnergy >= 100;
    } else if (this.player.specialEnergy < 100) {
      this.player.specialEnergy = Math.min(100, this.player.specialEnergy + dt * 16.0);
      this.stats.specialEnergy = Math.floor(this.player.specialEnergy);
    }

    // Update active Challenge Timer & Objectives
    if (this.stats.challengeActive && this.stats.challengeTimer !== undefined) {
      this.stats.challengeTimer -= dt;
      if (this.stats.challengeTimer <= 0) {
        this.endChallenge(false);
      }
    }

    // Warp Drive Handling & Relativistic Speed Rush
    if (this.warpDriveCooldown > 0) {
      this.warpDriveCooldown = Math.max(0, this.warpDriveCooldown - dt);
      this.stats.warpDriveCooldown = this.warpDriveCooldown;
    }

    if (this.warpDriveTimer > 0) {
      this.warpDriveTimer -= dt;
      this.stats.isWarpDriveActive = true;
      this.speedLinesPhase += dt * 65;
      this.gridScroll = (this.gridScroll + dt * 450) % 40;
      this.cameraZoom = 0.90;
      this.chromaticAberrationAlpha = Math.min(1.0, this.chromaticAberrationAlpha + dt * 4);

      // Auto-fire piercing hyper-plasma lasers
      this.warpLaserCooldown -= dt;
      if (this.warpLaserCooldown <= 0) {
        this.warpLaserCooldown = 0.09;
        const p = this.player;
        [-24, -8, 8, 24].forEach((xOff, idx) => {
          this.projectiles.push({
            id: Math.random().toString(),
            x: p.x + xOff,
            y: p.y - 25,
            vx: (idx - 1.5) * 35,
            vy: -1000,
            radius: 6,
            length: 36,
            color: '#00f0ff',
            glowColor: '#38bdf8',
            power: 3,
            weaponType: 'standard',
            piercing: true,
          });
        });
        sound.playLaser('plasma');
      }

      // Gravitational warp pull on nearby powerups & target letters
      for (const pu of this.powerUps) {
        const dx = this.player.x - pu.x;
        const dy = this.player.y - pu.y;
        pu.x += Math.sign(dx) * Math.min(Math.abs(dx), 350 * dt);
        pu.y += Math.sign(dy) * Math.min(Math.abs(dy), 350 * dt);
      }

      if (this.warpDriveTimer <= 0) {
        this.stats.isWarpDriveActive = false;
        this.anamorphicFlareAlpha = 1.0;
        this.createRing(this.player.x, this.player.y, '#ffffff', 160);
        this.createRing(this.player.x, this.player.y, '#00f0ff', 120);
        sound.playExplosion(true);
        this.addFloatingText(this.player.x, this.player.y - 40, '⚡ WARP COMPLETE!', '#38bdf8', 1.5);
      }
    } else {
      this.stats.isWarpDriveActive = false;
    }

    const gameSpeedMultiplier = this.activePowerUps.slowmoTimer > 0 ? 0.45 : 1.0;

    this.updatePlayer(dt);
    this.updateCosmos(dt);

    if (this.boss) {
      this.updateBoss(dt);
    } else if (this.mode === 'campaign' && (this.stats.level === 3 || this.stats.level === 5) && this.stats.levelProgress === 0) {
      this.triggerBossFight();
    }

    this.updateTargets(dt * gameSpeedMultiplier);
    this.updateAlienFighters(dt * gameSpeedMultiplier);
    this.updateSpaceHazards(dt * gameSpeedMultiplier);
    this.updateProjectiles(dt);
    this.updateEnemyProjectiles(dt);
    this.updatePowerUps(dt);
    this.checkCollisions();
    this.updateParticles(dt);
    this.updateFloatingTexts(dt);
  }

  private updatePlayer(dt: number) {
    const p = this.player;

    if (p.invulnerableTimer > 0) p.invulnerableTimer -= dt;

    // Idle breathing floating motion
    p.idleHoverPhase += dt * 3.5;

    // Recoil spring-back
    if (p.recoilOffset > 0) {
      p.recoilOffset = Math.max(0, p.recoilOffset - dt * 35);
    }

    let moveDir = 0;
    if (this.keys['ArrowLeft'] || this.keys['KeyA']) moveDir -= 1;
    if (this.keys['ArrowRight'] || this.keys['KeyD']) moveDir += 1;

    if (this.pointerControl.isTouching) {
      const diffX = this.pointerControl.targetX - p.x;
      if (Math.abs(diffX) > 2) {
        moveDir = Math.sign(diffX);
        p.vx = moveDir * p.speed * Math.min(Math.abs(diffX) / 45, 1.3);
        p.x += diffX * Math.min(dt * 18, 1);
      } else {
        p.vx = 0;
      }

      if (this.pointerControl.targetY !== undefined) {
        const diffY = this.pointerControl.targetY - p.y;
        if (Math.abs(diffY) > 2) {
          p.y += diffY * Math.min(dt * 18, 1);
        }
      }
    } else {
      const targetVx = moveDir * p.speed;
      p.vx += (targetVx - p.vx) * Math.min(dt * 15, 1);
      p.x += p.vx * dt;
    }

    // Skin-aware engine plasma afterburner trail
    const currentSkin = SHIP_SKINS.find((s) => s.id === p.skin) || SHIP_SKINS[0];
    if (Math.random() < 0.85) {
      this.particles.push({
        x: p.x - 12 + (Math.random() - 0.5) * 6,
        y: p.y + 20,
        vx: (Math.random() - 0.5) * 20,
        vy: Math.random() * 80 + 90,
        size: Math.random() * 2.8 + 1.2,
        color: currentSkin.trailColor,
        life: 0,
        maxLife: 0.28,
        alpha: 0.85,
        type: 'trail',
      });
      this.particles.push({
        x: p.x + 12 + (Math.random() - 0.5) * 6,
        y: p.y + 20,
        vx: (Math.random() - 0.5) * 20,
        vy: Math.random() * 80 + 90,
        size: Math.random() * 2.8 + 1.2,
        color: currentSkin.accentColor,
        life: 0,
        maxLife: 0.28,
        alpha: 0.85,
        type: 'trail',
      });
    }

    const targetTilt = (p.vx / p.speed) * 0.45;
    p.tilt += (targetTilt - p.tilt) * Math.min(dt * 12, 1);

    // PS5 3D Dynamic 6DOF Camera Tracking (Banking, Pitch, FOV Zoom, Parallax Pan)
    this.targetCameraRoll = p.tilt * 0.09;
    this.cameraRoll += (this.targetCameraRoll - this.cameraRoll) * Math.min(dt * 7, 1);

    const pitchFactor = (p.y - this.height * 0.72) / (this.height * 0.5);
    this.targetCameraPitch = Math.max(-0.06, Math.min(0.06, pitchFactor * 0.05 - p.recoilOffset * 0.003));
    this.cameraPitch += (this.targetCameraPitch - this.cameraPitch) * Math.min(dt * 6, 1);

    const targetPan = (p.x - this.width / 2) * 0.05;
    this.cameraPanX += (targetPan - this.cameraPanX) * Math.min(dt * 5, 1);

    if (p.dashTimer > 0) {
      this.targetCameraZoom = 0.94; // Dynamic wide-angle speed rush
      this.speedLinesPhase += dt * 38;
      this.chromaticAberrationAlpha = Math.min(1.0, this.chromaticAberrationAlpha + dt * 4);
    } else if (this.activePowerUps.slowmoTimer > 0) {
      this.targetCameraZoom = 1.05; // Cinematic bullet-time focus
      this.speedLinesPhase += dt * 4;
    } else {
      this.targetCameraZoom = 1.0;
      this.speedLinesPhase += dt * 14;
    }
    this.cameraZoom += (this.targetCameraZoom - this.cameraZoom) * Math.min(dt * 6, 1);

    if (this.chromaticAberrationAlpha > 0) {
      this.chromaticAberrationAlpha = Math.max(0, this.chromaticAberrationAlpha - dt * 2.8);
    }
    if (this.anamorphicFlareAlpha > 0) {
      this.anamorphicFlareAlpha = Math.max(0, this.anamorphicFlareAlpha - dt * 2.2);
    }

    const halfWidth = p.width / 2;
    if (p.x < halfWidth + 10) {
      p.x = halfWidth + 10;
      p.vx = 0;
    } else if (p.x > this.width - halfWidth - 10) {
      p.x = this.width - halfWidth - 10;
      p.vx = 0;
    }

    // Tick Jurus Cooldowns
    for (const j of JURUS_REGISTRY) {
      if (p.jurusCooldowns[j.id] > 0) {
        p.jurusCooldowns[j.id] = Math.max(0, p.jurusCooldowns[j.id] - dt);
        this.stats.activeJurusCooldowns[j.id] = p.jurusCooldowns[j.id];
      }
    }

    // Special Energy steady regen
    if (p.specialEnergy < 100) {
      p.specialEnergy = Math.min(100, p.specialEnergy + dt * 4.5);
      this.stats.specialEnergy = Math.floor(p.specialEnergy);
    }

    // Sync Ultimate Energy & readiness flags
    this.stats.ultimateEnergy = Math.floor(p.ultimateEnergy);
    this.stats.novaStrikeReady = p.ultimateEnergy >= 100;
    this.stats.galaxyBreakerReady = p.ultimateEnergy >= 100;

    // Recoil recovery (smoothly returns forward/backward recoil)
    if (p.recoilOffset > 0) p.recoilOffset = Math.max(0, p.recoilOffset - dt * 26);
    else if (p.recoilOffset < 0) p.recoilOffset = Math.min(0, p.recoilOffset + dt * 45);

    // Evasive Dash handling & after-image particles
    if (p.dashTimer > 0) {
      p.dashTimer -= dt;
      if (Math.random() < 0.6) {
        this.particles.push({
          x: p.x,
          y: p.y,
          vx: -p.vx * 0.08,
          vy: (Math.random() - 0.5) * 20,
          size: 22,
          color: 'rgba(0, 240, 255, 0.4)',
          life: 0,
          maxLife: 0.22,
          alpha: 0.65,
          type: 'shockwave',
        });
      }
    }

    // Mecha Robot Transformation animation timer
    if (p.transformTimer > 0) {
      p.transformTimer -= dt;
    }

    // Voice shout banner countdown
    if (p.voiceShoutTimer > 0) {
      p.voiceShoutTimer -= dt;
      if (p.voiceShoutTimer <= 0) {
        p.voiceShoutText = null;
        this.stats.voiceShoutText = null;
      }
    }

    // Combat Combo Timer
    if (this.stats.combatCombo.timer > 0) {
      this.stats.combatCombo.timer -= dt;
      if (this.stats.combatCombo.timer <= 0) {
        this.stats.combatCombo.chainTitle = null;
      }
    }

    // Jurus 5: Thunder Rail charging countdown
    if (p.thunderRailCharging) {
      p.thunderRailTimer -= dt;
      this.stats.thunderRailCharging = true;
      if (Math.random() < 0.8) {
        this.createSparks(p.x + (Math.random() - 0.5) * 25, p.y - 25, '#38bdf8', 2);
      }
      if (p.thunderRailTimer <= 0) {
        p.thunderRailCharging = false;
        this.stats.thunderRailCharging = false;
        this.fireThunderRailBeam();
      }
    }

    // Jurus 6: Orbital Guard Sentinel Drones
    if (p.orbitalGuardDuration > 0) {
      p.orbitalGuardDuration -= dt;
      this.stats.orbitalGuardActive = true;
      for (const drone of p.orbitalGuards) {
        drone.angle += drone.speed * dt;
        const dx = p.x + Math.cos(drone.angle) * drone.orbitRadius;
        const dy = p.y + Math.sin(drone.angle) * drone.orbitRadius;

        // Drone absorbs and deflects enemy projectiles
        for (let epi = this.enemyProjectiles.length - 1; epi >= 0; epi--) {
          const ep = this.enemyProjectiles[epi];
          if (Math.hypot(ep.x - dx, ep.y - dy) < ep.radius + 16) {
            this.createSparks(ep.x, ep.y, '#10b981', 8);
            this.enemyProjectiles.splice(epi, 1);
          }
        }

        // Drone auto-fires micro-plasma bolts
        drone.fireCooldown -= dt;
        if (drone.fireCooldown <= 0) {
          drone.fireCooldown = 0.65;
          this.projectiles.push({
            id: Math.random().toString(),
            x: dx,
            y: dy,
            vx: (Math.random() - 0.5) * 40,
            vy: -650,
            radius: 3.5,
            length: 15,
            color: '#10b981',
            glowColor: '#34d399',
            power: 1,
            weaponType: 'orbital_guard',
          });
        }
      }

      if (p.orbitalGuardDuration <= 0) {
        p.orbitalGuards = [];
        this.stats.orbitalGuardActive = false;
      }
    }

    // Jurus 7: Cosmic Sword duration
    if (p.cosmicSwordActive) {
      p.cosmicSwordTimer -= dt;
      this.stats.cosmicSwordActive = true;
      if (p.cosmicSwordTimer <= 0) {
        p.cosmicSwordActive = false;
        this.stats.cosmicSwordActive = false;
      }
    }

    // Jurus 8: Galaxy Breaker / Nova Strike timer
    if (p.galaxyBreakerTimer > 0) {
      p.galaxyBreakerTimer -= dt;
      p.novaStrikeTimer = p.galaxyBreakerTimer;
      this.stats.galaxyBreakerActive = true;
      this.stats.novaStrikeActive = true;
      if (p.galaxyBreakerTimer <= 0) {
        p.galaxyBreakerCharging = false;
        this.stats.galaxyBreakerCharging = false;
        this.stats.galaxyBreakerActive = false;
        this.stats.novaStrikeActive = false;
        p.novaStrikeActive = false;
      }
    }

    if (p.fireCooldown > 0) p.fireCooldown -= dt;

    const wantToFire =
      this.keys['Space'] ||
      this.keys['ArrowUp'] ||
      (this.autoShoot && (this.pointerControl.isTouching || this.keys['ArrowLeft'] || this.keys['ArrowRight'] || this.keys['KeyA'] || this.keys['KeyD']));
    if (wantToFire && p.fireCooldown <= 0) {
      this.fireWeapon();
    }
  }

  public fireWeapon() {
    const p = this.player;
    const isRapid = this.activePowerUps.rapidFireTimer > 0;
    const rateMultiplier = isRapid ? 0.5 : 1.0;
    const weapon = p.activeWeapon;
    const skin = SHIP_SKINS.find((s) => s.id === p.skin) || SHIP_SKINS[0];

    p.recoilOffset = 5.0;
    haptics.trigger('shoot');

    if (weapon === 'energy_blast') {
      if (p.specialEnergy < 25) {
        this.addFloatingText(p.x, p.y - 25, 'ENERGI SPESIAL HABIS!', '#f87171', 1.1);
        sound.playWrong();
        p.fireCooldown = 0.3;
        return;
      }
      p.specialEnergy -= 25;
      this.stats.specialEnergy = Math.floor(p.specialEnergy);
      p.fireCooldown = 0.45 * rateMultiplier;

      sound.playEnergyBlast();
      this.projectiles.push({
        id: Math.random().toString(),
        x: p.x,
        y: p.y - 24,
        vx: 0,
        vy: -550,
        radius: 13,
        length: 28,
        color: '#facc15',
        glowColor: '#eab308',
        power: 3,
        weaponType: 'energy_blast',
        isSplash: true,
      });
    } else if (weapon === 'spread') {
      p.fireCooldown = 0.22 * rateMultiplier;
      sound.playLaser('spread');
      const angles = [-0.18, 0, 0.18];
      for (const ang of angles) {
        this.projectiles.push({
          id: Math.random().toString(),
          x: p.x,
          y: p.y - 20,
          vx: Math.sin(ang) * 620,
          vy: -Math.cos(ang) * 620,
          radius: 4.5,
          length: 19,
          color: skin.accentColor,
          glowColor: skin.primaryColor,
          power: 1,
          weaponType: 'spread',
        });
      }
    } else if (weapon === 'double' || this.activePowerUps.multishotTimer > 0) {
      p.fireCooldown = 0.16 * rateMultiplier;
      sound.playLaser('double');
      this.projectiles.push(
        {
          id: Math.random().toString(),
          x: p.x - 18,
          y: p.y - 18,
          vx: -15,
          vy: -690,
          radius: 5,
          length: 23,
          color: skin.primaryColor,
          glowColor: skin.accentColor,
          power: 1,
          weaponType: 'double',
        },
        {
          id: Math.random().toString(),
          x: p.x + 18,
          y: p.y - 18,
          vx: 15,
          vy: -690,
          radius: 5,
          length: 23,
          color: skin.primaryColor,
          glowColor: skin.accentColor,
          power: 1,
          weaponType: 'double',
        }
      );
    } else if (p.isRobotMode && weapon === 'standard') {
      // Mecha Mode: Dual Forearm Buster Cannons with Heavy Impact
      p.fireCooldown = 0.17 * rateMultiplier;
      sound.playLaser('normal');
      p.recoilOffset = 7.0;
      [-22, 22].forEach((xOff) => {
        this.projectiles.push({
          id: Math.random().toString(),
          x: p.x + xOff,
          y: p.y - 20,
          vx: 0,
          vy: -720,
          radius: 5.5,
          length: 26,
          color: '#00f0ff',
          glowColor: '#38bdf8',
          power: 1.25,
          weaponType: 'standard',
        });
        this.addMuzzleSpark(p.x + xOff, p.y - 20);
      });
    } else {
      // Standard Weapon: KAFA Laser Cannon with Level Progression
      p.fireCooldown = 0.18 * rateMultiplier;
      sound.playLaser('normal');
      p.recoilOffset = 6.0;

      if (this.stats.level === 1) {
        // Level 1: Focused single high-power photon beam
        this.projectiles.push({
          id: Math.random().toString(),
          x: p.x,
          y: p.y - 24,
          vx: 0,
          vy: -680,
          radius: 5,
          length: 24,
          color: '#00f0ff',
          glowColor: '#38bdf8',
          power: 1,
          weaponType: 'standard',
        });
        this.addMuzzleSpark(p.x, p.y - 24);
      } else if (this.stats.level === 2) {
        // Level 2: Dual Wing Photon Cannons
        [-16, 16].forEach((xOff) => {
          this.projectiles.push({
            id: Math.random().toString(),
            x: p.x + xOff,
            y: p.y - 20,
            vx: 0,
            vy: -700,
            radius: 4.8,
            length: 24,
            color: '#00f0ff',
            glowColor: '#38bdf8',
            power: 1,
            weaponType: 'standard',
          });
          this.addMuzzleSpark(p.x + xOff, p.y - 20);
        });
      } else if (this.stats.level === 3) {
        // Level 3: Triple Stream (Center + Dual Angled)
        const streamAngles = [-0.08, 0, 0.08];
        const streamOffsets = [-16, 0, 16];
        streamAngles.forEach((ang, idx) => {
          this.projectiles.push({
            id: Math.random().toString(),
            x: p.x + streamOffsets[idx],
            y: p.y - 22,
            vx: Math.sin(ang) * 660,
            vy: -Math.cos(ang) * 660,
            radius: 5,
            length: 22,
            color: '#00f0ff',
            glowColor: '#38bdf8',
            power: 1,
            weaponType: 'standard',
          });
          this.addMuzzleSpark(p.x + streamOffsets[idx], p.y - 22);
        });
      } else {
        // Level 4+: Overcharged Quad Stream with micro-plasma pulses
        [-18, -6, 6, 18].forEach((xOff, idx) => {
          const ang = (idx - 1.5) * 0.05;
          this.projectiles.push({
            id: Math.random().toString(),
            x: p.x + xOff,
            y: p.y - 20,
            vx: Math.sin(ang) * 720,
            vy: -Math.cos(ang) * 720,
            radius: 5.2,
            length: 26,
            color: '#38bdf8',
            glowColor: '#00f0ff',
            power: 1.2,
            weaponType: 'standard',
          });
          this.addMuzzleSpark(p.x + xOff, p.y - 20);
        });
      }
    }

    // MODE DEWA: Peluru Pintar Anti-Pesawat HANYA memburu pesawat alien tempur & boss (Huruf edukasi harus dibidik manual!)
    if (this.isGodMode && (this.alienFighters.length > 0 || (this.boss && !this.boss.isDying))) {
      [-26, 26].forEach((xOff, idx) => {
        this.projectiles.push({
          id: Math.random().toString(),
          x: p.x + xOff,
          y: p.y - 15,
          vx: idx === 0 ? -120 : 120,
          vy: -680,
          radius: 5.5,
          length: 22,
          color: '#facc15',
          glowColor: '#fbbf24',
          power: 6,
          weaponType: 'homing_phoenix',
          isHoming: true,
          turnRate: 24,
        });
      });
    }
  }

  // ==================== 8 SPECIAL ABILITIES (JURUS) ====================
  public triggerJurus(id: JurusId) {
    if (!this.isRunning || this.isPaused || this.isMenuAmbient) return;
    const p = this.player;
    const jurusDef = JURUS_REGISTRY.find((j) => j.id === id);
    if (!jurusDef) return;

    if (p.jurusCooldowns[id] > 0) {
      this.addFloatingText(p.x, p.y - 35, `${jurusDef.name} COOLDOWN (${p.jurusCooldowns[id].toFixed(1)}s)`, '#94a3b8', 1.0);
      return;
    }

    if (p.specialEnergy < jurusDef.energyCost) {
      this.addFloatingText(p.x, p.y - 35, `ENERGI KURANG! (${jurusDef.energyCost}⚡)`, '#f87171', 1.1);
      sound.playWrong();
      return;
    }

    // Deduct cost & apply cooldown
    p.specialEnergy -= jurusDef.energyCost;
    this.stats.specialEnergy = Math.floor(p.specialEnergy);
    p.jurusCooldowns[id] = jurusDef.cooldown;
    this.stats.activeJurusCooldowns[id] = jurusDef.cooldown;
    p.recoilOffset = 7.5;
    haptics.trigger('jurus');

    // Vocal Shout: jurusDef.powerName vocalized via SpeechSynthesis & synth chime
    sound.speakSahabatKafaPower(jurusDef.powerName);
    p.voiceShoutText = `⚡ ${jurusDef.powerName.toUpperCase()} ⚡`;
    p.voiceShoutTimer = 1.7;
    this.stats.voiceShoutText = `⚡ ${jurusDef.powerName.toUpperCase()} ⚡`;
    this.addFloatingText(p.x, p.y - 70, `⚡ ${jurusDef.powerName.toUpperCase()} ⚡`, jurusDef.color, 1.7);
    this.createSparks(p.x, p.y, jurusDef.color, 18);
    this.createRing(p.x, p.y, jurusDef.color, 42);

    // Process combat combo sequence
    this.processCombatCombo(id);

    switch (id) {
      case 'double_photon': {
        sound.playDoublePhoton();
        this.addFloatingText(p.x, p.y - 45, 'JURUS 1: DOUBLE PHOTON!', '#00f0ff', 1.3);
        p.recoilOffset = 6.0;
        [-20, 20].forEach((xOff) => {
          this.projectiles.push({
            id: Math.random().toString(),
            x: p.x + xOff,
            y: p.y - 22,
            vx: 0,
            vy: -750,
            radius: 5.5,
            length: 30,
            color: '#00f0ff',
            glowColor: '#38bdf8',
            power: 2,
            weaponType: 'double_photon',
          });
          this.addMuzzleSpark(p.x + xOff, p.y - 22);
        });
        break;
      }

      case 'triple_nova': {
        sound.playTripleNova();
        this.addFloatingText(p.x, p.y - 45, 'JURUS 2: TRIPLE NOVA!', '#a855f7', 1.3);
        p.recoilOffset = 7.0;
        const configs = [
          { angle: -0.22, color: '#00f0ff', glow: '#38bdf8' },
          { angle: 0, color: '#3b82f6', glow: '#60a5fa' },
          { angle: 0.22, color: '#a855f7', glow: '#c084fc' },
        ];
        configs.forEach((cfg) => {
          this.projectiles.push({
            id: Math.random().toString(),
            x: p.x,
            y: p.y - 24,
            vx: Math.sin(cfg.angle) * 640,
            vy: -Math.cos(cfg.angle) * 640,
            radius: 7.5,
            length: 22,
            color: cfg.color,
            glowColor: cfg.glow,
            power: 2,
            weaponType: 'triple_nova',
            isSplash: true,
            blastRadius: 85,
          });
        });
        this.addMuzzleSpark(p.x, p.y - 24);
        break;
      }

      case 'homing_phoenix': {
        sound.playHomingPhoenix();
        this.addFloatingText(p.x, p.y - 45, 'JURUS 3: HOMING PHOENIX!', '#f97316', 1.3);
        p.recoilOffset = 8.0;
        [-22, 22].forEach((xOff, idx) => {
          this.projectiles.push({
            id: Math.random().toString(),
            x: p.x + xOff,
            y: p.y - 12,
            vx: (idx === 0 ? -1 : 1) * 85,
            vy: -480,
            radius: 6.5,
            length: 22,
            color: '#f97316',
            glowColor: '#ea580c',
            power: 3,
            weaponType: 'homing_phoenix',
            isHoming: true,
            turnRate: 16,
            life: 0,
            maxLife: 2.8,
          });
          this.addMuzzleSpark(p.x + xOff, p.y - 12);
        });
        break;
      }

      case 'spiral_dragon': {
        sound.playSpiralDragon();
        this.addFloatingText(p.x, p.y - 45, 'JURUS 4: SPIRAL DRAGON!', '#ec4899', 1.4);
        p.recoilOffset = 10.0;
        this.triggerScreenShake(5, 0.25);
        this.projectiles.push({
          id: Math.random().toString(),
          x: p.x,
          y: p.y - 25,
          vx: 0,
          vy: -520,
          radius: 14,
          length: 28,
          color: '#00f0ff',
          glowColor: '#ec4899',
          power: 4,
          weaponType: 'spiral_dragon',
          isDragon: true,
          isSpiral: true,
          spiralPhase: 0,
          isSplash: true,
          blastRadius: 120,
        });
        this.createSparks(p.x, p.y - 25, '#ec4899', 15);
        break;
      }

      case 'thunder_rail': {
        sound.playThunderRailCharge();
        this.addFloatingText(p.x, p.y - 45, 'JURUS 5: THUNDER RAIL!', '#38bdf8', 1.4);
        p.thunderRailCharging = true;
        p.thunderRailTimer = 0.22;
        this.stats.thunderRailCharging = true;
        this.triggerScreenShake(4, 0.2);
        break;
      }

      case 'orbital_guard': {
        sound.playOrbitalGuard();
        this.addFloatingText(p.x, p.y - 45, 'JURUS 6: ORBITAL GUARD!', '#10b981', 1.4);
        p.orbitalGuardDuration = 8.0;
        this.stats.orbitalGuardActive = true;
        p.orbitalGuards = [
          { id: '1', angle: 0, orbitRadius: 52, speed: 3.5, fireCooldown: 0.6, color: '#10b981' },
          { id: '2', angle: (Math.PI * 2) / 3, orbitRadius: 52, speed: 3.5, fireCooldown: 0.6, color: '#34d399' },
          { id: '3', angle: (Math.PI * 4) / 3, orbitRadius: 52, speed: 3.5, fireCooldown: 0.6, color: '#6ee7b7' },
        ];
        this.createSparks(p.x, p.y, '#10b981', 20);
        break;
      }

      case 'cosmic_sword': {
        sound.playCosmicSword();
        this.addFloatingText(p.x, p.y - 45, 'JURUS 7: COSMIC SWORD!', '#facc15', 1.5);
        p.cosmicSwordActive = true;
        p.cosmicSwordTimer = 0.55;
        this.stats.cosmicSwordActive = true;
        p.invulnerableTimer = Math.max(p.invulnerableTimer, 0.6);
        p.recoilOffset = -18.0; // Rapid forward thrust surge
        this.triggerScreenShake(7, 0.35);

        // Crescent slash wave projectile fired forward
        this.projectiles.push({
          id: Math.random().toString(),
          x: p.x,
          y: p.y - 30,
          vx: 0,
          vy: -660,
          radius: 22,
          length: 38,
          color: '#facc15',
          glowColor: '#f59e0b',
          power: 5,
          weaponType: 'cosmic_sword',
          isSwordWave: true,
          isSplash: true,
          blastRadius: 110,
        });

        // Close-range cleave on nearby targets
        for (let ti = this.targets.length - 1; ti >= 0; ti--) {
          const t = this.targets[ti];
          if (Math.hypot(t.x - p.x, t.y - p.y) < 70) {
            t.hp -= 4;
            t.vy = -120;
            this.createSparks(t.x, t.y, '#facc15', 6);
            if (t.hp <= 0) {
              this.handleTargetHit(t, ti);
            }
          }
        }
        break;
      }

      case 'galaxy_breaker': {
        this.triggerGalaxyBreaker();
        break;
      }

      case 'forest_roots': {
        sound.playForestPower();
        this.addFloatingText(p.x, p.y - 45, 'JURUS 9: SAHABAT KAFA FOREST POWER!', '#10b981', 1.4);
        p.recoilOffset = 6.0;
        this.activePowerUps.shieldActive = true;
        p.shieldHp = 30;
        this.createRing(p.x, p.y, '#10b981', 55);

        // Clear lower enemy projectiles with nature shield
        for (let epi = this.enemyProjectiles.length - 1; epi >= 0; epi--) {
          const ep = this.enemyProjectiles[epi];
          if (ep.y > p.y - 180) {
            this.createSparks(ep.x, ep.y, '#34d399', 8);
            this.enemyProjectiles.splice(epi, 1);
          }
        }

        // Fire 6 piercing emerald thorn projectiles
        const thornAngles = [-0.25, -0.15, -0.05, 0.05, 0.15, 0.25];
        thornAngles.forEach((ang) => {
          this.projectiles.push({
            id: Math.random().toString(),
            x: p.x,
            y: p.y - 25,
            vx: Math.sin(ang) * 650,
            vy: -Math.cos(ang) * 650,
            radius: 5,
            length: 26,
            color: '#10b981',
            glowColor: '#34d399',
            power: 2.2,
            weaponType: 'standard',
            piercing: true,
          });
        });
        break;
      }

      case 'solar_flare': {
        sound.playSolarPower();
        this.addFloatingText(p.x, p.y - 45, 'JURUS 10: SAHABAT KAFA SOLAR POWER!', '#f59e0b', 1.4);
        this.triggerScreenShake(8, 0.35);
        p.recoilOffset = 8.0;
        this.createRing(p.x, p.y, '#f59e0b', 75);
        this.createRing(p.x, p.y, '#ef4444', 95);

        for (let epi = this.enemyProjectiles.length - 1; epi >= 0; epi--) {
          const ep = this.enemyProjectiles[epi];
          this.createSparks(ep.x, ep.y, '#f59e0b', 6);
          this.enemyProjectiles.splice(epi, 1);
        }

        for (let ti = this.targets.length - 1; ti >= 0; ti--) {
          const t = this.targets[ti];
          t.hp -= 3;
          t.hitFlash = 1;
          this.createSparks(t.x, t.y, '#f59e0b', 8);
          if (t.hp <= 0) {
            this.handleTargetHit(t, ti);
          }
        }

        if (this.boss && !this.boss.isDying) {
          this.damageBoss(25);
          this.createExplosion(this.boss.x, this.boss.y, '#f59e0b', 18);
        }
        break;
      }

      case 'blizzard_freeze': {
        sound.playBlizzardPower();
        this.addFloatingText(p.x, p.y - 45, 'JURUS 11: SAHABAT KAFA BLIZZARD POWER!', '#38bdf8', 1.4);
        this.triggerScreenShake(5, 0.25);
        this.createRing(p.x, p.y, '#38bdf8', 65);

        for (const t of this.targets) {
          t.vy = 0;
          t.vx = 0;
          t.hitFlash = 1;
          this.createSparks(t.x, t.y, '#38bdf8', 10);
        }

        for (let epi = this.enemyProjectiles.length - 1; epi >= 0; epi--) {
          const ep = this.enemyProjectiles[epi];
          this.createSparks(ep.x, ep.y, '#38bdf8', 7);
          this.enemyProjectiles.splice(epi, 1);
        }

        [-0.15, -0.07, 0, 0.07, 0.15].forEach((ang) => {
          this.projectiles.push({
            id: Math.random().toString(),
            x: p.x,
            y: p.y - 25,
            vx: Math.sin(ang) * 700,
            vy: -Math.cos(ang) * 700,
            radius: 5.5,
            length: 28,
            color: '#38bdf8',
            glowColor: '#7dd3fc',
            power: 2.5,
            weaponType: 'standard',
          });
        });
        break;
      }

      case 'cyclone_vortex': {
        sound.playCyclonePower();
        this.addFloatingText(p.x, p.y - 45, 'JURUS 12: SAHABAT KAFA CYCLONE POWER!', '#06b6d4', 1.4);
        this.triggerScreenShake(6, 0.3);
        p.recoilOffset = 7.0;

        [-25, 25].forEach((xOff, idx) => {
          this.projectiles.push({
            id: Math.random().toString(),
            x: p.x + xOff,
            y: p.y - 25,
            vx: (idx === 0 ? -1 : 1) * 60,
            vy: -600,
            radius: 18,
            length: 32,
            color: '#06b6d4',
            glowColor: '#22d3ee',
            power: 3.5,
            weaponType: 'triple_nova',
            isSplash: true,
            blastRadius: 90,
          });
        });
        break;
      }

      case 'meteor_rain': {
        sound.playMeteorPower();
        this.addFloatingText(p.x, p.y - 45, 'JURUS 13: SAHABAT KAFA METEOR POWER!', '#f97316', 1.4);
        this.triggerScreenShake(10, 0.45);
        p.recoilOffset = 10.0;

        // Spawn 8 cascading flaming plasma meteors across the viewport
        for (let m = 0; m < 8; m++) {
          const mX = (this.width / 9) * (m + 1) + (Math.random() - 0.5) * 35;
          this.projectiles.push({
            id: Math.random().toString(),
            x: mX,
            y: p.y - 30,
            vx: (Math.random() - 0.5) * 70,
            vy: -Math.random() * 200 - 580,
            radius: 11,
            length: 30,
            color: '#f97316',
            glowColor: '#ea580c',
            power: 3.5,
            weaponType: 'triple_nova',
            isSplash: true,
            blastRadius: 95,
            isMeteor: true,
          });
        }

        // Vaporize any enemy projectiles nearby
        for (let epi = this.enemyProjectiles.length - 1; epi >= 0; epi--) {
          const ep = this.enemyProjectiles[epi];
          if (ep.y > p.y - 190) {
            this.createSparks(ep.x, ep.y, '#f97316', 8);
            this.enemyProjectiles.splice(epi, 1);
          }
        }
        break;
      }

      case 'gaia_quake': {
        sound.playGaiaPower();
        this.addFloatingText(p.x, p.y - 45, 'JURUS 14: SAHABAT KAFA GAIA POWER!', '#22c55e', 1.5);
        this.triggerScreenShake(12, 0.5);
        p.recoilOffset = 12.0;

        // Restore Nature Shield
        this.activePowerUps.shieldActive = true;
        p.shieldHp = 45;
        this.createRing(p.x, p.y, '#22c55e', 75);
        this.createRing(p.x, p.y, '#10b981', 105);

        // Slow & damage all targets on screen
        for (let ti = this.targets.length - 1; ti >= 0; ti--) {
          const t = this.targets[ti];
          t.vy = Math.min(t.vy * 0.35, 25);
          t.hitFlash = 1;
          this.createSparks(t.x, t.y, '#22c55e', 10);
        }

        // Destroy lower enemy projectiles
        for (let epi = this.enemyProjectiles.length - 1; epi >= 0; epi--) {
          const ep = this.enemyProjectiles[epi];
          this.createSparks(ep.x, ep.y, '#10b981', 7);
          this.enemyProjectiles.splice(epi, 1);
        }

        // 10 Piercing Emerald Crystal Thorn Projectiles in broad fan
        const thornAngles = [-0.34, -0.26, -0.18, -0.1, -0.02, 0.06, 0.14, 0.22, 0.3, 0.38];
        thornAngles.forEach((ang) => {
          this.projectiles.push({
            id: Math.random().toString(),
            x: p.x,
            y: p.y - 28,
            vx: Math.sin(ang) * 690,
            vy: -Math.cos(ang) * 690,
            radius: 6,
            length: 28,
            color: '#22c55e',
            glowColor: '#4ade80',
            power: 2.8,
            weaponType: 'standard',
            piercing: true,
          });
        });

        // Briefly awaken forest biome atmosphere
        if (this.stats.activeArenaBiome !== 'forest') {
          this.stats.activeArenaBiome = 'forest';
          setTimeout(() => {
            if (!this.stats.challengeActive && this.stats.activeArenaBiome === 'forest') {
              this.stats.activeArenaBiome = 'nebula';
            }
          }, 8500);
        }
        break;
      }
    }

    this.callbacks.onStatsUpdate(this.stats);
  }

  private fireThunderRailBeam() {
    const p = this.player;
    sound.playThunderRailFire();
    this.triggerScreenShake(12, 0.5);
    p.recoilOffset = 12.0;

    const beamHalfWidth = 28;
    // Pierce all targets in column
    for (let ti = this.targets.length - 1; ti >= 0; ti--) {
      const t = this.targets[ti];
      if (Math.abs(t.x - p.x) < beamHalfWidth + t.radius && t.y < p.y) {
        t.hp -= 5;
        t.hitFlash = 1;
        this.createSparks(t.x, t.y, '#38bdf8', 8);
        if (t.hp <= 0) {
          this.handleTargetHit(t, ti);
        }
      }
    }

    // Pierce all alien fighters in rail column
    for (let ai = this.alienFighters.length - 1; ai >= 0; ai--) {
      const a = this.alienFighters[ai];
      if (Math.abs(a.x - p.x) < beamHalfWidth + a.width * 0.5 && a.y < p.y) {
        a.hp -= 4;
        a.hitFlash = 1;
        this.createSparks(a.x, a.y, '#38bdf8', 10);
        if (a.hp <= 0) {
          sound.playExplosion(false);
          this.createExplosion(a.x, a.y, a.color, 22);
          this.stats.score += a.scoreValue;
          this.alienFighters.splice(ai, 1);
        }
      }
    }

    // Damage Boss in rail column
    if (this.boss && Math.abs(this.boss.x - p.x) < this.boss.width * 0.45 && this.boss.y < p.y) {
      if (this.boss.isShielded) {
        sound.playHit();
        this.createSparks(p.x, this.boss.y + this.boss.height / 2, '#38bdf8', 12);
        this.addFloatingText(p.x, this.boss.y, 'PERISAI BOSS MENAHAN RAIL!', '#93c5fd', 1.3);
      } else {
        // Massive vulnerability bonus damage on unshielded boss!
        const railDamage = 45;
        this.damageBoss(railDamage);
        this.createExplosion(p.x, this.boss.y + this.boss.height / 2, '#38bdf8', 25);
        this.addFloatingText(p.x, this.boss.y, `CRITICAL RAIL STRIKE! -${railDamage}`, '#facc15', 1.8);
      }
    }

    // Vaporize enemy projectiles in column
    for (let epi = this.enemyProjectiles.length - 1; epi >= 0; epi--) {
      const ep = this.enemyProjectiles[epi];
      if (Math.abs(ep.x - p.x) < beamHalfWidth + ep.radius && ep.y < p.y) {
        this.createSparks(ep.x, ep.y, '#38bdf8', 6);
        this.enemyProjectiles.splice(epi, 1);
      }
    }

    // Visual beam shockwave projectile with piercing flag
    this.projectiles.push({
      id: Math.random().toString(),
      x: p.x,
      y: p.y - 40,
      vx: 0,
      vy: -1200,
      radius: 20,
      length: 60,
      color: '#38bdf8',
      glowColor: '#00f0ff',
      power: 4,
      weaponType: 'thunder_rail',
      isRail: true,
      piercing: true,
    });
  }

  public triggerDash() {
    if (!this.isRunning || this.isPaused || this.isMenuAmbient) return;
    const p = this.player;
    if (p.dashTimer > 0) return;

    p.dashTimer = 0.35;
    p.invulnerableTimer = Math.max(p.invulnerableTimer, 0.45);
    sound.playDash();

    const dir = Math.sign(p.vx) || (this.keys['ArrowLeft'] || this.keys['KeyA'] ? -1 : 1);
    p.x += dir * 45;
    const halfW = p.width / 2;
    p.x = Math.max(halfW + 10, Math.min(this.width - halfW - 10, p.x));

    for (let i = 0; i < 12; i++) {
      this.particles.push({
        x: p.x + (Math.random() - 0.5) * 20,
        y: p.y + (Math.random() - 0.5) * 20,
        vx: -dir * (Math.random() * 80 + 30),
        vy: (Math.random() - 0.5) * 30,
        size: Math.random() * 3 + 1.5,
        color: '#00f0ff',
        life: 0,
        maxLife: 0.25,
        alpha: 0.8,
        type: 'spark',
      });
    }
  }

  public triggerWarpDrive() {
    if (!this.isRunning || this.isPaused || this.isMenuAmbient) return;
    if (this.warpDriveCooldown > 0 || this.warpDriveTimer > 0) {
      if (this.warpDriveCooldown > 0) {
        this.addFloatingText(this.player.x, this.player.y - 35, `WARP DRIVE CHARGING (${Math.ceil(this.warpDriveCooldown)}s)`, '#38bdf8', 1.0);
        sound.playWrong();
      }
      return;
    }

    const p = this.player;
    this.warpDriveTimer = 2.4;
    this.warpDriveCooldown = 12.0;
    p.invulnerableTimer = 2.8;
    this.stats.isWarpDriveActive = true;
    this.stats.warpDriveCooldown = 12.0;

    // Cinematic warp sound & vibration
    sound.playGalaxyBreakerCharge();
    sound.playTransformJet();
    haptics.trigger('ultimate');
    this.triggerScreenShake(14, 0.8);
    this.anamorphicFlareAlpha = 1.0;
    this.chromaticAberrationAlpha = 0.9;

    this.addFloatingText(this.width / 2, this.height * 0.42, '🚀 HYPERSPACE WARP ENGAGED! KECEPATAN CAHAYA!', '#00f0ff', 2.2);

    // Expand radial shockwave
    this.createRing(p.x, p.y, '#00f0ff', 80);
    this.createRing(p.x, p.y, '#ffffff', 130);

    for (let i = 0; i < 30; i++) {
      this.particles.push({
        x: p.x + (Math.random() - 0.5) * 40,
        y: p.y + (Math.random() - 0.5) * 40,
        vx: (Math.random() - 0.5) * 300,
        vy: Math.random() * 400 + 200,
        size: Math.random() * 4 + 2,
        color: Math.random() > 0.5 ? '#00f0ff' : '#a855f7',
        life: 0,
        maxLife: 0.6,
        alpha: 1,
        type: 'spark',
      });
    }

    this.callbacks.onStatsUpdate(this.stats);
  }

  public toggleRobotMode() {
    const p = this.player;
    p.isRobotMode = !p.isRobotMode;
    this.stats.isRobotMode = p.isRobotMode;
    p.transformTimer = 0.55;
    this.triggerScreenShake(5, 0.22);

    if (p.isRobotMode) {
      sound.playTransformRobot();
      this.addFloatingText(p.x, p.y - 50, '🤖 MODE ROBOT MECHA KAFA AKTIF! [T]', '#00f0ff', 1.6);
      this.createSparks(p.x, p.y, '#00f0ff', 30);
      this.createSparks(p.x, p.y, '#f59e0b', 15);
    } else {
      sound.playTransformJet();
      this.addFloatingText(p.x, p.y - 50, '✈️ MODE JET TEMPUR KOSMIK! [T]', '#38bdf8', 1.5);
      this.createSparks(p.x, p.y, '#38bdf8', 25);
      this.createSparks(p.x, p.y, '#ffffff', 15);
    }

    this.callbacks.onStatsUpdate(this.stats);
  }

  private processCombatCombo(nextJurusId: JurusId) {
    const now = performance.now() / 1000;
    const prev = this.lastJurusUsed;
    const delta = now - this.lastJurusTime;

    this.lastJurusUsed = nextJurusId;
    this.lastJurusTime = now;

    if (!prev || delta > 3.5) return;

    let comboTitle: string | null = null;
    let bonusPoints = 0;

    if (prev === 'double_photon' && nextJurusId === 'triple_nova') {
      comboTitle = 'NOVA CHAIN';
      bonusPoints = 500;
    } else if (prev === 'triple_nova' && nextJurusId === 'homing_phoenix') {
      comboTitle = 'PHOTON RUSH';
      bonusPoints = 750;
    } else if (prev === 'homing_phoenix' && nextJurusId === 'thunder_rail') {
      comboTitle = 'COSMIC ASSAULT';
      bonusPoints = 1200;
    } else if (prev === 'thunder_rail' && nextJurusId === 'cosmic_sword') {
      comboTitle = 'GALAXY OVERDRIVE';
      bonusPoints = 2000;
    } else if (prev === 'cosmic_sword' && nextJurusId === 'galaxy_breaker') {
      comboTitle = 'GALAXY OVERDRIVE SUPREME';
      bonusPoints = 3500;
    }

    if (comboTitle) {
      const prevCount = this.stats.combatCombo.chainCount || 0;
      this.stats.combatCombo = {
        chainTitle: comboTitle,
        chainCount: prevCount + 1,
        timer: 3.5,
        bonusPoints,
      };
      this.addFloatingText(this.player.x, this.player.y - 65, `⚡ COMBO: ${comboTitle}!`, '#fbbf24', 1.8);
      sound.playCombatCombo(comboTitle);
    }
  }

  // ==================== SUPER ULTIMATE ATTACK: GALAXY BREAKER ====================
  public triggerGalaxyBreaker() {
    if (!this.isRunning || this.isPaused || this.isMenuAmbient) return;
    const p = this.player;

    if (p.ultimateEnergy < 100) {
      this.addFloatingText(p.x, p.y - 45, `ULTIMATE BELUM SIAP! (${Math.floor(p.ultimateEnergy)}%)`, '#f87171', 1.2);
      sound.playWrong();
      return;
    }

    // Process combat combo if chaining
    this.processCombatCombo('galaxy_breaker');

    // Fire Galaxy Breaker
    p.ultimateEnergy = 0;
    this.stats.ultimateEnergy = 0;
    this.stats.novaStrikeReady = false;
    this.stats.galaxyBreakerReady = false;
    p.galaxyBreakerCharging = true;
    p.galaxyBreakerTimer = 1.45;
    p.novaStrikeActive = true;
    p.novaStrikeTimer = 1.45;
    this.stats.galaxyBreakerActive = true;
    this.stats.novaStrikeActive = true;
    haptics.trigger('ultimate');

    // Cinematic slow motion & screen shake
    this.activePowerUps.slowmoTimer = 1.0;
    this.triggerScreenShake(18, 1.0);

    sound.playGalaxyBreakerCharge();
    setTimeout(() => {
      sound.playGalaxyBreakerFire();
    }, 260);

    this.addFloatingText(this.width / 2, this.height * 0.4, '★ GALAXY BREAKER! ★', '#00f0ff', 2.6);

    // Vocal Shout: "Sahabat KAFA Power: Galaxy Breaker!"
    sound.speakSahabatKafaPower();
    p.voiceShoutText = '🌌 SAHABAT KAFA POWER: GALAXY BREAKER! 🌌';
    p.voiceShoutTimer = 2.4;
    this.stats.voiceShoutText = '🌌 SAHABAT KAFA POWER: GALAXY BREAKER! 🌌';

    // Vaporize all enemy projectiles instantly
    this.enemyProjectiles = [];

    // Vaporize all active alien fighters with cosmic shockwaves
    for (const a of this.alienFighters) {
      this.createExplosion(a.x, a.y, a.color, 25);
      this.stats.score += a.scoreValue;
    }
    this.alienFighters = [];

    // Damage Boss heavily if active
    if (this.boss && !this.boss.isDying) {
      if (this.boss.isShielded) {
        this.breakBossShield();
      }
      this.damageBoss(65);
      this.createExplosion(this.boss.x, this.boss.y, '#00f0ff', 45);
    }

    // Check if correct target is on screen and eliminate it with massive bonus
    let hitCorrect = false;
    for (let ti = this.targets.length - 1; ti >= 0; ti--) {
      const t = this.targets[ti];
      if (t.isCorrect) {
        hitCorrect = true;
        this.handleTargetHit(t, ti);
        break;
      }
    }

    // Vaporize remaining distractor targets with cosmic fireworks
    for (const t of this.targets) {
      this.createExplosion(t.x, t.y, '#a855f7', 20);
    }
    this.targets = [];

    if (hitCorrect) {
      const ultimateBonus = 3000;
      this.stats.score += ultimateBonus;
      this.addFloatingText(this.width / 2, this.height * 0.52, `+${ultimateBonus} GALAXY BREAKER BONUS!`, '#38bdf8', 2.0);
    }

    this.callbacks.onStatsUpdate(this.stats);
  }

  public triggerNovaStrike() {
    this.triggerGalaxyBreaker();
  }

  private addMuzzleSpark(x: number, y: number) {
    for (let i = 0; i < 5; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 90,
        vy: -Math.random() * 90 - 40,
        size: Math.random() * 2.5 + 1.2,
        color: '#67e8f9',
        life: 0,
        maxLife: 0.16,
        alpha: 1,
        type: 'spark',
      });
    }
  }

  private updateCosmos(dt: number) {
    const isWarp = this.warpDriveTimer > 0;
    const warpMult = isWarp ? 7.5 : 1.0;
    const warpSpeed = (this.activePowerUps.slowmoTimer > 0 ? 0.5 : 1 + (this.stats.level - 1) * 0.15) * warpMult;

    // Cosmic Aurora & Starlight Lightning
    this.auroraPhase += dt * 0.45;
    this.cosmicLightningTimer -= dt;
    if (this.cosmicLightningTimer <= 0) {
      this.cosmicLightningTimer = Math.random() * 4.5 + 3.0;
      const lx1 = Math.random() * this.width;
      const ly1 = Math.random() * this.height * 0.35;
      const lx2 = lx1 + (Math.random() - 0.5) * 160;
      const ly2 = ly1 + Math.random() * 90 + 40;
      this.cosmicLightningBolt = { x1: lx1, y1: ly1, x2: lx2, y2: ly2, alpha: 1.0 };
    }
    if (this.cosmicLightningBolt) {
      this.cosmicLightningBolt.alpha -= dt * 4.5;
      if (this.cosmicLightningBolt.alpha <= 0) {
        this.cosmicLightningBolt = null;
      }
    }

    // 0. 3D Hyperspace Perspective Grid Phase & Continuous Depth Scroll
    this.gridPhase = (this.gridPhase + dt * 2.2 * warpSpeed) % (Math.PI * 2);
    this.gridScroll = (this.gridScroll + dt * 160 * warpSpeed) % 40;

    // 1. Stars Parallax & Twinkle
    for (const star of this.stars) {
      star.y += star.z * 55 * dt * warpSpeed;
      star.twinklePhase += dt * star.twinkleSpeed;
      if (star.y > this.height) {
        star.y = 0;
        star.x = Math.random() * this.width;
      }
    }

    // 1b. Spiral Galaxies
    for (const sg of this.spiralGalaxies) {
      sg.y += sg.vy * dt * warpSpeed;
      sg.angle += sg.rotSpeed * dt;
      if (sg.y - sg.radius > this.height) {
        sg.y = -sg.radius;
        sg.x = Math.random() * this.width;
      }
    }

    // 2. Nebulae Slow Drift
    for (const n of this.nebulae) {
      n.y += n.vy * dt * warpSpeed;
      n.driftPhase += dt * 0.8;
      n.x += Math.sin(n.driftPhase) * n.vx * dt;
      if (n.y - n.radius > this.height) {
        n.y = -n.radius;
        n.x = Math.random() * this.width;
      }
    }

    // 3. Celestial Planets
    for (const cp of this.celestialPlanets) {
      cp.y += cp.vy * dt * 0.4 * warpSpeed;
      if (cp.rotation !== undefined) {
        cp.rotation = (cp.rotation + dt * 0.12) % (Math.PI * 2);
      }
      if (cp.y - cp.radius > this.height) {
        cp.y = -cp.radius * 1.5;
        cp.x = Math.random() * this.width;
      }
    }

    // 4. Occasional Meteors (Shooting Stars)
    this.meteorTimer -= dt;
    if (this.meteorTimer <= 0) {
      this.meteorTimer = Math.random() * 4 + 2.5;
      this.meteors.push({
        x: Math.random() * this.width * 0.9,
        y: -30,
        vx: Math.random() * 120 + 80,
        vy: Math.random() * 240 + 260,
        length: Math.random() * 45 + 35,
        color: Math.random() > 0.5 ? '#38bdf8' : '#f472b6',
        alpha: 1,
        life: 0,
        maxLife: 1.8,
      });
    }

    for (let i = this.meteors.length - 1; i >= 0; i--) {
      const m = this.meteors[i];
      m.life += dt;
      m.x += m.vx * dt;
      m.y += m.vy * dt;
      m.alpha = Math.max(0, 1 - m.life / m.maxLife);
      if (m.life >= m.maxLife || m.y > this.height + 60) {
        this.meteors.splice(i, 1);
      }
    }

    // 4b. Floating Asteroids with Parallax Drift
    for (const a of this.asteroids) {
      a.y += a.vy * dt * warpSpeed;
      a.x += a.vx * dt;
      a.angle += a.rotSpeed * dt;
      if (a.beaconLightTimer !== undefined) {
        a.beaconLightTimer = (a.beaconLightTimer + dt * 4.0) % (Math.PI * 2);
      }
      if (a.moonletAngle !== undefined) {
        a.moonletAngle = (a.moonletAngle + dt * 0.8) % (Math.PI * 2);
      }
      if (a.hitReactionTimer && a.hitReactionTimer > 0) {
        a.hitReactionTimer -= dt;
      }
      if (a.y - a.radius > this.height) {
        a.y = -a.radius * 2;
        if (a.isGiantMegalith) {
          a.x = Math.random() * (this.width * 0.6) + this.width * 0.2;
        } else {
          a.x = Math.random() * this.width;
        }
      }
    }

    // 2b. Undulating Cosmic Gas Ribbons
    for (const gr of this.gasRibbons) {
      gr.phase += dt * gr.speed;
      gr.yOffset += 4.5 * dt * warpSpeed;
      if (gr.yOffset > this.height + 120) {
        gr.yOffset = -120;
      }
    }

    // 5. Foreground Cosmic Dust
    for (const cd of this.cosmicDust) {
      cd.y += cd.vy * dt * warpSpeed;
      cd.x += cd.vx * dt;
      if (cd.y > this.height) {
        cd.y = 0;
        cd.x = Math.random() * this.width;
      }
    }

    // 6. Bioluminescent Forest Biome Spores & Smooth Transition
    this.updateForestCosmos(dt);
  }

  private spawnAlienSquadron() {
    if (this.isMenuAmbient || this.boss) return;
    const maxAliens = Math.min(8, 2 + this.stats.level);
    if (this.alienFighters.length >= maxAliens) return;

    // Pick alien type based on level
    const chosenType: AlienType =
      this.stats.level >= 3 && Math.random() < 0.35
        ? 'cruiser'
        : this.stats.level >= 2 && Math.random() < 0.45
        ? 'interceptor'
        : Math.random() < 0.5
        ? 'fighter'
        : 'scout';

    const squadSize = chosenType === 'cruiser' ? 1 : Math.min(3, Math.floor(Math.random() * 2) + 2);
    const startX = Math.random() * (this.width - 240) + 120;
    const startY = -40;

    for (let i = 0; i < squadSize; i++) {
      const offsetX = (i - (squadSize - 1) / 2) * 65;
      const x = Math.max(45, Math.min(this.width - 45, startX + offsetX));
      const y = startY - i * 35;

      let hp = 1;
      let width = 38;
      let height = 36;
      let color = '#f43f5e';
      let glowColor = '#fb7185';
      let scoreValue = 200;
      let shootInterval = 2.4;
      let pattern: 'swoop' | 'hover_strafe' | 'dive' | 'escort' = 'swoop';
      let name = 'ALIEN SCOUT';

      if (chosenType === 'fighter') {
        hp = 2;
        width = 44;
        height = 42;
        color = '#a855f7';
        glowColor = '#c084fc';
        scoreValue = 350;
        shootInterval = 2.0;
        pattern = 'hover_strafe';
        name = 'ALIEN FIGHTER';
      } else if (chosenType === 'interceptor') {
        hp = 2;
        width = 40;
        height = 46;
        color = '#00f0ff';
        glowColor = '#38bdf8';
        scoreValue = 450;
        shootInterval = 1.8;
        pattern = 'dive';
        name = 'INTERCEPTOR';
      } else if (chosenType === 'cruiser') {
        hp = 4;
        width = 68;
        height = 60;
        color = '#f59e0b';
        glowColor = '#facc15';
        scoreValue = 1000;
        shootInterval = 1.4;
        pattern = 'escort';
        name = 'ALIEN CRUISER';
      }

      this.alienFighters.push({
        id: Math.random().toString(),
        type: chosenType,
        name,
        x,
        y,
        vx: (Math.random() - 0.5) * 40,
        vy: pattern === 'dive' ? 160 : chosenType === 'cruiser' ? 45 : 85,
        width,
        height,
        hp,
        maxHp: hp,
        shootCooldown: Math.random() * 1.5 + 0.8,
        shootInterval,
        color,
        glowColor,
        tilt: 0,
        enginePhase: Math.random() * Math.PI * 2,
        hitFlash: 0,
        pattern,
        patternPhase: Math.random() * Math.PI * 2,
        scoreValue,
      });
    }
  }

  private updateAlienFighters(dt: number) {
    if (this.isMenuAmbient) return;

    // Periodic squadron spawning
    this.alienSpawnTimer -= dt;
    if (this.alienSpawnTimer <= 0) {
      this.alienSpawnTimer = Math.max(3.5, 6.5 - this.stats.level * 0.4);
      this.spawnAlienSquadron();
    }

    for (let i = this.alienFighters.length - 1; i >= 0; i--) {
      const a = this.alienFighters[i];
      a.enginePhase += dt * 8;
      a.patternPhase += dt * 2.2;
      if (a.hitFlash > 0) a.hitFlash -= dt * 6;

      // Update movement pattern
      if (a.pattern === 'swoop') {
        a.x += Math.sin(a.patternPhase) * 130 * dt;
        a.y += a.vy * dt;
        a.tilt = Math.sin(a.patternPhase) * 0.45;
      } else if (a.pattern === 'hover_strafe') {
        if (a.y < 120 + (i % 3) * 35) {
          a.y += 90 * dt;
        } else {
          a.x += Math.sin(a.patternPhase * 1.4) * 160 * dt;
          a.tilt = Math.sin(a.patternPhase * 1.4) * 0.35;
        }
      } else if (a.pattern === 'dive') {
        a.y += a.vy * dt;
        const dx = this.player.x - a.x;
        a.x += Math.sign(dx) * Math.min(Math.abs(dx), 80 * dt);
        a.tilt = Math.sign(dx) * 0.25;
      } else if (a.pattern === 'escort') {
        a.y += a.vy * dt;
        a.x += Math.sin(a.patternPhase * 0.7) * 45 * dt;
        a.tilt = Math.sin(a.patternPhase * 0.7) * 0.15;
      }

      // Screen edge clamping
      const halfW = a.width / 2;
      if (a.x < halfW + 10) {
        a.x = halfW + 10;
      } else if (a.x > this.width - halfW - 10) {
        a.x = this.width - halfW - 10;
      }

      // Engine particle trails
      if (Math.random() < 0.4) {
        this.particles.push({
          x: a.x + (Math.random() - 0.5) * 8,
          y: a.y - a.height * 0.3,
          vx: (Math.random() - 0.5) * 15,
          vy: -Math.random() * 30 - 20,
          size: Math.random() * 2.5 + 1.2,
          color: a.glowColor,
          life: 0,
          maxLife: 0.22,
          alpha: 0.85,
          type: 'spark',
        });
      }

      // Alien weapon shooting
      a.shootCooldown -= dt;
      if (a.shootCooldown <= 0 && a.y > 20 && a.y < this.height - 120) {
        a.shootCooldown = a.shootInterval + Math.random() * 0.6;
        sound.playLaser('normal');

        if (a.type === 'cruiser') {
          const angles = [-0.25, 0, 0.25];
          angles.forEach((ang) => {
            const speed = 250;
            this.enemyProjectiles.push({
              id: Math.random().toString(),
              x: a.x,
              y: a.y + a.height * 0.45,
              vx: Math.sin(ang) * speed,
              vy: Math.cos(ang) * speed,
              radius: 5.5,
              color: '#f59e0b',
              glowColor: '#facc15',
            });
          });
        } else if (a.type === 'fighter') {
          [-14, 14].forEach((xOff) => {
            this.enemyProjectiles.push({
              id: Math.random().toString(),
              x: a.x + xOff,
              y: a.y + a.height * 0.4,
              vx: 0,
              vy: 290,
              radius: 4,
              color: a.color,
              glowColor: a.glowColor,
            });
          });
        } else {
          const angle = Math.atan2(this.player.y - a.y, this.player.x - a.x);
          const speed = 270;
          this.enemyProjectiles.push({
            id: Math.random().toString(),
            x: a.x,
            y: a.y + a.height * 0.4,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            radius: 4.5,
            color: a.color,
            glowColor: a.glowColor,
          });
        }
      }

      // Cull offscreen aliens
      if (a.y > this.height + 70) {
        this.alienFighters.splice(i, 1);
      }
    }
  }

  private spawnHazard() {
    if (this.isMenuAmbient || this.boss) return;
    if (this.spaceHazards.length >= 3) return;

    const r = Math.random();
    const id = Math.random().toString();
    const vyBase = 65 + this.stats.level * 8;

    if (r < 0.45) {
      // 1. Pagar Laser Listrik Kosmik (Laser Barrier Fence)
      const fenceWidth = Math.min(180, Math.max(120, this.width * 0.38));
      const minX = fenceWidth / 2 + 30;
      const maxX = this.width - fenceWidth / 2 - 30;
      const x = Math.random() * (maxX - minX) + minX;
      this.spaceHazards.push({
        id,
        type: 'laser_fence',
        name: 'PAGAR LASER KOSMIK',
        x,
        y: -40,
        vx: 0,
        vy: vyBase * 0.9,
        width: fenceWidth,
        height: 24,
        radius: 16,
        hp: 4,
        maxHp: 4,
        hitFlash: 0,
        angle: 0,
        rotSpeed: 0,
        phase: 0,
        color: '#00f0ff',
        glowColor: '#38bdf8',
        scoreValue: 350,
        fenceWidth,
        leftEmitterHp: 2,
        rightEmitterHp: 2,
        leftAlive: true,
        rightAlive: true,
        overloadTimer: 0,
      });
    } else if (r < 0.8) {
      // 2. Asteroid Kristal Magma Destructible
      const rad = Math.floor(Math.random() * 8) + 24;
      const x = Math.random() * (this.width - rad * 2 - 40) + rad + 20;
      this.spaceHazards.push({
        id,
        type: 'magma_asteroid',
        name: 'ASTEROID MAGMA PURBA',
        x,
        y: -rad - 20,
        vx: (Math.random() - 0.5) * 35,
        vy: vyBase * 1.15,
        width: rad * 2,
        height: rad * 2,
        radius: rad,
        hp: 3,
        maxHp: 3,
        hitFlash: 0,
        angle: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 1.8,
        phase: Math.random() * Math.PI * 2,
        color: '#f97316',
        glowColor: '#ea580c',
        scoreValue: 400,
      });
    } else {
      // 3. Pusaran Gravitasi Nebula
      const rad = 38;
      const x = Math.random() * (this.width - rad * 2 - 60) + rad + 30;
      this.spaceHazards.push({
        id,
        type: 'gravity_vortex',
        name: 'PUSARAN ANOMALI GRAVITASI',
        x,
        y: -rad - 20,
        vx: 0,
        vy: vyBase * 0.7,
        width: rad * 2,
        height: rad * 2,
        radius: rad,
        hp: 999,
        maxHp: 999,
        hitFlash: 0,
        angle: 0,
        rotSpeed: 2.5,
        phase: 0,
        color: '#a855f7',
        glowColor: '#ec4899',
        scoreValue: 150,
      });
    }
  }

  private updateSpaceHazards(dt: number) {
    if (this.isMenuAmbient) return;

    this.hazardSpawnTimer -= dt;
    if (this.hazardSpawnTimer <= 0) {
      this.hazardSpawnTimer = Math.max(3.2, 5.5 - this.stats.level * 0.3);
      this.spawnHazard();
    }

    for (let i = this.spaceHazards.length - 1; i >= 0; i--) {
      const h = this.spaceHazards[i];
      h.y += h.vy * dt;
      h.x += h.vx * dt;
      h.phase += dt * 4;
      h.angle += h.rotSpeed * dt;
      if (h.hitFlash > 0) h.hitFlash -= dt * 6;

      // Handle Laser Fence
      if (h.type === 'laser_fence') {
        const halfF = (h.fenceWidth || 140) / 2;
        const beamActive = h.leftAlive && h.rightAlive;

        // If one emitter was destroyed, short-circuit
        if (!beamActive && h.overloadTimer !== undefined) {
          h.overloadTimer += dt;
          if (Math.random() < 0.6) {
            this.createSparks(h.x + (Math.random() - 0.5) * (h.fenceWidth || 140), h.y, '#38bdf8', 4);
          }
          if (h.overloadTimer > 0.4) {
            this.spaceHazards.splice(i, 1);
            continue;
          }
        }

        // Particle sparks along the electric beam
        if (beamActive && Math.random() < 0.5) {
          const sparkX = h.x - halfF + Math.random() * (halfF * 2);
          this.particles.push({
            x: sparkX,
            y: h.y + (Math.random() - 0.5) * 8,
            vx: (Math.random() - 0.5) * 30,
            vy: (Math.random() - 0.5) * 30,
            size: Math.random() * 2 + 1,
            color: '#00f0ff',
            life: 0,
            maxLife: 0.15,
            alpha: 0.9,
            type: 'spark',
          });
        }

        // Player collision with active beam
        if (beamActive && this.player.invulnerableTimer <= 0) {
          if (Math.abs(this.player.y - h.y) < 20 && this.player.x > h.x - halfF - 10 && this.player.x < h.x + halfF + 10) {
            if (this.isGodMode) {
              sound.playHit();
              this.createRing(this.player.x, this.player.y, '#facc15', 50);
              this.addFloatingText(this.player.x, this.player.y - 25, '⚡ PAGAR LASER TERTANGKIS PERISAI DEWA!', '#facc15', 1.3);
            } else if (this.player.dashTimer > 0) {
              this.addFloatingText(this.player.x, this.player.y - 25, '⚡ DASH BYPASS TEMBUS!', '#38bdf8', 1.3);
            } else {
              this.handlePlayerHit('PAGAR LASER KOSMIK');
            }
          }
        }
      }

      // Handle Magma Asteroid
      if (h.type === 'magma_asteroid') {
        if (Math.random() < 0.3) {
          this.particles.push({
            x: h.x + (Math.random() - 0.5) * h.radius,
            y: h.y - h.radius * 0.4,
            vx: (Math.random() - 0.5) * 20,
            vy: -Math.random() * 40 - 20,
            size: Math.random() * 2.5 + 1.2,
            color: '#f97316',
            life: 0,
            maxLife: 0.25,
            alpha: 0.8,
            type: 'spark',
          });
        }

        if (this.player.invulnerableTimer <= 0) {
          const dist = Math.hypot(this.player.x - h.x, this.player.y - h.y);
          if (dist < h.radius + this.player.width * 0.35) {
            this.createExplosion(h.x, h.y, h.color, 24);
            this.spaceHazards.splice(i, 1);
            if (this.isGodMode) {
              sound.playExplosion(true);
              this.createRing(this.player.x, this.player.y, '#facc15', 55);
              this.addFloatingText(this.player.x, this.player.y - 30, '⚡ ASTEROID HANCUR OLEH PERISAI DEWA!', '#facc15', 1.4);
            } else {
              this.handlePlayerHit('TABRAKAN ASTEROID MAGMA');
            }
            continue;
          }
        }
      }

      // Handle Gravity Vortex (gentle pull on player)
      if (h.type === 'gravity_vortex') {
        const dx = h.x - this.player.x;
        const dy = h.y - this.player.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 180 && dist > 20) {
          const pullForce = (1 - dist / 180) * 45 * dt;
          this.player.x += (dx / dist) * pullForce;
        }
      }

      // Cull offscreen
      if (h.y > this.height + 80) {
        this.spaceHazards.splice(i, 1);
      }
    }
  }

  private updateTargets(dt: number) {
    const maxTargetsOnScreen = Math.min(6, 3 + Math.floor(this.stats.level / 2));
    this.spawnCooldown -= dt;

    const correctTargetPresent = this.targets.some((t) => t.isCorrect && t.y < this.height - 100);

    if (this.targets.length < maxTargetsOnScreen && this.spawnCooldown <= 0) {
      this.spawnCooldown = Math.max(1.1, 2.4 - this.stats.level * 0.15);

      if (!correctTargetPresent && this.activeMission) {
        this.spawnTarget(this.activeMission, true);
      } else {
        this.spawnDistractors(1);
      }
    }

    for (let i = this.targets.length - 1; i >= 0; i--) {
      const t = this.targets[i];
      t.angle += t.rotSpeed;
      t.pulseTimer += dt * 3;
      t.floatTimer += dt * 3.5;
      if (t.hitFlash > 0) t.hitFlash -= dt * 6;

      if (t.pattern === 'sine') {
        t.sinePhase += dt * t.sineSpeed;
        t.x += Math.sin(t.sinePhase) * 110 * dt;
        t.y += t.vy * dt;
      } else if (t.pattern === 'bounce' || t.pattern === 'zigzag') {
        t.x += t.baseVx * dt;
        t.y += t.vy * dt;
        if (t.x - t.radius < 10) {
          t.x = t.radius + 10;
          t.baseVx = Math.abs(t.baseVx);
        } else if (t.x + t.radius > this.width - 10) {
          t.x = this.width - t.radius - 10;
          t.baseVx = -Math.abs(t.baseVx);
        }
      } else {
        t.x += t.vx * dt;
        t.y += t.vy * dt;
      }

      if (t.y - t.radius > this.height) {
        if (t.isCorrect) {
          this.stats.targetsEscaped++;
          this.stats.combo = 0;
          this.triggerScreenShake(3, 0.2);
          sound.playWrong();
          this.addFloatingText(t.x, this.height - 50, 'TARGET TERLEPAS!', '#f87171', 1.4);

          if (this.mode === 'accuracy') {
            this.stats.accuracyRemainingChances--;
            if (this.stats.accuracyRemainingChances <= 0) {
              this.gameOver();
              return;
            }
          }

          this.callbacks.onStatsUpdate(this.stats);
        }
        this.targets.splice(i, 1);
      }
    }
  }

  private updateProjectiles(dt: number) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];

      // 1. Homing Missiles: Smart curved steering towards mission target or closest threat
      if (p.isHoming) {
        p.life = (p.life || 0) + dt;
        let targetX: number | null = null;
        let targetY: number | null = null;

        // Smart Anti-Plane Target Lock: Homing missiles strictly target hostile alien fighters and bosses!
        // Target huruf / kuis edukasi sengaja TIDAK dibidik otomatis agar pemain benar-benar belajar & membidik sendiri!
        if (this.alienFighters.length > 0) {
          let closestAlienDist = 999999;
          for (const a of this.alienFighters) {
            if (a.y < -30 || a.y > this.height) continue;
            const dist = Math.hypot(a.x - p.x, a.y - p.y);
            if (dist < closestAlienDist) {
              closestAlienDist = dist;
              targetX = a.x;
              targetY = a.y;
            }
          }
        }

        if (targetX === null && this.boss && !this.boss.isDying) {
          targetX = this.boss.x;
          targetY = this.boss.y;
        }

        if (targetX !== null && targetY !== null) {
          const desiredAngle = Math.atan2(targetY - p.y, targetX - p.x);
          const currentAngle = Math.atan2(p.vy, p.vx);
          let angleDiff = desiredAngle - currentAngle;
          while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
          while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
          const turnRate = p.turnRate || 14;
          const newAngle = currentAngle + Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), turnRate * dt);
          const currentSpeed = Math.hypot(p.vx, p.vy);
          p.vx = Math.cos(newAngle) * currentSpeed;
          p.vy = Math.sin(newAngle) * currentSpeed;
        }

        // Swirling fiery engine exhaust
        if (Math.random() < 0.8) {
          this.particles.push({
            x: p.x - p.vx * 0.02 + (Math.random() - 0.5) * 4,
            y: p.y - p.vy * 0.02 + (Math.random() - 0.5) * 4,
            vx: (Math.random() - 0.5) * 20,
            vy: (Math.random() - 0.5) * 20,
            size: Math.random() * 2.5 + 1.2,
            color: Math.random() > 0.4 ? '#f97316' : '#facc15',
            life: 0,
            maxLife: 0.22,
            alpha: 0.85,
            type: 'trail',
          });
        }
      }

      // 2. Spiral Dragon Vortex / Spiral shots
      if (p.isDragon || p.isSpiral) {
        p.spiralPhase = (p.spiralPhase || 0) + dt * (p.isDragon ? 12 : 10);
        p.x += Math.sin(p.spiralPhase) * (p.isDragon ? 80 : 150) * dt;

        if (Math.random() < 0.75) {
          // Twin cosmic dragon ribbons (cyan & magenta)
          const ribbonOffset = Math.sin(p.spiralPhase) * 16;
          this.particles.push({
            x: p.x + ribbonOffset,
            y: p.y + 6,
            vx: (Math.random() - 0.5) * 20,
            vy: (Math.random() - 0.5) * 20,
            size: Math.random() * 2.6 + 1.2,
            color: '#00f0ff',
            life: 0,
            maxLife: 0.22,
            alpha: 0.85,
            type: 'spark',
          });
          this.particles.push({
            x: p.x - ribbonOffset,
            y: p.y + 6,
            vx: (Math.random() - 0.5) * 20,
            vy: (Math.random() - 0.5) * 20,
            size: Math.random() * 2.6 + 1.2,
            color: '#ec4899',
            life: 0,
            maxLife: 0.22,
            alpha: 0.85,
            type: 'spark',
          });
        }
      }

      // 3. Cosmic Sword Crescent Slash Wave
      if (p.isSwordWave) {
        if (Math.random() < 0.8) {
          this.particles.push({
            x: p.x + (Math.random() - 0.5) * p.radius * 1.5,
            y: p.y + (Math.random() - 0.5) * 8,
            vx: (Math.random() - 0.5) * 35,
            vy: -Math.random() * 50 - 20,
            size: Math.random() * 3 + 1.5,
            color: Math.random() > 0.4 ? '#facc15' : '#fbbf24',
            life: 0,
            maxLife: 0.24,
            alpha: 0.9,
            type: 'trail',
          });
        }
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (p.y < -50 || p.y > this.height + 60 || p.x < -50 || p.x > this.width + 50) {
        this.projectiles.splice(i, 1);
      }
    }
  }

  private updateEnemyProjectiles(dt: number) {
    for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
      const ep = this.enemyProjectiles[i];
      ep.x += ep.vx * dt;
      ep.y += ep.vy * dt;

      // Mode Dewa: Divine Aura otomatis membakar peluru musuh sebelum menyentuh pesawat!
      if (this.isGodMode) {
        const dx = ep.x - this.player.x;
        const dy = ep.y - this.player.y;
        if (Math.hypot(dx, dy) < 72) {
          this.createSparks(ep.x, ep.y, '#facc15', 6);
          this.enemyProjectiles.splice(i, 1);
          continue;
        }
      }

      if (this.player.invulnerableTimer <= 0) {
        const dx = ep.x - this.player.x;
        const dy = ep.y - this.player.y;
        if (Math.hypot(dx, dy) < ep.radius + 18) {
          this.handlePlayerHit('PROYEKTIL ALIEN');
          this.enemyProjectiles.splice(i, 1);
          continue;
        }
      }

      if (ep.y > this.height + 30) {
        this.enemyProjectiles.splice(i, 1);
      }
    }
  }

  private updatePowerUps(dt: number) {
    const isMagnet = this.activePowerUps.magnetTimer > 0;

    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const p = this.powerUps[i];

      if (isMagnet) {
        const dx = this.player.x - p.x;
        const dy = this.player.y - p.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 5) {
          p.x += (dx / dist) * 240 * dt;
          p.y += (dy / dist) * 240 * dt;
        }
      } else {
        p.y += p.vy * dt;
      }

      p.angle += dt * 2;
      p.pulse += dt * 5;

      const dx = p.x - this.player.x;
      const dy = p.y - this.player.y;
      const dist = Math.hypot(dx, dy);

      if (dist < p.radius + 28) {
        this.applyPowerUp(p.type, p.x, p.y);
        this.powerUps.splice(i, 1);
        continue;
      }

      if (p.y > this.height + 40) {
        this.powerUps.splice(i, 1);
      }
    }
  }

  private applyPowerUp(type: PowerUpType, x: number, y: number) {
    sound.playPowerup();

    switch (type) {
      case 'multishot':
        this.activePowerUps.multishotTimer = 10;
        this.addFloatingText(x, y, 'DUAL LASER!', '#38bdf8', 1.3);
        break;
      case 'slowmo':
        this.activePowerUps.slowmoTimer = 7;
        this.addFloatingText(x, y, 'SLOW MOTION!', '#a78bfa', 1.3);
        break;
      case 'heart':
        if (this.stats.lives < this.stats.maxLives) {
          this.stats.lives++;
          this.addFloatingText(x, y, '+1 NYAWA!', '#ef4444', 1.4);
        } else {
          this.stats.score += 250;
          this.addFloatingText(x, y, 'NYAWA PENUH (+250)', '#ef4444', 1.2);
        }
        break;
      case 'shield':
        this.activePowerUps.shieldActive = true;
        this.player.shieldHp = 1;
        this.addFloatingText(x, y, 'PERISAI ENERGI AKTIF!', '#34d399', 1.4);
        break;
      case 'rapid_fire':
        this.activePowerUps.rapidFireTimer = 10;
        this.addFloatingText(x, y, 'TEMBAKAN CEPAT (RAPID FIRE)!', '#f59e0b', 1.4);
        break;
      case 'double_score':
        this.activePowerUps.doubleScoreTimer = 10;
        this.addFloatingText(x, y, 'SKOR GANDA 2X!', '#fbbf24', 1.4);
        break;
      case 'magnet':
        this.activePowerUps.magnetTimer = 10;
        this.addFloatingText(x, y, 'MAGNET POWER-UP!', '#06b6d4', 1.4);
        break;
      case 'energy':
        this.player.specialEnergy = Math.min(100, this.player.specialEnergy + 50);
        this.stats.specialEnergy = Math.floor(this.player.specialEnergy);
        this.addFloatingText(x, y, '+50 ENERGI SPESIAL!', '#38bdf8', 1.3);
        break;
      case 'nuke':
        this.triggerScreenShake(8, 0.4);
        sound.playExplosion(true);
        for (const t of this.targets) {
          if (!t.isCorrect) {
            this.createExplosion(t.x, t.y, '#f59e0b', 20);
          }
        }
        this.targets = this.targets.filter((t) => t.isCorrect);
        this.addFloatingText(this.width / 2, this.height / 2, 'EMP DETONATOR!', '#fbbf24', 1.6);
        break;
    }

    this.callbacks.onStatsUpdate(this.stats);

    for (let i = 0; i < 20; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 160,
        vy: (Math.random() - 0.5) * 160,
        size: Math.random() * 3 + 1,
        color: '#facc15',
        life: 0,
        maxLife: 0.5,
        alpha: 1,
        type: 'spark',
      });
    }
  }

  private checkCollisions() {
    for (let pi = this.projectiles.length - 1; pi >= 0; pi--) {
      const proj = this.projectiles[pi];
      let projConsumed = false;

      if (this.boss && !this.boss.isDying && proj.y < this.boss.y + this.boss.height / 2) {
        const dx = Math.abs(proj.x - this.boss.x);
        const dy = Math.abs(proj.y - this.boss.y);
        if (dx < this.boss.width * 0.45 && dy < this.boss.height * 0.5) {
          projConsumed = true;
          if (this.boss.isShielded) {
            sound.playHit();
            this.createSparks(proj.x, proj.y, '#38bdf8', 6);
            this.addFloatingText(proj.x, proj.y - 10, 'KEBAL! PERISAI AKTIF!', '#93c5fd', 1.1);
          } else {
            sound.playHit();
            this.damageBoss(proj.power * 4);
            this.createSparks(proj.x, proj.y, '#f59e0b', 12);
          }
        }
      }

      if (projConsumed) {
        this.projectiles.splice(pi, 1);
        continue;
      }

      // Check collision with Giant Megalith Asteroid of Sahabat KAFA (non-destructive, fun cosmic reaction!)
      for (const a of this.asteroids) {
        if (a.isGiantMegalith) {
          const dx = proj.x - a.x;
          const dy = proj.y - a.y;
          const dist = Math.hypot(dx, dy);
          if (dist < a.radius + 10) {
            projConsumed = true;
            a.hitReactionTimer = 0.45;
            sound.playHit();
            this.createSparks(proj.x, proj.y, a.crystalVeinColor || '#00f0ff', 10);
            this.createSparks(proj.x, proj.y, '#ffffff', 5);
            if (Math.random() < 0.35) {
              this.addFloatingText(proj.x, proj.y - 12, '✦ ENERGI SAHABAT KAFA! ✦', '#38bdf8', 1.0);
            }
            break;
          }
        }
      }

      if (projConsumed) {
        this.projectiles.splice(pi, 1);
        continue;
      }

      // Check collision with Alien Fighters
      for (let ai = this.alienFighters.length - 1; ai >= 0; ai--) {
        const alien = this.alienFighters[ai];
        const dx = Math.abs(proj.x - alien.x);
        const dy = Math.abs(proj.y - alien.y);
        if (dx < alien.width * 0.45 + proj.radius && dy < alien.height * 0.45 + proj.radius) {
          if (!proj.piercing) {
            projConsumed = true;
          }
          const dmgMultiplier = this.isGodMode ? 8 : 1;
          alien.hp -= proj.power * dmgMultiplier;
          alien.hitFlash = 1.0;
          this.createSparks(proj.x, proj.y, alien.glowColor, 8);
          sound.playHit();

          if (alien.hp <= 0) {
            sound.playExplosion(alien.type === 'cruiser');
            this.createExplosion(alien.x, alien.y, alien.color, alien.type === 'cruiser' ? 35 : 22);
            this.stats.score += alien.scoreValue * (this.isGodMode ? 2 : 1);
            this.player.ultimateEnergy = Math.min(100, this.player.ultimateEnergy + (this.isGodMode ? 20 : 8));
            this.stats.ultimateEnergy = Math.floor(this.player.ultimateEnergy);
            this.stats.novaStrikeReady = this.player.ultimateEnergy >= 100;
            this.stats.galaxyBreakerReady = this.player.ultimateEnergy >= 100;
            this.addFloatingText(alien.x, alien.y - 15, `+${alien.scoreValue} ${alien.name}!`, alien.glowColor, 1.3);
            if (Math.random() < (this.isGodMode ? 0.4 : 0.25)) {
              this.spawnPowerUp(alien.x, alien.y);
            }
            this.alienFighters.splice(ai, 1);
          }
          break;
        }
      }

      if (projConsumed) {
        this.projectiles.splice(pi, 1);
        continue;
      }

      // Check collision with Space Hazards (Pagar Laser Pylons & Magma Asteroids)
      for (let hi = this.spaceHazards.length - 1; hi >= 0; hi--) {
        const h = this.spaceHazards[hi];
        if (h.type === 'laser_fence') {
          const halfF = (h.fenceWidth || 140) / 2;
          const leftX = h.x - halfF;
          const rightX = h.x + halfF;

          // Check Left Pylon
          if (h.leftAlive && Math.hypot(proj.x - leftX, proj.y - h.y) < h.radius + proj.radius) {
            projConsumed = true;
            h.leftEmitterHp = (h.leftEmitterHp || 2) - proj.power * (this.isGodMode ? 4 : 1);
            h.hitFlash = 1.0;
            this.createSparks(proj.x, proj.y, '#00f0ff', 8);
            sound.playHit();
            if (h.leftEmitterHp <= 0) {
              h.leftAlive = false;
              h.overloadTimer = 0;
              sound.playExplosion(false);
              this.createExplosion(leftX, h.y, '#00f0ff', 20);
              this.stats.score += h.scoreValue;
              this.addFloatingText(leftX, h.y - 20, '⚡ SIRKUIT PAGAR LASER HANCUR!', '#38bdf8', 1.4);
            }
            break;
          }

          // Check Right Pylon
          if (h.rightAlive && Math.hypot(proj.x - rightX, proj.y - h.y) < h.radius + proj.radius) {
            projConsumed = true;
            h.rightEmitterHp = (h.rightEmitterHp || 2) - proj.power * (this.isGodMode ? 4 : 1);
            h.hitFlash = 1.0;
            this.createSparks(proj.x, proj.y, '#00f0ff', 8);
            sound.playHit();
            if (h.rightEmitterHp <= 0) {
              h.rightAlive = false;
              h.overloadTimer = 0;
              sound.playExplosion(false);
              this.createExplosion(rightX, h.y, '#00f0ff', 20);
              this.stats.score += h.scoreValue;
              this.addFloatingText(rightX, h.y - 20, '⚡ SIRKUIT PAGAR LASER HANCUR!', '#38bdf8', 1.4);
            }
            break;
          }
        } else if (h.type === 'magma_asteroid') {
          const dist = Math.hypot(proj.x - h.x, proj.y - h.y);
          if (dist < h.radius + proj.radius) {
            projConsumed = true;
            h.hp -= proj.power * (this.isGodMode ? 6 : 1);
            h.hitFlash = 1.0;
            this.createSparks(proj.x, proj.y, '#f97316', 8);
            sound.playHit();
            if (h.hp <= 0) {
              sound.playExplosion(true);
              this.createExplosion(h.x, h.y, '#f97316', 28);
              this.stats.score += h.scoreValue;
              this.player.specialEnergy = Math.min(100, this.player.specialEnergy + 15);
              this.stats.specialEnergy = Math.floor(this.player.specialEnergy);
              this.addFloatingText(h.x, h.y - 20, `+${h.scoreValue} ASTEROID PECAH!`, '#facc15', 1.4);
              if (Math.random() < 0.4) {
                this.spawnPowerUp(h.x, h.y);
              }
              this.spaceHazards.splice(hi, 1);
            }
            break;
          }
        }
      }

      if (projConsumed) {
        this.projectiles.splice(pi, 1);
        continue;
      }

      for (let ti = this.targets.length - 1; ti >= 0; ti--) {
        const target = this.targets[ti];
        const dx = proj.x - target.x;
        const dy = proj.y - target.y;
        const dist = Math.hypot(dx, dy);

        if (dist < target.radius + proj.radius) {
          projConsumed = true;
          this.handleTargetHit(target, ti);

          if (proj.isSplash) {
            this.createExplosion(target.x, target.y, '#facc15', 30);
            for (let oi = this.targets.length - 1; oi >= 0; oi--) {
              if (oi === ti) continue;
              const other = this.targets[oi];
              if (Math.hypot(other.x - target.x, other.y - target.y) < 90) {
                if (other.isCorrect) {
                  this.handleTargetHit(other, oi);
                }
              }
            }
          }
          break;
        }
      }

      if (projConsumed) {
        this.projectiles.splice(pi, 1);
      }
    }

    if (this.player.invulnerableTimer <= 0) {
      for (let ti = this.targets.length - 1; ti >= 0; ti--) {
        const target = this.targets[ti];
        const dx = this.player.x - target.x;
        const dy = this.player.y - target.y;
        const dist = Math.hypot(dx, dy);

        if (dist < target.radius + this.player.width * 0.35) {
          this.handlePlayerCollision(target, ti);
          break;
        }
      }

      for (let ai = this.alienFighters.length - 1; ai >= 0; ai--) {
        const alien = this.alienFighters[ai];
        const dist = Math.hypot(this.player.x - alien.x, this.player.y - alien.y);
        if (dist < alien.width * 0.4 + this.player.width * 0.35) {
          this.createExplosion(alien.x, alien.y, alien.color, 25);
          this.alienFighters.splice(ai, 1);
          if (this.isGodMode) {
            sound.playExplosion(true);
            this.createRing(this.player.x, this.player.y, '#facc15', 55);
            this.triggerScreenShake(3, 0.15);
            this.stats.score += alien.scoreValue * 2;
            this.addFloatingText(this.player.x, this.player.y - 30, '⚡ ALIEN HANCUR TERBENTUR PERISAI DEWA!', '#facc15', 1.4);
          } else {
            this.handlePlayerHit('TABRAKAN PESAWAT ALIEN');
          }
          break;
        }
      }
    }
  }

  private handleTargetHit(target: TargetEntity, targetIndex: number) {
    this.stats.targetsHit++;

    if (target.isCorrect) {
      haptics.trigger('hit');
      this.stats.targetsCorrect++;
      this.stats.combo++;
      if (this.stats.combo > this.stats.maxCombo) {
        this.stats.maxCombo = this.stats.combo;
      }

      let milestoneTitle: string | null = null;
      if (this.stats.combo === 3) milestoneTitle = 'PERFECT!';
      else if (this.stats.combo === 5) milestoneTitle = 'LETTER HIT!';
      else if (this.stats.combo >= 8) milestoneTitle = `COMBO x${this.stats.combo}!`;

      if (milestoneTitle) {
        this.stats.comboMilestone = milestoneTitle;
        sound.playComboMilestone(milestoneTitle);
        this.addFloatingText(this.player.x, this.player.y - 60, milestoneTitle, '#facc15', 1.8);
      }

      achievementManager.addTargetsDestroyed(1);
      achievementManager.recordCombo(this.stats.combo);

      if (this.boss && this.boss.isShielded && this.boss.shieldLetter?.id === target.letter.id) {
        this.breakBossShield();
      }

      const comboMultiplier = Math.min(this.stats.combo, 8);
      const isDoubleScore = this.activePowerUps.doubleScoreTimer > 0;
      const basePoints = 100 * comboMultiplier;
      const finalPoints = isDoubleScore ? basePoints * 2 : basePoints;

      this.stats.score += finalPoints;

      // Challenge Progression:
      if (this.stats.challengeActive) {
        this.stats.challengeProgress = (this.stats.challengeProgress || 0) + 1;
        const challengeBonus = 250;
        this.stats.score += challengeBonus;
        this.addFloatingText(target.x, target.y - 35, `🌲 TANTANGAN +1 (${this.stats.challengeProgress}/${this.stats.challengeGoal}) +${challengeBonus}!`, '#34d399', 1.5);
        if (this.stats.challengeGoal && this.stats.challengeProgress >= this.stats.challengeGoal) {
          this.endChallenge(true);
        }
      } else if (this.mode === 'campaign' && this.stats.level === 2 && this.stats.levelProgress === 2) {
        this.startChallenge('forest', 'TANTANGAN 1: BELANTARA HUTAN PURBA KAFA!', 30, 5);
      } else if (this.mode === 'campaign' && this.stats.level === 4 && this.stats.levelProgress === 2) {
        this.startChallenge('forest', 'TANTANGAN 2: ANOMALI HUTAN KOSMIK KAFA!', 30, 5);
      }

      // Bonus Combat Combo: Award bonus when attacks hit a valid target!
      if (this.stats.combatCombo.chainTitle && this.stats.combatCombo.bonusPoints > 0) {
        const comboBonus = this.stats.combatCombo.bonusPoints;
        this.stats.score += comboBonus;
        this.addFloatingText(target.x, target.y - 35, `⚡ COMBO: ${this.stats.combatCombo.chainTitle} (+${comboBonus})`, '#fbbf24', 1.6);
        this.stats.combatCombo.bonusPoints = 0;
      }

      if (achievementManager.updateHighScore(this.mode, this.stats.score)) {
        this.stats.highScore = this.stats.score;
      }

      sound.playCorrect(this.stats.combo);
      sound.playExplosion(false);
      this.triggerScreenShake(4, 0.2);
      this.createExplosion(target.x, target.y, '#38bdf8', 35);

      // Radiant Noor Starburst & Calligraphy Praise (Belajar Jadi Spektakuler & Memuaskan!)
      this.createRing(target.x, target.y, '#facc15', 70);
      this.createRing(target.x, target.y, '#10b981', 50);
      this.createSparks(target.x, target.y, '#fef08a', 25);
      this.createSparks(target.x, target.y, '#34d399', 15);
      const praises = ['✦ MAASYA ALLAH! MUMTAZ! ✦', '✦ TEPAT SEKALI! ✦', '✦ HEBAT! MUMTAZ! ✦', '✦ BINTANG KAFA BERSINAR! ✦'];
      const chosenPraise = praises[Math.floor(Math.random() * praises.length)];
      this.addFloatingText(target.x, target.y - 42, chosenPraise, '#facc15', 1.7);

      const doubleNotice = isDoubleScore ? ' [2X]' : '';
      const comboText = comboMultiplier > 1 ? ` (+${finalPoints} x${comboMultiplier}!${doubleNotice})` : ` (+${finalPoints}${doubleNotice})`;
      this.addFloatingText(target.x, target.y - 15, `BENAR! ${target.letter.latin}${comboText}`, '#22d3ee', 1.4);

      // Replenish Special Energy and Ultimate Meter
      this.player.specialEnergy = Math.min(100, this.player.specialEnergy + 15);
      this.stats.specialEnergy = Math.floor(this.player.specialEnergy);

      const prevUlt = this.player.ultimateEnergy;
      this.player.ultimateEnergy = Math.min(100, this.player.ultimateEnergy + 14 + Math.min(this.stats.combo * 2, 10));
      this.stats.ultimateEnergy = Math.floor(this.player.ultimateEnergy);
      this.stats.novaStrikeReady = this.player.ultimateEnergy >= 100;
      this.stats.galaxyBreakerReady = this.player.ultimateEnergy >= 100;
      if (prevUlt < 100 && this.player.ultimateEnergy >= 100) {
        sound.playPowerup();
        this.addFloatingText(this.player.x, this.player.y - 70, '★ GALAXY BREAKER SIAP! [X] ★', '#00f0ff', 2.2);
      }

      if (Math.random() < 0.28) {
        this.spawnPowerUp(target.x, target.y);
      }

      this.targets.splice(targetIndex, 1);

      this.stats.levelProgress++;
      if (this.mode === 'accuracy') {
        this.stats.accuracyRemainingChances--;
        if (this.stats.accuracyRemainingChances <= 0) {
          this.gameOver();
          return;
        }
      }

      if (this.mode !== 'survival' && this.stats.levelProgress >= this.stats.levelTargetGoal) {
        this.levelUp();
      } else {
        this.pickNewMission();
      }

      this.callbacks.onScoreEvent(finalPoints, comboMultiplier > 1);
      this.recalculateAccuracy();
      this.callbacks.onStatsUpdate(this.stats);
    } else {
      haptics.trigger('error');
      this.stats.targetsWrong++;
      this.stats.combo = 0;
      this.stats.comboMilestone = null;
      const penalty = Math.min(this.stats.score, 30);
      this.stats.score = Math.max(0, this.stats.score - penalty);

      sound.playWrong();
      this.triggerScreenShake(5, 0.25);
      this.createSparks(target.x, target.y, '#f87171', 15);
      target.hitFlash = 1;

      this.addFloatingText(target.x, target.y - 10, `BUKAN! ITU ${target.letter.latin} (-${penalty})`, '#f87171', 1.2);

      if (this.mode === 'accuracy') {
        this.stats.accuracyRemainingChances--;
        if (this.stats.accuracyRemainingChances <= 0) {
          this.gameOver();
          return;
        }
      }

      this.recalculateAccuracy();
      this.callbacks.onStatsUpdate(this.stats);
    }
  }

  private handlePlayerHit(sourceLabel: string) {
    if (this.player.invulnerableTimer > 0) return;

    // Mode Dewa: Unlimited Lives & Divine Energy Deflection
    if (this.isGodMode) {
      this.player.invulnerableTimer = 0.8;
      this.stats.lives = 999;
      this.stats.maxLives = 999;
      sound.playHit();
      this.triggerScreenShake(3, 0.15);
      this.createSparks(this.player.x, this.player.y, '#facc15', 25);
      this.createSparks(this.player.x, this.player.y, '#00f0ff', 20);
      this.createRing(this.player.x, this.player.y, '#facc15', 65);
      // Vaporize any nearby enemy bullets in shockwave
      this.enemyProjectiles = this.enemyProjectiles.filter((p) => Math.hypot(p.x - this.player.x, p.y - this.player.y) > 180);
      this.addFloatingText(this.player.x, this.player.y - 40, '🛡️ KEBAL! (MODE DEWA ∞ TAK TERBATAS)', '#facc15', 1.5);
      this.callbacks.onStatsUpdate(this.stats);
      return;
    }

    if (this.activePowerUps.shieldActive || this.player.shieldHp > 0) {
      this.activePowerUps.shieldActive = false;
      this.player.shieldHp = 0;
      this.player.invulnerableTimer = 1.5;
      sound.playHit();
      this.triggerScreenShake(6, 0.25);
      this.addFloatingText(this.player.x, this.player.y - 40, 'PERISAI MENAHAN SERANGAN!', '#34d399', 1.5);
      this.createSparks(this.player.x, this.player.y, '#34d399', 25);
      this.callbacks.onStatsUpdate(this.stats);
      return;
    }

    this.stats.lives--;
    this.stats.combo = 0;
    this.player.invulnerableTimer = 2.0;

    this.triggerScreenShake(12, 0.4);
    sound.playExplosion(true);
    sound.playWrong();
    this.createExplosion(this.player.x, this.player.y, '#ef4444', 40);

    this.addFloatingText(this.player.x, this.player.y - 40, `${sourceLabel}! (-1 NYAWA)`, '#ef4444', 1.5);
    this.callbacks.onStatsUpdate(this.stats);

    if (this.stats.lives <= 0) {
      this.gameOver();
    }
  }

  private handlePlayerCollision(target: TargetEntity, targetIndex: number) {
    this.targets.splice(targetIndex, 1);
    this.handlePlayerHit('TABRAKAN ASTEROID');
  }

  private recalculateAccuracy() {
    const total = this.stats.targetsCorrect + this.stats.targetsWrong;
    this.stats.accuracy = total > 0 ? Math.round((this.stats.targetsCorrect / total) * 100) : 100;
    achievementManager.recordAccuracy(this.stats.accuracy, total);
  }

  private levelUp() {
    this.stats.level++;
    this.stats.currentWorld = getWorldForLevel(this.stats.level);
    this.updateWorldCosmos();

    this.stats.levelProgress = 0;
    this.stats.levelTargetGoal = 5 + this.stats.level * 2;

    achievementManager.recordScoreOrLevel(this.stats.score, this.stats.level);

    sound.playLevelUp();
    this.triggerScreenShake(8, 0.5);

    for (let i = 0; i < 60; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 200,
        vy: -Math.random() * 300 - 100,
        size: Math.random() * 3 + 2,
        color: this.stats.currentWorld.themeColor,
        life: 0,
        maxLife: 0.8,
        alpha: 1,
        type: 'shockwave',
      });
    }

    this.addFloatingText(
      this.width / 2,
      this.height * 0.4,
      `WORLD: ${this.stats.currentWorld.name} (LVL ${this.stats.level})`,
      this.stats.currentWorld.themeColor,
      2.0
    );

    this.targets = [];
    this.pickNewMission();
    this.spawnInitialWave();

    this.callbacks.onLevelUp(this.stats.level);
    this.callbacks.onStatsUpdate(this.stats);
  }

  private gameOver() {
    if (this.isGodMode) {
      this.stats.lives = 999;
      this.stats.maxLives = 999;
      this.stats.accuracyRemainingChances = 20;
      this.player.invulnerableTimer = 2.0;
      this.addFloatingText(this.width / 2, this.height * 0.4, '🛡️ PERISAI DEWA MENYELAMATKAN PESAWAT! (NYAWA ∞)', '#facc15', 1.8);
      this.callbacks.onStatsUpdate(this.stats);
      return;
    }

    this.isRunning = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    sound.stopBgm();
    sound.playGameOver();

    achievementManager.updateHighScore(this.mode, this.stats.score);
    this.callbacks.onGameOver(this.stats);
  }

  private triggerScreenShake(intensity: number, duration: number) {
    this.shakeIntensity = intensity;
    this.shakeTimer = duration;
    if (intensity >= 5) {
      this.chromaticAberrationAlpha = Math.min(1.0, intensity * 0.08);
    }
  }

  private createExplosion(x: number, y: number, primaryColor: string, particleCount: number) {
    this.particles.push({
      x,
      y,
      vx: 0,
      vy: 0,
      size: 16,
      color: primaryColor,
      life: 0,
      maxLife: 0.35,
      alpha: 1,
      type: 'shockwave',
    });

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 220 + 40;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 3.5 + 1.5,
        color: Math.random() > 0.4 ? primaryColor : '#ffffff',
        life: 0,
        maxLife: Math.random() * 0.4 + 0.25,
        alpha: 1,
        type: 'spark',
      });
    }
  }

  private createSparks(x: number, y: number, color: string, count: number) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 140 + 30;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 2.5 + 1,
        color,
        life: 0,
        maxLife: Math.random() * 0.25 + 0.15,
        alpha: 1,
        type: 'spark',
      });
    }
  }

  private createRing(x: number, y: number, color: string, size: number = 30) {
    this.particles.push({
      x,
      y,
      vx: 0,
      vy: 0,
      size,
      color,
      life: 0,
      maxLife: 0.35,
      alpha: 1,
      type: 'shockwave',
    });
  }

  public addFloatingText(x: number, y: number, text: string, color: string, scale: number = 1) {
    this.floatingTexts.push({
      id: Math.random().toString(),
      x,
      y,
      text,
      color,
      life: 0,
      maxLife: 1.2,
      vy: -55,
      scale,
    });
  }

  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.alpha = Math.max(0, 1 - p.life / p.maxLife);

      if (p.type === 'shockwave') {
        p.size += dt * 140;
      }

      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }
  }

  private updateFloatingTexts(dt: number) {
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life += dt;
      ft.y += ft.vy * dt;
      if (ft.life >= ft.maxLife) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  // ==================== RENDERING ====================
  private render() {
    const ctx = this.ctx;
    ctx.save();
    ctx.scale(this.dpr, this.dpr);

    if (this.shakeTimer > 0) {
      const offsetX = (Math.random() - 0.5) * this.shakeIntensity * 2;
      const offsetY = (Math.random() - 0.5) * this.shakeIntensity * 2;
      ctx.translate(offsetX, offsetY);
    }

    const world = this.stats.currentWorld;

    // 1. Rich Multi-Tone Cosmic Space / Bright Daylight Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, this.height);
    if (world.isBrightTheme) {
      bgGrad.addColorStop(0, world.bgGradStart);
      bgGrad.addColorStop(0.28, world.bgMidColor1 || '#fef08a');
      bgGrad.addColorStop(0.65, world.bgMidColor2 || '#f59e0b');
      bgGrad.addColorStop(1, world.bgGradEnd);
    } else {
      bgGrad.addColorStop(0, world.bgGradStart);
      bgGrad.addColorStop(0.25, world.bgMidColor1 || '#0c1435');
      bgGrad.addColorStop(0.5, world.bgMidColor2 || '#180a2e');
      bgGrad.addColorStop(0.75, '#042238');
      bgGrad.addColorStop(1, world.bgGradEnd);
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // 1a. Bright Daylight Atmospheric Features (Giant Sun, Lunar Horizon, Morning Dawn)
    this.renderBrightAtmosphere(ctx);

    // 1aa. Cosmic Phenomena: Aurora Borealis Curtains & Deep Space Electric Lightning
    this.renderCosmicAurora(ctx);
    this.renderCosmicLightning(ctx);

    // 1b. PS5 Cinematic 3D Camera Dynamic Banking, Pitch & FOV Zoom (Vanishing Horizon Pivot)
    if (this.is3DVisualEnabled) {
      const vpX = this.width / 2;
      const vpY = this.height * 0.36 + this.cameraPitch * 120;
      ctx.translate(vpX + this.cameraPanX, vpY);
      if (Math.abs(this.cameraZoom - 1.0) > 0.001) {
        ctx.scale(this.cameraZoom, this.cameraZoom);
      }
      if (Math.abs(this.cameraRoll) > 0.0003) {
        ctx.rotate(this.cameraRoll);
      }
      ctx.translate(-vpX - this.cameraPanX, -vpY);
    }

    // 1c. 3D Hyperspace Perspective Grid & Depth Arena
    this.render3DPerspectiveGrid(ctx);

    // 2. Parallax Layer 1: Twinkling Colorful Stars with Diffraction Crosses
    for (const star of this.stars) {
      const twinkle = (Math.sin(star.twinklePhase) + 1) * 0.4 + 0.3;
      ctx.fillStyle = star.color;
      ctx.globalAlpha = star.brightness * twinkle;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();

      // Diffraction cross spikes on brightest distant stars
      if (star.size > 2.0 && twinkle > 0.8) {
        ctx.strokeStyle = star.color;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        const spikeLen = star.size * 3.5;
        ctx.moveTo(star.x - spikeLen, star.y);
        ctx.lineTo(star.x + spikeLen, star.y);
        ctx.moveTo(star.x, star.y - spikeLen);
        ctx.lineTo(star.x, star.y + spikeLen);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;

    // 2b. Parallax Layer 1b: Distant Spiral Galaxies
    for (const sg of this.spiralGalaxies) {
      this.renderSpiralGalaxy(ctx, sg);
    }

    // 3. Parallax Layer 2: Colorful Vibrant Nebulae & Cosmic Gas Clouds
    for (const n of this.nebulae) {
      const grad = ctx.createRadialGradient(n.x, n.y, 10, n.x, n.y, n.radius);
      grad.addColorStop(0, n.color);
      grad.addColorStop(0.5, n.color);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.globalAlpha = n.alpha;
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // 3b. Undulating Cosmic Gas Ribbons
    for (const gr of this.gasRibbons) {
      this.renderCosmicGasRibbon(ctx, gr);
    }

    // 4. Parallax Layer 3: Edge-Lit Celestial Planets & Cosmic Spheres
    for (const cp of this.celestialPlanets) {
      this.renderCelestialPlanet(ctx, cp);
    }

    // 4b. Parallax Layer 4b: Floating Asteroid Belt Rocks
    for (const a of this.asteroids) {
      this.renderAsteroid(ctx, a);
    }

    // 5. Parallax Layer 4: Meteors / Shooting Stars
    for (const m of this.meteors) {
      this.renderMeteor(ctx, m);
    }

    // 5b. Bioluminescent Alien Forest Biome ("Hutan Purba KAFA") - smoothly morphs when challenge or forest biome active!
    this.renderForestBiome(ctx);

    // Interactive Gameplay Entities (Rendered during active play)
    if (!this.isMenuAmbient) {
      // 6. Boss Alien Dreadnought
      if (this.boss) {
        this.renderBoss(ctx);
      }

      // 6b. Active Alien Fighter Squadrons
      this.renderAlienFighters(ctx);

      // 6c. Dynamic Space Hazards (Laser Barrier Fences, Magma Asteroids, Gravity Vortexes)
      this.renderSpaceHazards(ctx);

      // 7. Targets (Letter Drones / Crystal Cores / Asteroids)
      this.renderTargets(ctx);

      // 8. Power-ups
      this.renderPowerUps(ctx);

      // 9. Projectiles (Player Lasers & Alien Orbs)
      this.renderProjectiles(ctx);
      this.renderEnemyProjectiles(ctx);

      // 9b. Special Abilities VFX (Thunder Rail, Orbital Guards, Cosmic Sword, Galaxy Breaker)
      this.renderThunderRail(ctx);
      this.renderOrbitalGuards(ctx);
      this.renderCosmicSword(ctx);
      this.renderGalaxyBreaker(ctx);
    }

    // 10. Hero Star Fighter Player Ship or Mecha Robot (Always rendered, animated in both menu & game!)
    if (this.cameraMode === 'cockpit_fpv' && !this.isMenuAmbient) {
      this.renderCockpitFPV(ctx);
    } else if (this.player.isRobotMode) {
      this.renderHeroMechaRobot(ctx);
    } else {
      this.renderHeroShip(ctx);
    }
    this.renderPlayerShoutBanner(ctx);

    // 11. Particles & Explosions
    this.renderParticles(ctx);

    if (!this.isMenuAmbient) {
      // 12. Floating Scores & Feedback Text
      this.renderFloatingTexts(ctx);
    }

    // 13. Parallax Layer 5: Foreground Floating Cosmic Dust Motes
    for (const cd of this.cosmicDust) {
      ctx.fillStyle = cd.color;
      ctx.globalAlpha = cd.alpha;
      ctx.beginPath();
      ctx.arc(cd.x, cd.y, cd.size, 0, Math.PI * 2);
      ctx.fill();
    }
    // 14. Sci-Fi Film Anamorphic Lens Flare & Volumetric Bloom
    this.renderCinematicAnamorphicFlare(ctx);
    this.renderPS5CinematicPostProcessing(ctx);

    ctx.restore();
  }

  private renderPS5CinematicPostProcessing(ctx: CanvasRenderingContext2D) {
    if (!this.is3DVisualEnabled) return;

    // 1. PS5 Next-Gen Cinematic Vignette (Deep corner focal depth)
    ctx.save();
    const cx = this.width / 2;
    const cy = this.height / 2;
    const vigRadius = Math.max(this.width, this.height) * 0.75;
    const vigGrad = ctx.createRadialGradient(cx, cy, this.height * 0.32, cx, cy, vigRadius);
    vigGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vigGrad.addColorStop(0.7, 'rgba(2, 6, 23, 0.22)');
    vigGrad.addColorStop(1, 'rgba(2, 6, 23, 0.65)');
    ctx.fillStyle = vigGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // 2. Raytraced Chromatic Aberration Screen Splitting (Triggered on impacts, overcharge & boss encounters)
    if (this.chromaticAberrationAlpha > 0.02) {
      ctx.globalCompositeOperation = 'screen';
      const caShift = this.chromaticAberrationAlpha * 4.5;

      // Cyan fringe pass
      ctx.fillStyle = `rgba(0, 240, 255, ${this.chromaticAberrationAlpha * 0.12})`;
      ctx.fillRect(-caShift, 0, this.width, this.height);

      // Red/Magenta fringe pass
      ctx.fillStyle = `rgba(244, 63, 94, ${this.chromaticAberrationAlpha * 0.12})`;
      ctx.fillRect(caShift, 0, this.width, this.height);
      ctx.globalCompositeOperation = 'source-over';
    }

    // 3. 3D Hyperspace Tunnel Peripheral Speed Lines (Active flight sensation)
    if (this.player.dashTimer > 0 || Math.abs(this.player.vx) > 80) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const numLines = 18;
      const speedAlpha = this.player.dashTimer > 0 ? 0.45 : 0.18;
      ctx.strokeStyle = `rgba(56, 189, 248, ${speedAlpha})`;
      ctx.lineWidth = 1.2;

      for (let i = 0; i < numLines; i++) {
        const side = i % 2 === 0 ? 0 : this.width;
        const y = ((i * 47 + this.speedLinesPhase * 30) % this.height);
        const len = 35 + ((i * 23) % 45);
        ctx.beginPath();
        ctx.moveTo(side, y);
        ctx.lineTo(side + (side === 0 ? len : -len), y + 10);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 4. PS5 Real-Time Ray-Traced Point Illumination Highlights
    if (this.ps5GraphicsMode === 'rt_ultra') {
      const p = this.player;
      for (const proj of this.projectiles) {
        const dx = proj.x - p.x;
        const dy = proj.y - p.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 140) {
          const ptGrad = ctx.createRadialGradient(proj.x, proj.y, 2, proj.x, proj.y, 80);
          ptGrad.addColorStop(0, proj.color);
          ptGrad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.save();
          ctx.globalCompositeOperation = 'screen';
          ctx.globalAlpha = (1 - dist / 140) * 0.45;
          ctx.fillStyle = ptGrad;
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, 80, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }
    }

    // 5. PS5 Pro Console Real-Time Telemetry Watermark & RT Status Badge
    ctx.save();
    const isUltraRT = this.ps5GraphicsMode === 'rt_ultra';
    const badgeW = 270;
    const badgeH = 24;
    const badgeX = 14;
    const badgeY = this.height - 32;

    // Glass backdrop with chromatic rim
    ctx.fillStyle = 'rgba(2, 6, 23, 0.78)';
    ctx.strokeStyle = isUltraRT ? 'rgba(0, 240, 255, 0.55)' : 'rgba(148, 163, 184, 0.35)';
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 6);
    ctx.fill();
    ctx.stroke();

    // PS5 Logo / Icon
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 10px Orbitron, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('🎮 PS5 PRO', badgeX + 8, badgeY + 16);

    // Dynamic FPS readout
    ctx.fillStyle = this.fps >= 55 ? '#4ade80' : '#facc15';
    ctx.font = 'bold 9px Orbitron, sans-serif';
    ctx.fillText(`${this.fps} FPS`, badgeX + 82, badgeY + 16);

    // RT Status indicator dot
    ctx.fillStyle = isUltraRT ? '#00f0ff' : '#94a3b8';
    ctx.shadowColor = isUltraRT ? '#00f0ff' : 'transparent';
    ctx.shadowBlur = isUltraRT ? 6 : 0;
    ctx.beginPath();
    ctx.arc(badgeX + 138, badgeY + 12, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.font = '8px Orbitron, sans-serif';
    ctx.fillText(isUltraRT ? 'RT ULTRA' : 'PERF 60', badgeX + 145, badgeY + 16);

    // Active Camera Mode tag
    ctx.fillStyle = this.cameraMode === 'cockpit_fpv' ? '#f43f5e' : '#38bdf8';
    ctx.font = 'bold 8px Orbitron, sans-serif';
    const camTag = this.cameraMode === 'cockpit_fpv' ? 'KOKPIT FPV' : this.cameraMode === 'chase_3d' ? '3D CHASE' : '2D RETRO';
    ctx.fillText(`[${camTag}]`, badgeX + 210, badgeY + 16);
    ctx.restore();

    ctx.restore();
  }

  private renderCinematicAnamorphicFlare(ctx: CanvasRenderingContext2D) {
    if (!this.is3DVisualEnabled || this.anamorphicFlareAlpha <= 0.01) return;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = Math.min(0.65, this.anamorphicFlareAlpha);

    // 1. Horizontal Anamorphic Blue/Cyan Film Streak
    const py = this.player.y - 10;
    const flareGrad = ctx.createLinearGradient(0, py, this.width, py);
    flareGrad.addColorStop(0, 'rgba(6, 182, 212, 0)');
    flareGrad.addColorStop(0.2, 'rgba(56, 189, 248, 0.15)');
    flareGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.85)');
    flareGrad.addColorStop(0.8, 'rgba(56, 189, 248, 0.15)');
    flareGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');

    ctx.fillStyle = flareGrad;
    ctx.fillRect(0, py - 2.5, this.width, 5);

    // 2. Center Spherical Halo Glow
    const halo = ctx.createRadialGradient(this.player.x, py, 2, this.player.x, py, 90);
    halo.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
    halo.addColorStop(0.3, 'rgba(56, 189, 248, 0.35)');
    halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(this.player.x, py, 90, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private renderCosmicGasRibbon(ctx: CanvasRenderingContext2D, gr: CosmicGasRibbonEntity) {
    ctx.save();
    ctx.globalAlpha = gr.alpha;

    const grad = ctx.createLinearGradient(0, gr.yOffset - gr.thickness, this.width, gr.yOffset + gr.thickness);
    grad.addColorStop(0, gr.colorStart);
    grad.addColorStop(0.5, gr.colorEnd);
    grad.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, gr.yOffset);

    const step = 40;
    for (let x = 0; x <= this.width; x += step) {
      const y = gr.yOffset + Math.sin(x * gr.frequency + gr.phase) * gr.amplitude;
      ctx.lineTo(x, y);
    }

    for (let x = this.width; x >= 0; x -= step) {
      const y = gr.yOffset + Math.sin(x * gr.frequency + gr.phase) * gr.amplitude + gr.thickness;
      ctx.lineTo(x, y);
    }

    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  private renderAsteroid(ctx: CanvasRenderingContext2D, a: AsteroidEntity) {
    ctx.save();
    ctx.translate(a.x, a.y);
    ctx.rotate(a.angle);

    if (a.isGiantMegalith) {
      // 1. Giant Megalith Cosmic Rock Body with 3D Faceted Shading
      ctx.beginPath();
      const pts = a.shapeOffsets.length;
      for (let i = 0; i < pts; i++) {
        const angle = (i * 2 * Math.PI) / pts;
        const r = a.radius * a.shapeOffsets[i];
        const px = Math.cos(angle) * r;
        const py = Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();

      // Realistic 3D rock gradient with light source from top-left
      const rockGrad = ctx.createRadialGradient(-a.radius * 0.35, -a.radius * 0.35, a.radius * 0.1, 0, 0, a.radius * 1.15);
      const isReacting = Boolean(a.hitReactionTimer && a.hitReactionTimer > 0);
      rockGrad.addColorStop(0, isReacting ? '#64748b' : '#334155');
      rockGrad.addColorStop(0.35, isReacting ? '#475569' : '#1e293b');
      rockGrad.addColorStop(0.8, '#0f172a');
      rockGrad.addColorStop(1, '#020617');

      ctx.fillStyle = rockGrad;
      ctx.fill();

      // Outer Rim Glow
      ctx.shadowColor = a.rimColor || '#00f0ff';
      ctx.shadowBlur = isReacting ? 25 : 12;
      ctx.strokeStyle = isReacting ? '#67e8f9' : (a.rimColor || '#38bdf8');
      ctx.lineWidth = isReacting ? 3.5 : 2.2;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // 2. 3D Craters on Asteroid Surface
      const craters = [
        { cx: -a.radius * 0.42, cy: -a.radius * 0.36, cr: a.radius * 0.18 },
        { cx: a.radius * 0.46, cy: a.radius * 0.38, cr: a.radius * 0.16 },
        { cx: -a.radius * 0.48, cy: a.radius * 0.35, cr: a.radius * 0.13 },
        { cx: a.radius * 0.38, cy: -a.radius * 0.44, cr: a.radius * 0.15 },
      ];
      for (const cr of craters) {
        ctx.beginPath();
        ctx.arc(cr.cx, cr.cy, cr.cr, 0, Math.PI * 2);
        ctx.fillStyle = '#070b14';
        ctx.fill();
        ctx.strokeStyle = 'rgba(100, 116, 139, 0.45)';
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }

      // 3. Glowing Cyan & Gold Crystal Veins
      const veinColor = a.crystalVeinColor || '#38bdf8';
      ctx.strokeStyle = veinColor;
      ctx.lineWidth = 1.6;
      ctx.shadowColor = veinColor;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      // Vein 1: Left to Center
      ctx.moveTo(-a.radius * 0.72, -a.radius * 0.1);
      ctx.lineTo(-a.radius * 0.42, -a.radius * 0.05);
      ctx.lineTo(-a.radius * 0.25, -a.radius * 0.2);
      ctx.lineTo(-a.radius * 0.05, -a.radius * 0.15);
      ctx.stroke();
      // Vein 2: Bottom-Right Crevice
      ctx.beginPath();
      ctx.moveTo(a.radius * 0.1, a.radius * 0.25);
      ctx.lineTo(a.radius * 0.35, a.radius * 0.32);
      ctx.lineTo(a.radius * 0.65, a.radius * 0.18);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // 4. Central Inscribed Monolith Tablet: "SAHABAT KAFA"
      const plateW = a.radius * 1.35;
      const plateH = a.radius * 0.68;
      const plateX = -plateW / 2;
      const plateY = -plateH / 2;

      // Holographic Plate Background
      const plateGrad = ctx.createLinearGradient(plateX, plateY, plateX, plateY + plateH);
      plateGrad.addColorStop(0, 'rgba(15, 23, 42, 0.94)');
      plateGrad.addColorStop(0.5, 'rgba(8, 47, 73, 0.9)');
      plateGrad.addColorStop(1, 'rgba(2, 6, 23, 0.96)');

      ctx.fillStyle = plateGrad;
      ctx.beginPath();
      ctx.roundRect(plateX, plateY, plateW, plateH, 8);
      ctx.fill();

      // Glowing Cyber Tech Border
      ctx.strokeStyle = isReacting ? '#facc15' : '#00f0ff';
      ctx.lineWidth = 1.8;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Tech Corner Accent Brackets
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      // Top-left
      ctx.beginPath();
      ctx.moveTo(plateX - 2, plateY + 6);
      ctx.lineTo(plateX - 2, plateY - 2);
      ctx.lineTo(plateX + 6, plateY - 2);
      ctx.stroke();
      // Top-right
      ctx.beginPath();
      ctx.moveTo(plateX + plateW + 2, plateY + 6);
      ctx.lineTo(plateX + plateW + 2, plateY - 2);
      ctx.lineTo(plateX + plateW - 6, plateY - 2);
      ctx.stroke();
      // Bottom-left
      ctx.beginPath();
      ctx.moveTo(plateX - 2, plateY + plateH - 6);
      ctx.lineTo(plateX - 2, plateY + plateH + 2);
      ctx.lineTo(plateX + 6, plateY + plateH + 2);
      ctx.stroke();
      // Bottom-right
      ctx.beginPath();
      ctx.moveTo(plateX + plateW + 2, plateY + plateH - 6);
      ctx.lineTo(plateX + plateW + 2, plateY + plateH + 2);
      ctx.lineTo(plateX + plateW - 6, plateY + plateH + 2);
      ctx.stroke();

      // Top Tag: ✦ SEKTOR KOSMIK ✦
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 8px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('✦ SEKTOR KOSMIK ✦', 0, plateY + 11);

      // MAIN BOLD TITLE: "SAHABAT KAFA"
      ctx.save();
      ctx.shadowColor = isReacting ? '#fef08a' : '#38bdf8';
      ctx.shadowBlur = 14;
      ctx.fillStyle = '#ffffff';
      const fontSize = Math.max(12, Math.min(18, a.radius * 0.22));
      ctx.font = `900 ${fontSize}px Orbitron, sans-serif`;
      ctx.fillText(a.label || 'SAHABAT KAFA', 0, plateY + plateH * 0.48);
      ctx.shadowBlur = 0;
      ctx.restore();

      // Subtitle Arabic Calligraphy: "صَحَابَة كَافَا"
      ctx.fillStyle = '#67e8f9';
      ctx.font = 'bold 11px Amiri, Arial, sans-serif';
      ctx.fillText(a.arabicLabel || 'صَحَابَة كَافَا', 0, plateY + plateH * 0.82);

      // 5. Radio Communication Beacon Mast on Asteroid Peak
      const mastX = 0;
      const mastTopY = -a.radius * 0.95;
      const mastTipY = mastTopY - 18;

      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(mastX, mastTopY);
      ctx.lineTo(mastX, mastTipY);
      ctx.stroke();

      // Crossbars
      ctx.beginPath();
      ctx.moveTo(mastX - 5, mastTipY + 7);
      ctx.lineTo(mastX + 5, mastTipY + 7);
      ctx.moveTo(mastX - 3, mastTipY + 12);
      ctx.lineTo(mastX + 3, mastTipY + 12);
      ctx.stroke();

      // Pulsing Radio Wave Rings
      const pulseT = a.beaconLightTimer || 0;
      const pulseWaveR = 6 + (pulseT * 4) % 18;
      const pulseAlpha = Math.max(0, 1 - pulseWaveR / 18);
      ctx.strokeStyle = `rgba(56, 189, 248, ${pulseAlpha})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(mastX, mastTipY, pulseWaveR, 0, Math.PI * 2);
      ctx.stroke();

      // Blinking Beacon LED Light
      const isBeaconOn = Math.sin(pulseT * 2) > 0;
      ctx.fillStyle = isBeaconOn ? '#10b981' : '#06b6d4';
      ctx.shadowColor = isBeaconOn ? '#34d399' : '#00f0ff';
      ctx.shadowBlur = isBeaconOn ? 12 : 5;
      ctx.beginPath();
      ctx.arc(mastX, mastTipY, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // 6. Orbiting Tiny Stardust Moonlet
      const mAngle = a.moonletAngle || 0;
      const moonDist = a.radius * 1.38;
      const moonX = Math.cos(mAngle) * moonDist;
      const moonY = Math.sin(mAngle) * (moonDist * 0.45); // elliptical orbit

      ctx.fillStyle = '#cbd5e1';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(moonX, moonY, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

    } else {
      // Standard Field Asteroid
      ctx.beginPath();
      const pts = a.shapeOffsets.length;
      for (let i = 0; i < pts; i++) {
        const angle = (i * 2 * Math.PI) / pts;
        const r = a.radius * a.shapeOffsets[i];
        const px = Math.cos(angle) * r;
        const py = Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();

      ctx.fillStyle = a.baseColor;
      ctx.fill();

      // Colored rim highlight on top-left edge
      ctx.strokeStyle = a.rimColor;
      ctx.lineWidth = 1.6;
      ctx.stroke();
    }

    ctx.restore();
  }

  // ==================== COSMIC PHENOMENA: AURORA & LIGHTNING ====================
  private renderCosmicAurora(ctx: CanvasRenderingContext2D) {
    if (this.stats.currentWorld.isBrightTheme) return;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const numRibbons = 3;
    for (let r = 0; r < numRibbons; r++) {
      const baseColor = r === 0 ? 'rgba(52, 211, 153, ' : r === 1 ? 'rgba(6, 182, 212, ' : 'rgba(168, 85, 247, ';
      const startY = 25 + r * 38;
      const waveFreq = 0.007 + r * 0.002;
      const phase = this.auroraPhase + r * 1.5;

      ctx.beginPath();
      ctx.moveTo(0, startY);
      for (let x = 0; x <= this.width; x += 22) {
        const y = startY + Math.sin(x * waveFreq + phase) * 24 + Math.cos(x * 0.014 - phase * 0.6) * 14;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(this.width, 0);
      ctx.lineTo(0, 0);
      ctx.closePath();

      const aGrad = ctx.createLinearGradient(0, 0, 0, 140);
      aGrad.addColorStop(0, `${baseColor}0.22)`);
      aGrad.addColorStop(0.5, `${baseColor}0.10)`);
      aGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = aGrad;
      ctx.fill();
    }
    ctx.restore();
  }

  private renderCosmicLightning(ctx: CanvasRenderingContext2D) {
    if (!this.cosmicLightningBolt || this.cosmicLightningBolt.alpha <= 0.01) return;
    const bolt = this.cosmicLightningBolt;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.strokeStyle = `rgba(103, 232, 249, ${bolt.alpha * 0.85})`;
    ctx.lineWidth = 2.0;
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 14;

    ctx.beginPath();
    ctx.moveTo(bolt.x1, bolt.y1);
    const steps = 6;
    for (let s = 1; s < steps; s++) {
      const prog = s / steps;
      const mx = bolt.x1 + (bolt.x2 - bolt.x1) * prog + (Math.random() - 0.5) * 24;
      const my = bolt.y1 + (bolt.y2 - bolt.y1) * prog + (Math.random() - 0.5) * 16;
      ctx.lineTo(mx, my);
    }
    ctx.lineTo(bolt.x2, bolt.y2);
    ctx.stroke();

    ctx.strokeStyle = `rgba(255, 255, 255, ${bolt.alpha})`;
    ctx.lineWidth = 1.0;
    ctx.stroke();
    ctx.restore();
  }

  // ==================== BRIGHT DAYLIGHT ATMOSPHERIC FEATURES ====================
  private renderBrightAtmosphere(ctx: CanvasRenderingContext2D) {
    const world = this.stats.currentWorld;
    if (!world.isBrightTheme) return;

    ctx.save();

    if (world.id === 1) {
      // ☀️ MATAHARI (SOLAR RADIANCE) - Blazing Daylight Sun with Corona Rays & Solar Prominences
      const sunX = this.width / 2;
      const sunY = -45;
      const sunRad = Math.min(190, this.width * 0.28);

      // Rotating Solar Corona Sunbeams
      const rays = 12;
      for (let r = 0; r < rays; r++) {
        const ang = (r * Math.PI) / (rays / 2) + Date.now() * 0.0006;
        const rGrad = ctx.createLinearGradient(
          sunX,
          sunY,
          sunX + Math.cos(ang) * (this.height * 0.95),
          sunY + Math.sin(ang) * (this.height * 0.95)
        );
        rGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
        rGrad.addColorStop(0.25, 'rgba(254, 240, 138, 0.25)');
        rGrad.addColorStop(0.7, 'rgba(245, 158, 11, 0.12)');
        rGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = rGrad;
        ctx.beginPath();
        ctx.moveTo(sunX, sunY);
        ctx.lineTo(sunX + Math.cos(ang - 0.14) * this.height * 0.95, sunY + Math.sin(ang - 0.14) * this.height * 0.95);
        ctx.lineTo(sunX + Math.cos(ang + 0.14) * this.height * 0.95, sunY + Math.sin(ang + 0.14) * this.height * 0.95);
        ctx.closePath();
        ctx.fill();
      }

      // Blazing Solar Photosphere Disk
      const diskGrad = ctx.createRadialGradient(sunX, sunY, sunRad * 0.2, sunX, sunY, sunRad * 1.55);
      diskGrad.addColorStop(0, '#ffffff');
      diskGrad.addColorStop(0.3, '#fef08a');
      diskGrad.addColorStop(0.65, '#f59e0b');
      diskGrad.addColorStop(1, 'rgba(234, 88, 12, 0)');
      ctx.fillStyle = diskGrad;
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunRad * 1.55, 0, Math.PI * 2);
      ctx.fill();

      // Magnetic Solar Flares & Looping Arches
      ctx.strokeStyle = 'rgba(254, 240, 138, 0.75)';
      ctx.lineWidth = 2.5;
      for (let f = 0; f < 4; f++) {
        const fAng = (f * Math.PI) / 2.5 + Math.sin(Date.now() * 0.002 + f) * 0.3;
        const fx = sunX + Math.cos(fAng) * (sunRad * 0.85);
        const fy = sunY + Math.sin(fAng) * (sunRad * 0.85);
        ctx.beginPath();
        ctx.arc(fx, fy, 24, fAng - 0.6, fAng + 0.6);
        ctx.stroke();
      }

    } else if (world.id === 2) {
      // 🌕 BULAN (LUNAR DAYLIGHT) - Radiant Earth-rise in Brilliant Silver Crater Horizon
      const earthX = this.width * 0.78;
      const earthY = 95;
      const earthRad = Math.min(82, this.width * 0.13);

      // Earth Atmosphere Outer Cyan Halo
      const earthHalo = ctx.createRadialGradient(earthX, earthY, earthRad * 0.8, earthX, earthY, earthRad * 1.45);
      earthHalo.addColorStop(0, 'rgba(56, 189, 248, 0.6)');
      earthHalo.addColorStop(0.5, 'rgba(2, 132, 199, 0.3)');
      earthHalo.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = earthHalo;
      ctx.beginPath();
      ctx.arc(earthX, earthY, earthRad * 1.45, 0, Math.PI * 2);
      ctx.fill();

      // Earth Blue Ocean Sphere
      const earthGrad = ctx.createRadialGradient(
        earthX - earthRad * 0.3,
        earthY - earthRad * 0.3,
        earthRad * 0.1,
        earthX,
        earthY,
        earthRad
      );
      earthGrad.addColorStop(0, '#ffffff');
      earthGrad.addColorStop(0.35, '#38bdf8');
      earthGrad.addColorStop(0.7, '#0284c7');
      earthGrad.addColorStop(1, '#0c4a6e');
      ctx.fillStyle = earthGrad;
      ctx.beginPath();
      ctx.arc(earthX, earthY, earthRad, 0, Math.PI * 2);
      ctx.fill();

      // Green Continents & Swirling White Clouds
      ctx.fillStyle = 'rgba(16, 185, 129, 0.55)';
      ctx.beginPath();
      ctx.ellipse(earthX - 10, earthY - 8, earthRad * 0.45, earthRad * 0.28, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.beginPath();
      ctx.ellipse(earthX + 10, earthY + 12, earthRad * 0.4, earthRad * 0.18, -0.4, 0, Math.PI * 2);
      ctx.fill();

      // Undulating Silver Lunar Crater Horizons (Lower Third)
      const craterY = this.height * 0.64;
      const craterGrad = ctx.createLinearGradient(0, craterY, 0, this.height);
      craterGrad.addColorStop(0, 'rgba(226, 232, 240, 0.45)');
      craterGrad.addColorStop(0.35, 'rgba(148, 163, 184, 0.32)');
      craterGrad.addColorStop(1, 'rgba(100, 116, 139, 0.18)');
      ctx.fillStyle = craterGrad;
      ctx.beginPath();
      ctx.moveTo(0, this.height);
      for (let cx = 0; cx <= this.width; cx += 25) {
        const cy = craterY + Math.sin(cx * 0.012) * 20 + Math.cos(cx * 0.024) * 12;
        ctx.lineTo(cx, cy);
      }
      ctx.lineTo(this.width, this.height);
      ctx.closePath();
      ctx.fill();

      // Platinum Rim Highlight
      ctx.strokeStyle = 'rgba(248, 250, 252, 0.65)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (let cx = 0; cx <= this.width; cx += 25) {
        const cy = craterY + Math.sin(cx * 0.012) * 20 + Math.cos(cx * 0.024) * 12;
        if (cx === 0) ctx.moveTo(cx, cy);
        else ctx.lineTo(cx, cy);
      }
      ctx.stroke();

    } else if (world.id === 3) {
      // 🌅 LANGIT FAJAR (CELESTIAL DAWN) - Emerald Sunrise Sunbeams & Golden Aurora
      const dawnX = this.width * 0.25;
      const dawnY = 0;
      for (let r = 0; r < 6; r++) {
        const ang = (r * Math.PI) / 8 + 0.2;
        const dGrad = ctx.createLinearGradient(
          dawnX,
          dawnY,
          dawnX + Math.cos(ang) * this.height,
          dawnY + Math.sin(ang) * this.height
        );
        dGrad.addColorStop(0, 'rgba(254, 240, 138, 0.4)');
        dGrad.addColorStop(0.4, 'rgba(52, 211, 153, 0.22)');
        dGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = dGrad;
        ctx.beginPath();
        ctx.moveTo(dawnX, dawnY);
        ctx.lineTo(dawnX + Math.cos(ang - 0.15) * this.height, dawnY + Math.sin(ang - 0.15) * this.height);
        ctx.lineTo(dawnX + Math.cos(ang + 0.15) * this.height, dawnY + Math.sin(ang + 0.15) * this.height);
        ctx.closePath();
        ctx.fill();
      }

    } else if (world.id === 6) {
      // 🏙️ METROPOLIS ANGKASA - Cyber Ivory Gold City Skyline
      const cityY = this.height * 0.68;
      ctx.fillStyle = 'rgba(234, 179, 8, 0.25)';
      const buildingWidth = 35;
      for (let bx = 0; bx < this.width; bx += buildingWidth + 8) {
        const h = 45 + Math.sin(bx * 0.04) * 35 + ((bx * 7) % 30);
        ctx.fillRect(bx, cityY - h, buildingWidth, h + (this.height - cityY));
        // Glowing spire beacon antenna
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(bx + buildingWidth / 2, cityY - h);
        ctx.lineTo(bx + buildingWidth / 2, cityY - h - 18);
        ctx.stroke();
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(bx + buildingWidth / 2, cityY - h - 18, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(234, 179, 8, 0.25)';
      }
    }

    ctx.restore();
  }

  // ==================== ALIEN FIGHTER SQUADRON RENDERING ====================
  private renderAlienFighters(ctx: CanvasRenderingContext2D) {
    for (const a of this.alienFighters) {
      ctx.save();
      ctx.translate(a.x, a.y);
      // PS5 3D Depth Foreshortening: Distant swooping fighters appear smaller at horizon and scale up in foreground
      if (this.is3DVisualEnabled && this.cameraMode !== 'topdown') {
        const horizonY = this.height * 0.32;
        const normalizedDepth = Math.max(0, Math.min(1.25, (a.y - horizonY) / (this.height * 0.55)));
        const depthScale = 0.65 + 0.42 * normalizedDepth;
        ctx.scale(depthScale, depthScale);
      }
      ctx.rotate(a.tilt);

      if (a.hitFlash > 0) {
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 18;
      }

      if (a.type === 'cruiser') {
        // Heavy Cruiser Dreadnought
        const hullGrad = ctx.createLinearGradient(0, -a.height / 2, 0, a.height / 2);
        hullGrad.addColorStop(0, a.hitFlash > 0 ? '#ffffff' : '#334155');
        hullGrad.addColorStop(0.5, a.hitFlash > 0 ? '#ffffff' : '#1e293b');
        hullGrad.addColorStop(1, a.hitFlash > 0 ? '#ffffff' : '#0f172a');
        ctx.fillStyle = hullGrad;
        ctx.strokeStyle = a.color;
        ctx.lineWidth = 2.2;

        ctx.beginPath();
        ctx.moveTo(0, a.height * 0.55); // Nose
        ctx.lineTo(a.width * 0.45, a.height * 0.2);
        ctx.lineTo(a.width * 0.5, -a.height * 0.35);
        ctx.lineTo(a.width * 0.25, -a.height * 0.5);
        ctx.lineTo(-a.width * 0.25, -a.height * 0.5);
        ctx.lineTo(-a.width * 0.5, -a.height * 0.35);
        ctx.lineTo(-a.width * 0.45, a.height * 0.2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Pulsating glowing energy core
        const corePulse = (Math.sin(a.enginePhase) + 1) * 0.5;
        ctx.fillStyle = a.glowColor;
        ctx.shadowColor = a.glowColor;
        ctx.shadowBlur = 14 + corePulse * 6;
        ctx.beginPath();
        ctx.arc(0, 0, 9 + corePulse * 3, 0, Math.PI * 2);
        ctx.fill();

        // Wing cannon pods
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(-a.width * 0.42, 0, 5, 12);
        ctx.fillRect(a.width * 0.42 - 5, 0, 5, 12);

      } else if (a.type === 'fighter') {
        // Twin-wing aggressive fighter
        const wingGrad = ctx.createLinearGradient(0, -a.height / 2, 0, a.height / 2);
        wingGrad.addColorStop(0, a.hitFlash > 0 ? '#ffffff' : '#2e1065');
        wingGrad.addColorStop(0.5, a.hitFlash > 0 ? '#ffffff' : '#4c1d95');
        wingGrad.addColorStop(1, a.hitFlash > 0 ? '#ffffff' : '#1e1b4b');
        ctx.fillStyle = wingGrad;
        ctx.strokeStyle = a.color;
        ctx.lineWidth = 1.8;

        ctx.beginPath();
        ctx.moveTo(0, a.height * 0.5);
        ctx.lineTo(a.width * 0.22, a.height * 0.1);
        ctx.lineTo(a.width * 0.48, -a.height * 0.25);
        ctx.lineTo(a.width * 0.42, -a.height * 0.48);
        ctx.lineTo(a.width * 0.12, -a.height * 0.35);
        ctx.lineTo(0, -a.height * 0.2);
        ctx.lineTo(-a.width * 0.12, -a.height * 0.35);
        ctx.lineTo(-a.width * 0.42, -a.height * 0.48);
        ctx.lineTo(-a.width * 0.48, -a.height * 0.25);
        ctx.lineTo(-a.width * 0.22, a.height * 0.1);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Glowing violet visor cockpit
        ctx.fillStyle = a.glowColor;
        ctx.shadowColor = a.glowColor;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.ellipse(0, a.height * 0.15, 5, 9, 0, 0, Math.PI * 2);
        ctx.fill();

      } else if (a.type === 'interceptor') {
        // Forward swept dart interceptor
        ctx.fillStyle = a.hitFlash > 0 ? '#ffffff' : '#083344';
        ctx.strokeStyle = a.color;
        ctx.lineWidth = 1.8;

        ctx.beginPath();
        ctx.moveTo(0, a.height * 0.52);
        ctx.lineTo(a.width * 0.46, a.height * 0.25);
        ctx.lineTo(a.width * 0.35, -a.height * 0.45);
        ctx.lineTo(0, -a.height * 0.2);
        ctx.lineTo(-a.width * 0.35, -a.height * 0.45);
        ctx.lineTo(-a.width * 0.46, a.height * 0.25);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Cyan cockpit slit
        ctx.fillStyle = a.glowColor;
        ctx.shadowColor = a.glowColor;
        ctx.shadowBlur = 8;
        ctx.fillRect(-3, a.height * 0.1, 6, 8);

      } else {
        // Scout nimble delta craft
        ctx.fillStyle = a.hitFlash > 0 ? '#ffffff' : '#450a0a';
        ctx.strokeStyle = a.color;
        ctx.lineWidth = 1.6;

        ctx.beginPath();
        ctx.moveTo(0, a.height * 0.48);
        ctx.lineTo(a.width * 0.45, -a.height * 0.4);
        ctx.lineTo(0, -a.height * 0.22);
        ctx.lineTo(-a.width * 0.45, -a.height * 0.4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Red sensor eye
        ctx.fillStyle = a.glowColor;
        ctx.shadowColor = a.glowColor;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(0, a.height * 0.1, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Small health bar if damaged
      if (a.hp < a.maxHp) {
        const barW = a.width * 0.9;
        const barH = 3.5;
        const barY = -a.height * 0.55 - 6;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(-barW / 2, barY, barW, barH);
        ctx.fillStyle = a.hp / a.maxHp > 0.4 ? a.glowColor : '#ef4444';
        ctx.fillRect(-barW / 2, barY, barW * (a.hp / a.maxHp), barH);
      }

      ctx.restore();
    }
  }

  private renderSpiralGalaxy(ctx: CanvasRenderingContext2D, sg: SpiralGalaxyEntity) {
    ctx.save();
    ctx.translate(sg.x, sg.y);
    ctx.rotate(sg.angle);
    ctx.globalAlpha = sg.alpha;

    // Core glow
    const coreGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, sg.radius * 0.45);
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.4, sg.color);
    coreGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(0, 0, sg.radius * 0.45, 0, Math.PI * 2);
    ctx.fill();

    // Spiral Arms with Stellar Clusters
    ctx.strokeStyle = sg.color;
    ctx.lineWidth = 1.8;
    for (let arm = 0; arm < 2; arm++) {
      ctx.beginPath();
      const offset = arm * Math.PI;
      for (let t = 0; t < Math.PI * 2.5; t += 0.18) {
        const r = (sg.radius / (Math.PI * 2.5)) * t;
        const theta = t + offset;
        const x = Math.cos(theta) * r;
        const y = Math.sin(theta) * r * 0.45;
        if (t === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    ctx.restore();
  }

  // ==================== PS5 NEXT-GEN 3D HYPERSPACE CURVED ARENA ====================
  private render3DPerspectiveGrid(ctx: CanvasRenderingContext2D) {
    if (!this.is3DVisualEnabled) return;
    ctx.save();

    const world = this.stats.currentWorld;
    const isForest = this.stats.activeArenaBiome === 'forest';
    const gridColorPrefix = isForest
      ? 'rgba(52, 211, 153, '
      : world.id === 3
      ? 'rgba(245, 158, 11, '
      : world.id === 4
      ? 'rgba(56, 189, 248, '
      : 'rgba(6, 182, 212, ';

    const neonPrimary = isForest ? '#34d399' : world.id === 3 ? '#fbbf24' : world.id === 4 ? '#38bdf8' : '#00f0ff';
    const vpX = this.width / 2;
    const vpY = this.height * 0.34 + this.cameraPitch * 90; // 3D vanishing point on horizon
    const floorY = this.height + 70;

    // 0. Hyperspace Warp Drive Cylindrical Flux Tunnel Rings
    if (this.warpDriveTimer > 0) {
      const numWarpRings = 9;
      for (let wr = 0; wr < numWarpRings; wr++) {
        const ringProgress = ((wr + this.speedLinesPhase * 0.12) % numWarpRings) / numWarpRings;
        const ringRadius = Math.pow(ringProgress, 2.0) * Math.max(this.width, this.height) * 0.95;
        const ringAlpha = Math.sin(ringProgress * Math.PI) * 0.85;

        ctx.strokeStyle = wr % 2 === 0 ? `rgba(0, 240, 255, ${ringAlpha})` : `rgba(168, 85, 247, ${ringAlpha})`;
        ctx.lineWidth = 2.5 + ringProgress * 4.0;
        ctx.beginPath();
        ctx.ellipse(vpX, vpY, ringRadius, ringRadius * 0.65, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Warp lightning arcs connecting rings
        if (wr % 3 === 0 && Math.random() < 0.4) {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          const ang = Math.random() * Math.PI * 2;
          ctx.moveTo(vpX + Math.cos(ang) * ringRadius * 0.7, vpY + Math.sin(ang) * ringRadius * 0.45);
          ctx.lineTo(vpX + Math.cos(ang) * ringRadius, vpY + Math.sin(ang) * ringRadius * 0.65);
          ctx.stroke();
        }
      }
    }

    // 1. Horizon Anamorphic Laser Blade & Volumetric Rim Glow
    const horizonGrad = ctx.createLinearGradient(0, vpY - 20, 0, vpY + 28);
    horizonGrad.addColorStop(0, 'rgba(0,0,0,0)');
    horizonGrad.addColorStop(0.5, isForest ? 'rgba(52, 211, 153, 0.28)' : 'rgba(56, 189, 248, 0.25)');
    horizonGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = horizonGrad;
    ctx.fillRect(0, vpY - 20, this.width, 48);

    // Brilliant White-Hot Laser Horizon Line
    ctx.save();
    ctx.strokeStyle = neonPrimary;
    ctx.lineWidth = 1.4;
    ctx.shadowColor = neonPrimary;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(0, vpY);
    ctx.lineTo(this.width, vpY);
    ctx.stroke();
    ctx.restore();

    // 2. 3D Hyperspace Warp Rays (Streaming outward in 3D perspective from horizon vanishing point)
    const numSpeedRays = 14;
    ctx.save();
    for (let sr = 0; sr < numSpeedRays; sr++) {
      const angle = (sr / numSpeedRays) * Math.PI * 2 + (this.speedLinesPhase * 0.05);
      // Skip top sky sector
      if (Math.sin(angle) < -0.3) continue;

      const progress = ((sr * 0.17 + this.speedLinesPhase * 0.08) % 1);
      const innerDist = 40 + progress * 70;
      const outerDist = innerDist + 50 + progress * 160;
      const alpha = Math.sin(progress * Math.PI) * (this.player.dashTimer > 0 ? 0.65 : 0.28);

      ctx.strokeStyle = `${gridColorPrefix}${alpha})`;
      ctx.lineWidth = 1.0 + progress * 2.2;
      ctx.beginPath();
      ctx.moveTo(vpX + Math.cos(angle) * innerDist, vpY + Math.sin(angle) * innerDist * 0.6);
      ctx.lineTo(vpX + Math.cos(angle) * outerDist, vpY + Math.sin(angle) * outerDist * 0.6);
      ctx.stroke();
    }
    ctx.restore();

    // 3. 3D Radial Perspective Floor Beams (Vanishing Point to Floor Bounds)
    const numRays = 20;
    for (let r = 0; r <= numRays; r++) {
      const bottomX = (this.width / numRays) * r * 2.2 - this.width * 0.6;
      const distFromCenter = Math.abs(bottomX - vpX) / (this.width * 1.1);
      const alpha = Math.max(0.04, (1 - distFromCenter) * 0.28);

      ctx.strokeStyle = `${gridColorPrefix}${alpha})`;
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(vpX, vpY);
      ctx.lineTo(bottomX, floorY);
      ctx.stroke();
    }

    // 4. 3D Latitudinal Depth Rings with Ground Ripple under Player Ship
    const numRings = 14;
    for (let i = 0; i < numRings; i++) {
      const progress = ((i + this.gridScroll / 40) / numRings) % 1;
      const depthRatio = Math.pow(progress, 2.3);
      const y = vpY + (floorY - vpY) * depthRatio;
      const alpha = Math.max(0.02, depthRatio * 0.35);
      const lineWidth = Math.max(0.8, depthRatio * 2.4);

      // Localized engine wave distortion underneath the player
      const distToPlayerY = Math.abs(y - this.player.y);
      const engineDistortion = distToPlayerY < 80 ? Math.sin((80 - distToPlayerY) * 0.15 + this.gridPhase) * 6 : 0;
      const waveAmp = depthRatio * 7 + engineDistortion;

      ctx.strokeStyle = `${gridColorPrefix}${alpha})`;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();

      const span = this.width * (0.35 + depthRatio * 0.9);
      const startX = vpX - span;
      const endX = vpX + span;
      const steps = 16;
      const stepW = (endX - startX) / steps;

      for (let s = 0; s <= steps; s++) {
        const curX = startX + s * stepW;
        const curY = y + Math.sin(s * 0.55 + this.gridPhase) * waveAmp;
        if (s === 0) ctx.moveTo(curX, curY);
        else ctx.lineTo(curX, curY);
      }
      ctx.stroke();
    }

    // 5. Lateral 3D Cyber Railings & Perspective Altitude Columns (Left & Right Fences)
    [-1, 1].forEach((side) => {
      const numPosts = 7;
      const railTopY = vpY - 15;
      const railBottomY = floorY - 20;

      for (let p = 0; p < numPosts; p++) {
        const prog = Math.pow(p / numPosts, 1.8);
        const postX = vpX + side * (this.width * 0.44 + prog * (this.width * 0.12));
        const postBaseY = vpY + (railBottomY - vpY) * prog;
        const postHeight = 22 + prog * 65;
        const alpha = Math.max(0.05, prog * 0.45);

        // Vertical cyber column
        ctx.strokeStyle = `${gridColorPrefix}${alpha})`;
        ctx.lineWidth = Math.max(1, prog * 2.2);
        ctx.beginPath();
        ctx.moveTo(postX, postBaseY);
        ctx.lineTo(postX, postBaseY - postHeight);
        ctx.stroke();

        // Altitude beacon light at top of column
        ctx.fillStyle = neonPrimary;
        ctx.shadowColor = neonPrimary;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(postX, postBaseY - postHeight, Math.max(1.5, prog * 3), 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    });

    ctx.restore();
  }

  private renderMeteor(ctx: CanvasRenderingContext2D, m: MeteorEntity) {
    ctx.save();
    ctx.globalAlpha = m.alpha;
    const grad = ctx.createLinearGradient(m.x - m.vx * 0.15, m.y - m.vy * 0.15, m.x, m.y);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(0.7, m.color);
    grad.addColorStop(1, '#ffffff');

    ctx.strokeStyle = grad;
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.moveTo(m.x - m.vx * 0.15, m.y - m.vy * 0.15);
    ctx.lineTo(m.x, m.y);
    ctx.stroke();

    // Head spark flare
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(m.x, m.y, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private renderCelestialPlanet(ctx: CanvasRenderingContext2D, p: PlanetEntity) {
    ctx.save();
    ctx.globalAlpha = p.alpha;

    if (p.type === 'giant_sun') {
      // Radiant Solar Sun with Glowing Corona Flare
      const sunGrad = ctx.createRadialGradient(p.x, p.y, p.radius * 0.1, p.x, p.y, p.radius * 1.5);
      sunGrad.addColorStop(0, '#ffffff');
      sunGrad.addColorStop(0.25, '#fef08a');
      sunGrad.addColorStop(0.6, '#f97316');
      sunGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');

      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * 1.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // 3D Spherical Shading with Edge Atmosphere Halo
      const grad = ctx.createRadialGradient(
        p.x - p.radius * 0.35,
        p.y - p.radius * 0.35,
        p.radius * 0.08,
        p.x,
        p.y,
        p.radius
      );
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.35, p.color);
      grad.addColorStop(0.85, '#091124');
      grad.addColorStop(1, '#040712');

      // Atmospheric rim halo
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 18;
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Special Planet Sahabat KAFA Surface Continents & Night City Clusters
      if (p.type === 'sahabat_kafa_planet' || p.label?.includes('SAHABAT KAFA')) {
        // Glowing Emerald Continents
        ctx.fillStyle = 'rgba(16, 185, 129, 0.28)';
        ctx.beginPath();
        ctx.ellipse(p.x - p.radius * 0.22, p.y - p.radius * 0.12, p.radius * 0.42, p.radius * 0.26, 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(p.x + p.radius * 0.26, p.y + p.radius * 0.22, p.radius * 0.38, p.radius * 0.22, -0.3, 0, Math.PI * 2);
        ctx.fill();

        // Golden City Clusters (Night Side)
        const citySpots = [
          { cx: p.x - p.radius * 0.16, cy: p.y - p.radius * 0.08 },
          { cx: p.x - p.radius * 0.06, cy: p.y - p.radius * 0.24 },
          { cx: p.x + p.radius * 0.18, cy: p.y + p.radius * 0.14 },
          { cx: p.x + p.radius * 0.32, cy: p.y + p.radius * 0.06 },
        ];
        ctx.fillStyle = '#fef08a';
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 5;
        for (const cs of citySpots) {
          ctx.beginPath();
          ctx.arc(cs.cx, cs.cy, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.shadowBlur = 0;
      }

      // Subtle atmospheric cloud streaks
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y - p.radius * 0.2, p.radius * 0.85, p.radius * 0.2, 0.1, 0, Math.PI * 2);
      ctx.stroke();

      // Translucent Planetary Rings (with planet shadow cast!)
      if (p.ringColor) {
        ctx.strokeStyle = p.ringColor;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, p.radius * 1.7, p.radius * 0.45, -0.32, 0, Math.PI * 2);
        ctx.stroke();

        // Inner ring lane
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, p.radius * 1.45, p.radius * 0.38, -0.32, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Majestic Orbital Holographic Banner for PLANET SAHABAT KAFA
      if (p.orbitalRingText || p.type === 'sahabat_kafa_planet') {
        const ringText = p.orbitalRingText || '★ PLANET SAHABAT KAFA ★';
        ctx.save();
        ctx.translate(p.x, p.y + p.radius * 0.65);

        // Holographic Badge backing
        ctx.fillStyle = 'rgba(2, 6, 23, 0.8)';
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.7)';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.roundRect(-80, -12, 160, 24, 12);
        ctx.fill();
        ctx.stroke();

        // Glowing Holographic Name
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#67e8f9';
        ctx.font = '900 10.5px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(ringText, 0, 0);
        ctx.restore();
      }
    }

    ctx.restore();
  }

  // ==================== HERO STAR FIGHTER RENDERING ====================
  private renderHeroShip(ctx: CanvasRenderingContext2D) {
    const p = this.player;

    if (p.invulnerableTimer > 0 && Math.floor(Date.now() / 80) % 2 === 0) {
      return;
    }

    const skin = SHIP_SKINS.find((s) => s.id === p.skin) || SHIP_SKINS[0];

    // Subtle idle hover floating breathing motion
    const idleY = Math.sin(p.idleHoverPhase) * 2.8;

    // 0. 3D Ground Drop Shadow (Real physical floor elevation & 3D grounding)
    ctx.save();
    ctx.fillStyle = 'rgba(2, 6, 23, 0.58)';
    ctx.beginPath();
    ctx.ellipse(p.x, p.y + 44, 36 + Math.abs(p.vx) * 0.05, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(p.x, p.y + p.recoilOffset + idleY);
    ctx.rotate(p.tilt);

    // 1. Dual High-Energy Plasma Engines Multi-Stage Plumes
    const isMoving = Math.abs(p.vx) > 20;
    const flameBase = isMoving ? 26 : 20;
    const pulseFl = Math.sin(p.idleHoverPhase * 8) * 3.5;
    const flameHeight = flameBase + pulseFl + Math.random() * 5;

    // 1. Dynamic Exhaust Nozzle Positions & Multi-Stage Plumes per Aircraft Skin
    let enginePositions = [-15, 15];
    if (skin.id === 'valkyrie') enginePositions = [-16, 0, 16];
    else if (skin.id === 'apocalypse') enginePositions = [-18, 18];
    else if (skin.id === 'nova') enginePositions = [-17, 0, 17];
    else if (skin.id === 'titan') enginePositions = [-20, -8, 8, 20];
    else if (skin.id === 'phantom') enginePositions = [-14, 14];

    enginePositions.forEach((exX) => {
      // Outer radiant flare
      const outerGrad = ctx.createLinearGradient(exX, 16, exX, 16 + flameHeight);
      outerGrad.addColorStop(0, skin.accentColor);
      outerGrad.addColorStop(0.4, skin.primaryColor);
      outerGrad.addColorStop(1, 'rgba(0, 240, 255, 0)');

      ctx.fillStyle = outerGrad;
      ctx.beginPath();
      ctx.moveTo(exX - 6, 16);
      ctx.lineTo(exX + 6, 16);
      ctx.lineTo(exX, 16 + flameHeight);
      ctx.closePath();
      ctx.fill();

      // Middle plasma flame
      const midGrad = ctx.createLinearGradient(exX, 16, exX, 16 + flameHeight * 0.75);
      midGrad.addColorStop(0, '#ffffff');
      midGrad.addColorStop(0.5, skin.primaryColor);
      midGrad.addColorStop(1, 'rgba(0, 240, 255, 0)');

      ctx.fillStyle = midGrad;
      ctx.beginPath();
      ctx.moveTo(exX - 4, 16);
      ctx.lineTo(exX + 4, 16);
      ctx.lineTo(exX, 16 + flameHeight * 0.75);
      ctx.closePath();
      ctx.fill();

      // Inner white-hot electric core diamond
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(exX - 2, 16);
      ctx.lineTo(exX + 2, 16);
      ctx.lineTo(exX, 16 + flameHeight * 0.45);
      ctx.closePath();
      ctx.fill();

      // 3D Mach Shock Diamonds trailing in perspective
      if (this.is3DVisualEnabled) {
        for (let md = 1; md <= 3; md++) {
          const mdY = 16 + md * (flameHeight * 0.28);
          const mdSize = Math.max(1, 4.5 - md * 1.1);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.beginPath();
          ctx.moveTo(exX, mdY - mdSize);
          ctx.lineTo(exX + mdSize, mdY);
          ctx.lineTo(exX, mdY + mdSize);
          ctx.lineTo(exX - mdSize, mdY);
          ctx.closePath();
          ctx.fill();
        }
      }

      // Engine Exhaust Nozzle Ring
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(exX - 5, 13, 10, 4);
      ctx.strokeStyle = skin.primaryColor;
      ctx.lineWidth = 1.2;
      ctx.strokeRect(exX - 5, 13, 10, 4);
    });

    // 1b. Wingtip Vapor Contrails & Hypersonic Exhaust Particles
    if (isMoving || p.dashTimer > 0) {
      const tipX = skin.id === 'titan' ? 38 : skin.id === 'valkyrie' ? 42 : skin.id === 'apocalypse' ? 40 : 36;
      [-tipX, tipX].forEach((tx) => {
        if (Math.random() < 0.45) {
          this.particles.push({
            x: p.x + tx + (Math.random() - 0.5) * 4,
            y: p.y + 14,
            vx: -p.vx * 0.05,
            vy: Math.random() * 40 + 40,
            size: Math.random() * 2 + 1,
            color: skin.trailColor,
            life: 0,
            maxLife: 0.22,
            alpha: 0.75,
            type: 'trail',
          });
        }
      });
    }

    // 2. Distinctive Airframe Geometries per Fighter Model
    ctx.fillStyle = skin.secondaryColor;
    ctx.strokeStyle = skin.primaryColor;
    ctx.lineWidth = 2.4;

    if (skin.id === 'valkyrie') {
      // ===== KAFA VALKYRIE: Angelic Celestial Hyper-Cruiser =====
      ctx.beginPath();
      ctx.moveTo(0, -38);
      ctx.lineTo(12, -18);
      ctx.lineTo(26, -14);
      ctx.lineTo(42, 4);
      ctx.lineTo(40, 18);
      ctx.lineTo(28, 16);
      ctx.lineTo(24, 24);
      ctx.lineTo(14, 20);
      ctx.lineTo(0, 22);
      ctx.lineTo(-14, 20);
      ctx.lineTo(-24, 24);
      ctx.lineTo(-28, 16);
      ctx.lineTo(-40, 18);
      ctx.lineTo(-42, 4);
      ctx.lineTo(-26, -14);
      ctx.lineTo(-12, -18);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Golden Holy Halo above nose tip
      ctx.save();
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2.0;
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(0, -44, 9, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Angelic feather photon blade wingtips
      ctx.fillStyle = skin.accentColor;
      ctx.beginPath(); ctx.moveTo(40, 2); ctx.lineTo(46, 6); ctx.lineTo(42, 18); ctx.lineTo(38, 16); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-40, 2); ctx.lineTo(-46, 6); ctx.lineTo(-42, 18); ctx.lineTo(-38, 16); ctx.closePath(); ctx.fill();

      // Celestial white dorsal spine
      ctx.fillStyle = skin.trimColor || '#ffffff';
      ctx.beginPath(); ctx.moveTo(0, -34); ctx.lineTo(8, -8); ctx.lineTo(14, 8); ctx.lineTo(0, 14); ctx.lineTo(-14, 8); ctx.lineTo(-8, -8); ctx.closePath(); ctx.fill();

    } else if (skin.id === 'apocalypse') {
      // ===== KAFA APOCALYPSE: Dark Matter Dragonwing =====
      ctx.beginPath();
      ctx.moveTo(0, -40);
      ctx.lineTo(10, -22);
      ctx.lineTo(22, -18);
      ctx.lineTo(42, -2);
      ctx.lineTo(36, 10);
      ctx.lineTo(44, 18);
      ctx.lineTo(26, 20);
      ctx.lineTo(18, 24);
      ctx.lineTo(0, 20);
      ctx.lineTo(-18, 24);
      ctx.lineTo(-26, 20);
      ctx.lineTo(-44, 18);
      ctx.lineTo(-36, 10);
      ctx.lineTo(-42, -2);
      ctx.lineTo(-22, -18);
      ctx.lineTo(-10, -22);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Crimson dragon blade tips
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath(); ctx.moveTo(40, -4); ctx.lineTo(48, -2); ctx.lineTo(42, 14); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-40, -4); ctx.lineTo(-48, -2); ctx.lineTo(-42, 14); ctx.closePath(); ctx.fill();

      // Dark matter glowing spine
      ctx.fillStyle = '#e11d48';
      ctx.beginPath(); ctx.moveTo(0, -36); ctx.lineTo(6, -12); ctx.lineTo(12, 6); ctx.lineTo(0, 16); ctx.lineTo(-12, 6); ctx.lineTo(-6, -12); ctx.closePath(); ctx.fill();

    } else if (skin.id === 'phantom') {
      // ===== KAFA PHANTOM: Stealth Void Interceptor =====
      ctx.beginPath();
      ctx.moveTo(0, -38);
      ctx.lineTo(14, -12);
      ctx.lineTo(38, 2);
      ctx.lineTo(32, 22);
      ctx.lineTo(20, 18);
      ctx.lineTo(14, 24);
      ctx.lineTo(0, 18);
      ctx.lineTo(-14, 24);
      ctx.lineTo(-20, 18);
      ctx.lineTo(-32, 22);
      ctx.lineTo(-38, 2);
      ctx.lineTo(-14, -12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Violet stealth wing foils
      ctx.fillStyle = skin.accentColor;
      ctx.beginPath(); ctx.moveTo(36, 0); ctx.lineTo(40, 4); ctx.lineTo(34, 22); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-36, 0); ctx.lineTo(-40, 4); ctx.lineTo(-34, 22); ctx.closePath(); ctx.fill();

      // Obsidian spine
      ctx.fillStyle = skin.trimColor;
      ctx.beginPath(); ctx.moveTo(0, -32); ctx.lineTo(6, -8); ctx.lineTo(10, 6); ctx.lineTo(0, 12); ctx.lineTo(-10, 6); ctx.lineTo(-6, -8); ctx.closePath(); ctx.fill();

    } else if (skin.id === 'nova') {
      // ===== KAFA NOVA: Solar Vanguard Delta =====
      ctx.beginPath();
      ctx.moveTo(0, -38);
      ctx.lineTo(16, -10);
      ctx.lineTo(36, 14);
      ctx.lineTo(28, 22);
      ctx.lineTo(18, 18);
      ctx.lineTo(0, 22);
      ctx.lineTo(-18, 18);
      ctx.lineTo(-28, 22);
      ctx.lineTo(-36, 14);
      ctx.lineTo(-16, -10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Fiery solar wing vents
      ctx.fillStyle = skin.accentColor;
      ctx.beginPath(); ctx.moveTo(34, 12); ctx.lineTo(38, 14); ctx.lineTo(30, 24); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-34, 12); ctx.lineTo(-38, 14); ctx.lineTo(-30, 24); ctx.closePath(); ctx.fill();

      // Golden solar dorsal armor
      ctx.fillStyle = skin.trimColor;
      ctx.beginPath(); ctx.moveTo(0, -32); ctx.lineTo(8, -10); ctx.lineTo(14, 6); ctx.lineTo(0, 14); ctx.lineTo(-14, 6); ctx.lineTo(-8, -10); ctx.closePath(); ctx.fill();

    } else if (skin.id === 'titan') {
      // ===== KAFA TITAN: Heavy Dreadwing =====
      ctx.beginPath();
      ctx.moveTo(0, -36);
      ctx.lineTo(12, -24);
      ctx.lineTo(24, -20);
      ctx.lineTo(26, -8);
      ctx.lineTo(40, 8);
      ctx.lineTo(34, 24);
      ctx.lineTo(22, 20);
      ctx.lineTo(12, 24);
      ctx.lineTo(0, 20);
      ctx.lineTo(-12, 24);
      ctx.lineTo(-22, 20);
      ctx.lineTo(-34, 24);
      ctx.lineTo(-40, 8);
      ctx.lineTo(-26, -8);
      ctx.lineTo(-24, -20);
      ctx.lineTo(-12, -24);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Heavy armor plates
      ctx.fillStyle = skin.accentColor;
      ctx.fillRect(-22, -18, 4, 12);
      ctx.fillRect(18, -18, 4, 12);

      // Heavy emerald dorsal armor
      ctx.fillStyle = skin.trimColor;
      ctx.beginPath(); ctx.moveTo(0, -30); ctx.lineTo(10, -10); ctx.lineTo(16, 4); ctx.lineTo(0, 14); ctx.lineTo(-16, 4); ctx.lineTo(-10, -10); ctx.closePath(); ctx.fill();

    } else {
      // ===== PIONEER: Classic Supersonic Interceptor =====
      ctx.beginPath();
      ctx.moveTo(0, -36);
      ctx.lineTo(10, -14);
      ctx.lineTo(16, -12);
      ctx.lineTo(14, -6);
      ctx.lineTo(18, -4);
      ctx.lineTo(36, 12);
      ctx.lineTo(34, 22);
      ctx.lineTo(24, 18);
      ctx.lineTo(18, 22);
      ctx.lineTo(11, 16);
      ctx.lineTo(0, 20);
      ctx.lineTo(-11, 16);
      ctx.lineTo(-18, 22);
      ctx.lineTo(-24, 18);
      ctx.lineTo(-34, 22);
      ctx.lineTo(-36, 12);
      ctx.lineTo(-18, -4);
      ctx.lineTo(-14, -6);
      ctx.lineTo(-16, -12);
      ctx.lineTo(-10, -14);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Cyan foils
      ctx.fillStyle = skin.primaryColor;
      ctx.beginPath(); ctx.moveTo(34, 10); ctx.lineTo(38, 12); ctx.lineTo(35, 23); ctx.lineTo(31, 21); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-34, 10); ctx.lineTo(-38, 12); ctx.lineTo(-35, 23); ctx.lineTo(-31, 21); ctx.closePath(); ctx.fill();

      // Titanium spine
      ctx.fillStyle = skin.trimColor || '#ffffff';
      ctx.beginPath(); ctx.moveTo(0, -32); ctx.lineTo(7, -10); ctx.lineTo(16, 4); ctx.lineTo(11, 12); ctx.lineTo(0, 14); ctx.lineTo(-11, 12); ctx.lineTo(-16, 4); ctx.lineTo(-7, -10); ctx.closePath(); ctx.fill();
    }

    // 3b. Aerospace Navigation Strobe Lights (Blinking beacons)
    const isStrobeOn = Math.floor(Date.now() / 450) % 2 === 0;
    if (isStrobeOn) {
      ctx.fillStyle = '#ef4444';
      ctx.shadowColor = '#f87171';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(-36, 12, 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#10b981';
      ctx.shadowColor = '#34d399';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(36, 12, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // 7. Twin Wing Plasma Laser Cannons
    ctx.fillStyle = p.activeWeapon === 'energy_blast' ? '#f59e0b' : '#334155';
    ctx.fillRect(-27, -16, 4, 20);
    ctx.fillRect(23, -16, 4, 20);

    // Glowing cannon tips
    ctx.fillStyle = p.recoilOffset > 2 ? '#ffffff' : skin.primaryColor;
    ctx.fillRect(-27, -18, 4, 3.5);
    ctx.fillRect(23, -18, 4, 3.5);

    // 8. PS5 3D Cockpit Canopy with Dynamic Roll Perspective & Specular Arc
    const roll3D = p.tilt * 1.4;
    const cosRoll = Math.cos(roll3D);
    const sinRoll = Math.sin(roll3D);
    const cockpitShiftX = -sinRoll * 5;

    ctx.save();
    ctx.translate(cockpitShiftX, 0);

    const canopyGrad = ctx.createLinearGradient(0, -24, 0, 4);
    canopyGrad.addColorStop(0, '#ffffff');
    canopyGrad.addColorStop(0.3, skin.cockpitColor);
    canopyGrad.addColorStop(0.8, skin.secondaryColor);
    canopyGrad.addColorStop(1, '#020617');

    ctx.fillStyle = canopyGrad;
    ctx.beginPath();
    ctx.ellipse(0, -7, Math.max(3, 7.5 * Math.abs(cosRoll)), 15, -sinRoll * 0.15, 0, Math.PI * 2);
    ctx.fill();

    // Cockpit chrome rim outline
    ctx.strokeStyle = skin.primaryColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 3D Curved Specular Glare Arc shifting with roll angle
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(-sinRoll * 2, -7, Math.max(2, 5.5 * Math.abs(cosRoll)), -Math.PI * 0.75, -Math.PI * 0.2);
    ctx.stroke();

    // Pilot HUD scanlines inside canopy
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 0.8;
    for (let sl = -12; sl <= 0; sl += 4) {
      ctx.beginPath();
      ctx.moveTo(-4 * Math.abs(cosRoll), sl);
      ctx.lineTo(4 * Math.abs(cosRoll), sl);
      ctx.stroke();
    }
    ctx.restore();

    // 3D Tactical Flight Crosshair & Lead Reticle
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(p.vx * 0.03, -54, 10, 0, Math.PI * 2);
    ctx.moveTo(p.vx * 0.03, -68);
    ctx.lineTo(p.vx * 0.03, -40);
    ctx.moveTo(p.vx * 0.03 - 14, -54);
    ctx.lineTo(p.vx * 0.03 + 14, -54);
    ctx.stroke();

    // Inner Holographic Pilot Console Glow
    ctx.fillStyle = 'rgba(103, 232, 249, 0.85)';
    ctx.beginPath();
    ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // 9. Protective Shield Bubble with Rotating Hexagonal Ripple
    if (this.activePowerUps.shieldActive || p.shieldHp > 0) {
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.9)';
      ctx.fillStyle = 'rgba(52, 211, 153, 0.15)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, -2, 42, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Hexagonal energy facet rings
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.5)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let h = 0; h < 6; h++) {
        const hAng = (h * Math.PI) / 3 + p.idleHoverPhase;
        const hx = Math.cos(hAng) * 42;
        const hy = Math.sin(hAng) * 42 - 2;
        if (h === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.stroke();
    }

    // 9b. Mode Dewa: Divine Golden Aura Barrier with Rotating Sacred Runes & Halo
    if (this.isGodMode) {
      const auraPulse = (Math.sin(Date.now() * 0.005) + 1) * 0.5;
      const auraGrad = ctx.createRadialGradient(0, -2, 20, 0, -2, 52);
      auraGrad.addColorStop(0, 'rgba(250, 204, 21, 0.06)');
      auraGrad.addColorStop(0.7, `rgba(250, 204, 21, ${0.16 + auraPulse * 0.12})`);
      auraGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(0, -2, 52, 0, Math.PI * 2);
      ctx.fill();

      // Outer glowing golden ring
      ctx.strokeStyle = `rgba(250, 204, 21, ${0.65 + auraPulse * 0.3})`;
      ctx.lineWidth = 2.0;
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(0, -2, 45 + auraPulse * 2.5, 0, Math.PI * 2);
      ctx.stroke();

      // Rotating sacred sparkles
      for (let r = 0; r < 4; r++) {
        const rAng = (r * Math.PI) / 2 + Date.now() * 0.003;
        const rx = Math.cos(rAng) * 45;
        const ry = Math.sin(rAng) * 45 - 2;
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(rx, ry, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    }

    // 10. Ultimate Cosmic Aura (when Galaxy Breaker is 100% ready)
    if (this.stats.galaxyBreakerReady || this.stats.novaStrikeReady) {
      ctx.save();
      const auraPulse = (Math.sin(Date.now() * 0.008) + 1) * 0.5;
      const auraRadius = 46 + auraPulse * 8;
      const auraGrad = ctx.createRadialGradient(0, -2, 25, 0, -2, auraRadius);
      auraGrad.addColorStop(0, 'rgba(0, 240, 255, 0)');
      auraGrad.addColorStop(0.5, `rgba(0, 240, 255, ${0.35 + auraPulse * 0.3})`);
      auraGrad.addColorStop(0.85, `rgba(168, 85, 247, ${0.4 + auraPulse * 0.35})`);
      auraGrad.addColorStop(1, 'rgba(236, 72, 153, 0)');

      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(0, -2, auraRadius, 0, Math.PI * 2);
      ctx.fill();

      // Rotating celestial energy rings
      ctx.strokeStyle = `rgba(0, 240, 255, ${0.6 + auraPulse * 0.4})`;
      ctx.lineWidth = 1.6;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.arc(0, -2, 44, (Date.now() * 0.002) % (Math.PI * 2), (Date.now() * 0.002) % (Math.PI * 2) + Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // 11. Thunder Rail Charging Glow & Muzzle Arc
    if (p.thunderRailCharging) {
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(0, -36, 9, 0, Math.PI * 2);
      ctx.fill();

      // Wing charging arcs
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(-30, 8);
      ctx.lineTo(0, -36);
      ctx.lineTo(30, 8);
      ctx.stroke();
      ctx.restore();
    }

    // 12. Cosmic Sword Plasma Blade extending forward
    if (p.cosmicSwordActive) {
      ctx.save();
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 20;

      // Radiant energy blade
      const swordGrad = ctx.createLinearGradient(0, -36, 0, -100);
      swordGrad.addColorStop(0, '#ffffff');
      swordGrad.addColorStop(0.3, '#facc15');
      swordGrad.addColorStop(0.7, '#f59e0b');
      swordGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');

      ctx.fillStyle = swordGrad;
      ctx.beginPath();
      ctx.moveTo(-8, -36);
      ctx.lineTo(0, -105);
      ctx.lineTo(8, -36);
      ctx.closePath();
      ctx.fill();

      // Crescent slash energy winglets
      ctx.strokeStyle = 'rgba(254, 240, 138, 0.9)';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(0, -60, 28, -Math.PI * 0.8, -Math.PI * 0.2);
      ctx.stroke();

      ctx.restore();
    }

    ctx.restore();
  }

  // ==================== PS5 3D COCKPIT FPV PILOT VIEW ====================
  private renderCockpitFPV(ctx: CanvasRenderingContext2D) {
    const w = this.width;
    const h = this.height;
    const p = this.player;
    const skin = SHIP_SKINS.find((s) => s.id === p.skin) || SHIP_SKINS[0];

    ctx.save();

    // 1. Cockpit Canopy Glass Tint & Edge Vignette
    const glassGrad = ctx.createRadialGradient(w / 2, h * 0.45, w * 0.15, w / 2, h * 0.45, w * 0.85);
    glassGrad.addColorStop(0, 'rgba(2, 6, 23, 0.02)');
    glassGrad.addColorStop(0.7, 'rgba(6, 182, 212, 0.05)');
    glassGrad.addColorStop(1, 'rgba(2, 6, 23, 0.45)');
    ctx.fillStyle = glassGrad;
    ctx.fillRect(0, 0, w, h);

    // Dynamic curved canopy specular glare (shifts as the ship turns)
    const glareOffset = (p.vx / p.speed) * 45;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(w / 2 + glareOffset, -h * 0.2, w * 0.75, Math.PI * 0.2, Math.PI * 0.8);
    ctx.stroke();

    // 2. 3D Fighter Canopy Structural Airframe
    ctx.fillStyle = '#060a17';
    ctx.strokeStyle = skin.primaryColor;
    ctx.lineWidth = 2.0;

    // Left Canopy Pillar
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(w * 0.18, 0);
    ctx.lineTo(w * 0.12, 0);
    ctx.lineTo(0, h * 0.7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Right Canopy Pillar
    ctx.beginPath();
    ctx.moveTo(w, h);
    ctx.lineTo(w * 0.82, 0);
    ctx.lineTo(w * 0.88, 0);
    ctx.lineTo(w, h * 0.7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Top Overhead Arch Canopy Strut
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(w, 0);
    ctx.lineTo(w * 0.82, 38);
    ctx.lineTo(w * 0.18, 38);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Interior Ambient Neon Strip along cockpit rim
    ctx.strokeStyle = skin.accentColor;
    ctx.lineWidth = 1.6;
    ctx.shadowColor = skin.accentColor;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(w * 0.19, 36);
    ctx.lineTo(w * 0.81, 36);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 2b. Overhead Scrolling Tactical Compass Tape (360° Nav Heading)
    ctx.save();
    const compassW = Math.min(260, w * 0.5);
    const compassX = (w - compassW) / 2;
    ctx.fillStyle = 'rgba(2, 6, 23, 0.82)';
    ctx.strokeStyle = skin.primaryColor;
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.roundRect(compassX, 10, compassW, 20, 5);
    ctx.fill();
    ctx.stroke();

    // Compass Tape Tick Marks & Cardinal Directions
    ctx.save();
    ctx.beginPath();
    ctx.rect(compassX + 2, 11, compassW - 4, 18);
    ctx.clip();

    const headingOffset = ((p.vx / p.speed) * 90 - this.cameraRoll * 60) % 360;
    const compassStep = 30;
    ctx.font = 'bold 8px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let deg = -180; deg <= 540; deg += compassStep) {
      const relDeg = (deg - headingOffset);
      const tickX = w / 2 + (relDeg / 60) * (compassW * 0.4);
      if (tickX >= compassX - 20 && tickX <= compassX + compassW + 20) {
        ctx.strokeStyle = deg % 90 === 0 ? '#38bdf8' : 'rgba(148, 163, 184, 0.45)';
        ctx.lineWidth = deg % 90 === 0 ? 1.5 : 0.8;
        ctx.beginPath();
        ctx.moveTo(tickX, 12);
        ctx.lineTo(tickX, deg % 90 === 0 ? 20 : 16);
        ctx.stroke();

        const label = deg % 360 === 0 ? 'N' : deg % 360 === 90 ? 'E' : deg % 360 === 180 ? 'S' : deg % 360 === 270 ? 'W' : `${((deg % 360 + 360) % 360)}`;
        ctx.fillStyle = deg % 90 === 0 ? '#facc15' : '#94a3b8';
        ctx.fillText(label, tickX, 23);
      }
    }
    ctx.restore();

    // Center Heading Lubber Line Diamond
    ctx.fillStyle = '#00f0ff';
    ctx.beginPath();
    ctx.moveTo(w / 2, 10);
    ctx.lineTo(w / 2 + 4, 6);
    ctx.lineTo(w / 2 - 4, 6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 2c. Twin Canopy Wing Plasma Cannons (Nose housings)
    [-1, 1].forEach((side) => {
      const gunX = side === -1 ? w * 0.13 : w * 0.87;
      const gunY = h - 65;
      const recoilY = (p.recoilOffset > 0 ? p.recoilOffset * 2.2 : 0);

      ctx.save();
      ctx.translate(gunX, gunY + recoilY);
      ctx.rotate(side * 0.12);

      // Gun Heavy Mount Housing
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = skin.primaryColor;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.roundRect(-8, -25, 16, 45, 4);
      ctx.fill();
      ctx.stroke();

      // Gun Heat Heat-Sink Vents
      ctx.fillStyle = '#334155';
      for (let v = -18; v <= 5; v += 6) {
        ctx.fillRect(-6, v, 12, 2.5);
      }

      // Gun Muzzle Tip
      ctx.fillStyle = p.recoilOffset > 1.5 ? '#ffffff' : skin.accentColor;
      ctx.fillRect(-5, -30, 10, 6);

      // Firing Muzzle Flash & Laser Bloom
      if (p.recoilOffset > 1.2) {
        ctx.fillStyle = '#00f0ff';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.arc(0, -32, 10, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, -32, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      ctx.restore();
    });

    // 3. Lower Flight Avionics Dashboard Console
    const dashY = h - 95;
    const dashGrad = ctx.createLinearGradient(0, dashY, 0, h);
    dashGrad.addColorStop(0, '#090d1a');
    dashGrad.addColorStop(0.3, '#0b1329');
    dashGrad.addColorStop(1, '#030712');
    ctx.fillStyle = dashGrad;
    ctx.strokeStyle = skin.primaryColor;
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(w * 0.12, dashY + 30);
    ctx.lineTo(w * 0.28, dashY);
    ctx.lineTo(w * 0.72, dashY);
    ctx.lineTo(w * 0.88, dashY + 30);
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 3b. Left Avionics Console: Real-Time Tactical Mini-Radar
    const radarX = w * 0.20;
    const radarY = dashY + 45;
    const radarR = 24;

    ctx.save();
    // Radar Scope Glass
    const rGrad = ctx.createRadialGradient(radarX, radarY, 2, radarX, radarY, radarR);
    rGrad.addColorStop(0, '#022c22');
    rGrad.addColorStop(0.7, '#064e3b');
    rGrad.addColorStop(1, '#021812');
    ctx.fillStyle = rGrad;
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(radarX, radarY, radarR, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Radar Concentric Range Rings
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.35)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.arc(radarX, radarY, radarR * 0.5, 0, Math.PI * 2);
    ctx.stroke();

    // Crosshairs
    ctx.beginPath();
    ctx.moveTo(radarX - radarR, radarY);
    ctx.lineTo(radarX + radarR, radarY);
    ctx.moveTo(radarX, radarY - radarR);
    ctx.lineTo(radarX, radarY + radarR);
    ctx.stroke();

    // Rotating Radar Sweep Arm
    const sweepAng = (Date.now() * 0.0035) % (Math.PI * 2);
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(radarX, radarY);
    ctx.lineTo(radarX + Math.cos(sweepAng) * radarR, radarY + Math.sin(sweepAng) * radarR);
    ctx.stroke();

    // Plot Real-Time Target Blips on Radar
    for (const t of this.targets) {
      const relX = ((t.x - p.x) / (w * 0.6)) * (radarR * 0.8);
      const relY = ((t.y - (h * 0.5)) / (h * 0.6)) * (radarR * 0.8);
      const blipDist = Math.hypot(relX, relY);
      if (blipDist <= radarR - 2) {
        ctx.fillStyle = t.isCorrect ? '#00f0ff' : '#f43f5e';
        ctx.beginPath();
        ctx.arc(radarX + relX, radarY + relY, t.isCorrect ? 2.5 : 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // Plot Alien Fighters Blips on Radar
    for (const a of this.alienFighters) {
      const relX = ((a.x - p.x) / (w * 0.6)) * (radarR * 0.8);
      const relY = ((a.y - (h * 0.5)) / (h * 0.6)) * (radarR * 0.8);
      if (Math.hypot(relX, relY) <= radarR - 2) {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(radarX + relX, radarY + relY, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 7px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('RADAR 360°', radarX, radarY + radarR + 8);
    ctx.restore();

    // 3c. Right Avionics Console: 3-Axis G-Force & Engine Gyro Gauge
    const gaugeX = w * 0.80;
    const gaugeY = dashY + 45;
    const gaugeR = 24;

    ctx.save();
    ctx.fillStyle = '#090d16';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(gaugeX, gaugeY, gaugeR, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    const gVal = (1.0 + Math.abs(p.vx) / 85 + (p.recoilOffset > 2 ? 1.4 : 0)).toFixed(1);
    const gPct = Math.min(1.0, parseFloat(gVal) / 6.0);

    // Arc meter
    ctx.strokeStyle = parseFloat(gVal) > 4 ? '#ef4444' : '#facc15';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(gaugeX, gaugeY, gaugeR - 4, Math.PI * 0.75, Math.PI * 0.75 + gPct * Math.PI * 1.5);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 10px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${gVal}G`, gaugeX, gaugeY + 3);

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 7px Orbitron, sans-serif';
    ctx.fillText('G-FORCE', gaugeX, gaugeY + gaugeR + 8);
    ctx.restore();

    // Center Tactical Avionics Status Displays on Dash
    ctx.fillStyle = '#38bdf8';
    ctx.font = '900 8.5px Orbitron, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('SYS: PS5 FLIGHT LINK', w * 0.28, dashY + 20);
    ctx.fillStyle = skin.accentColor;
    ctx.fillText(`AIRFRAME: ${skin.name.toUpperCase()}`, w * 0.28, dashY + 34);

    // Center-Right Dash Sensor readout
    ctx.textAlign = 'right';
    ctx.fillStyle = this.isGodMode ? '#facc15' : '#34d399';
    ctx.fillText(this.isGodMode ? 'SHIELD: DEWA [∞]' : `SHIELD: ${Math.round(p.shieldHp)} HP`, w * 0.72, dashY + 20);
    ctx.fillStyle = '#a855f7';
    ctx.fillText(`WEAPON: ${p.activeWeapon.toUpperCase()}`, w * 0.72, dashY + 34);

    // 4. Center 3D Animated Flight Joystick / Throttle Stick
    const stickX = w / 2 + (p.vx / p.speed) * 28;
    const stickY = dashY + 45;
    ctx.save();
    ctx.translate(stickX, stickY);
    ctx.rotate((p.vx / p.speed) * 0.25);

    // Joystick rubber boot
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.ellipse(0, 20, 22, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Grip handle
    const gripGrad = ctx.createLinearGradient(-10, -35, 10, 20);
    gripGrad.addColorStop(0, '#334155');
    gripGrad.addColorStop(0.5, '#0f172a');
    gripGrad.addColorStop(1, '#020617');
    ctx.fillStyle = gripGrad;
    ctx.beginPath();
    ctx.roundRect(-8, -32, 16, 44, 4);
    ctx.fill();

    // Weapon trigger button
    ctx.fillStyle = p.recoilOffset > 2 ? '#ef4444' : skin.primaryColor;
    ctx.beginPath();
    ctx.arc(0, -32, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 5. Collimated Holographic HUD (Projected on Glass Canopy)
    const hudCenterX = w / 2;
    const hudCenterY = h * 0.46 + this.cameraPitch * 100;

    ctx.save();
    ctx.translate(hudCenterX, hudCenterY);
    ctx.rotate(-this.cameraRoll * 1.4);

    // Artificial Horizon & Pitch Ladder
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.65)';
    ctx.lineWidth = 1.4;
    // Central Horizon Bar
    ctx.beginPath();
    ctx.moveTo(-70, 0);
    ctx.lineTo(-20, 0);
    ctx.moveTo(20, 0);
    ctx.lineTo(70, 0);
    ctx.stroke();

    // Pitch Ladder Rungs (+10, -10 degrees)
    [-30, 30].forEach((rungY) => {
      ctx.beginPath();
      ctx.moveTo(-35, rungY);
      ctx.lineTo(-15, rungY);
      ctx.lineTo(-15, rungY + (rungY > 0 ? -4 : 4));
      ctx.moveTo(35, rungY);
      ctx.lineTo(15, rungY);
      ctx.lineTo(15, rungY + (rungY > 0 ? -4 : 4));
      ctx.stroke();
    });

    // Flight Path Vector Reticle (Velocity Direction)
    const fpvX = (p.vx / p.speed) * 35;
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(fpvX, 0, 7, 0, Math.PI * 2);
    ctx.moveTo(fpvX - 12, 0);
    ctx.lineTo(fpvX - 7, 0);
    ctx.moveTo(fpvX + 7, 0);
    ctx.lineTo(fpvX + 12, 0);
    ctx.moveTo(fpvX, -7);
    ctx.lineTo(fpvX, -12);
    ctx.stroke();

    // Collimated Center Gun Pipper
    ctx.fillStyle = '#00f0ff';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();

    // 6. Dynamic 3D Target Lock Box Tracking Active Hijaiyah Mission
    const correctTarget = this.targets.find((t) => t.isCorrect);
    if (correctTarget) {
      ctx.save();
      const targetScreenX = correctTarget.x;
      const targetScreenY = correctTarget.y;
      const distToPlayer = Math.hypot(p.x - targetScreenX, p.y - targetScreenY);

      // Spinning 3D Lock Diamond Brackets
      const lockAngle = Date.now() * 0.003;
      const boxSize = 28 + Math.sin(Date.now() * 0.008) * 3;

      ctx.translate(targetScreenX, targetScreenY);
      ctx.rotate(lockAngle);
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2.0;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 12;

      // 4 Corner Brackets
      const c = boxSize;
      const len = 8;
      // Top-left
      ctx.beginPath(); ctx.moveTo(-c, -c + len); ctx.lineTo(-c, -c); ctx.lineTo(-c + len, -c); ctx.stroke();
      // Top-right
      ctx.beginPath(); ctx.moveTo(c - len, -c); ctx.lineTo(c, -c); ctx.lineTo(c, -c + len); ctx.stroke();
      // Bottom-left
      ctx.beginPath(); ctx.moveTo(-c, c - len); ctx.lineTo(-c, c); ctx.lineTo(-c + len, c); ctx.stroke();
      // Bottom-right
      ctx.beginPath(); ctx.moveTo(c - len, c); ctx.lineTo(c, c); ctx.lineTo(c, c - len); ctx.stroke();

      ctx.restore();

      // HUD Lead Line from Cockpit Reticle to Target
      ctx.save();
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.35)';
      ctx.lineWidth = 1.0;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(hudCenterX, hudCenterY);
      ctx.lineTo(targetScreenX, targetScreenY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Tactical Target Data Tag
      ctx.fillStyle = 'rgba(2, 6, 23, 0.85)';
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.roundRect(targetScreenX + 32, targetScreenY - 18, 95, 34, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#00f0ff';
      ctx.font = 'bold 8.5px Orbitron, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('TARGET LOCK', targetScreenX + 37, targetScreenY - 6);
      ctx.fillStyle = '#facc15';
      ctx.fillText(`${correctTarget.letter.latin.toUpperCase()} | ${Math.round(distToPlayer / 4)}m`, targetScreenX + 37, targetScreenY + 8);
      ctx.restore();
    }

    // 7. Tactical Speed & Altitude Ribbons on Glass Visor
    ctx.save();
    ctx.fillStyle = '#38bdf8';
    ctx.font = '900 10px Orbitron, sans-serif';
    // Airspeed on Left Tape
    ctx.textAlign = 'left';
    ctx.fillText('SPD: 1,480 KTS', w * 0.22, h * 0.38);
    ctx.fillText('MACH 2.4', w * 0.22, h * 0.42);

    // Altitude on Right Tape
    ctx.textAlign = 'right';
    ctx.fillText('ALT: 45,200 FT', w * 0.78, h * 0.38);
    ctx.fillText('RADAR: ACTIVE', w * 0.78, h * 0.42);
    ctx.restore();

    // 8. Low Health / Enemy Threat Flashing Warning Bar
    if (this.stats.lives <= 2 && !this.isGodMode) {
      const flash = Math.floor(Date.now() / 250) % 2 === 0;
      if (flash) {
        ctx.save();
        ctx.fillStyle = 'rgba(239, 68, 68, 0.85)';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(w / 2 - 90, 48, 180, 24, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 10px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('⚠️ PERINGATAN: INTEGRITAS RENDAH', w / 2, 64);
        ctx.restore();
      }
    }

    ctx.restore();
  }

  // ==================== HERO MECHA ROBOT RENDERING ====================
  private renderHeroMechaRobot(ctx: CanvasRenderingContext2D) {
    const p = this.player;

    if (p.invulnerableTimer > 0 && Math.floor(Date.now() / 80) % 2 === 0) {
      return;
    }

    const skin = SHIP_SKINS.find((s) => s.id === p.skin) || SHIP_SKINS[0];

    // Subtle idle hover floating breathing motion
    const idleY = Math.sin(p.idleHoverPhase) * 2.8;

    // 0. 3D Ground Drop Shadow on Hyperspace Floor
    ctx.save();
    ctx.fillStyle = 'rgba(2, 6, 23, 0.58)';
    ctx.beginPath();
    ctx.ellipse(p.x, p.y + 46, 32 + Math.abs(p.vx) * 0.04, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(p.x, p.y + p.recoilOffset + idleY);
    ctx.rotate(p.tilt * 0.7);

    // 0. Transformation Active Cyber Ring / Digital Matrix VFX
    if (p.transformTimer > 0) {
      ctx.save();
      const progress = p.transformTimer / 0.55;
      ctx.strokeStyle = skin.primaryColor;
      ctx.lineWidth = 2.5;
      ctx.setLineDash([8, 4]);
      ctx.beginPath();
      ctx.arc(0, 0, (1 - progress) * 55 + 25, 0, Math.PI * 2);
      ctx.stroke();

      // Hexagonal transformation field
      ctx.strokeStyle = skin.accentColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let h = 0; h < 6; h++) {
        const ang = (h * Math.PI) / 3 + Date.now() * 0.01;
        const rad = 42 + Math.sin(Date.now() * 0.02) * 6;
        const hx = Math.cos(ang) * rad;
        const hy = Math.sin(ang) * rad;
        if (h === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }

    // 1. Dual Back Booster Vernier Wings (Extending upward & outward)
    [-1, 1].forEach((side) => {
      ctx.save();
      // Back Wing Strut
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = skin.primaryColor;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(side * 8, -6);
      ctx.lineTo(side * 28, -26);
      ctx.lineTo(side * 34, -20);
      ctx.lineTo(side * 18, 6);
      ctx.lineTo(side * 10, 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Wing Glowing Energy Foil / Crystal Edge
      ctx.shadowColor = skin.primaryColor;
      ctx.shadowBlur = 10;
      ctx.fillStyle = skin.primaryColor;
      ctx.beginPath();
      ctx.moveTo(side * 28, -26);
      ctx.lineTo(side * 36, -23);
      ctx.lineTo(side * 22, 2);
      ctx.lineTo(side * 18, 6);
      ctx.closePath();
      ctx.fill();

      // Wing Trim Chevron
      ctx.fillStyle = skin.accentColor;
      ctx.beginPath();
      ctx.moveTo(side * 18, -12);
      ctx.lineTo(side * 26, -18);
      ctx.lineTo(side * 24, -14);
      ctx.lineTo(side * 18, -9);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });

    // 2. Dual Leg Thruster Boots with Downward Plasma Exhaust Jets
    const isMoving = Math.abs(p.vx) > 20;
    const flameBase = isMoving ? 24 : 18;
    const flameH = flameBase + Math.sin(p.idleHoverPhase * 8) * 3 + Math.random() * 4;

    [-12, 12].forEach((lx) => {
      // Plasma flame plume
      const fGrad = ctx.createLinearGradient(lx, 26, lx, 26 + flameH);
      fGrad.addColorStop(0, '#ffffff');
      fGrad.addColorStop(0.3, skin.primaryColor);
      fGrad.addColorStop(0.7, skin.accentColor);
      fGrad.addColorStop(1, 'rgba(0, 240, 255, 0)');
      ctx.fillStyle = fGrad;
      ctx.beginPath();
      ctx.moveTo(lx - 5, 26);
      ctx.lineTo(lx + 5, 26);
      ctx.lineTo(lx, 26 + flameH);
      ctx.closePath();
      ctx.fill();

      // Thigh & Shin Armored Legs
      ctx.fillStyle = skin.secondaryColor;
      ctx.strokeStyle = skin.primaryColor;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.roundRect(lx - 6, 8, 12, 18, [3, 3, 4, 4]);
      ctx.fill();
      ctx.stroke();

      // Leg Knee Armor Plate
      ctx.fillStyle = skin.trimColor || '#ffffff';
      ctx.fillRect(lx - 4, 12, 8, 4);

      // Foot Thruster Nozzle
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(lx - 5, 24, 10, 3);
      ctx.strokeStyle = skin.primaryColor;
      ctx.lineWidth = 1;
      ctx.strokeRect(lx - 5, 24, 10, 3);
    });

    // 3. Mecha Torso & Armored Breastplate
    ctx.fillStyle = skin.secondaryColor;
    ctx.strokeStyle = skin.primaryColor;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-16, -16);
    ctx.lineTo(16, -16);
    ctx.lineTo(14, 8);
    ctx.lineTo(-14, 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Torso Titanium Trim Plates
    ctx.fillStyle = skin.trimColor || '#ffffff';
    ctx.beginPath();
    ctx.moveTo(-12, -14);
    ctx.lineTo(12, -14);
    ctx.lineTo(10, -8);
    ctx.lineTo(-10, -8);
    ctx.closePath();
    ctx.fill();

    // 4. Centered KAFA Arc Reactor / Mecha Core (Glowing Core Power Generator)
    const coreGrad = ctx.createRadialGradient(0, -2, 2, 0, -2, 9);
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.4, skin.primaryColor);
    coreGrad.addColorStop(0.85, skin.accentColor);
    coreGrad.addColorStop(1, 'rgba(0,0,0,0.8)');

    ctx.save();
    ctx.shadowColor = skin.primaryColor;
    ctx.shadowBlur = 14;
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(0, -2, 8, 0, Math.PI * 2);
    ctx.fill();

    // Core Chrome Bezel Ring
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.restore();

    // 5. Heavy Shoulder Pauldrons & Arm Buster Cannons
    [-1, 1].forEach((side) => {
      const armTilt = side * p.tilt * 10;
      // Shoulder Pauldron
      ctx.save();
      ctx.translate(side * 22, -12);
      ctx.rotate(armTilt * 0.05);

      // Shoulder Armor
      ctx.fillStyle = skin.secondaryColor;
      ctx.strokeStyle = skin.primaryColor;
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(-side * 2, -10);
      ctx.lineTo(side * 12, -6);
      ctx.lineTo(side * 10, 6);
      ctx.lineTo(-side * 2, 8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Shoulder Accent Hazard Decal
      ctx.fillStyle = skin.accentColor;
      ctx.beginPath();
      ctx.moveTo(side * 2, -4);
      ctx.lineTo(side * 9, -2);
      ctx.lineTo(side * 7, 2);
      ctx.lineTo(side * 2, 0);
      ctx.closePath();
      ctx.fill();

      // Arm & Forearm Buster Cannon
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(side > 0 ? 2 : -8, 6, 6, 16);
      ctx.strokeStyle = skin.primaryColor;
      ctx.lineWidth = 1.2;
      ctx.strokeRect(side > 0 ? 2 : -8, 6, 6, 16);

      // Cannon Barrel Muzzle
      const muzzleY = 22;
      ctx.fillStyle = p.recoilOffset > 2 ? '#ffffff' : skin.primaryColor;
      ctx.fillRect(side > 0 ? 1 : -9, muzzleY, 8, 4);

      // Muzzle Glow Flare on firing
      if (p.recoilOffset > 1.5) {
        ctx.fillStyle = '#00f0ff';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(side > 0 ? 5 : -5, muzzleY + 4, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      ctx.restore();
    });

    // 6. Mecha Head & Illuminated Visor (Gundam / Mecha Style)
    // Head Base
    ctx.fillStyle = skin.secondaryColor;
    ctx.strokeStyle = skin.primaryColor;
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(-8, -16);
    ctx.lineTo(8, -16);
    ctx.lineTo(10, -28);
    ctx.lineTo(5, -34);
    ctx.lineTo(-5, -34);
    ctx.lineTo(-10, -28);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // V-Fin Crest / Golden Antenna on top of Head
    ctx.fillStyle = skin.accentColor;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.moveTo(0, -32);
    ctx.lineTo(12, -42);
    ctx.lineTo(10, -43);
    ctx.lineTo(0, -36);
    ctx.lineTo(-10, -43);
    ctx.lineTo(-12, -42);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Glowing Cybernetic Optic Visor / Sensor Eye Slit
    ctx.save();
    ctx.shadowColor = skin.primaryColor;
    ctx.shadowBlur = 12;
    ctx.fillStyle = skin.primaryColor;
    ctx.beginPath();
    ctx.moveTo(-6, -26);
    ctx.lineTo(6, -26);
    ctx.lineTo(5, -22);
    ctx.lineTo(-5, -22);
    ctx.closePath();
    ctx.fill();

    // Specular Visor Gleam
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-3, -25, 3, 2);
    ctx.restore();

    // Mouth Guard / Chin Plate
    ctx.fillStyle = skin.trimColor || '#ffffff';
    ctx.beginPath();
    ctx.moveTo(-4, -20);
    ctx.lineTo(4, -20);
    ctx.lineTo(2, -16);
    ctx.lineTo(-2, -16);
    ctx.closePath();
    ctx.fill();

    // 7. Protective Shield Bubble with Rotating Hexagonal Ripple (if active)
    if (this.activePowerUps.shieldActive || p.shieldHp > 0) {
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.9)';
      ctx.fillStyle = 'rgba(52, 211, 153, 0.15)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, -2, 44, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = 'rgba(52, 211, 153, 0.5)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let h = 0; h < 6; h++) {
        const hAng = (h * Math.PI) / 3 + p.idleHoverPhase;
        const hx = Math.cos(hAng) * 44;
        const hy = Math.sin(hAng) * 44 - 2;
        if (h === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.stroke();
    }

    // 8. Ultimate Cosmic Aura (when Galaxy Breaker is 100% ready)
    if (this.stats.galaxyBreakerReady || this.stats.novaStrikeReady) {
      ctx.save();
      const auraPulse = (Math.sin(Date.now() * 0.008) + 1) * 0.5;
      const auraRadius = 48 + auraPulse * 8;
      const auraGrad = ctx.createRadialGradient(0, -2, 25, 0, -2, auraRadius);
      auraGrad.addColorStop(0, 'rgba(0, 240, 255, 0)');
      auraGrad.addColorStop(0.5, `rgba(0, 240, 255, ${0.35 + auraPulse * 0.3})`);
      auraGrad.addColorStop(0.85, `rgba(168, 85, 247, ${0.4 + auraPulse * 0.35})`);
      auraGrad.addColorStop(1, 'rgba(236, 72, 153, 0)');

      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(0, -2, auraRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = `rgba(0, 240, 255, ${0.6 + auraPulse * 0.4})`;
      ctx.lineWidth = 1.6;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.arc(0, -2, 46, (Date.now() * 0.002) % (Math.PI * 2), (Date.now() * 0.002) % (Math.PI * 2) + Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // 9. Thunder Rail Charging on Mecha Buster Cannons
    if (p.thunderRailCharging) {
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(0, -2, 10, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(-22, 15);
      ctx.lineTo(0, -2);
      ctx.lineTo(22, 15);
      ctx.stroke();
      ctx.restore();
    }

    // 10. Cosmic Sword Plasma Blade extending forward
    if (p.cosmicSwordActive) {
      ctx.save();
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 20;

      const swordGrad = ctx.createLinearGradient(0, -36, 0, -100);
      swordGrad.addColorStop(0, '#ffffff');
      swordGrad.addColorStop(0.3, '#facc15');
      swordGrad.addColorStop(0.7, '#f59e0b');
      swordGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');

      ctx.fillStyle = swordGrad;
      ctx.beginPath();
      ctx.moveTo(-8, -36);
      ctx.lineTo(0, -105);
      ctx.lineTo(8, -36);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = 'rgba(254, 240, 138, 0.9)';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(0, -60, 28, -Math.PI * 0.8, -Math.PI * 0.2);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }

  // ==================== HERO PLAYER SHOUT BANNER ====================
  private renderPlayerShoutBanner(ctx: CanvasRenderingContext2D) {
    const p = this.player;
    if (p.voiceShoutTimer <= 0 || !p.voiceShoutText) return;

    ctx.save();
    const alpha = Math.min(1, p.voiceShoutTimer * 2.5);
    ctx.globalAlpha = alpha;
    ctx.translate(p.x, p.y - 70);

    const text = p.voiceShoutText;
    ctx.font = "bold 13px 'Orbitron', 'Plus Jakarta Sans', sans-serif";
    const textMetrics = ctx.measureText(text);
    const boxW = Math.max(160, textMetrics.width + 32);
    const boxH = 30;

    // Glowing Comic / Hologram Callout Bubble
    ctx.fillStyle = 'rgba(2, 6, 23, 0.92)';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.2;
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 16;

    ctx.beginPath();
    ctx.roundRect(-boxW / 2, -boxH / 2, boxW, boxH, 8);
    ctx.fill();
    ctx.stroke();

    // Callout pointer arrow
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(-6, boxH / 2);
    ctx.lineTo(6, boxH / 2);
    ctx.lineTo(0, boxH / 2 + 7);
    ctx.closePath();
    ctx.fill();

    // Text with energetic comic glow
    ctx.fillStyle = '#fef08a';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 10;
    ctx.fillText(text, 0, 0);

    ctx.restore();
  }

  // ==================== SPACE HAZARDS RENDERING ====================
  private renderSpaceHazards(ctx: CanvasRenderingContext2D) {
    for (const h of this.spaceHazards) {
      ctx.save();

      if (h.type === 'laser_fence') {
        const halfF = (h.fenceWidth || 140) / 2;
        const leftX = h.x - halfF;
        const rightX = h.x + halfF;
        const beamActive = h.leftAlive && h.rightAlive;

        // 1. Crackling Electric Laser Beam
        if (beamActive) {
          ctx.save();
          // Outer neon cyan glow
          ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
          ctx.lineWidth = 10;
          ctx.beginPath();
          ctx.moveTo(leftX, h.y);
          ctx.lineTo(rightX, h.y);
          ctx.stroke();

          // Sizzling electric jagged line
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(leftX, h.y);
          const steps = 8;
          for (let s = 1; s < steps; s++) {
            const sx = leftX + (h.fenceWidth! / steps) * s;
            const sy = h.y + (Math.random() - 0.5) * 8;
            ctx.lineTo(sx, sy);
          }
          ctx.lineTo(rightX, h.y);
          ctx.stroke();

          // Core brilliant white hot beam
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(leftX, h.y);
          ctx.lineTo(rightX, h.y);
          ctx.stroke();
          ctx.restore();
        }

        // 2. Render Left and Right Emitter Pylons
        const renderPylon = (px: number, alive: boolean) => {
          ctx.save();
          ctx.translate(px, h.y);

          if (!alive) {
            ctx.fillStyle = '#334155';
            ctx.beginPath();
            ctx.arc(0, 0, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            return;
          }

          // Pylon base
          ctx.fillStyle = '#0f172a';
          ctx.strokeStyle = h.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, 14, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Pulsing energy core
          const pulse = (Math.sin(h.phase) + 1) * 0.5;
          ctx.fillStyle = h.hitFlash > 0 ? '#ffffff' : h.glowColor;
          ctx.shadowColor = h.glowColor;
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(0, 0, 7 + pulse * 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          // Emitter prongs
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(-2, -18, 4, 6);
          ctx.fillRect(-2, 12, 4, 6);

          ctx.restore();
        };

        renderPylon(leftX, !!h.leftAlive);
        renderPylon(rightX, !!h.rightAlive);
      } else if (h.type === 'magma_asteroid') {
        ctx.save();
        ctx.translate(h.x, h.y);
        ctx.rotate(h.angle);

        // Craggy jagged asteroid base
        ctx.fillStyle = h.hitFlash > 0 ? '#ffffff' : '#1c1917';
        ctx.strokeStyle = h.color;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        const pts = 8;
        for (let p = 0; p < pts; p++) {
          const a = (p * Math.PI * 2) / pts;
          const r = h.radius * (0.8 + ((p * 3) % 4) * 0.08);
          const px = Math.cos(a) * r;
          const py = Math.sin(a) * r;
          if (p === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Molten glowing magma core & veins
        const magmaGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, h.radius * 0.75);
        magmaGrad.addColorStop(0, '#fef08a');
        magmaGrad.addColorStop(0.4, '#f97316');
        magmaGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
        ctx.fillStyle = magmaGrad;
        ctx.beginPath();
        ctx.arc(0, 0, h.radius * 0.75, 0, Math.PI * 2);
        ctx.fill();

        // Crackling magma vein lines
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(-h.radius * 0.4, -h.radius * 0.3);
        ctx.lineTo(0, 0);
        ctx.lineTo(h.radius * 0.5, h.radius * 0.2);
        ctx.moveTo(0, 0);
        ctx.lineTo(-h.radius * 0.2, h.radius * 0.5);
        ctx.stroke();

        ctx.restore();
      } else if (h.type === 'gravity_vortex') {
        ctx.save();
        ctx.translate(h.x, h.y);
        ctx.rotate(h.angle);

        // Hypnotic swirling purple/cyan spiral
        const vGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, h.radius);
        vGrad.addColorStop(0, '#ffffff');
        vGrad.addColorStop(0.3, '#c084fc');
        vGrad.addColorStop(0.7, '#6b21a8');
        vGrad.addColorStop(1, 'rgba(107, 33, 168, 0)');
        ctx.fillStyle = vGrad;
        ctx.beginPath();
        ctx.arc(0, 0, h.radius, 0, Math.PI * 2);
        ctx.fill();

        // Spiral arms
        ctx.strokeStyle = 'rgba(236, 72, 153, 0.7)';
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        for (let a = 0; a < Math.PI * 4; a += 0.2) {
          const r = (a / (Math.PI * 4)) * h.radius;
          const px = Math.cos(a) * r;
          const py = Math.sin(a) * r;
          if (a === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();

        ctx.restore();
      }

      ctx.restore();
    }
  }

  // ==================== BOSS DREADNOUGHT RENDERING ====================
  private renderBoss(ctx: CanvasRenderingContext2D) {
    if (!this.boss) return;
    const b = this.boss;

    ctx.save();
    ctx.translate(b.x, b.y);

    if (b.hitFlash > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${b.hitFlash * 0.7})`;
      ctx.fillRect(-b.width / 2, -b.height / 2, b.width, b.height);
    }

    const hullGrad = ctx.createLinearGradient(0, -b.height / 2, 0, b.height / 2);
    hullGrad.addColorStop(0, '#3b0764');
    hullGrad.addColorStop(0.5, '#701a75');
    hullGrad.addColorStop(1, '#090d16');

    ctx.fillStyle = hullGrad;
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 3.2;

    ctx.beginPath();
    ctx.moveTo(0, b.height / 2);
    ctx.lineTo(b.width * 0.45, b.height * 0.25);
    ctx.lineTo(b.width * 0.5, -b.height * 0.2);
    ctx.lineTo(b.width * 0.35, -b.height / 2);
    ctx.lineTo(-b.width * 0.35, -b.height / 2);
    ctx.lineTo(-b.width * 0.5, -b.height * 0.2);
    ctx.lineTo(-b.width * 0.45, b.height * 0.25);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Central Core
    const coreGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 25);
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.5, b.isShielded ? '#38bdf8' : '#f59e0b');
    coreGrad.addColorStop(1, b.isShielded ? 'rgba(56,189,248,0)' : 'rgba(245,158,11,0)');

    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 25, 0, Math.PI * 2);
    ctx.fill();

    if (b.isShielded) {
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
      ctx.lineWidth = 3.5;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, b.width * 0.56, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      if (b.shieldLetter) {
        const textLen = b.shieldLetter.arabic.length;
        const boxW = Math.max(100, Math.min(180, textLen * 11 + 60));
        ctx.fillStyle = 'rgba(11, 19, 43, 0.95)';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(-boxW / 2, b.height / 2 + 10, boxW, 32, 8);
        ctx.fill();
        ctx.stroke();

        ctx.font = "bold 10px 'Orbitron', sans-serif";
        ctx.fillStyle = '#38bdf8';
        ctx.textAlign = 'center';
        ctx.fillText('LEMAH:', -boxW / 2 + 28, b.height / 2 + 29);

        const isArabic = b.shieldLetter.subject === 'hijaiyah' || !b.shieldLetter.subject;
        const fSize = isArabic ? 18 : textLen > 7 ? 11 : 14;
        ctx.font = `bold ${fSize}px ${isArabic ? "'Cairo', serif" : "'Orbitron', 'Plus Jakarta Sans', sans-serif"}`;
        ctx.fillStyle = '#ffffff';
        ctx.fillText(b.shieldLetter.arabic, boxW * 0.22, b.height / 2 + 30);
      }
    }

    ctx.restore();
  }

  // ==================== TARGETS RENDERING ====================
  private renderTargets(ctx: CanvasRenderingContext2D) {
    for (const t of this.targets) {
      ctx.save();

      // Vertical hover floating animation
      const hoverY = Math.sin(t.floatTimer) * 3.5;
      ctx.translate(t.x, t.y + hoverY);

      // PS5 3D Depth Foreshortening: Distant horizon targets appear smaller, scaling dynamically as they approach foreground
      if (this.is3DVisualEnabled && this.cameraMode !== 'topdown') {
        const horizonY = this.height * 0.32;
        const normalizedDepth = Math.max(0, Math.min(1.2, (t.y - horizonY) / (this.height * 0.55)));
        const depthScale = 0.65 + 0.45 * normalizedDepth;
        ctx.scale(depthScale, depthScale);
      }

      if (t.hitFlash > 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${t.hitFlash * 0.9})`;
        ctx.beginPath();
        ctx.arc(0, 0, t.radius + 8, 0, Math.PI * 2);
        ctx.fill();
      }

      const isTargetLetter = t.isCorrect;

      // 1. 3D Rotating Polyhedral Crystal Cage (True Perspective Octahedron / Hexagonal Bipyramid)
      if (this.is3DVisualEnabled) {
        ctx.save();
        const rotY = t.floatTimer * 1.6;
        const rotX = Math.sin(t.pulseTimer * 1.1) * 0.4;
        const rotZ = Math.cos(t.pulseTimer * 0.8) * 0.25;

        // 3D vertices (top apex, bottom apex, and 6 equatorial ring points)
        const rad3D = t.radius * 1.25;
        const rawVerts: [number, number, number][] = [
          [0, -rad3D * 1.25, 0], // 0: Top Apex
          [0, rad3D * 1.25, 0],  // 1: Bottom Apex
        ];
        for (let i = 0; i < 6; i++) {
          const a = (i * Math.PI) / 3;
          rawVerts.push([Math.cos(a) * rad3D, Math.sin(a * 2 + t.pulseTimer) * 4, Math.sin(a) * rad3D]);
        }

        // 3D Rotation Matrix projection
        const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
        const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
        const cosZ = Math.cos(rotZ), sinZ = Math.sin(rotZ);

        const projVerts: { x: number; y: number; z: number }[] = rawVerts.map(([vx, vy, vz]) => {
          // Rot around Y
          const x1 = vx * cosY + vz * sinY;
          const y1 = vy;
          const z1 = -vx * sinY + vz * cosY;
          // Rot around X
          const x2 = x1;
          const y2 = y1 * cosX - z1 * sinX;
          const z2 = y1 * sinX + z1 * cosX;
          // Rot around Z
          const x3 = x2 * cosZ - y2 * sinZ;
          const y3 = x2 * sinZ + y2 * cosZ;
          const z3 = z2;

          // Perspective scaling
          const fov = 170;
          const scale = fov / (fov + z3);
          return { x: x3 * scale, y: y3 * scale, z: z3 };
        });

        // 3D Polygonal Facets (translucent metallic crystal faces)
        for (let i = 0; i < 6; i++) {
          const next = 2 + ((i + 1) % 6);
          const cur = 2 + i;
          const vTop = projVerts[0];
          const vBot = projVerts[1];
          const v1 = projVerts[cur];
          const v2 = projVerts[next];

          // Face normal Z for top triangle
          const normalZTop = (v1.x - vTop.x) * (v2.y - vTop.y) - (v1.y - vTop.y) * (v2.x - vTop.x);
          if (normalZTop > 0) {
            ctx.fillStyle = isTargetLetter ? 'rgba(6, 182, 212, 0.22)' : 'rgba(100, 116, 139, 0.15)';
            ctx.beginPath();
            ctx.moveTo(vTop.x, vTop.y);
            ctx.lineTo(v1.x, v1.y);
            ctx.lineTo(v2.x, v2.y);
            ctx.closePath();
            ctx.fill();
          }

          // Face normal Z for bottom triangle
          const normalZBot = (v2.x - vBot.x) * (v1.y - vBot.y) - (v2.y - vBot.y) * (v1.x - vBot.x);
          if (normalZBot > 0) {
            ctx.fillStyle = isTargetLetter ? 'rgba(14, 116, 144, 0.25)' : 'rgba(51, 65, 85, 0.18)';
            ctx.beginPath();
            ctx.moveTo(vBot.x, vBot.y);
            ctx.lineTo(v2.x, v2.y);
            ctx.lineTo(v1.x, v1.y);
            ctx.closePath();
            ctx.fill();
          }
        }

        // Draw 3D Crystal Edges with Depth Attenuation
        for (let i = 0; i < 6; i++) {
          const next = 2 + ((i + 1) % 6);
          const cur = 2 + i;
          const edgePairs = [
            [0, cur],
            [1, cur],
            [cur, next],
          ];

          for (const [idxA, idxB] of edgePairs) {
            const vA = projVerts[idxA];
            const vB = projVerts[idxB];
            const avgZ = (vA.z + vB.z) / 2;
            const isFront = avgZ < 0;

            ctx.strokeStyle = isTargetLetter
              ? (isFront ? '#22d3ee' : 'rgba(8, 145, 178, 0.45)')
              : (isFront ? 'rgba(203, 213, 225, 0.85)' : 'rgba(71, 85, 105, 0.38)');
            ctx.lineWidth = isFront ? (isTargetLetter ? 2.5 : 1.6) : 0.9;
            ctx.beginPath();
            ctx.moveTo(vA.x, vA.y);
            ctx.lineTo(vB.x, vB.y);
            ctx.stroke();
          }
        }

        // Dual 3D Gyroscope Orbital Rings
        if (isTargetLetter) {
          ctx.save();
          const ringAng = t.floatTimer * 1.5;
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 1.6;
          ctx.setLineDash([8, 6]);
          ctx.beginPath();
          ctx.ellipse(0, 0, rad3D * 1.45, rad3D * 0.45, ringAng * 0.6, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.restore();
        }

        ctx.restore();
      }

      // 2. Core glowing radial energy backing
      const coreGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, t.radius);
      if (isTargetLetter) {
        coreGrad.addColorStop(0, '#0e7490');
        coreGrad.addColorStop(0.5, '#083344');
        coreGrad.addColorStop(1, '#020617');
      } else {
        coreGrad.addColorStop(0, '#1e293b');
        coreGrad.addColorStop(0.6, '#0f172a');
        coreGrad.addColorStop(1, '#020617');
      }

      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(0, 0, t.radius - 2, 0, Math.PI * 2);
      ctx.fill();

      // Specular Glass Gleam Arc
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(0, 0, t.radius - 5, -Math.PI * 0.85, -Math.PI * 0.35);
      ctx.stroke();

      if (isTargetLetter) {
        const pulse = (Math.sin(t.pulseTimer * 1.5) + 1) * 0.5;
        ctx.strokeStyle = `rgba(6, 182, 212, ${0.45 + pulse * 0.45})`;
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.arc(0, 0, t.radius - 3, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 4. Subject-Adaptive Dynamic Typography
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const wordLen = t.letter.arabic.length;
      let fontSize = Math.floor(t.radius * 1.05);

      if (t.letter.subject === 'hijaiyah' || (!t.letter.subject && wordLen <= 2)) {
        fontSize = Math.floor(t.radius * 1.08);
        ctx.font = `bold ${fontSize}px 'Cairo', 'Amiri', 'Traditional Arabic', serif`;
      } else if (t.letter.subject === 'matematika') {
        fontSize = Math.floor(t.radius * (wordLen > 2 ? 0.75 : 0.95));
        ctx.font = `900 ${fontSize}px 'Orbitron', 'Plus Jakarta Sans', sans-serif`;
      } else {
        // IPA & Bahasa Inggris words
        if (wordLen <= 4) fontSize = Math.floor(t.radius * 0.72);
        else if (wordLen <= 6) fontSize = Math.floor(t.radius * 0.56);
        else if (wordLen <= 9) fontSize = Math.floor(t.radius * 0.44);
        else fontSize = Math.floor(t.radius * 0.36);
        ctx.font = `bold ${fontSize}px 'Plus Jakarta Sans', 'Orbitron', sans-serif`;
      }

      ctx.shadowColor = isTargetLetter ? '#00f0ff' : 'rgba(255, 255, 255, 0.4)';
      ctx.shadowBlur = isTargetLetter ? 14 : 4;
      ctx.fillStyle = isTargetLetter ? '#ffffff' : '#f1f5f9';

      ctx.fillText(t.letter.arabic, 0, 1);
      ctx.shadowBlur = 0;

      // 5. Sleek Cyber Subtitle Badge with Adaptive Width
      const subText = t.letter.latin;
      const subBadgeWidth = Math.max(52, Math.min(120, subText.length * 7.5 + 16));
      ctx.fillStyle = 'rgba(2, 6, 23, 0.94)';
      ctx.strokeStyle = isTargetLetter ? '#38bdf8' : '#475569';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(-subBadgeWidth / 2, t.radius - 1, subBadgeWidth, 16, 5);
      ctx.fill();
      ctx.stroke();

      ctx.font = "bold 9.5px 'Plus Jakarta Sans', sans-serif";
      ctx.fillStyle = isTargetLetter ? '#67e8f9' : '#94a3b8';
      ctx.fillText(subText, 0, t.radius + 7);

      ctx.restore();
    }
  }

  // ==================== PROJECTILES RENDERING ====================
  private renderProjectiles(ctx: CanvasRenderingContext2D) {
    for (const p of this.projectiles) {
      ctx.save();

      if (p.isMeteor) {
        // Jagged fiery meteor
        ctx.translate(p.x, p.y);
        const rot = Math.atan2(p.vy, p.vx) + Math.PI / 2;
        ctx.rotate(rot);

        // Blazing fireball core
        const meteorGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, p.radius);
        meteorGrad.addColorStop(0, '#ffffff');
        meteorGrad.addColorStop(0.3, '#facc15');
        meteorGrad.addColorStop(0.7, '#f97316');
        meteorGrad.addColorStop(1, '#ef4444');
        ctx.fillStyle = meteorGrad;
        ctx.beginPath();
        ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
        ctx.fill();

        // Atmospheric entry shock cone
        ctx.strokeStyle = 'rgba(254, 240, 138, 0.7)';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(0, 0, p.radius * 1.35, -Math.PI * 0.8, -Math.PI * 0.2);
        ctx.stroke();

      } else if (p.isHoming) {
        // Guided sleek missile with rocket fins
        ctx.translate(p.x, p.y);
        const missileAngle = Math.atan2(p.vy, p.vx) + Math.PI / 2;
        ctx.rotate(missileAngle);

        // Missile body
        ctx.fillStyle = '#f8fafc';
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, -p.length / 2);
        ctx.lineTo(p.radius * 0.8, p.length * 0.2);
        ctx.lineTo(p.radius * 0.8, p.length / 2);
        ctx.lineTo(-p.radius * 0.8, p.length / 2);
        ctx.lineTo(-p.radius * 0.8, p.length * 0.2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Rocket fins
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.moveTo(-p.radius * 0.8, p.length * 0.1);
        ctx.lineTo(-p.radius * 1.6, p.length * 0.5);
        ctx.lineTo(-p.radius * 0.8, p.length * 0.45);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(p.radius * 0.8, p.length * 0.1);
        ctx.lineTo(p.radius * 1.6, p.length * 0.5);
        ctx.lineTo(p.radius * 0.8, p.length * 0.45);
        ctx.closePath();
        ctx.fill();

        // Warhead glowing tip
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(0, -p.length / 2 + 3, 2.5, 0, Math.PI * 2);
        ctx.fill();

      } else if (p.weaponType === 'energy_blast') {
        // Heavy pulsating plasma sphere with concentric rotating corona
        ctx.translate(p.x, p.y);

        const plasmaGrad = ctx.createRadialGradient(0, 0, 3, 0, 0, p.radius);
        plasmaGrad.addColorStop(0, '#ffffff');
        plasmaGrad.addColorStop(0.35, '#fef08a');
        plasmaGrad.addColorStop(0.7, '#f59e0b');
        plasmaGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
        ctx.fillStyle = plasmaGrad;
        ctx.beginPath();
        ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
        ctx.fill();

        // Pulsating electric halo
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.85)';
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.arc(0, 0, p.radius * 0.8, 0, Math.PI * 2);
        ctx.stroke();

      } else if (p.isDragon) {
        // Jurus 4: Spiral Dragon cosmic dragon plasma projectile
        ctx.translate(p.x, p.y);
        ctx.shadowColor = '#ec4899';
        ctx.shadowBlur = 18;

        // Central cosmic dragon plasma core
        const coreGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, p.radius);
        coreGrad.addColorStop(0, '#ffffff');
        coreGrad.addColorStop(0.35, '#00f0ff');
        coreGrad.addColorStop(0.7, '#ec4899');
        coreGrad.addColorStop(1, 'rgba(236, 72, 153, 0)');
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
        ctx.fill();

        // Twin rotating dragon energy ribbons (Cyan & Magenta)
        const ribbonAng = p.spiralPhase || 0;
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.arc(0, 0, p.radius * 1.35, ribbonAng, ribbonAng + Math.PI * 0.85);
        ctx.stroke();

        ctx.strokeStyle = '#ec4899';
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.arc(0, 0, p.radius * 1.35, ribbonAng + Math.PI, ribbonAng + Math.PI * 1.85);
        ctx.stroke();

      } else if (p.isSwordWave) {
        // Jurus 7: Cosmic Sword crescent slash wave
        ctx.translate(p.x, p.y);
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 18;

        // Brilliant crescent energy arc
        ctx.strokeStyle = 'rgba(250, 204, 21, 0.95)';
        ctx.lineWidth = 4.2;
        ctx.beginPath();
        ctx.arc(0, 10, p.radius * 1.4, -Math.PI * 0.8, -Math.PI * 0.2);
        ctx.stroke();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.arc(0, 10, p.radius * 1.25, -Math.PI * 0.75, -Math.PI * 0.25);
        ctx.stroke();

      } else if (p.isRail) {
        // Jurus 5: Thunder Rail high-velocity piercing beam
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 20;
        ctx.fillRect(p.x - 3, 0, 6, p.y);

        ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)';
        ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.moveTo(p.x, 0);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        ctx.restore();

      } else if (p.isSpiral) {
        // Twin spiral cosmic vortex projectile
        ctx.translate(p.x, p.y);
        ctx.shadowColor = p.glowColor;
        ctx.shadowBlur = 12;

        const orbGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, p.radius);
        orbGrad.addColorStop(0, '#ffffff');
        orbGrad.addColorStop(0.4, p.color);
        orbGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = orbGrad;
        ctx.beginPath();
        ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.2;
        ctx.stroke();

      } else {
        // Standard KAFA Laser Cannon & Double Photon lasers (Cyan with bright white core & fading glow trail)
        const grad = ctx.createLinearGradient(p.x, p.y - p.length, p.x, p.y);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, p.color);
        grad.addColorStop(1, 'rgba(0, 240, 255, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(p.x, p.y - p.length / 2, p.radius, p.length / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // High-contrast white core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(p.x, p.y - p.length / 2, Math.max(1.8, p.radius * 0.45), p.length * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Outer neon aura
        ctx.fillStyle = p.glowColor;
        ctx.globalAlpha = 0.55;
        ctx.beginPath();
        ctx.ellipse(p.x, p.y - p.length / 2, p.radius * 2.2, p.length / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      ctx.restore();
    }
  }

  // ==================== ABILITY SPECIAL EFFECTS RENDERING ====================
  private renderThunderRail(ctx: CanvasRenderingContext2D) {
    const p = this.player;
    if (!p.thunderRailCharging) return;

    ctx.save();
    // Pre-firing warning tracer line and charging arcs
    const pulse = Math.sin(Date.now() * 0.05) * 2;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.75)';
    ctx.lineWidth = 1.8 + pulse * 0.5;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y - 35);
    ctx.lineTo(p.x, 0);
    ctx.stroke();
    ctx.setLineDash([]);

    // Charging muzzle capacitor glow
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(p.x, p.y - 35, 7 + pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private renderOrbitalGuards(ctx: CanvasRenderingContext2D) {
    const p = this.player;
    if (p.orbitalGuardDuration <= 0 || p.orbitalGuards.length === 0) return;

    ctx.save();
    for (const drone of p.orbitalGuards) {
      const dx = p.x + Math.cos(drone.angle) * drone.orbitRadius;
      const dy = p.y + Math.sin(drone.angle) * drone.orbitRadius;

      // Faint energy tether connecting to player ship
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.35)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(dx, dy);
      ctx.stroke();

      // Glowing emerald orb
      ctx.shadowColor = drone.color;
      ctx.shadowBlur = 14;
      const orbGrad = ctx.createRadialGradient(dx, dy, 1, dx, dy, 9);
      orbGrad.addColorStop(0, '#ffffff');
      orbGrad.addColorStop(0.4, drone.color);
      orbGrad.addColorStop(1, 'rgba(16, 185, 129, 0)');
      ctx.fillStyle = orbGrad;
      ctx.beginPath();
      ctx.arc(dx, dy, 9, 0, Math.PI * 2);
      ctx.fill();

      // Hexagonal micro-shield facet around drone
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      for (let h = 0; h < 6; h++) {
        const ang = (h * Math.PI) / 3 + drone.angle * 2;
        const px = dx + Math.cos(ang) * 11;
        const py = dy + Math.sin(ang) * 11;
        if (h === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
    }
    ctx.restore();
  }

  private renderCosmicSword(ctx: CanvasRenderingContext2D) {
    // Handled in renderHeroShip directly on ship nose
  }

  private renderQuantumBeam(ctx: CanvasRenderingContext2D) {
    // Compatibility stub
  }

  private renderStarShieldBurst(ctx: CanvasRenderingContext2D) {
    // Compatibility stub
  }

  // ==================== JURUS 8: GALAXY BREAKER ULTIMATE VFX ====================
  private renderGalaxyBreaker(ctx: CanvasRenderingContext2D) {
    const p = this.player;
    if (!p.galaxyBreakerCharging && !this.stats.galaxyBreakerActive && !p.novaStrikeActive) return;

    ctx.save();
    const timer = p.galaxyBreakerTimer || p.novaStrikeTimer || 0;
    const progress = Math.max(0, timer / 1.45);

    // 1. Stage 4: Background slightly dimmed to highlight attack
    ctx.fillStyle = `rgba(3, 7, 18, ${progress * 0.55})`;
    ctx.fillRect(0, 0, this.width, this.height);

    // 2. Stage 2: Ship surrounded by celestial energy circles
    ctx.save();
    ctx.translate(p.x, p.y);
    const ringRot = (Date.now() * 0.003) % (Math.PI * 2);
    ctx.rotate(ringRot);

    // Cyan & Violet outer rings
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.85)';
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.arc(0, 0, 72, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(168, 85, 247, 0.85)';
    ctx.lineWidth = 2.0;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.arc(0, 0, 84, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // 8-Point Starlight Mandala
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    for (let pt = 0; pt < 8; pt++) {
      const starAng = (pt * Math.PI) / 4;
      const rad = pt % 2 === 0 ? 92 : 55;
      const sx = Math.cos(starAng) * rad;
      const sy = Math.sin(starAng) * rad;
      if (pt === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();

    // 3. Stage 5: Cosmic Energy Core forming at nose of ship
    const coreGrad = ctx.createRadialGradient(p.x, p.y - 35, 3, p.x, p.y - 35, 38);
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.3, '#00f0ff');
    coreGrad.addColorStop(0.65, '#3b82f6');
    coreGrad.addColorStop(0.85, '#a855f7');
    coreGrad.addColorStop(1, 'rgba(236, 72, 153, 0)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(p.x, p.y - 35, 38, 0, Math.PI * 2);
    ctx.fill();

    // 4. Stage 6: Colossal Mega-Beam surging across screen (White, Cyan, Electric Blue, Violet, Magenta)
    const beamW = Math.min(this.width * 0.78, 290) * Math.sin(progress * Math.PI);
    const megaGrad = ctx.createLinearGradient(p.x - beamW / 2, 0, p.x + beamW / 2, 0);
    megaGrad.addColorStop(0, 'rgba(236, 72, 153, 0)');
    megaGrad.addColorStop(0.18, 'rgba(168, 85, 247, 0.75)');
    megaGrad.addColorStop(0.35, 'rgba(59, 130, 246, 0.9)');
    megaGrad.addColorStop(0.5, '#ffffff');
    megaGrad.addColorStop(0.65, 'rgba(0, 240, 255, 0.9)');
    megaGrad.addColorStop(0.82, 'rgba(168, 85, 247, 0.75)');
    megaGrad.addColorStop(1, 'rgba(236, 72, 153, 0)');

    ctx.fillStyle = megaGrad;
    ctx.fillRect(p.x - beamW / 2, 0, beamW, this.height);

    // 5. Stage 7: Expanding Shockwaves along beam axis
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 3.2;
    for (let sw = 0; sw < 4; sw++) {
      const swY = (p.y - (Date.now() * 0.6 + sw * 140) % p.y);
      if (swY > 0) {
        ctx.beginPath();
        ctx.ellipse(p.x, swY, beamW * 0.55, 14, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // 6. Stage 8: Huge Glorious Text Banner: "GALAXY BREAKER!"
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 24;
    ctx.font = "900 36px 'Orbitron', 'Plus Jakarta Sans', sans-serif";

    // Text outer glow stroke
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 6;
    ctx.strokeText('GALAXY BREAKER!', this.width / 2, this.height * 0.38);

    // Text inner bright fill
    ctx.fillStyle = '#ffffff';
    ctx.fillText('GALAXY BREAKER!', this.width / 2, this.height * 0.38);
    ctx.restore();

    ctx.restore();
  }

  private renderNovaStrike(ctx: CanvasRenderingContext2D) {
    this.renderGalaxyBreaker(ctx);
  }

  private renderEnemyProjectiles(ctx: CanvasRenderingContext2D) {
    for (const ep of this.enemyProjectiles) {
      ctx.save();
      ctx.shadowColor = ep.glowColor;
      ctx.shadowBlur = 12;
      ctx.fillStyle = ep.color;
      ctx.beginPath();
      ctx.arc(ep.x, ep.y, ep.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ep.x, ep.y, ep.radius * 0.45, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  // ==================== POWER-UPS RENDERING ====================
  private renderPowerUps(ctx: CanvasRenderingContext2D) {
    for (const p of this.powerUps) {
      ctx.save();
      ctx.translate(p.x, p.y);

      const colorMap: Record<PowerUpType, string> = {
        multishot: '#38bdf8',
        slowmo: '#a78bfa',
        shield: '#34d399',
        nuke: '#fbbf24',
        heart: '#ef4444',
        rapid_fire: '#f59e0b',
        double_score: '#fbbf24',
        magnet: '#06b6d4',
        energy: '#60a5fa',
      };
      const labelMap: Record<PowerUpType, string> = {
        multishot: '2X',
        slowmo: 'SLOW',
        shield: '🛡️',
        nuke: 'EMP',
        heart: '❤️',
        rapid_fire: '⚡',
        double_score: '2X$',
        magnet: '🧲',
        energy: '🔋',
      };

      const color = colorMap[p.type] || '#38bdf8';

      ctx.shadowColor = color;
      ctx.shadowBlur = 14;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = "bold 11px 'Orbitron', sans-serif";
      ctx.fillText(labelMap[p.type] || 'UP', 0, 1);

      ctx.restore();
    }
  }

  private renderParticles(ctx: CanvasRenderingContext2D) {
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;

      if (p.type === 'shockwave') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  private renderFloatingTexts(ctx: CanvasRenderingContext2D) {
    for (const ft of this.floatingTexts) {
      ctx.save();
      const alpha = Math.max(0, 1 - ft.life / ft.maxLife);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = ft.color;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
      ctx.shadowBlur = 8;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const fontSize = Math.floor(16 * ft.scale);
      ctx.font = `bold ${fontSize}px 'Orbitron', 'Plus Jakarta Sans', sans-serif`;
      ctx.fillText(ft.text, ft.x, ft.y);

      ctx.restore();
    }
  }

  // ==================== BIOLUMINESCENT FOREST BIOME & CHALLENGE SYSTEM ====================

  private initForestCosmos() {
    this.forestSpores = [];
    const colors = ['#34d399', '#6ee7b7', '#facc15', '#a3e635', '#22d3ee', '#10b981'];
    for (let i = 0; i < 45; i++) {
      this.forestSpores.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 20,
        vy: -Math.random() * 25 - 12,
        size: Math.random() * 3.5 + 1.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.7 + 0.3,
        phase: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 2.2 + 1.5,
      });
    }
  }

  private updateForestCosmos(dt: number) {
    const target = this.stats.activeArenaBiome === 'forest' ? 1 : 0;
    this.targetBiomeAlpha = target;
    this.biomeTransitionAlpha += (this.targetBiomeAlpha - this.biomeTransitionAlpha) * Math.min(dt * 3.2, 1);

    for (const s of this.forestSpores) {
      s.phase += dt * s.pulseSpeed;
      s.x += s.vx * dt + Math.sin(s.phase) * 15 * dt;
      s.y += s.vy * dt;

      if (s.y < -20) {
        s.y = this.height + 20;
        s.x = Math.random() * this.width;
      }
      if (s.x < -20) s.x = this.width + 20;
      if (s.x > this.width + 20) s.x = -20;
    }
  }

  public startChallenge(
    biome: ArenaBiome = 'forest',
    title: string = 'TANTANGAN: HUTAN PURBA KAFA!',
    duration: number = 30,
    goal: number = 5
  ) {
    this.stats.challengeActive = true;
    this.stats.challengeTitle = title;
    this.stats.challengeTimer = duration;
    this.stats.challengeGoal = goal;
    this.stats.challengeProgress = 0;
    this.stats.activeArenaBiome = biome;

    sound.playChallengeStart();
    if (biome === 'forest') {
      sound.playForestPower();
      sound.speakSahabatKafaPower('Tantangan Hutan Purba Sahabat KAFA!');
    }

    this.addFloatingText(this.width / 2, 180, `⚡ ${title.toUpperCase()} ⚡`, '#10b981', 2.0);
    this.triggerScreenShake(8, 0.4);
    this.callbacks.onStatsUpdate(this.stats);
  }

  public endChallenge(success: boolean) {
    if (!this.stats.challengeActive) return;
    this.stats.challengeActive = false;

    if (success) {
      const bonus = 2500;
      this.stats.score += bonus;
      sound.playChallengeComplete();
      this.addFloatingText(this.width / 2, this.height * 0.4, `🏆 TANTANGAN SELESAI! +${bonus} SKOR! 🏆`, '#facc15', 2.2);
    } else {
      this.addFloatingText(this.width / 2, this.height * 0.4, 'WAKTU TANTANGAN SELESAI!', '#f87171', 1.8);
    }

    // Smoothly return to nebula biome if not currently in a boss fight
    if (!this.boss) {
      this.stats.activeArenaBiome = 'nebula';
    }
    this.callbacks.onStatsUpdate(this.stats);
  }

  public toggleForestBiome() {
    if (this.stats.activeArenaBiome === 'forest') {
      this.stats.activeArenaBiome = 'nebula';
      this.stats.challengeActive = false;
      this.addFloatingText(this.width / 2, 200, '🌌 ARENA: GALAXY NEBULA', '#38bdf8', 1.6);
    } else {
      this.startChallenge('forest', 'TANTANGAN: BELANTARA HUTAN PURBA KAFA!', 30, 5);
    }
    this.callbacks.onStatsUpdate(this.stats);
  }

  private renderForestBiome(ctx: CanvasRenderingContext2D) {
    if (this.biomeTransitionAlpha < 0.01) return;
    ctx.save();
    ctx.globalAlpha = this.biomeTransitionAlpha;

    // 1. Deep Bioluminescent Forest Atmospheric Gradient
    const forestGrad = ctx.createLinearGradient(0, 0, 0, this.height);
    forestGrad.addColorStop(0, '#021812');
    forestGrad.addColorStop(0.3, '#042e24');
    forestGrad.addColorStop(0.6, '#064e3b');
    forestGrad.addColorStop(0.85, '#022c22');
    forestGrad.addColorStop(1, '#01140e');
    ctx.fillStyle = forestGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // 2. Ethereal God Rays / Sunbeams Filtering Through Canopy
    ctx.save();
    for (let r = 0; r < 5; r++) {
      const rayX = (this.width / 6) * (r + 1);
      const rayWidth = 70 + r * 15;
      const rayGrad = ctx.createLinearGradient(rayX, 0, rayX + 60, this.height);
      rayGrad.addColorStop(0, 'rgba(52, 211, 153, 0.12)');
      rayGrad.addColorStop(0.4, 'rgba(110, 231, 183, 0.06)');
      rayGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = rayGrad;
      ctx.beginPath();
      ctx.moveTo(rayX - 30, 0);
      ctx.lineTo(rayX + 30, 0);
      ctx.lineTo(rayX + 110, this.height);
      ctx.lineTo(rayX - rayWidth + 30, this.height);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // 3. Parallax Layer: Towering Ancient Tree Pillars (Left & Right Flanks)
    const treeTrunkWidth = Math.min(105, this.width * 0.14);

    // Left Giant Ancient Trunk
    const leftTrunkGrad = ctx.createLinearGradient(0, 0, treeTrunkWidth, 0);
    leftTrunkGrad.addColorStop(0, '#021a14');
    leftTrunkGrad.addColorStop(0.7, '#063f31');
    leftTrunkGrad.addColorStop(1, 'rgba(6, 63, 49, 0)');
    ctx.fillStyle = leftTrunkGrad;
    ctx.fillRect(0, 0, treeTrunkWidth, this.height);

    // Right Giant Ancient Trunk
    const rightTrunkGrad = ctx.createLinearGradient(this.width, 0, this.width - treeTrunkWidth, 0);
    rightTrunkGrad.addColorStop(0, '#021a14');
    rightTrunkGrad.addColorStop(0.7, '#063f31');
    rightTrunkGrad.addColorStop(1, 'rgba(6, 63, 49, 0)');
    ctx.fillStyle = rightTrunkGrad;
    ctx.fillRect(this.width - treeTrunkWidth, 0, treeTrunkWidth, this.height);

    // Bark Moss & Glowing Ancient Runes on Trunks
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1.4;
    ctx.globalAlpha = this.biomeTransitionAlpha * 0.6;
    for (let y = 60; y < this.height; y += 90) {
      // Left runes & moss knots
      ctx.beginPath();
      ctx.arc(treeTrunkWidth * 0.35, y, 9, 0, Math.PI * 1.5);
      ctx.stroke();
      ctx.fillStyle = '#34d399';
      ctx.beginPath();
      ctx.arc(treeTrunkWidth * 0.35, y, 3, 0, Math.PI * 2);
      ctx.fill();

      // Right runes & moss knots
      ctx.beginPath();
      ctx.arc(this.width - treeTrunkWidth * 0.35, y + 45, 9, Math.PI * 0.5, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(this.width - treeTrunkWidth * 0.35, y + 45, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = this.biomeTransitionAlpha;

    // 4. Overarching Ancient Canopy Foliage & Glowing Leaves (Top Edge)
    const canopyHeight = 75;
    const canopyGrad = ctx.createLinearGradient(0, 0, 0, canopyHeight);
    canopyGrad.addColorStop(0, '#01140e');
    canopyGrad.addColorStop(0.7, '#043428');
    canopyGrad.addColorStop(1, 'rgba(4, 52, 40, 0)');
    ctx.fillStyle = canopyGrad;
    ctx.fillRect(0, 0, this.width, canopyHeight);

    // Glowing Bioluminescent Leaves along canopy
    const leafStep = 55;
    for (let lx = 0; lx < this.width; lx += leafStep) {
      const sway = Math.sin(Date.now() * 0.002 + lx) * 5;
      ctx.fillStyle = lx % 110 === 0 ? '#10b981' : '#059669';
      ctx.beginPath();
      ctx.ellipse(lx + 20, 15 + sway, 28, 14, Math.PI * 0.25, 0, Math.PI * 2);
      ctx.fill();

      // Glowing leaf veins
      ctx.strokeStyle = '#6ee7b7';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(lx + 8, 8 + sway);
      ctx.lineTo(lx + 32, 22 + sway);
      ctx.stroke();
    }

    // 5. Hanging Bioluminescent Lianas / Vines with Neon Spore Bulbs
    const vinePositions = [
      { x: this.width * 0.18, len: 110, color: '#34d399' },
      { x: this.width * 0.32, len: 80, color: '#facc15' },
      { x: this.width * 0.68, len: 95, color: '#22d3ee' },
      { x: this.width * 0.82, len: 125, color: '#34d399' },
    ];

    vinePositions.forEach((v, idx) => {
      const sway = Math.sin(Date.now() * 0.0018 + idx) * 8;
      ctx.strokeStyle = '#065f46';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(v.x, 0);
      ctx.quadraticCurveTo(v.x + sway, v.len * 0.5, v.x + sway * 0.5, v.len);
      ctx.stroke();

      // Glowing Spore Bulb at tip of vine
      const tipX = v.x + sway * 0.5;
      const tipY = v.len;
      const sporePulse = (Math.sin(Date.now() * 0.005 + idx * 2) + 1) * 0.5;

      const bulbGrad = ctx.createRadialGradient(tipX, tipY, 1, tipX, tipY, 14);
      bulbGrad.addColorStop(0, '#ffffff');
      bulbGrad.addColorStop(0.4, v.color);
      bulbGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = bulbGrad;
      ctx.beginPath();
      ctx.arc(tipX, tipY, 8 + sporePulse * 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // 6. Floating Bioluminescent Spores / Fireflies
    for (const s of this.forestSpores) {
      const pulse = (Math.sin(s.phase) + 1) * 0.5;
      const sporeRadius = s.size * (0.8 + pulse * 0.5);

      const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, sporeRadius * 2.8);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.35, s.color);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad;
      ctx.globalAlpha = this.biomeTransitionAlpha * s.alpha;
      ctx.beginPath();
      ctx.arc(s.x, s.y, sporeRadius * 2.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // 7. Challenge Banner Overlay (When Challenge is Active)
    if (this.stats.challengeActive) {
      const bannerW = Math.min(480, this.width * 0.88);
      const bannerH = 46;
      const bx = (this.width - bannerW) / 2;
      const by = 88;

      ctx.save();
      ctx.fillStyle = 'rgba(2, 44, 34, 0.9)';
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 15;

      // Rounded banner rect
      ctx.beginPath();
      ctx.roundRect(bx, by, bannerW, bannerH, 14);
      ctx.fill();
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Title
      ctx.font = 'bold 13px Orbitron, sans-serif';
      ctx.fillStyle = '#6ee7b7';
      ctx.fillText(`🌲 ${this.stats.challengeTitle || 'TANTANGAN HUTAN PURBA KAFA'} 🌲`, this.width / 2, by + 16);

      // Objective & Timer
      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = '#fef08a';
      const timerSec = Math.max(0, Math.ceil(this.stats.challengeTimer || 0));
      const prog = this.stats.challengeProgress || 0;
      const goal = this.stats.challengeGoal || 5;
      ctx.fillText(`Target: ${prog}/${goal} Soal Selesai  •  Sisa Waktu: ${timerSec}s`, this.width / 2, by + 32);

      ctx.restore();
    }

    ctx.restore();
  }

  public getStats(): GameStats {
    return { ...this.stats };
  }

  public getActivePowerUps(): ActivePowerUps {
    return { ...this.activePowerUps };
  }
}
