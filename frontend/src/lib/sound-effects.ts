/**
 * EDU360 Junior Web Audio API Synthesizer
 * Zero-dependency, lightweight, pure procedural audio engine for K-5 Gamification.
 * Generates pleasant, non-annoying chimes and bubble pops.
 */

class JuniorSoundEngine {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private listeners: Set<(enabled: boolean) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('edu360_junior_sound_enabled');
        this.soundEnabled = stored !== null ? stored === 'true' : true;
      } catch {
        this.soundEnabled = true;
      }
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  public isEnabled(): boolean {
    return this.soundEnabled;
  }

  public setEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('edu360_junior_sound_enabled', enabled ? 'true' : 'false');
      } catch {
        // Ignore storage errors
      }
    }
    this.listeners.forEach((fn) => fn(enabled));
  }

  public toggle(): boolean {
    this.setEnabled(!this.soundEnabled);
    return this.soundEnabled;
  }

  public subscribe(listener: (enabled: boolean) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Bright ascending two-tone chime (C6 ~1046Hz -> G6 ~1568Hz)
   * Triggered when collecting stars or finishing small tasks
   */
  public playStarCollect(): void {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1046.5, now); // C6
    osc1.frequency.exponentialRampToValueAtTime(1567.98, now + 0.12); // G6

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(2093, now + 0.08); // C7 harmonic sparkle
    osc2.frequency.exponentialRampToValueAtTime(3135.96, now + 0.22);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now + 0.06);
    osc1.stop(now + 0.45);
    osc2.stop(now + 0.45);
  }

  /**
   * Triumphant 3-note arpeggio + sparkle chords
   * Triggered when opening a Magic Booster Treasure Chest
   */
  public playChestOpen(): void {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // C Major Arpeggio: C5 (523Hz), E5 (659Hz), G5 (784Hz), C6 (1046Hz)
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = i === notes.length - 1 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.09);

      gain.gain.setValueAtTime(0.001, now + i * 0.09);
      gain.gain.linearRampToValueAtTime(0.2, now + i * 0.09 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.55);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.09);
      osc.stop(now + i * 0.09 + 0.6);
    });

    // Shimmer chord tail
    const shimmerOsc = ctx.createOscillator();
    const shimmerGain = ctx.createGain();
    shimmerOsc.type = 'sine';
    shimmerOsc.frequency.setValueAtTime(1567.98, now + 0.35); // G6
    shimmerGain.gain.setValueAtTime(0.001, now + 0.35);
    shimmerGain.gain.linearRampToValueAtTime(0.12, now + 0.4);
    shimmerGain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);
    shimmerOsc.connect(shimmerGain);
    shimmerGain.connect(ctx.destination);
    shimmerOsc.start(now + 0.35);
    shimmerOsc.stop(now + 1.1);
  }

  /**
   * Soft playful bubble pop
   * Triggered on button clicks, tab switches, and card taps
   */
  public playButtonClick(): void {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Rapid upward pop curve
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(980, now + 0.06);

    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.085);
  }

  /**
   * Gentle whoosh sweep effect
   * Triggered on Rocket launch or island node navigation
   */
  public playRocketLaunch(): void {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Rising sine with resonant filter
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(1300, now + 0.45);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.65);
  }

  /**
   * Victory Fanfare for Level Ups and Grand Achievements
   */
  public playFanfare(): void {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Fanfare chords: G4 -> C5 -> E5 -> G5
    const notes = [392.0, 523.25, 659.25, 783.99];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = now + idx * 0.12;
      const duration = idx === notes.length - 1 ? 0.7 : 0.25;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.18, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.05);
    });
  }
}

// Global Singleton Instance
export const soundEngine = new JuniorSoundEngine();

// Convenience helper functions
export const playStarCollect = () => soundEngine.playStarCollect();
export const playChestOpen = () => soundEngine.playChestOpen();
export const playButtonClick = () => soundEngine.playButtonClick();
export const playRocketLaunch = () => soundEngine.playRocketLaunch();
export const playFanfare = () => soundEngine.playFanfare();
export const isSoundEffectsEnabled = () => soundEngine.isEnabled();
export const setSoundEffectsEnabled = (enabled: boolean) => soundEngine.setEnabled(enabled);
export const toggleSoundEffects = () => soundEngine.toggle();
