import { useEffect, useRef } from 'react';

export function AnimatedLoopBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    let time = 0;

    const animate = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      time += 0.005;

      // Get computed styles for theming
      const computedStyle = getComputedStyle(document.documentElement);
      const foregroundHSL = computedStyle.getPropertyValue('--foreground').trim();

      // Draw flowing wave lines
      const waveCount = 6;
      for (let w = 0; w < waveCount; w++) {
        const baseY = height * 0.3 + (w * height * 0.1);
        const opacity = 0.08 + (w * 0.02);
        
        ctx.beginPath();
        ctx.strokeStyle = `hsla(${foregroundHSL} / ${opacity})`;
        ctx.lineWidth = 1.5;

        for (let x = 0; x <= width; x += 2) {
          const frequency = 0.003 + (w * 0.001);
          const amplitude = 30 + (w * 10);
          const phaseShift = w * 0.5;
          
          const y = baseY + 
            Math.sin(x * frequency + time + phaseShift) * amplitude +
            Math.sin(x * frequency * 2 + time * 1.5 + phaseShift) * (amplitude * 0.5);
          
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      // Draw floating orbs
      const orbCount = 5;
      for (let i = 0; i < orbCount; i++) {
        const orbTime = time + i * 1.2;
        const orbX = width * (0.15 + i * 0.18) + Math.sin(orbTime * 0.7) * 40;
        const orbY = height * 0.5 + Math.cos(orbTime * 0.5 + i) * (height * 0.2);
        const orbRadius = 60 + Math.sin(orbTime) * 20;
        
        const gradient = ctx.createRadialGradient(orbX, orbY, 0, orbX, orbY, orbRadius);
        gradient.addColorStop(0, `hsla(${foregroundHSL} / 0.06)`);
        gradient.addColorStop(0.5, `hsla(${foregroundHSL} / 0.03)`);
        gradient.addColorStop(1, `hsla(${foregroundHSL} / 0)`);
        
        ctx.beginPath();
        ctx.arc(orbX, orbY, orbRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      // Draw geometric shapes rotating
      const shapeCount = 4;
      for (let i = 0; i < shapeCount; i++) {
        const shapeTime = time * 0.3 + i * 1.5;
        const shapeX = width * (0.2 + i * 0.2);
        const shapeY = height * 0.6 + Math.sin(shapeTime * 0.8) * 50;
        const size = 25 + i * 10;
        const rotation = shapeTime;
        
        ctx.save();
        ctx.translate(shapeX, shapeY);
        ctx.rotate(rotation);
        ctx.strokeStyle = `hsla(${foregroundHSL} / ${0.05 + i * 0.02})`;
        ctx.lineWidth = 1;
        
        // Draw diamond shape
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.lineTo(size, 0);
        ctx.lineTo(0, size);
        ctx.lineTo(-size, 0);
        ctx.closePath();
        ctx.stroke();
        
        ctx.restore();
      }

      // Draw subtle grid dots
      const dotSpacing = 80;
      const dotRadius = 1;
      for (let x = dotSpacing; x < width; x += dotSpacing) {
        for (let y = dotSpacing; y < height; y += dotSpacing) {
          const pulseOffset = (x + y) * 0.01;
          const pulse = Math.sin(time * 2 + pulseOffset) * 0.5 + 0.5;
          const opacity = 0.03 + pulse * 0.04;
          
          ctx.beginPath();
          ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${foregroundHSL} / ${opacity})`;
          ctx.fill();
        }
      }

      // Draw connecting lines between nearest dots occasionally
      const connectionCount = 8;
      for (let i = 0; i < connectionCount; i++) {
        const lineTime = time + i * 0.8;
        const startX = (Math.sin(lineTime * 0.3) * 0.5 + 0.5) * width;
        const startY = (Math.cos(lineTime * 0.4) * 0.5 + 0.5) * height;
        const endX = startX + Math.cos(lineTime) * 150;
        const endY = startY + Math.sin(lineTime * 0.7) * 100;
        
        const lineOpacity = (Math.sin(lineTime * 2) * 0.5 + 0.5) * 0.06;
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = `hsla(${foregroundHSL} / ${lineOpacity})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  );
}
