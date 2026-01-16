'use client';

import { useEffect, useRef, useState } from 'react';
import createGlobe from 'cobe';

// Flood report locations with severity
const FLOOD_LOCATIONS = [
  { lat: 12.9716, lng: 77.5946, city: 'Bangalore', severity: 0.8 },
  { lat: 19.0760, lng: 72.8777, city: 'Mumbai', severity: 0.9 },
  { lat: 22.5726, lng: 88.3639, city: 'Kolkata', severity: 0.6 },
  { lat: 13.0827, lng: 80.2707, city: 'Chennai', severity: 0.7 },
  { lat: 28.6139, lng: 77.2090, city: 'Delhi', severity: 0.1 },
];

// Dot matrix background component
const DotMatrix = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

        ctx.fillStyle = `rgba(156, 163, 175, ${Math.max(0, Math.min(opacity, 0.4))})`;
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

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};

export default function GlobeHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let phi = 0;
    let width = 0;
    const onResize = () => canvasRef.current && (width = canvasRef.current.offsetWidth);
    window.addEventListener('resize', onResize);
    onResize();

    // Create markers from flood locations - size encodes severity
    const markers = FLOOD_LOCATIONS.map(loc => ({
      location: [loc.lat, loc.lng] as [number, number],
      size: 0.025 + loc.severity * 0.08,
    }));

    const globe = createGlobe(canvasRef.current!, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: 0,
      theta: 0.3,
      dark: 0,
      diffuse: 0.4,
      mapSamples: 20000,
      mapBrightness: 1.2,
      baseColor: [1, 1, 1] as [number, number, number],
      markerColor: [0.94, 0.27, 0.27] as [number, number, number], // red for flood markers
      glowColor: [0.94, 0.27, 0.27] as [number, number, number],
      markers,
      onRender: (state) => {
        if (!pointerInteracting.current) {
          phi += 0.005;
        }
        state.phi = phi + pointerInteractionMovement.current / 200;
        state.width = width * 2;
        state.height = width * 2;
      },
    });


    setTimeout(() => {
      if (canvasRef.current) {
        canvasRef.current.style.opacity = '1';
        setIsLoaded(true);
      }
    }, 100);

return () => {
  globe.destroy();
  window.removeEventListener('resize', onResize);
};
    }, []);

  return (
    <section className="relative h-screen w-full overflow-hidden bg-[#f5f5f5]">
      {/* Animated dot matrix background */}
      <DotMatrix />

      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-br from-transparent via-transparent to-white/30 pointer-events-none" />

      {/* Globe Container - centered right */}
      <div className="absolute right-[8%] top-1/2 -translate-y-1/2 size-162.5">
        {/* Green glow behind globe */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="size-137.5 rounded-full bg-green-400/15 blur-[120px]" />
        </div>

        <div
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
          }}
        >
          <canvas
            ref={canvasRef}
            onPointerDown={(e) => {
              pointerInteracting.current = e.clientX - pointerInteractionMovement.current;
              if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing';
            }}
            onPointerUp={() => {
              pointerInteracting.current = null;
              if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
            }}
            onPointerOut={() => {
              pointerInteracting.current = null;
              if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
            }}
            onMouseMove={(e) => {
              if (pointerInteracting.current !== null) {
                const delta = e.clientX - pointerInteracting.current;
                pointerInteractionMovement.current = delta;
              }
            }}
            onTouchMove={(e) => {
              if (pointerInteracting.current !== null && e.touches[0]) {
                const delta = e.touches[0].clientX - pointerInteracting.current;
                pointerInteractionMovement.current = delta;
              }
            }}
            style={{
              width: '100%',
              height: '100%',
              cursor: 'grab',
              contain: 'layout paint size',
              opacity: 0,
              transition: 'opacity 1s ease',
            }}
          />
        </div>
      </div>

      {/* Content Overlay - left side */}
      <div className="absolute inset-0 flex items-center justify-start pointer-events-none">
        <div className={`max-w-2xl ml-8 md:ml-20 space-y-6 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
          
          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-bold text-black leading-[1.1] tracking-tight">
            Floods are becoming
            <br />
            <span className="block mt-1">
              harder to predict
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-gray-700 leading-relaxed max-w-xl">
            FloodLens helps people report real-world flooding and see what&apos;s actually happening —{' '}
            <span className="font-semibold text-black">street by street</span>.
          </p>

          {/* Tagline */}
          <p className="text-base text-gray-600 max-w-lg">
            Verified by Science. Secured by Data. Trusted by Design.
          </p>

          {/* CTA Button */}
          <div className="pt-2 pointer-events-auto">
            <a
              href="/report"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white font-semibold rounded-full transition-all duration-300 hover:bg-gray-800 hover:shadow-xl hover:scale-[1.02]"
            >
              Report flooding
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>

          {/* Stats */}
          <div className="flex gap-8 pt-4">
            <div className="space-y-1">
              <div className="text-3xl font-bold text-black">12,847</div>
              <div className="text-sm text-gray-600">Active reports</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold text-black">48</div>
              <div className="text-sm text-gray-600">Cities covered</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold text-green-600">Live</div>
              <div className="text-sm text-gray-600">Updated now</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}