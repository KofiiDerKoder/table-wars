/**
 * TABLE WARS! - Sound Engine
 * 
 * This service generates all competition audio cues procedurally using the
 * browser's Web Audio API (OscillatorNode). No external audio files are required,
 * ensuring zero network latency for time-critical sounds like buzzers.
 * 
 * Last Updated: May 13, 2026
 */

export class SoundEngine {
  private static ctx: AudioContext | null = null;

  /** Lazy-initializes the AudioContext (required by modern browser policies) */
  private static getCtx() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as Window & typeof globalThis & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /** Core helper to create an oscillator with a specific envelope */
  private static createOscillator(type: OscillatorType, freq: number, duration: number, volume: number = 0.1) {
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  }

  /** Plays the buzzer sound effect (Major Triad: A4, C#5, E5) */
  static playBuzzer() {
    const freqs = [440, 554.37, 659.25];
    freqs.forEach((f, i) => {
      setTimeout(() => this.createOscillator('square', f, 0.4, 0.05), i * 150);
    });
  }

  /** Plays the success tone for correct answers (C5, E5, G5) */
  static playCorrect() {
    const freqs = [523.25, 659.25, 783.99];
    freqs.forEach((f, i) => {
      setTimeout(() => this.createOscillator('sine', f, 0.6, 0.1), i * 100);
    });
  }

  /** Plays a down-pitched 'wrong' tone (Sawtooth) */
  static playWrong() {
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(200, ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  }

  /** Plays a short ping for countdown alerts */
  static playTimerPing() {
    this.createOscillator('sine', 880, 0.15, 0.2);
  }

  /** Plays a short tick sound (used for timer interval) */
  static playTick() {
    this.createOscillator('sine', 600, 0.05, 0.08);
  }

  /** Plays the victory fanfare (Major Arpeggio) */
  static playCelebration() {
    const freqs = [523.25, 659.25, 783.99, 1046.50];
    freqs.forEach((f, i) => {
      setTimeout(() => this.createOscillator('sine', f, 0.4, 0.2), i * 150);
    });
  }
}
