// Rocket module for shared game celebrations
export class Rocket {
  constructor(overlayCanvas, audio, fireworks, onFireworksDone) {
    this.canvas = overlayCanvas;
    this.ctx = overlayCanvas.getContext('2d');
    this.width = overlayCanvas.width;
    this.height = overlayCanvas.height;
    this.audio = audio;
    this.fireworks = fireworks;

    // Placement on the far left (inside overlay space)
    this.baseX = 60;                        // LHS position (kept always visible)
    this.groundY = this.height - 40;        // a bit above bottom of overlay

    // Size / growth
    this.minHeight = 28;                    // short at start
    this.growStep = 10;                     // added height per word
    this.currentHeight = this.minHeight;
    this.targetHeight = this.minHeight;

    // Animation state
    this.launched = false;
    this.inFireworks = false;

    // Launch path randomness
    this._y = this.groundY - this.currentHeight - 12;
    this._tAccum = 0;
    this._lastT = 0;
    this._launchParams = null;

    // Loop
    this._raf = null;
    this.onFireworksDone = onFireworksDone || (() => {});
    this._startLoop();
  }

  resetForLevel() {
    this.launched = false;
    this.inFireworks = false;
    this.currentHeight = this.minHeight;
    this.targetHeight = this.minHeight;
    this._y = this.groundY - this.currentHeight - 12;
    this._launchParams = null;
  }

  grow() {
    // Smooth growth via target height
    this.targetHeight += this.growStep;
  }

  launch() {
    if (this.launched || this.inFireworks) return;
    this.launched = true;

    // resume context (for autoplay restrictions)
    this.audio.resume();
    this.audio.rocketRumble();

    const dir = Math.random() < 0.5 ? -1 : 1;              // left/right arc
    const amplitude = 60 + Math.random() * 80;             // reduced horizontal wiggle to keep in view
    const speed = 260 + Math.random() * 110;               // vertical speed px/s
    const wobble = 2 + Math.random() * 3;                  // sine frequency

    // Start near its ground position on the LHS
    this._y = this.groundY - this.currentHeight - 16;
    this._launchParams = {
      dir, amplitude, speed, wobble,
      baseX: this.baseX + 10
    };
    this._lastT = performance.now();
    // Loop already running; launch is handled in draw/update
  }

  _drawGrounded() {
    const x = this.baseX;
    const yTop = this.groundY - this.currentHeight;

    // Small idle flame
    this.ctx.fillStyle = "orange";
    this.ctx.beginPath();
    this.ctx.ellipse(x + 10, this.groundY + 6, 4 + Math.random() * 2, 8 + Math.random() * 4, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Body
    this.ctx.fillStyle = "red";
    this.ctx.fillRect(x, yTop, 20, this.currentHeight);

    // Nose cone
    this.ctx.fillStyle = "yellow";
    this.ctx.beginPath();
    this.ctx.moveTo(x + 10, yTop - 12);
    this.ctx.lineTo(x, yTop);
    this.ctx.lineTo(x + 20, yTop);
    this.ctx.closePath();
    this.ctx.fill();

    // Tiny smoke puffs
    this.ctx.fillStyle = "rgba(200,200,200,0.5)";
    for (let i = 0; i < 2; i++) {
      const sx = x + 10 + (Math.random() * 10 - 5);
      const sy = this.groundY + 12 + i * 8;
      this.ctx.beginPath();
      this.ctx.arc(sx, sy, 3 + Math.random() * 3, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  _drawLaunched(dt) {
    if (!this._launchParams) return;

    this._tAccum += dt;
    // Vertical motion
    this._y -= this._launchParams.speed * dt;
    const x = this._launchParams.baseX + Math.sin(this._tAccum * this._launchParams.wobble) * this._launchParams.amplitude * this._launchParams.dir;
    const y = this._y;

    // Flame
    this.ctx.fillStyle = "orange";
    this.ctx.beginPath();
    this.ctx.ellipse(x, y + 24, 6 + Math.random() * 5, 12 + Math.random() * 8, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Body
    this.ctx.fillStyle = "red";
    this.ctx.fillRect(x - 6, y - 20, 12, 40);

    // Nose cone
    this.ctx.fillStyle = "yellow";
    this.ctx.beginPath();
    this.ctx.moveTo(x, y - 32);
    this.ctx.lineTo(x - 10, y - 20);
    this.ctx.lineTo(x + 10, y - 20);
    this.ctx.closePath();
    this.ctx.fill();

    // Smoke puffs
    this.ctx.fillStyle = "rgba(200,200,200,0.5)";
    for (let i = 0; i < 3; i++) {
      const sx = x + (Math.random() * 20 - 10);
      const sy = y + 30 + i * 10;
      this.ctx.beginPath();
      this.ctx.arc(sx, sy, 6 + Math.random() * 6, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Off the top? -> fireworks
    if (y < -60) {
      this.launched = false;
      this._launchParams = null;
      this._fireworksShow();
    }
  }

  _fireworksShow() {
    this.inFireworks = true;
    
    // Use rocket's last x position as base
    const baseX = this._launchParams ? this._launchParams.baseX : this.baseX;
    const baseY = this.groundY - this.currentHeight - 60;

    console.log('🎆 Fireworks triggered at:', baseX, baseY); // Debug log

    // Show fireworks and handle completion
    this.fireworks.show(baseX, baseY, () => {
      console.log('🎆 Fireworks complete!'); // Debug log
      this.inFireworks = false;
      this.onFireworksDone && this.onFireworksDone();
    });
  }

  _startLoop() {
    const loop = (now) => {
      // Smooth growth tween
      this.currentHeight += (this.targetHeight - this.currentHeight) * 0.18;
      if (Math.abs(this.currentHeight - this.targetHeight) < 0.05) {
        this.currentHeight = this.targetHeight;
      }

      // Clear overlay each frame
      this.ctx.clearRect(0, 0, this.width, this.height);

      if (this.launched) {
        if (!this._lastT) this._lastT = now;
        const dt = (now - this._lastT) / 1000;
        this._lastT = now;
        this._drawLaunched(dt);
      } else if (!this.inFireworks) {
        // Draw grounded rocket if not in fireworks
        this._drawGrounded();
      }

      this._raf = requestAnimationFrame(loop);
    };
    this._raf = requestAnimationFrame(loop);
  }

  // Clean up animation frame
  destroy() {
    if (this._raf) {
      cancelAnimationFrame(this._raf);
      this._raf = null;
    }
  }
}
