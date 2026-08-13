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

    // Dynamic Star Particles
    const particleCount = Math.min(35, Math.floor(width / 40));
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
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

      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';

      ctx.clearRect(0, 0, width, height);

      if (currentTheme === 'light') {
        // Light White Theme Background
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, width, height);

        const radial = ctx.createRadialGradient(
          width * 0.5,
          height * 0.1,
          10,
          width * 0.5,
          height * 0.1,
          width * 0.6
        );
        radial.addColorStop(0, 'rgba(59, 130, 246, 0.06)');
        radial.addColorStop(1, 'rgba(248, 250, 252, 0)');
        ctx.fillStyle = radial;
        ctx.fillRect(0, 0, width, height);

        // Dark Slate Particles for Light Mode
        for (const p of particles) {
          p.x += p.vx;
          p.y += p.vy;
          p.pulse += 0.02;
          if (p.x < 0 || p.x > width) p.vx *= -1;
          if (p.y < 0 || p.y > height) p.vy *= -1;

          const currentAlpha = p.alpha + Math.sin(p.pulse) * 0.15;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(15, 23, 42, ${Math.max(0.1, currentAlpha * 0.4)})`;
          ctx.fill();
        }
      } else if (currentTheme === 'cyber') {
        // Aurora Cyber Theme (Blue ➔ Emerald Green Gradient)
        const linearGrad = ctx.createLinearGradient(0, 0, width, height);
        linearGrad.addColorStop(0, '#051329');
        linearGrad.addColorStop(0.5, '#0d3b66');
        linearGrad.addColorStop(1, '#064e3b');
        ctx.fillStyle = linearGrad;
        ctx.fillRect(0, 0, width, height);

        const radial = ctx.createRadialGradient(
          width * 0.3,
          height * 0.2,
          10,
          width * 0.3,
          height * 0.2,
          width * 0.7
        );
        radial.addColorStop(0, 'rgba(56, 189, 248, 0.15)');
        radial.addColorStop(0.5, 'rgba(16, 185, 129, 0.1)');
        radial.addColorStop(1, 'rgba(5, 19, 41, 0)');
        ctx.fillStyle = radial;
        ctx.fillRect(0, 0, width, height);

        // Cyan & Emerald Glowing Particles
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.pulse += 0.02;
          if (p.x < 0 || p.x > width) p.vx *= -1;
          if (p.y < 0 || p.y > height) p.vy *= -1;

          const currentAlpha = p.alpha + Math.sin(p.pulse) * 0.2;
          const colorStr = i % 2 === 0 ? '56, 189, 248' : '16, 185, 129';

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${colorStr}, ${Math.max(0, currentAlpha * 0.2)})`;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${colorStr}, ${Math.max(0.2, currentAlpha)})`;
          ctx.fill();
        }
      } else {
        // Dark Theme (Pitch-Black & Glowing White)
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);

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

        for (const p of particles) {
          p.x += p.vx;
          p.y += p.vy;
          p.pulse += 0.02;
          if (p.x < 0 || p.x > width) p.vx *= -1;
          if (p.y < 0 || p.y > height) p.vy *= -1;

          const currentAlpha = p.alpha + Math.sin(p.pulse) * 0.2;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, currentAlpha * 0.15)})`;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, currentAlpha)})`;
          ctx.fill();
        }
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
      className="fixed inset-0 pointer-events-none z-0 opacity-90 transition-opacity duration-300"
      style={{ willChange: 'transform' }}
    />
  );
}
