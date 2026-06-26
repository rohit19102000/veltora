class AudioController {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private tickInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Only initialize in browser
    if (typeof window !== 'undefined') {
      this.isMuted = localStorage.getItem('veltora_muted') === 'true';
    }
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.ctx && this.ctx.state === 'running') {
      // Pause audio context to stop all sound
      this.ctx.suspend();
    } else if (!muted && this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Synthesizes a high-end mechanical watch tick (tock) sound
  public playTick(pitch: number = 2500, duration: number = 0.05, gainValue: number = 0.15) {
    this.initContext();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    
    // First, create the metallic ping noise
    // Generate white noise buffer
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseNode = this.ctx.createBufferSource();
    noiseNode.buffer = buffer;

    // Filter noise to high frequencies (replicating pallet fork impact)
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(pitch, now);
    noiseFilter.Q.setValueAtTime(4, now);

    // Exponential gain decay for the noise
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(gainValue, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    noiseNode.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    // Second, create the case resonance (sine oscillator at lower frequency)
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    // Bevel sound
    osc.frequency.exponentialRampToValueAtTime(300, now + duration * 1.5);

    oscGain.gain.setValueAtTime(gainValue * 0.5, now);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 1.5);

    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);

    // Start nodes
    noiseNode.start(now);
    osc.start(now);

    noiseNode.stop(now + duration);
    osc.stop(now + duration * 1.5);
  }

  // A brass-on-glass chime for swatch selection in customizer
  public playClick() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1600, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);

    gainNode.gain.setValueAtTime(0.08, now);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  // Starts the continuous metronome background ticking
  public startMetronome(vph: number = 2.8) {
    this.stopMetronome();
    const intervalMs = 1000 / vph;
    
    // Play immediately
    this.playTick(2200, 0.03, 0.08);

    this.tickInterval = setInterval(() => {
      // Alternate pitch slightly for a tick-tock feel
      const tickOrTock = Math.random() > 0.5;
      this.playTick(tickOrTock ? 2400 : 2100, 0.03, 0.06);
    }, intervalMs);
  }

  public stopMetronome() {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
  }
}

export const audioController = new AudioController();
