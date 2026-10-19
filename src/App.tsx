import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './game/GameEngine';
import { sound } from './game/sound';
import { haptics } from './game/haptics';
import { achievementManager } from './game/achievements';
import {
  ActivePowerUps,
  GameMode,
  GameStats,
  ScreenState,
  WeaponType,
  Achievement,
  ShipSkinId,
  JurusId,
} from './game/types';
import { GALAXY_WORLDS } from './game/worldData';
import { MainMenu } from './components/MainMenu';
import { GameHUD } from './components/GameHUD';
import { TouchControls } from './components/TouchControls';
import { PauseModal } from './components/PauseModal';
import { GameOverModal } from './components/GameOverModal';
import { VictoryModal } from './components/VictoryModal';
import { HangarModal } from './components/HangarModal';
import { MateriModal } from './components/MateriModal';
import { KamusModal } from './components/KamusModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { AchievementsModal } from './components/AchievementsModal';
import { AchievementToast } from './components/AchievementToast';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // Screen & Modal states
  const [screenState, setScreenState] = useState<ScreenState>('MENU');
  const [showMateriModal, setShowMateriModal] = useState<boolean>(false);
  const [showHowToPlayModal, setShowHowToPlayModal] = useState<boolean>(false);
  const [showKamusModal, setShowKamusModal] = useState<boolean>(false);
  const [showAchievementsModal, setShowAchievementsModal] = useState<boolean>(false);
  const [showHangarModal, setShowHangarModal] = useState<boolean>(false);
  const [currentMateriId, setCurrentMateriId] = useState<string>('all');
  const [currentMode, setCurrentMode] = useState<GameMode>('campaign');
  const [currentSkinId, setCurrentSkinId] = useState<ShipSkinId>(achievementManager.getSelectedSkin());

  // Mobile smartphone specific control settings
  const [controlMode, setControlMode] = useState<'touch_drag' | 'dpad'>(() => {
    try {
      const saved = localStorage.getItem('letterfighter_control_mode');
      return saved === 'dpad' || saved === 'touch_drag' ? saved : 'touch_drag';
    } catch {
      return 'touch_drag';
    }
  });

  const [autoShoot, setAutoShootState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('letterfighter_autoshoot');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const [hapticsEnabled, setHapticsEnabled] = useState<boolean>(() => {
    return haptics.isEnabled();
  });

  // Achievement unlock toast banner
  const [unlockedToast, setUnlockedToast] = useState<Achievement | null>(null);

  // Live Stats for HUD & Modals
  const [gameStats, setGameStats] = useState<GameStats>({
    score: 0,
    highScore: 0,
    mode: 'campaign',
    level: 1,
    currentWorld: GALAXY_WORLDS[0],
    shipSkin: 'pioneer',
    combo: 0,
    maxCombo: 0,
    comboMilestone: null,
    lives: 3,
    maxLives: 3,
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
    combatCombo: {
      chainTitle: null,
      chainCount: 0,
      timer: 0,
      bonusPoints: 0,
    },
    orbitalGuardActive: false,
    cosmicSwordActive: false,
    thunderRailCharging: false,
    galaxyBreakerReady: false,
    novaStrikeReady: false,
    bossActive: false,
    bossHp: 0,
    bossMaxHp: 0,
    bossName: '',
    bossShielded: false,
    bossShieldLetter: null,
    isRobotMode: false,
    voiceShoutText: null,
    isVictory: false,
  });

  const [activePowerUps, setActivePowerUps] = useState<ActivePowerUps>({
    multishotTimer: 0,
    slowmoTimer: 0,
    rapidFireTimer: 0,
    doubleScoreTimer: 0,
    magnetTimer: 0,
    shieldActive: false,
  });

  useEffect(() => {
    try {
      const savedMateri = localStorage.getItem('letterfighter_materi');
      if (savedMateri) {
        setCurrentMateriId(savedMateri);
      }
      const savedMode = localStorage.getItem('letterfighter_mode') as GameMode;
      if (savedMode && ['campaign', 'survival', 'accuracy'].includes(savedMode)) {
        setCurrentMode(savedMode);
      }
      const savedSkin = achievementManager.getSelectedSkin();
      setCurrentSkinId(savedSkin);
    } catch {
      // ignore
    }

    const unsubscribe = achievementManager.onAchievementUnlocked((ach) => {
      setUnlockedToast(ach);
      setTimeout(() => {
        setUnlockedToast((current) => (current?.id === ach.id ? null : current));
      }, 4000);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Initialize Game Engine on Canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new GameEngine(canvasRef.current, {
      onStatsUpdate: (stats) => {
        setGameStats({ ...stats });
        if (engineRef.current) {
          setActivePowerUps(engineRef.current.getActivePowerUps());
        }
      },
      onGameOver: (stats) => {
        setGameStats({ ...stats });
        setScreenState('GAMEOVER');
      },
      onVictory: (stats) => {
        setGameStats({ ...stats });
        setScreenState('VICTORY');
      },
      onLevelUp: () => {},
      onMissionChange: () => {},
      onScoreEvent: () => {},
    });

    engine.setMateri(currentMateriId);
    engine.setMode(currentMode);
    engine.setSkin(currentSkinId);
    engine.setAutoShoot(autoShoot);
    engine.startAmbientMode();
    engineRef.current = engine;

    return () => {
      engine.destroy();
    };
  }, []);

  // Mode Selection
  const handleSelectMode = useCallback((mode: GameMode) => {
    setCurrentMode(mode);
    try {
      localStorage.setItem('letterfighter_mode', mode);
    } catch {
      // ignore
    }
    if (engineRef.current) {
      engineRef.current.setMode(mode);
    }
    setGameStats((prev) => ({
      ...prev,
      mode,
      highScore: achievementManager.getHighScore(mode),
    }));
  }, []);

  // Sync selected sector with engine
  const handleSelectMateri = useCallback((id: string) => {
    setCurrentMateriId(id);
    try {
      localStorage.setItem('letterfighter_materi', id);
    } catch {
      // ignore
    }
    if (engineRef.current) {
      engineRef.current.setMateri(id);
    }
  }, []);

  // Ship Skin Selection
  const handleSelectSkin = useCallback((skinId: ShipSkinId) => {
    setCurrentSkinId(skinId);
    achievementManager.selectSkin(skinId);
    if (engineRef.current) {
      engineRef.current.setSkin(skinId);
    }
    setGameStats((prev) => ({ ...prev, shipSkin: skinId }));
  }, []);

  // Quick cycle between aircraft skins
  const handleCycleShip = useCallback(() => {
    if (engineRef.current) {
      const nextSkin = engineRef.current.cycleNextSkin();
      setCurrentSkinId(nextSkin);
      setGameStats((prev) => ({ ...prev, shipSkin: nextSkin }));
    }
  }, []);

  // Weapon Selection
  const handleSelectWeapon = useCallback((weapon: WeaponType) => {
    if (engineRef.current) {
      engineRef.current.setWeapon(weapon);
    }
  }, []);

  // Cycle Weapon for mobile touch control
  const handleCycleWeapon = useCallback(() => {
    const weapons: WeaponType[] = ['standard', 'double', 'spread', 'energy_blast'];
    const currentIdx = weapons.indexOf(gameStats.activeWeapon);
    const nextWeapon = weapons[(currentIdx + 1) % weapons.length];
    handleSelectWeapon(nextWeapon);
  }, [gameStats.activeWeapon, handleSelectWeapon]);

  // Special Combat Ability Trigger (14 Jurus)
  const handleTriggerJurus = useCallback((id: JurusId) => {
    if (engineRef.current) {
      engineRef.current.triggerJurus(id);
    }
  }, []);

  // Super Ultimate Nova Strike / Galaxy Breaker Trigger
  const handleTriggerNovaStrike = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.triggerNovaStrike();
    }
  }, []);

  // Transform between Jet & Mecha Robot Mode
  const handleToggleRobotMode = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.toggleRobotMode();
    }
  }, []);

  // Toggle Forest Biome Arena & Tantangan Hutan
  const handleToggleForestBiome = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.toggleForestBiome();
    }
  }, []);

  // Toggle Mobile Control Style (Touch Drag vs D-Pad)
  const handleToggleControlMode = useCallback(() => {
    setControlMode((prev) => {
      const next = prev === 'touch_drag' ? 'dpad' : 'touch_drag';
      try {
        localStorage.setItem('letterfighter_control_mode', next);
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  // Toggle Auto-Shoot for Mobile Phones
  const handleToggleAutoShoot = useCallback(() => {
    setAutoShootState((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('letterfighter_autoshoot', String(next));
      } catch {
        // ignore
      }
      if (engineRef.current) {
        engineRef.current.setAutoShoot(next);
      }
      return next;
    });
  }, []);

  // Toggle Haptic Feedback
  const handleToggleHaptics = useCallback(() => {
    setHapticsEnabled((prev) => {
      const next = !prev;
      haptics.setEnabled(next);
      return next;
    });
  }, []);

  // Start / Launch Game
  const handleStartGame = useCallback(() => {
    if (!engineRef.current) return;
    engineRef.current.setMateri(currentMateriId);
    engineRef.current.setMode(currentMode);
    engineRef.current.setSkin(currentSkinId);
    engineRef.current.setAutoShoot(autoShoot);
    engineRef.current.start();
    setScreenState('PLAYING');
  }, [currentMateriId, currentMode, currentSkinId, autoShoot]);

  // Pause Game
  const handlePause = useCallback(() => {
    if (!engineRef.current) return;
    engineRef.current.togglePause();
    setScreenState('PAUSED');
  }, []);

  // Resume Game
  const handleResume = useCallback(() => {
    if (!engineRef.current) return;
    engineRef.current.togglePause();
    setScreenState('PLAYING');
  }, []);

  // Toggle 3D Cinematic Sci-Fi Engine
  const handleToggle3D = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.toggle3DVisual();
    }
  }, []);

  // Cycle Camera Mode (Chase 3D -> Cockpit FPV -> 2D Retro)
  const handleCycleCamera = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.cycleCameraMode();
    }
  }, []);

  // Toggle PS5 Graphics Mode (Ray-Tracing Ultra vs 60FPS Performance)
  const handleTogglePS5Graphics = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.togglePS5GraphicsMode();
    }
  }, []);

  // Overcharge burst volley when tapping shoot during auto-shoot
  const handleOverchargeBurst = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.triggerOverchargeBurst();
    }
  }, []);

  // Change location/world dynamically
  const handleSelectWorld = useCallback((worldId: number) => {
    if (engineRef.current) {
      engineRef.current.setWorld(worldId);
    }
  }, []);

  // Toggle God Mode / Infinite Lives & Anti-Plane Super Weapons
  const handleToggleGodMode = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.toggleGodMode();
    }
  }, []);

  // Restart Game (Robust replay with zero crashes)
  const handleRestart = useCallback(() => {
    try {
      if (!engineRef.current) return;
      engineRef.current.setMateri(currentMateriId);
      engineRef.current.setMode(currentMode);
      engineRef.current.setSkin(currentSkinId);
      engineRef.current.setAutoShoot(autoShoot);
      engineRef.current.start();
      setScreenState('PLAYING');
    } catch {
      setScreenState('PLAYING');
    }
  }, [currentMateriId, currentMode, currentSkinId, autoShoot]);

  // Return to Home Menu
  const handleHome = useCallback(() => {
    if (!engineRef.current) return;
    engineRef.current.returnToMenu();
    setScreenState('MENU');
    setGameStats((prev) => ({
      ...prev,
      highScore: achievementManager.getHighScore(currentMode),
    }));
  }, [currentMode]);

  // Virtual Key handler for touch buttons
  const handleVirtualKey = useCallback((key: string, isPressed: boolean) => {
    if (engineRef.current) {
      engineRef.current.setVirtualKey(key, isPressed);
    }
  }, []);

  // Pointer / Touch direct drag tracking on canvas (Ergonomic offset on mobile)
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (screenState !== 'PLAYING' || !engineRef.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = controlMode === 'touch_drag' ? e.clientY - rect.top - 55 : undefined;
    engineRef.current.setPointerTarget(x, true, y);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (screenState !== 'PLAYING' || !engineRef.current || !canvasRef.current) return;
    if (e.buttons > 0 || e.pointerType === 'touch') {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = controlMode === 'touch_drag' ? e.clientY - rect.top - 55 : undefined;
      engineRef.current.setPointerTarget(x, true, y);
    }
  };

  const handlePointerUp = () => {
    if (engineRef.current) {
      engineRef.current.setPointerTarget(0, false);
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full h-[100dvh] overflow-hidden bg-[#060814] flex items-center justify-center select-none font-sans touch-none overscroll-none">
      {/* 1. Main Game Canvas (Always active in background, sharp DPI) */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="absolute inset-0 w-full h-full block touch-none cursor-crosshair"
      />

      {/* 2. Cyber Scanning Lines & Radial Vignette */}
      <div className="absolute inset-0 pointer-events-none cyber-grid opacity-30 z-0" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(2,6,23,0.75)_100%)] z-0" />

      {/* 3. In-Game Achievement Unlock Toast */}
      <AchievementToast achievement={unlockedToast} onDismiss={() => setUnlockedToast(null)} />

      {/* 4. Screen State: MAIN MENU */}
      {screenState === 'MENU' && (
        <MainMenu
          onStartGame={handleStartGame}
          onOpenMateri={() => setShowMateriModal(true)}
          onOpenHowToPlay={() => setShowHowToPlayModal(true)}
          onOpenKamus={() => setShowKamusModal(true)}
          onOpenAchievements={() => setShowAchievementsModal(true)}
          onOpenHangar={() => setShowHangarModal(true)}
          currentMateriId={currentMateriId}
          currentMode={currentMode}
          onSelectMode={handleSelectMode}
          currentSkinId={currentSkinId}
          highScore={gameStats.highScore}
          controlMode={controlMode}
          onToggleControlMode={handleToggleControlMode}
          onSelectWorld={handleSelectWorld}
          currentWorldId={gameStats.currentWorld?.id}
          isGodMode={gameStats.isGodMode}
          onToggleGodMode={handleToggleGodMode}
        />
      )}

      {/* 5. Screen State: PLAYING HUD & Touch Controls */}
      {screenState === 'PLAYING' && (
        <>
          <GameHUD
            stats={gameStats}
            activePowerUps={activePowerUps}
            onPause={handlePause}
            onSelectWeapon={handleSelectWeapon}
            onTriggerJurus={handleTriggerJurus}
            onTriggerNovaStrike={handleTriggerNovaStrike}
            onToggleRobotMode={handleToggleRobotMode}
            onToggleForestBiome={handleToggleForestBiome}
            onToggle3D={handleToggle3D}
            onCycleCamera={handleCycleCamera}
            onTogglePS5Graphics={handleTogglePS5Graphics}
            onSelectWorld={handleSelectWorld}
            onToggleGodMode={handleToggleGodMode}
            onCycleShip={handleCycleShip}
            onOpenHangar={() => setShowHangarModal(true)}
          />
          <TouchControls
            onVirtualKey={handleVirtualKey}
            onCycleWeapon={handleCycleWeapon}
            activeWeapon={gameStats.activeWeapon}
            specialEnergy={gameStats.specialEnergy}
            ultimateEnergy={gameStats.ultimateEnergy}
            novaStrikeReady={gameStats.novaStrikeReady}
            onTriggerJurus={handleTriggerJurus}
            onTriggerNovaStrike={handleTriggerNovaStrike}
            activeJurusCooldowns={gameStats.activeJurusCooldowns}
            isRobotMode={gameStats.isRobotMode}
            onToggleRobotMode={handleToggleRobotMode}
            controlMode={controlMode}
            onToggleControlMode={handleToggleControlMode}
            autoShoot={autoShoot}
            onToggleAutoShoot={handleToggleAutoShoot}
            hapticsEnabled={hapticsEnabled}
            onToggleHaptics={handleToggleHaptics}
            onOverchargeBurst={handleOverchargeBurst}
          />
        </>
      )}

      {/* 6. Screen State: PAUSED MODAL */}
      {screenState === 'PAUSED' && (
        <PauseModal
          onResume={handleResume}
          onRestart={handleRestart}
          onHome={handleHome}
          controlMode={controlMode}
          onToggleControlMode={handleToggleControlMode}
          autoShoot={autoShoot}
          onToggleAutoShoot={handleToggleAutoShoot}
          isGodMode={gameStats.isGodMode}
          onToggleGodMode={handleToggleGodMode}
          cameraMode={gameStats.cameraMode}
          onCycleCamera={handleCycleCamera}
          ps5GraphicsMode={gameStats.ps5GraphicsMode}
          onTogglePS5Graphics={handleTogglePS5Graphics}
        />
      )}

      {/* 7. Screen State: GAME OVER DEBRIEF */}
      {screenState === 'GAMEOVER' && (
        <GameOverModal
          stats={gameStats}
          onRestart={handleRestart}
          onHome={handleHome}
        />
      )}

      {/* 8. Screen State: MISSION COMPLETE / VICTORY */}
      {screenState === 'VICTORY' && (
        <VictoryModal
          stats={gameStats}
          onRestart={handleRestart}
          onHome={handleHome}
          onOpenHangar={() => setShowHangarModal(true)}
        />
      )}

      {/* 9. Dialog: HANGAR PESAWAT MODAL */}
      {showHangarModal && (
        <HangarModal
          currentSkinId={currentSkinId}
          onSelectSkin={handleSelectSkin}
          onClose={() => setShowHangarModal(false)}
          isGodMode={gameStats.isGodMode}
        />
      )}

      {/* 10. Dialog: PILIH MATERI MODAL */}
      {showMateriModal && (
        <MateriModal
          currentMateriId={currentMateriId}
          onSelectMateri={handleSelectMateri}
          onClose={() => setShowMateriModal(false)}
        />
      )}

      {/* 11. Dialog: KAMUS HURUF HIJAIYAH MODAL */}
      {showKamusModal && (
        <KamusModal onClose={() => setShowKamusModal(false)} />
      )}

      {/* 12. Dialog: CARA BERMAIN MODAL */}
      {showHowToPlayModal && (
        <HowToPlayModal onClose={() => setShowHowToPlayModal(false)} />
      )}

      {/* 13. Dialog: AULA PENCAPAIAN MODAL */}
      {showAchievementsModal && (
        <AchievementsModal onClose={() => setShowAchievementsModal(false)} />
      )}
    </div>
  );
}
