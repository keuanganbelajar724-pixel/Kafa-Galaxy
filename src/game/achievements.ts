import { Achievement, SaveData, ShipSkinId } from './types';
import { sound } from './sound';

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_flight',
    title: 'First Flight',
    description: 'Luncurkan misi penerbangan luar angkasa KAFA pertamamu.',
    icon: '🚀',
    isUnlocked: false,
  },
  {
    id: 'letter_master',
    title: 'Letter Master',
    description: 'Hancurkan 25 target huruf yang benar dengan sukses.',
    icon: '🎯',
    isUnlocked: false,
    progress: 0,
    maxProgress: 25,
  },
  {
    id: 'combo_legend',
    title: 'Combo Legend',
    description: 'Capai rentetan kombo tembakan benar hingga 6x berturut-turut.',
    icon: '🔥',
    isUnlocked: false,
    progress: 0,
    maxProgress: 6,
  },
  {
    id: 'boss_slayer',
    title: 'Boss Slayer',
    description: 'Kalahkan Penjaga Galaksi dalam pertempuran epik.',
    icon: '👑',
    isUnlocked: false,
  },
  {
    id: 'galaxy_defender',
    title: 'Galaxy Defender',
    description: 'Capai Level 5 di Campaign atau raih total 5.000 skor.',
    icon: '🛡️',
    isUnlocked: false,
  },
  {
    id: 'sharpshooter',
    title: 'Sharpshooter',
    description: 'Selesaikan sesi permainan dengan akurasi minimal 90%.',
    icon: '🎖️',
    isUnlocked: false,
  },
  {
    id: 'arsenal_master',
    title: 'Weapon Specialist',
    description: 'Tembakkan seluruh 4 jenis senjata luar angkasa (Double, Spread, Energy Blast).',
    icon: '⚡',
    isUnlocked: false,
    progress: 1,
    maxProgress: 4,
  },
  {
    id: 'survival_hero',
    title: 'Survival Hero',
    description: 'Bertahan hidup lebih dari 60 detik di Survival Mode.',
    icon: '⏱️',
    isUnlocked: false,
  },
];

const SAVE_KEY = 'letterfighter_save_v2';

class AchievementManager {
  private saveData: SaveData;
  private unlockListeners: ((achievement: Achievement) => void)[] = [];

  constructor() {
    this.saveData = this.loadSaveData();
  }

  private loadSaveData(): SaveData {
    const defaultData: SaveData = {
      version: 2,
      highScores: {
        campaign: 0,
        survival: 0,
        accuracy: 0,
      },
      totalGamesPlayed: 0,
      totalTargetsDestroyed: 0,
      bossesDefeated: 0,
      unlockedAchievements: [],
      unlockedSkins: ['pioneer'],
      selectedSkin: 'pioneer',
      bestAccuracy: 0,
    };

    try {
      const stored = localStorage.getItem(SAVE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...defaultData,
          ...parsed,
          highScores: { ...defaultData.highScores, ...(parsed.highScores || {}) },
          unlockedSkins: parsed.unlockedSkins || ['pioneer'],
          selectedSkin: parsed.selectedSkin || 'pioneer',
        };
      }

      const oldHighScore = localStorage.getItem('letterfighter_highscore');
      if (oldHighScore) {
        const score = parseInt(oldHighScore, 10);
        if (!isNaN(score)) {
          defaultData.highScores.campaign = score;
        }
      }
    } catch {
      // fallback
    }

