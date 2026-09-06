"use client";

/**
 * Procedural ambient drone — two slow-detuned oscillators through a lowpass
 * filter with a gentle LFO on the gain, so the "ambient sound" toggle in the
 * nav has something real to switch rather than loading an external audio
 * file (none are permitted in this build).
 */
class AmbientSound {
  private ctx: AudioContext | null = null;
  private nodes: { osc: OscillatorNode; lfo: OscillatorNode; gain: GainNode }[] = [];
  private playing = false;

  toggle(): boolean {
    if (this.playing) {
      this.stop();
    } else {
      this.start();
    }
    return this.playing;
  }

  isPlaying() {
    return this.playing;
  }

  private start() {
    if (typeof window === "undefined") return;
    const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    this.ctx = ctx;

    const master = ctx.createGain();
    master.gain.value = 0;
    master.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 2);
    master.connect(ctx.destination);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 480;
    filter.connect(master);

    const freqs = [82, 123.5, 164.8];
    for (const f of freqs) {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = f;

      const gain = ctx.createGain();
      gain.gain.value = 0.3;

      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.05 + Math.random() * 0.05;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.15;
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);

      osc.connect(gain);
      gain.connect(filter);
      osc.start();
      lfo.start();

      this.nodes.push({ osc, lfo, gain });
    }

    this.playing = true;
  }

  private stop() {
    const ctx = this.ctx;
    if (!ctx) return;
    for (const { osc, lfo } of this.nodes) {
      osc.stop();
      lfo.stop();
    }
    this.nodes = [];
    ctx.close();
    this.ctx = null;
    this.playing = false;
  }
}

export const ambientSound = new AmbientSound();
