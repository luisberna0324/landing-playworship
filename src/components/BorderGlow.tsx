import { useCallback, useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import './BorderGlow.css';

interface BorderGlowProps {
  children: ReactNode;
  className?: string;
  edgeSensitivity?: number;
  glowColor?: string;
  backgroundColor?: string;
  borderRadius?: number;
  glowRadius?: number;
  glowIntensity?: number;
  coneSpread?: number;
  animated?: boolean;
  colors?: string[];
  fillOpacity?: number;
}

type GlowStyle = CSSProperties & Record<`--${string}`, string | number>;

interface AnimationOptions {
  start?: number;
  end?: number;
  duration?: number;
  delay?: number;
  ease?: (value: number) => number;
  onUpdate: (value: number) => void;
  onEnd?: () => void;
}

const gradientPositions = ['80% 55%', '69% 34%', '8% 6%', '41% 38%', '86% 85%', '82% 18%', '51% 4%'];
const gradientKeys: Array<`--${string}`> = [
  '--gradient-one',
  '--gradient-two',
  '--gradient-three',
  '--gradient-four',
  '--gradient-five',
  '--gradient-six',
  '--gradient-seven'
];
const colorMap = [0, 1, 2, 0, 1, 2, 1];

function parseHSL(value: string) {
  const match = value.match(/([\d.]+)\s*([\d.]+)%?\s*([\d.]+)%?/);
  if (!match) return { h: 140, s: 70, l: 50 };
  return { h: Number(match[1]), s: Number(match[2]), l: Number(match[3]) };
}

function buildGlowVars(glowColor: string, intensity: number): GlowStyle {
  const { h, s, l } = parseHSL(glowColor);
  const base = `${h}deg ${s}% ${l}%`;
  const opacities = [100, 60, 50, 40, 30, 20, 10];
  const keys = ['', '-60', '-50', '-40', '-30', '-20', '-10'];
  const variables: GlowStyle = {};

  opacities.forEach((opacity, index) => {
    variables[`--glow-color${keys[index]}`] = `hsl(${base} / ${Math.min(opacity * intensity, 100)}%)`;
  });

  return variables;
}

function buildGradientVars(colors: string[]): GlowStyle {
  const palette = colors.length > 0 ? colors : ['#1DB954'];
  const variables: GlowStyle = {};

  gradientKeys.forEach((key, index) => {
    const color = palette[Math.min(colorMap[index], palette.length - 1)];
    variables[key] = `radial-gradient(at ${gradientPositions[index]}, ${color} 0px, transparent 50%)`;
  });

  variables['--gradient-base'] = `linear-gradient(${palette[0]} 0 100%)`;
  return variables;
}

const easeOutCubic = (value: number) => 1 - Math.pow(1 - value, 3);
const easeInCubic = (value: number) => value * value * value;

function animateValue({
  start = 0,
  end = 100,
  duration = 1000,
  delay = 0,
  ease = easeOutCubic,
  onUpdate,
  onEnd
}: AnimationOptions) {
  let frameId = 0;
  const startTime = performance.now() + delay;

  const tick = () => {
    const elapsed = performance.now() - startTime;
    const progress = Math.min(Math.max(elapsed / duration, 0), 1);
    onUpdate(start + (end - start) * ease(progress));
    if (progress < 1) frameId = requestAnimationFrame(tick);
    else onEnd?.();
  };

  const timeoutId = window.setTimeout(() => {
    frameId = requestAnimationFrame(tick);
  }, delay);

  return () => {
    window.clearTimeout(timeoutId);
    cancelAnimationFrame(frameId);
  };
}

export default function BorderGlow({
  children,
  className = '',
  edgeSensitivity = 30,
  glowColor = '140 70 50',
  backgroundColor = '#101612',
  borderRadius = 12,
  glowRadius = 24,
  glowIntensity = 1,
  coneSpread = 25,
  animated = false,
  colors = ['#1DB954', '#1ED760', '#86EFAC'],
  fillOpacity = 0.3
}: BorderGlowProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const deltaX = x - centerX;
    const deltaY = y - centerY;
    const scaleX = deltaX === 0 ? Number.POSITIVE_INFINITY : centerX / Math.abs(deltaX);
    const scaleY = deltaY === 0 ? Number.POSITIVE_INFINITY : centerY / Math.abs(deltaY);
    const edge = Math.min(Math.max(1 / Math.min(scaleX, scaleY), 0), 1);
    let angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI) + 90;
    if (angle < 0) angle += 360;

    card.style.setProperty('--edge-proximity', (edge * 100).toFixed(3));
    card.style.setProperty('--cursor-angle', `${angle.toFixed(3)}deg`);
  }, []);

  useEffect(() => {
    const card = cardRef.current;
    if (!animated || !card || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const angleStart = 110;
    const angleEnd = 465;
    card.classList.add('sweep-active');
    card.style.setProperty('--cursor-angle', `${angleStart}deg`);

    const cleanups = [
      animateValue({ duration: 500, onUpdate: (value) => card.style.setProperty('--edge-proximity', String(value)) }),
      animateValue({
        ease: easeInCubic,
        duration: 1500,
        end: 50,
        onUpdate: (value) => card.style.setProperty('--cursor-angle', `${(angleEnd - angleStart) * (value / 100) + angleStart}deg`)
      }),
      animateValue({
        ease: easeOutCubic,
        delay: 1500,
        duration: 2250,
        start: 50,
        end: 100,
        onUpdate: (value) => card.style.setProperty('--cursor-angle', `${(angleEnd - angleStart) * (value / 100) + angleStart}deg`)
      }),
      animateValue({
        ease: easeInCubic,
        delay: 2500,
        duration: 1500,
        start: 100,
        end: 0,
        onUpdate: (value) => card.style.setProperty('--edge-proximity', String(value)),
        onEnd: () => card.classList.remove('sweep-active')
      })
    ];

    return () => {
      cleanups.forEach((cleanup) => cleanup());
      card.classList.remove('sweep-active');
    };
  }, [animated]);

  const style: GlowStyle = {
    '--card-bg': backgroundColor,
    '--edge-sensitivity': edgeSensitivity,
    '--border-radius': `${borderRadius}px`,
    '--glow-padding': `${glowRadius}px`,
    '--cone-spread': coneSpread,
    '--fill-opacity': fillOpacity,
    ...buildGlowVars(glowColor, glowIntensity),
    ...buildGradientVars(colors)
  };

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      className={`border-glow-card ${className}`.trim()}
      style={style}
    >
      <span className="edge-light" aria-hidden="true" />
      <div className="border-glow-inner">{children}</div>
    </div>
  );
}
