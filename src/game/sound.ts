/**
 * Synthetic Audio Engine using Web Audio API
 * Generates all arcade shooter sound effects and synthwave ambient music completely in-code.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private bgmGain: GainNode | null = null;
  private isBgmPlaying: boolean = false;
  private bgmIntervalId: number | null = null;

  constructor() {
    // Load mute preference from localStorage if available
    try {
      const savedMute = localStorage.getItem('letterfighter_muted');
      if (savedMute !== null) {
        this.isMuted = savedMute === 'true';
      }
    } catch {
      // ignore
    }
  }

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    try {
      localStorage.setItem('letterfighter_muted', String(this.isMuted));
    } catch {
      // ignore
    }

    if (this.isMuted && this.bgmGain) {
      this.bgmGain.gain.setValueAtTime(0, this.ctx?.currentTime || 0);
    } else if (!this.isMuted && this.bgmGain && this.ctx) {
      this.bgmGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    }

    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public playClick() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch {
      // Audio error ignored
    }
  }

  public playLaser(type: 'normal' | 'double' | 'plasma' | 'spread' = 'normal') {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      if (type === 'normal') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, t);
        osc.frequency.exponentialRampToValueAtTime(140, t + 0.12);
        gain.gain.setValueAtTime(0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.12);
      } else if (type === 'double') {
        // Dual laser chord
        const osc2 = this.ctx.createOscillator();
        osc.type = 'square';
        osc2.type = 'sawtooth';
        osc.frequency.setValueAtTime(960, t);
        osc2.frequency.setValueAtTime(1180, t);
        osc.frequency.exponentialRampToValueAtTime(180, t + 0.15);
        osc2.frequency.exponentialRampToValueAtTime(220, t + 0.15);

        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

        osc.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc2.start(t);
        osc.stop(t + 0.15);
        osc2.stop(t + 0.15);
      } else if (type === 'spread') {
        // 3-way spread laser
        const osc2 = this.ctx.createOscillator();
        const osc3 = this.ctx.createOscillator();
        osc.type = 'triangle';
        osc2.type = 'sawtooth';
        osc3.type = 'sawtooth';

        osc.frequency.setValueAtTime(1200, t);
        osc2.frequency.setValueAtTime(1050, t);
        osc3.frequency.setValueAtTime(900, t);

        osc.frequency.exponentialRampToValueAtTime(260, t + 0.14);
        osc2.frequency.exponentialRampToValueAtTime(220, t + 0.14);
        osc3.frequency.exponentialRampToValueAtTime(190, t + 0.14);

        gain.gain.setValueAtTime(0.22, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

        osc.connect(gain);
        osc2.connect(gain);
        osc3.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc2.start(t);
        osc3.start(t);
        osc.stop(t + 0.14);
        osc2.stop(t + 0.14);
        osc3.stop(t + 0.14);
      } else {
        // Plasma spread
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1400, t);
        osc.frequency.exponentialRampToValueAtTime(300, t + 0.18);
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.18);
      }
    } catch {
      // ignore
    }
  }

  public playEnergyBlast() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      // Heavy charge sweep and release
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, t);
      osc.frequency.exponentialRampToValueAtTime(1800, t + 0.12);
      osc.frequency.exponentialRampToValueAtTime(60, t + 0.4);

      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.4);
    } catch {
      // ignore
    }
  }

  public playWeaponSwitch() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(587.33, t); // D5
      osc.frequency.setValueAtTime(880.0, t + 0.04); // A5

      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.1);
    } catch {
      // ignore
    }
  }

  public playHit() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, t);
      osc.frequency.exponentialRampToValueAtTime(80, t + 0.08);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.08);
    } catch {
      // ignore
    }
  }

  public playExplosion(major: boolean = false) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const duration = major ? 0.45 : 0.25;

      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(major ? 700 : 900, t);
      filter.frequency.exponentialRampToValueAtTime(60, t + duration);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(major ? 0.4 : 0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      const sub = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(major ? 120 : 150, t);
      sub.frequency.exponentialRampToValueAtTime(30, t + duration);
      subGain.gain.setValueAtTime(0.3, t);
      subGain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      sub.connect(subGain);
      subGain.connect(this.ctx.destination);

      noise.start(t);
      sub.start(t);
      sub.stop(t + duration);
    } catch {
      // ignore
    }
  }

  public playCorrect(combo: number = 1) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      const scale = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
      const baseNote = scale[Math.min(combo - 1, scale.length - 1)];

      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(baseNote, t);
      osc1.frequency.setValueAtTime(baseNote * 1.25, t + 0.08);

      osc2.frequency.setValueAtTime(baseNote * 0.5, t);
      osc2.frequency.setValueAtTime(baseNote * 0.75, t + 0.08);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + 0.28);
      osc2.stop(t + 0.28);
    } catch {
      // ignore
    }
  }

  public playComboMilestone(title: string) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const chords = [523.25, 659.25, 783.99, 1046.5]; // C Major
      chords.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t + idx * 0.06);

        gain.gain.setValueAtTime(0.2, t + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.06 + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + idx * 0.06);
        osc.stop(t + idx * 0.06 + 0.35);
      });
    } catch {
      // ignore
    }
  }

  public playWrong() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'square';

      osc1.frequency.setValueAtTime(140, t);
      osc2.frequency.setValueAtTime(148, t);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + 0.3);
      osc2.stop(t + 0.3);
    } catch {
      // ignore
    }
  }

  public playLevelUp() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t + idx * 0.09);

        gain.gain.setValueAtTime(0, t + idx * 0.09);
        gain.gain.linearRampToValueAtTime(0.2, t + idx * 0.09 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.09 + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + idx * 0.09);
        osc.stop(t + idx * 0.09 + 0.3);
      });
    } catch {
      // ignore
    }
  }

  public playBossAlarm() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';

      // Urgent siren modulation
      osc.frequency.setValueAtTime(400, t);
      osc.frequency.linearRampToValueAtTime(750, t + 0.25);
      osc.frequency.linearRampToValueAtTime(400, t + 0.5);
      osc.frequency.linearRampToValueAtTime(750, t + 0.75);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.85);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.85);
    } catch {
      // ignore
    }
  }

  public playBossShoot() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, t);
      osc.frequency.exponentialRampToValueAtTime(70, t + 0.16);

      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.16);
    } catch {
      // ignore
    }
  }

  public playBossShieldBreak() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const notes = [1200, 1500, 1800, 2400]; // crystal shatter
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + idx * 0.04);
        gain.gain.setValueAtTime(0.2, t + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.04 + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + idx * 0.04);
        osc.stop(t + idx * 0.04 + 0.2);
      });
    } catch {
      // ignore
    }
  }

  public playBossDefeat() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      // Multi-staged explosion blast
      for (let i = 0; i < 4; i++) {
        setTimeout(() => {
          this.playExplosion(true);
        }, i * 220);
      }
      setTimeout(() => {
        this.playLevelUp();
      }, 900);
    } catch {
      // ignore
    }
  }

  public playAchievement() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C, E, G, High C
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + idx * 0.08);

        gain.gain.setValueAtTime(0.25, t + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + idx * 0.08);
        osc.stop(t + idx * 0.08 + 0.4);
      });
    } catch {
      // ignore
    }
  }

  public playPowerup() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, t);
      osc.frequency.exponentialRampToValueAtTime(1200, t + 0.25);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.25);
    } catch {
      // ignore
    }
  }

  public playGameOver() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const notes = [330, 311, 293, 220];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t + idx * 0.14);

        gain.gain.setValueAtTime(0.22, t + idx * 0.14);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.14 + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + idx * 0.14);
        osc.stop(t + idx * 0.14 + 0.3);
      });
    } catch {
      // ignore
    }
  }

  // ==================== 8 JURUS & EPIC COMBAT SOUND SYNTHESIS ====================
  public playDoublePhoton() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      [0, 0.035].forEach((dt) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1150, t + dt);
        osc.frequency.exponentialRampToValueAtTime(220, t + dt + 0.11);

        gain.gain.setValueAtTime(0.2, t + dt);
        gain.gain.exponentialRampToValueAtTime(0.001, t + dt + 0.11);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + dt);
        osc.stop(t + dt + 0.11);
      });
    } catch {
      // ignore
    }
  }

  public playTripleNova() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      [600, 850, 1100].forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t + idx * 0.025);
        osc.frequency.exponentialRampToValueAtTime(120, t + idx * 0.025 + 0.18);

        gain.gain.setValueAtTime(0.18, t + idx * 0.025);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.025 + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + idx * 0.025);
        osc.stop(t + idx * 0.025 + 0.18);
      });
    } catch {
      // ignore
    }
  }

  public playPlasmaBurst() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      // Heavy deep plasma charge & punchy blast
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(380, t);
      osc.frequency.exponentialRampToValueAtTime(75, t + 0.32);

      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.32);
    } catch {
      // ignore
    }
  }

  public playQuantumBeam() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      // Piercing supersonic laser beam
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(1800, t);
      osc.frequency.exponentialRampToValueAtTime(280, t + 0.38);

      gain.gain.setValueAtTime(0.28, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.38);
    } catch {
      // ignore
    }
  }

  public playHomingMissile() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      // Dual missile launch with thruster whistling
      [0, 0.06].forEach((delay) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(260, t + delay);
        osc.frequency.linearRampToValueAtTime(1100, t + delay + 0.12);
        osc.frequency.exponentialRampToValueAtTime(420, t + delay + 0.28);

        gain.gain.setValueAtTime(0.22, t + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.28);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + delay);
        osc.stop(t + delay + 0.28);
      });
    } catch {
      // ignore
    }
  }

  public playSpiralGalaxyShot() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      // Twin oscillating harmonic vortex
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(480, t);
      osc2.frequency.setValueAtTime(720, t);
      osc1.frequency.linearRampToValueAtTime(960, t + 0.18);
      osc2.frequency.linearRampToValueAtTime(1440, t + 0.18);
      osc1.frequency.exponentialRampToValueAtTime(220, t + 0.36);
      osc2.frequency.exponentialRampToValueAtTime(330, t + 0.36);

      gain.gain.setValueAtTime(0.24, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.36);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);
      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + 0.36);
      osc2.stop(t + 0.36);
    } catch {
      // ignore
    }
  }

  public playStarShieldBurst() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      // Resonant crystal shield eruption chord
      [350, 525, 700, 1050].forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.4, t + 0.42);

        gain.gain.setValueAtTime(0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.42);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.42);
      });
    } catch {
      // ignore
    }
  }

  public playMeteorRain() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      // Staggered meteors crashing down
      [0, 0.08, 0.16, 0.24, 0.32].forEach((delay, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800 - idx * 70, t + delay);
        osc.frequency.exponentialRampToValueAtTime(90, t + delay + 0.22);

        gain.gain.setValueAtTime(0.18, t + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + delay);
        osc.stop(t + delay + 0.22);
      });
    } catch {
      // ignore
    }
  }

  public playNovaStrikeCharge() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      // Sub-bass cosmic swell with ascending celestial resonance
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(55, t);
      osc.frequency.linearRampToValueAtTime(440, t + 0.65);

      gain.gain.setValueAtTime(0.08, t);
      gain.gain.linearRampToValueAtTime(0.5, t + 0.65);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.65);
    } catch {
      // ignore
    }
  }

  public playNovaStrikeFire() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      // Cataclysmic detonation & beam blast
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(900, t);
      osc1.frequency.exponentialRampToValueAtTime(50, t + 1.0);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(160, t);
      osc2.frequency.exponentialRampToValueAtTime(25, t + 1.0);

      gain.gain.setValueAtTime(0.65, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.0);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + 1.0);
      osc2.stop(t + 1.0);
    } catch {
      // ignore
    }
  }

  public playHomingPhoenix() {
    this.playHomingMissile();
  }

  public playSpiralDragon() {
    this.playSpiralGalaxyShot();
  }

  public playThunderRailCharge() {
    this.playQuantumBeam();
  }

  public playThunderRailFire() {
    this.playQuantumBeam();
  }

  public playGalaxyBreakerCharge() {
    this.playNovaStrikeCharge();
  }

  public playGalaxyBreakerFire() {
    this.playNovaStrikeFire();
  }

  public playOrbitalGuard() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      // Soft energetic drone hum with resonant harmonics
      [440, 660, 880].forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.2, t + 0.35);

        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + idx * 0.04);
        osc.stop(t + idx * 0.04 + 0.35);
      });
    } catch {
      // ignore
    }
  }

  public playCosmicSword() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      // High-pitched energy blade hum and whooshing slash
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1400, t);
      osc.frequency.linearRampToValueAtTime(320, t + 0.28);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.28);
    } catch {
      // ignore
    }
  }

  public playDash() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(450, t);
      osc.frequency.exponentialRampToValueAtTime(150, t + 0.15);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.15);
    } catch {
      // ignore
    }
  }

  public playCombatCombo(title: string) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const chords = [523.25, 659.25, 783.99, 1046.5, 1318.5]; // C Major 9
      chords.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t + idx * 0.05);

        gain.gain.setValueAtTime(0.22, t + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.05 + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + idx * 0.05);
        osc.stop(t + idx * 0.05 + 0.35);
      });
    } catch {
      // ignore
    }
  }

  /**
   * Vocalizes "Sahabat KAFA [Name] Power!" using Web Speech API + heroic synth audio flourish
   */
  public speakSahabatKafaPower(customPower?: string) {
    const text = customPower || 'Sahabat KAFA Power!';
    if (this.isMuted) return;
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'id-ID';
        utterance.rate = 1.18;
        utterance.pitch = 1.25;
        utterance.volume = 1.0;
        const voices = window.speechSynthesis.getVoices();
        const idVoice = voices.find((v) => v.lang.toLowerCase().includes('id'));
        if (idVoice) utterance.voice = idVoice;
        window.speechSynthesis.speak(utterance);
      }
    } catch {
      // ignore
    }
    this.playHeroicShoutChime();
  }

  /**
   * Vocalizes target letter / word pronunciation for active learning
   */
  public speakTargetPronunciation(text: string, subject: string = 'hijaiyah') {
    if (this.isMuted) return;
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        if (subject === 'hijaiyah') {
          utterance.lang = 'ar-SA';
          utterance.rate = 0.9;
        } else if (subject === 'inggris') {
          utterance.lang = 'en-US';
          utterance.rate = 0.95;
        } else {
          utterance.lang = 'id-ID';
          utterance.rate = 1.0;
        }
        utterance.pitch = 1.05;
        utterance.volume = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    } catch {
      // ignore
    }
  }

  public playForestPower() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      // Resonant organic nature chime chord + crystalline rustle
      [329.63, 440, 523.25, 659.25].forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + idx * 0.04);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.5, t + idx * 0.04 + 0.35);

        gain.gain.setValueAtTime(0.2, t + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.04 + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + idx * 0.04);
        osc.stop(t + idx * 0.04 + 0.35);
      });
    } catch {
      // ignore
    }
  }

  public playSolarPower() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      // Blazing solar eruption with plasma sizzle
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(250, t);
      osc.frequency.exponentialRampToValueAtTime(1200, t + 0.15);
      osc.frequency.exponentialRampToValueAtTime(80, t + 0.45);

      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.45);
    } catch {
      // ignore
    }
  }

  public playBlizzardPower() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      // Sub-zero frost crystal shatter and whistling wind
      [880, 1174.66, 1760, 2349.32].forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t + idx * 0.02);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.6, t + idx * 0.02 + 0.28);

        gain.gain.setValueAtTime(0.22, t + idx * 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.02 + 0.28);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + idx * 0.02);
        osc.stop(t + idx * 0.02 + 0.28);
      });
    } catch {
      // ignore
    }
  }

  public playCyclonePower() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      // High-pressure swirling cyclone vortex
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, t);
      osc.frequency.linearRampToValueAtTime(900, t + 0.15);
      osc.frequency.linearRampToValueAtTime(250, t + 0.35);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.35);
    } catch {
      // ignore
    }
  }

  public playMeteorPower() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      // Rumbling meteor cascade with atmospheric friction
      [140, 220, 310, 480].forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq * 1.8, t + idx * 0.05);
        osc.frequency.exponentialRampToValueAtTime(60, t + idx * 0.05 + 0.4);

        gain.gain.setValueAtTime(0.25, t + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.05 + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + idx * 0.05);
        osc.stop(t + idx * 0.05 + 0.4);
      });
    } catch {
      // ignore
    }
  }

  public playGaiaPower() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      // Low tectonic rumble
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(80, t);
      osc.frequency.linearRampToValueAtTime(45, t + 0.5);

      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.5);

      // Nature crystal harmonic flourish
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(freq, t + 0.1 + idx * 0.04);
        gain2.gain.setValueAtTime(0.2, t + 0.1 + idx * 0.04);
        gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.1 + idx * 0.04 + 0.35);
        osc2.connect(gain2);
        gain2.connect(this.ctx.destination);
        osc2.start(t + 0.1 + idx * 0.04);
        osc2.stop(t + 0.1 + idx * 0.04 + 0.35);
      });
    } catch {
      // ignore
    }
  }

  public playChallengeStart() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      // Dramatic ascending fanfare chord sequence
      [349.23, 440, 523.25, 698.46, 880].forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        const start = t + idx * 0.06;
        osc.frequency.setValueAtTime(freq, start);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.05, start + 0.4);

        gain.gain.setValueAtTime(0.28, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(start);
        osc.stop(start + 0.4);
      });
    } catch {
      // ignore
    }
  }

  public playChallengeComplete() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      // Celebratory major victory flourish
      [523.25, 659.25, 783.99, 1046.5, 1318.51].forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        const start = t + idx * 0.07;
        osc.frequency.setValueAtTime(freq, start);
        osc.frequency.linearRampToValueAtTime(freq * 1.02, start + 0.45);

        gain.gain.setValueAtTime(0.3, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(start);
        osc.stop(start + 0.45);
      });
    } catch {
      // ignore
    }
  }

  public playHeroicShoutChime() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      // Bright heroic power chord (C5 - E5 - G5 - C6)
      const chord = [523.25, 659.25, 783.99, 1046.5];
      chord.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t + idx * 0.03);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.05, t + idx * 0.03 + 0.45);

        gain.gain.setValueAtTime(0.2, t + idx * 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.03 + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + idx * 0.03);
        osc.stop(t + idx * 0.03 + 0.45);
      });
    } catch {
      // ignore
    }
  }

  public playTransformRobot() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      // Mechanical servo stepped sound (Transformers classic shift)
      [220, 330, 440, 660, 880].forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        const start = t + idx * 0.07;
        osc.frequency.setValueAtTime(freq, start);
        osc.frequency.linearRampToValueAtTime(freq * 1.3, start + 0.08);

        gain.gain.setValueAtTime(0.18, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.08);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(start);
        osc.stop(start + 0.08);
      });
    } catch {
      // ignore
    }
  }

  public playTransformJet() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      // Jet turbine spool & aerodynamic thrust
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, t);
      osc.frequency.exponentialRampToValueAtTime(950, t + 0.35);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.35);
    } catch {
      // ignore
    }
  }

  /**
   * Ambient synth bassline arpeggio for retro sci-fi arcade atmosphere
   */
  public startBgm() {
    if (this.isBgmPlaying) return;
    this.isBgmPlaying = true;
    try {
      this.initContext();
      if (!this.ctx) return;

      const notes = [110, 110, 130.8, 146.8, 110, 164.8, 146.8, 123.47];
      let step = 0;

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(this.isMuted ? 0 : 0.05, this.ctx.currentTime);
      this.bgmGain.connect(this.ctx.destination);

      this.bgmIntervalId = window.setInterval(() => {
        if (!this.ctx || !this.isBgmPlaying || this.isMuted) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(notes[step % notes.length], t);

        noteGain.gain.setValueAtTime(0.12, t);
        noteGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

        osc.connect(noteGain);
        if (this.bgmGain) {
          noteGain.connect(this.bgmGain);
        }
        osc.start(t);
        osc.stop(t + 0.2);

        step++;
      }, 220);
    } catch {
      // ignore
    }
  }

  public stopBgm() {
    this.isBgmPlaying = false;
    if (this.bgmIntervalId !== null) {
      clearInterval(this.bgmIntervalId);
      this.bgmIntervalId = null;
    }
    if (this.bgmGain) {
      try {
        this.bgmGain.disconnect();
      } catch {
        // ignore
      }
      this.bgmGain = null;
    }
  }
}

export const sound = new SoundEngine();
