'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';

export function DotMatrix() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();
  const isDarkRef = useRef(resolvedTheme === 'dark');

  // Update ref when theme changes
  useEffect(() => {
    isDarkRef.current = resolvedTheme === 'dark';
  }, [resolvedTheme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const dotSpacing = 30;
    const dotRadius = 1.5;
    const cols = Math.ceil(canvas.width / dotSpacing);
    const rows = Math.ceil(canvas.height / dotSpacing);

    const dots: { x: number; y: number; opacity: number; flickerSpeed: number; flickerPhase: number }[] = [];
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        dots.push({
          x: i * dotSpacing,
          y: j * dotSpacing,
          opacity: Math.random() * 0.3 + 0.1,
          flickerSpeed: Math.random() * 0.02 + 0.005,
          flickerPhase: Math.random() * Math.PI * 2,
        });
      }
    }

    let animationFrame: number;
    let time = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.016;

      dots.forEach(dot => {
        const flicker = Math.sin(time * dot.flickerSpeed + dot.flickerPhase);
        const opacity = dot.opacity + flicker * 0.15;

        const color = isDarkRef.current ? '255, 255, 255' : '156, 163, 175';
        ctx.fillStyle = `rgba(${color}, ${Math.max(0, Math.min(opacity, 0.4))})`;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dotRadius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full -z-10" />;
}
