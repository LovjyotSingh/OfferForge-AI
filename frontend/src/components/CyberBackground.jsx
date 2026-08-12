import { useEffect, useRef } from 'react';

export default function CyberBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Glowing white star particles
    const particleCount = Math.min(30, Math.floor(width / 45));
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: Math.random() * 2 + 1,
      alpha: Math.random() * 0.6 + 0.2,
      pulse: Math.random() * Math.PI,
    }));

    let lastTime = 0;

    const render = (time) => {
      if (time - lastTime < 20) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      // Deep void black background fill
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      // Faint central ambient white radial aura
      const radial = ctx.createRadialGradient(
        width * 0.5,
        height * 0.1,
        10,
        width * 0.5,
        height * 0.1,
        width * 0.6
      );
      radial.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
      radial.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = radial;
      ctx.fillRect(0, 0, width, height);

      // Render glowing white particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.02;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        const currentAlpha = p.alpha + Math.sin(p.pulse) * 0.2;

        // Particle halo glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, currentAlpha * 0.15)})`;
        ctx.fill();

        // Core white particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, currentAlpha)})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-90"
      style={{ willChange: 'transform' }}
    />
  );
}