    return defaultData;
  }

  public save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.saveData));
    } catch {
      // ignore
    }
  }

  public getSaveData(): SaveData {
    return { ...this.saveData };
  }

  public getSelectedSkin(): ShipSkinId {
    return this.saveData.selectedSkin || 'pioneer';
  }

  public selectSkin(skinId: ShipSkinId): boolean {
    if (this.isSkinUnlocked(skinId)) {
      this.saveData.selectedSkin = skinId;
      this.save();
      return true;
    }
    return false;
  }

  public isSkinUnlocked(skinId: ShipSkinId, isGodMode?: boolean): boolean {
    if (skinId === 'pioneer' || isGodMode) return true;
    if (this.saveData.unlockedSkins?.includes(skinId)) return true;

    // Dynamic milestone unlocks
    if (skinId === 'phantom' && (this.saveData.unlockedAchievements.includes('boss_slayer') || this.saveData.unlockedAchievements.includes('combo_legend'))) {
      this.unlockSkin('phantom');
      return true;
    }
    if (skinId === 'nova' && (this.saveData.highScores.campaign >= 3000 || this.saveData.totalTargetsDestroyed >= 20)) {
      this.unlockSkin('nova');
      return true;
    }
    if (skinId === 'titan' && (this.saveData.unlockedAchievements.includes('sharpshooter') || this.saveData.bossesDefeated >= 1)) {
      this.unlockSkin('titan');
      return true;
    }
    if (skinId === 'valkyrie' && (this.saveData.highScores.campaign >= 2000 || this.saveData.totalTargetsDestroyed >= 15)) {
      this.unlockSkin('valkyrie');
      return true;
    }
    if (skinId === 'apocalypse' && (this.saveData.bossesDefeated >= 1 || this.saveData.highScores.campaign >= 4000)) {
      this.unlockSkin('apocalypse');
      return true;
    }

    return false;
  }

  public unlockSkin(skinId: ShipSkinId) {
    if (!this.saveData.unlockedSkins.includes(skinId)) {
      this.saveData.unlockedSkins.push(skinId);
      this.save();
    }
  }

  public getHighScore(mode: 'campaign' | 'survival' | 'accuracy'): number {
    return this.saveData.highScores[mode] || 0;
  }

  public updateHighScore(mode: 'campaign' | 'survival' | 'accuracy', score: number): boolean {
    const current = this.saveData.highScores[mode] || 0;
    if (score > current) {
      this.saveData.highScores[mode] = score;
      if (mode === 'campaign') {
        try {
          localStorage.setItem('letterfighter_highscore', String(score));
        } catch {
          // ignore
        }
      }
      this.save();
      return true;
    }
    return false;
  }

  public incrementGamesPlayed() {
    this.saveData.totalGamesPlayed++;
    this.checkUnlock('first_flight');
    this.save();
  }

  public addTargetsDestroyed(count: number = 1) {
    this.saveData.totalTargetsDestroyed += count;
    if (this.saveData.totalTargetsDestroyed >= 25) {
      this.checkUnlock('letter_master');
    }
    this.save();
  }

  public recordBossDefeated() {
    this.saveData.bossesDefeated++;
    this.checkUnlock('boss_slayer');
    this.unlockSkin('phantom');
    this.save();
  }

  public recordCombo(combo: number) {
    if (combo >= 6) {
      this.checkUnlock('combo_legend');
    }
  }

  public recordAccuracy(acc: number, totalHits: number) {
    if (acc > this.saveData.bestAccuracy) {
      this.saveData.bestAccuracy = acc;
    }
    if (acc >= 90 && totalHits >= 10) {
      this.checkUnlock('sharpshooter');
      this.unlockSkin('titan');
    }
    this.save();
  }

  public recordScoreOrLevel(score: number, level: number) {
    if (score >= 5000 || level >= 5) {
      this.checkUnlock('galaxy_defender');
    }
    if (score >= 3000) {
      this.unlockSkin('nova');
    }
  }

  public recordSurvivalTime(seconds: number) {
    if (seconds >= 60) {
      this.checkUnlock('survival_hero');
    }
  }

  public checkUnlock(id: string) {
    if (this.saveData.unlockedAchievements.includes(id)) return;

    this.saveData.unlockedAchievements.push(id);
    this.save();

    const ach = INITIAL_ACHIEVEMENTS.find((a) => a.id === id);
    if (ach) {
      const unlockedAch: Achievement = {
        ...ach,
        isUnlocked: true,
        unlockedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };
      sound.playAchievement();
      this.unlockListeners.forEach((listener) => listener(unlockedAch));
    }
  }

  public onAchievementUnlocked(listener: (achievement: Achievement) => void) {
    this.unlockListeners.push(listener);
    return () => {
      this.unlockListeners = this.unlockListeners.filter((l) => l !== listener);
    };
  }

  public getAllAchievements(): Achievement[] {
    return INITIAL_ACHIEVEMENTS.map((ach) => {
      const isUnlocked = this.saveData.unlockedAchievements.includes(ach.id);
      let progress = ach.progress;
      if (ach.id === 'letter_master') {
        progress = Math.min(25, this.saveData.totalTargetsDestroyed);
      }
      return {
        ...ach,
        isUnlocked,
        progress,
      };
    });
  }
}

export const achievementManager = new AchievementManager();
