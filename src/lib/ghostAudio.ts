/**
 * Procedural Web Audio API sound engine for "Completely Normal Notepad".
 * Generates eerie, delicate ghostly tones without needing any external audio assets.
 */

class GhostSoundEngine {
  private ctx: AudioContext | null = null;
  private exorcismOsc: OscillatorNode | null = null;
  private exorcismGain: GainNode | null = null;
  private exorcismFilter: BiquadFilterNode | null = null;

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
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
  }

  /**
   * Sound when a ghost rises from deleted text.
   * Wisps: high fluttery chime
   * Word: soft wooden floor creak & whisper
   * Sentence: deep hollow resonance
   * Regret: melancholic minor chord swell
   * Poltergeist: sudden chaotic harmonic burst
   */
  public playSpawn(type: 'wisp' | 'word' | 'sentence' | 'regret' | 'poltergeist', volume = 0.5) {
    const ctx = this.initContext();
    if (!ctx) return;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume * 0.4, ctx.currentTime);
    masterGain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'wisp') {
      // Rapid fluttering high frequency chirp
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.16);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.22);
    } else if (type === 'regret') {
      // Mournful dual sine chord with slow soft attack
      [220, 261.63, 329.63].forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.25);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.9);
      });
    } else if (type === 'poltergeist') {
      // Multiple detuned waves burst
      [110, 165, 233, 440].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq * (1 + idx * 0.05), now);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.6, now + 0.4);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, now);
        filter.frequency.exponentialRampToValueAtTime(200, now + 0.4);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.5);
      });
    } else if (type === 'sentence') {
      // Deep hollow resonance
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(130, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.6);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(240, now);
      filter.Q.value = 3;

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.35, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.75);
    } else {
      // Word ghost: Soft creak and airy whisper
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(240, now + 0.25);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.35);
    }
  }

  /**
   * Sound when dropping a ghost back into the text.
   * Gentle, satisfying soul restoration bell.
   */
  public playRestore(volume = 0.5) {
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume * 0.45, now);
    masterGain.connect(ctx.destination);

    // Ethereal chime chord (E5, B5)
    [659.25, 987.77].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.35 - idx * 0.1, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now + idx * 0.04);
      osc.stop(now + 0.6);
    });
  }

  /**
   * Sound when picking up a ghost to drag.
   */
  public playCatch(volume = 0.5) {
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(350, now);
    osc.frequency.linearRampToValueAtTime(520, now + 0.12);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(volume * 0.2, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.16);
  }

  /**
   * Sound when ghost dodges cursor.
   */
  public playDodge(volume = 0.5) {
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(650, now + 0.1);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(volume * 0.15, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.14);
  }

  /**
   * Continuous swirling vortex sound while holding Exorcism button.
   * Progress is 0.0 to 1.0.
   */
  public startExorcismVortex(volume = 0.5) {
    const ctx = this.initContext();
    if (!ctx) return;

    if (this.exorcismOsc) {
      this.stopExorcismVortex();
    }

    const now = ctx.currentTime;
    this.exorcismOsc = ctx.createOscillator();
    this.exorcismGain = ctx.createGain();
    this.exorcismFilter = ctx.createBiquadFilter();

    this.exorcismOsc.type = 'sawtooth';
    this.exorcismOsc.frequency.setValueAtTime(80, now);

    this.exorcismFilter.type = 'lowpass';
    this.exorcismFilter.frequency.setValueAtTime(200, now);

    this.exorcismGain.gain.setValueAtTime(0.001, now);
    this.exorcismGain.gain.linearRampToValueAtTime(volume * 0.3, now + 0.2);

    this.exorcismOsc.connect(this.exorcismFilter);
    this.exorcismFilter.connect(this.exorcismGain);
    this.exorcismGain.connect(ctx.destination);

    this.exorcismOsc.start(now);
  }

  public updateExorcismProgress(progress: number) {
    if (!this.ctx || !this.exorcismOsc || !this.exorcismFilter) return;
    const now = this.ctx.currentTime;
    // As progress goes from 0 to 1, frequency rises from 80Hz to 360Hz, filter opens from 200Hz to 1600Hz
    this.exorcismOsc.frequency.setTargetAtTime(80 + progress * 280, now, 0.05);
    this.exorcismFilter.frequency.setTargetAtTime(200 + progress * 1400, now, 0.05);
  }

  public stopExorcismVortex() {
    if (this.exorcismGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.exorcismGain.gain.setTargetAtTime(0.0001, now, 0.05);
      setTimeout(() => {
        try {
          this.exorcismOsc?.stop();
          this.exorcismOsc?.disconnect();
          this.exorcismGain?.disconnect();
          this.exorcismFilter?.disconnect();
        } catch {
          // ignore already stopped
        }
        this.exorcismOsc = null;
        this.exorcismGain = null;
        this.exorcismFilter = null;
      }, 100);
    }
  }

  /**
   * Climax chime when exorcism completes.
   */
  public playExorcismComplete(volume = 0.5) {
    this.stopExorcismVortex();
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume * 0.4, now);
    masterGain.connect(ctx.destination);

    // Choral major chord ascending and dissolving
    [440, 554.37, 659.25, 880].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.05 + idx * 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now + idx * 0.05);
      osc.stop(now + 1.3);
    });
  }

  /**
   * Delicate crystal clink when a ghost taps against or enters the glass punishment jar.
   */
  public playGlassClink(volume = 0.5) {
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(2480, now);
    osc.frequency.exponentialRampToValueAtTime(1860, now + 0.18);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(volume * 0.25, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  /**
   * Soft kinetic breath/whisper when typing keystroke ripples push away nearby ghosts.
   */
  public playTypingGust(volume = 0.3) {
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(350, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(volume * 0.08, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  /**
   * Deep thud when books are knocked over.
   */
  public playBookThud(volume = 0.5) {
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.2);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(volume * 0.4, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.28);
  }

  /**
   * Sound when plate or glass breaks.
   */
  public playGlassShatter(volume = 0.5) {
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    [1800, 2400, 3200].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + i * 0.02);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.4, now + i * 0.02 + 0.15);

      gain.gain.setValueAtTime(volume * 0.2, now + i * 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.02 + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.02);
      osc.stop(now + i * 0.02 + 0.2);
    });
  }

  /**
   * Short, subtle tactile click/settle when an object is replaced or repaired.
   * Grounded, dark, and quick — a crisp physical contact rather than a jolly musical chime.
   */
  public playMendChime(volume = 0.5) {
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // 1. Crisp tactile transient click (ceramic/wood contact)
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    clickOsc.type = 'triangle';
    clickOsc.frequency.setValueAtTime(720, now);
    clickOsc.frequency.exponentialRampToValueAtTime(180, now + 0.035);

    clickGain.gain.setValueAtTime(0.001, now);
    clickGain.gain.linearRampToValueAtTime(volume * 0.35, now + 0.004);
    clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

    clickOsc.connect(clickGain);
    clickGain.connect(ctx.destination);
    clickOsc.start(now);
    clickOsc.stop(now + 0.045);

    // 2. Muted wooden/stone shelf resonance body
    const bodyOsc = ctx.createOscillator();
    const bodyGain = ctx.createGain();
    bodyOsc.type = 'sine';
    bodyOsc.frequency.setValueAtTime(210, now + 0.005);
    bodyOsc.frequency.exponentialRampToValueAtTime(75, now + 0.08);

    bodyGain.gain.setValueAtTime(0.001, now + 0.005);
    bodyGain.gain.linearRampToValueAtTime(volume * 0.28, now + 0.015);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.085);

    bodyOsc.connect(bodyGain);
    bodyGain.connect(ctx.destination);
    bodyOsc.start(now + 0.005);
    bodyOsc.stop(now + 0.09);
  }

  /**
   * Soft breath whoosh when a candle is snuffed by a passing ghost.
   */
  public playBlowOut(volume = 0.4) {
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.2);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, now);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(volume * 0.3, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.26);
  }
}

export const ghostAudio = new GhostSoundEngine();
