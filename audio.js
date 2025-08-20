// Audio module for shared game audio effects
export class GameAudio {
  constructor() {
    this.AudioCtx = window.AudioContext || window.webkitAudioContext;
    this.actx = new this.AudioCtx();
  }

  // Resume audio context (for autoplay restrictions)
  resume() {
    if (this.actx.resume) {
      this.actx.resume();
    }
  }

  // Basic beep sound
  beep(freq = 440, dur = 0.07, type = 'square', vol = 0.02) {
    const o = this.actx.createOscillator();
    const g = this.actx.createGain();
    o.type = type;
    o.frequency.value = freq;
    o.connect(g);
    g.connect(this.actx.destination);
    g.gain.value = vol;
    o.start();
    o.stop(this.actx.currentTime + dur);
  }

  // Rocket launch rumble sound
  rocketRumble() {
    const g = this.actx.createGain();
    g.gain.value = 0.04;
    g.connect(this.actx.destination);
    
    const o1 = this.actx.createOscillator();
    const o2 = this.actx.createOscillator();
    o1.type = 'sawtooth';
    o2.type = 'square';
    
    o1.frequency.setValueAtTime(90, this.actx.currentTime);
    o2.frequency.setValueAtTime(55, this.actx.currentTime);
    o1.frequency.exponentialRampToValueAtTime(140, this.actx.currentTime + 0.6);
    o2.frequency.exponentialRampToValueAtTime(70, this.actx.currentTime + 0.6);
    
    o1.connect(g);
    o2.connect(g);
    
    const end = this.actx.currentTime + 0.7;
    g.gain.setValueAtTime(0.045, this.actx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01, end);
    
    o1.start();
    o2.start();
    o1.stop(end);
    o2.stop(end);
  }

  // Fireworks pop sound
  fireworksPop() {
    [900, 1100, 1300].forEach((f, i) => {
      const delay = i * 0.08;
      const o = this.actx.createOscillator();
      const g = this.actx.createGain();
      o.type = 'triangle';
      o.frequency.value = f;
      o.connect(g);
      g.connect(this.actx.destination);
      g.gain.setValueAtTime(0.03, this.actx.currentTime + delay);
      g.gain.exponentialRampToValueAtTime(0.0001, this.actx.currentTime + delay + 0.2);
      o.start(this.actx.currentTime + delay);
      o.stop(this.actx.currentTime + delay + 0.22);
    });
  }
}
