/**
 * =========================================================
 * AUDIO ENGINE - Web Audio API Sound Synthesizer
 * 100% self-contained synthesized sound effects:
 *  - System lock alert & hazard tone
 *  - Processing blip & verification pulse
 *  - Grand celebratory "GOTCHA!" fanfare & comical spring boing
 *  - Tactical button click feedback
 *  - Zero external MP3 dependency (no network/CORS issues)
 * =========================================================
 */

class PrankAudioManager {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.activeAlarm = null;

    try {
      const saved = localStorage.getItem('flash_prank_muted');
      if (saved !== null) {
        this.isMuted = saved === 'true';
      }
    } catch (e) {}
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    try {
      localStorage.setItem('flash_prank_muted', String(this.isMuted));
    } catch (e) {}

    if (this.isMuted) {
      this.stopAlert();
    }
    return this.isMuted;
  }

  // 1. Subtle tactile click sound for buttons
  playClick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(650, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.04);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch (e) {}
  }

  // 2. Hardware Security Lock Sound (Low double warning beep)
  playLockAlert() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      // Beep 1
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(440, now);
      gain1.gain.setValueAtTime(0.12, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.18);

      // Beep 2 (lower pitch, ominous)
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(220, now + 0.22);
      gain2.gain.setValueAtTime(0.15, now + 0.22);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(now + 0.22);
      osc2.stop(now + 0.55);
    } catch (e) {}
  }

  // 3. Processing Blip / Radar pulse
  playProcessingBlip() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.1);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.12);
    } catch (e) {}
  }

  // 4. Verification Check Sound (Two harmonious ascending chimes)
  playVerificationChime() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      [
        { freq: 587.33, delay: 0.0, dur: 0.2 }, // D5
        { freq: 880.00, delay: 0.15, dur: 0.35 } // A5
      ].forEach(({ freq, delay, dur }) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + delay);
        gain.gain.setValueAtTime(0.12, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + dur);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + dur);
      });
    } catch (e) {}
  }

  // 5. GOTCHA Grand Celebration (Brass fanfare + clown boing)
  playGotchaFanfare() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      // Brass Fanfare (C5, E5, G5, C6)
      const fanfare = [
        { freq: 523.25, delay: 0.0, dur: 0.15 }, // C5
        { freq: 659.25, delay: 0.14, dur: 0.15 }, // E5
        { freq: 783.99, delay: 0.28, dur: 0.20 }, // G5
        { freq: 1046.50, delay: 0.44, dur: 0.80 } // C6
      ];

      fanfare.forEach(({ freq, delay, dur }) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + delay);
        gain.gain.setValueAtTime(0.22, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + dur);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + dur);
      });

      // Layered funny clown boing at end of fanfare
      setTimeout(() => {
        if (this.isMuted || !this.ctx) return;
        try {
          const t = this.ctx.currentTime;
          const boing = this.ctx.createOscillator();
          const bGain = this.ctx.createGain();

          boing.type = 'sine';
          boing.frequency.setValueAtTime(160, t);
          boing.frequency.exponentialRampToValueAtTime(680, t + 0.18);
          boing.frequency.exponentialRampToValueAtTime(220, t + 0.45);

          bGain.gain.setValueAtTime(0.25, t);
          bGain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

          boing.connect(bGain);
          bGain.connect(this.ctx.destination);

          boing.start(t);
          boing.stop(t + 0.5);
        } catch (err) {}
      }, 500);

    } catch (e) {}
  }

  // 6. Stop any active repeating sounds
  stopAlert() {
    if (this.activeAlarm) {
      try {
        this.activeAlarm.osc.stop();
        this.activeAlarm.gain.disconnect();
      } catch (e) {}
      this.activeAlarm = null;
    }
  }
}

// Global audio singleton
window.prankAudio = new PrankAudioManager();
