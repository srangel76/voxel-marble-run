// Web Audio API Procedural Synthesizer for Voxel Marble Run

class SoundFX {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private rollGain: GainNode | null = null;
  private rollFilter: BiquadFilterNode | null = null;
  private rollNoiseSource: AudioBufferSourceNode | null = null;
  private lastClackTime: number = 0;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.rollGain) {
      this.rollGain.gain.setValueAtTime(0, this.ctx?.currentTime || 0);
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Playful pop sound when placing a block
  public playPlaceSound() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(680, t + 0.08);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.09);
  }

  // Crisp remove/break sound when deleting a block
  public playDeleteSound() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(450, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.07);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.08);
  }

  // Collision clack sound (rate-limited to prevent sound spam)
  public playClackSound(velocity: number = 2) {
    if (this.isMuted) return;
    const now = Date.now();
    if (now - this.lastClackTime < 70) return; // limit frequency
    this.lastClackTime = now;

    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const intensity = Math.min(Math.max(velocity / 4, 0.2), 1.0);
    const baseFreq = 500 + Math.random() * 200;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.04);

    gain.gain.setValueAtTime(0.22 * intensity, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.05);
  }

  // Magnetic laser booster whoosh sound
  public playBoostSound() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(240, t);
    osc.frequency.exponentialRampToValueAtTime(1400, t + 0.18);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.exponentialRampToValueAtTime(2400, t + 0.18);
    filter.Q.value = 3;

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.22);
  }

  // Mechanical "click-clack" solenoid switch for splitter flipper
  public playFlipperSound() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // First click
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(750, t);
    osc1.frequency.exponentialRampToValueAtTime(320, t + 0.025);
    gain1.gain.setValueAtTime(0.25, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc1.start(t);
    osc1.stop(t + 0.03);

    // Second clack (50ms later)
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(420, t + 0.05);
    osc2.frequency.exponentialRampToValueAtTime(180, t + 0.08);
    gain2.gain.setValueAtTime(0.22, t + 0.05);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.start(t + 0.05);
    osc2.stop(t + 0.09);
  }

  // Sound when marble is spawned or launched
  public playLaunchSound() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(780, t + 0.22);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.25);
  }

  // Victory fanfare arpeggio (C5 -> E5 -> G5 -> C6)
  public playVictorySound() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    const startTime = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const noteTime = startTime + idx * 0.11;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      const duration = idx === notes.length - 1 ? 0.6 : 0.2;
      gain.gain.setValueAtTime(0.28, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + duration);
    });
  }

  // Continuous subtle rolling rumble modulation based on speed
  public updateRollSound(speed: number) {
    if (this.isMuted || speed < 0.2) {
      if (this.rollGain && this.ctx) {
        this.rollGain.gain.setValueAtTime(0, this.ctx.currentTime);
      }
      return;
    }
    this.initContext();
    if (!this.ctx) return;

    if (!this.rollGain) {
      this.setupContinuousRollLoop();
    }

    if (this.rollGain && this.rollFilter && this.ctx) {
      const t = this.ctx.currentTime;
      const normalizedSpeed = Math.min(speed / 8, 1);
      const targetGain = Math.min(normalizedSpeed * 0.12, 0.15);
      const targetFreq = 180 + normalizedSpeed * 350;

      this.rollGain.gain.setTargetAtTime(targetGain, t, 0.05);
      this.rollFilter.frequency.setTargetAtTime(targetFreq, t, 0.05);
    }
  }

  public stopRollSound() {
    if (this.rollGain && this.ctx) {
      this.rollGain.gain.setValueAtTime(0, this.ctx.currentTime);
    }
  }

  private setupContinuousRollLoop() {
    if (!this.ctx) return;

    const bufferSize = this.ctx.sampleRate * 1.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    this.rollNoiseSource = this.ctx.createBufferSource();
    this.rollNoiseSource.buffer = buffer;
    this.rollNoiseSource.loop = true;

    this.rollFilter = this.ctx.createBiquadFilter();
    this.rollFilter.type = 'lowpass';
    this.rollFilter.frequency.value = 250;

    this.rollGain = this.ctx.createGain();
    this.rollGain.gain.value = 0;

    this.rollNoiseSource.connect(this.rollFilter);
    this.rollFilter.connect(this.rollGain);
    this.rollGain.connect(this.ctx.destination);

    this.rollNoiseSource.start();
  }
}

export const sound = new SoundFX();
