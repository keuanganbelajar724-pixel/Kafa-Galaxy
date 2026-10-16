/**
 * Haptic Vibration Feedback Engine for Mobile Smartphones (HP)
 * Provides subtle, tactile vibrations for actions like shooting, hitting, combos, and jurus.
 */

export type HapticType =
  | 'tap'
  | 'button'
  | 'shoot'
  | 'hit'
  | 'error'
  | 'combo'
  | 'jurus'
  | 'ultimate'
  | 'levelUp';

class HapticsEngine {
  private enabled: boolean = true;

  constructor() {
    try {
      const saved = localStorage.getItem('letterfighter_haptics');
      if (saved !== null) {
        this.enabled = saved === 'true';
      }
    } catch {
      this.enabled = true;
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
    try {
      localStorage.setItem('letterfighter_haptics', val ? 'true' : 'false');
    } catch {
      // ignore
    }
  }

  public trigger(type: HapticType = 'tap') {
    if (!this.enabled) return;
    if (typeof window === 'undefined' || !('navigator' in window) || !navigator.vibrate) return;

    try {
      switch (type) {
        case 'tap':
        case 'button':
          navigator.vibrate(10);
          break;
        case 'shoot':
          navigator.vibrate(8);
          break;
        case 'hit':
          navigator.vibrate(22);
          break;
        case 'error':
          navigator.vibrate([35, 30, 45]);
          break;
        case 'combo':
          navigator.vibrate([15, 20, 25]);
          break;
        case 'jurus':
          navigator.vibrate([40, 25, 60]);
          break;
        case 'ultimate':
          navigator.vibrate([60, 30, 80, 40, 120]);
          break;
        case 'levelUp':
          navigator.vibrate([30, 20, 30, 20, 50]);
          break;
        default:
          navigator.vibrate(15);
      }
    } catch {
      // Fail silently if vibration API blocked by policy
    }
  }
}

export const haptics = new HapticsEngine();
