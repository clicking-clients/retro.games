// Fireworks module for shared game celebrations
export class Fireworks {
  constructor(canvas, audio) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
    this.audio = audio;
    this.isActive = false;
  }

  // Generate random colors for fireworks
  randColor() {
    const colors = ["#0f0", "#0ff", "#ff0", "#f0f", "#f60", "#0fa", "#ff3", "#f3f", "#3ff", "#f06", "#f33", "#33f", "#fff"];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // Show fireworks at specified position
  show(baseX, baseY, onComplete) {
    console.log('🎆 Fireworks.show() called with:', baseX, baseY); // Debug log
    console.log('🎆 Canvas dimensions:', this.width, 'x', this.height); // Debug log
    
    if (this.isActive) {
      console.log('🎆 Fireworks already active, returning'); // Debug log
      return;
    }
    
    this.isActive = true;
    const bursts = [];
    const numBursts = 4 + Math.floor(Math.random() * 3);

    // Create multiple firework bursts
    for (let b = 0; b < numBursts; b++) {
      // Scale the base position to match the fireworks canvas
      const scaleX = this.width / 1200; // Scale from game width to fireworks canvas
      const scaleY = this.height / 720;  // Scale from game height to fireworks canvas
      
      // Convert game coordinates to fireworks canvas coordinates
      const scaledX = baseX * scaleX;
      const scaledY = baseY * scaleY;
      
      // Ensure fireworks stay within canvas bounds
      const bx = Math.max(50, Math.min(this.width - 50, scaledX + (Math.random() * 60 - 30)));
      const by = Math.max(50, Math.min(this.height - 50, scaledY + (Math.random() * 40 - 20)));
      const count = 25 + Math.floor(Math.random() * 20);
      const parts = [];
      
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 80 + Math.random() * 140;
        parts.push({
          x: bx,
          y: by,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0.9 + Math.random() * 0.6,
          color: this.randColor()
        });
      }
      bursts.push(parts);

      // Play sound with staggered timing
      setTimeout(() => {
        this.audio.fireworksPop();
      }, b * 120);
    }

    const start = performance.now();
    const animate = (now) => {
      const t = (now - start) / 1000;
      this.ctx.clearRect(0, 0, this.width, this.height);
      this.ctx.globalCompositeOperation = 'lighter';

      // Animate each firework particle
      bursts.forEach(parts => {
        parts.forEach(p => {
          if (p.life <= 0) return;
          
          // Apply gravity and update position
          p.vy += 80 * 0.016;
          p.x += p.vx * 0.016;
          p.y += p.vy * 0.016;
          p.life -= 0.016;
          
          const a = Math.max(0, p.life);
          const c = p.color;
          
          // Draw particle with fade effect
          this.ctx.fillStyle = `rgba(${parseInt(c.slice(1, 3), 16)},${parseInt(c.slice(3, 5), 16)},${parseInt(c.slice(5, 7), 16)},${a})`;
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
          this.ctx.fill();
        });
      });

      this.ctx.globalCompositeOperation = 'source-over';

      // Continue animation or finish
      if (t < 1.5) {
        requestAnimationFrame(animate);
      } else {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.isActive = false;
        if (onComplete) onComplete();
      }
    };

    requestAnimationFrame(animate);
  }

  // Clear the fireworks canvas
  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }
}
