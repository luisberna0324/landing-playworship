import { useEffect, useRef, useState } from 'react';
import './InteractiveBackdrop.css';

/** Decorative light field: pointer work is limited to one frame per event burst. */
export function InteractiveBackdrop() {
  const backdrop = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const element = backdrop.current;
    const hero = element?.parentElement;
    if (!element || !hero) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    let frame = 0;
    let x = .5;
    let y = .3;
    let inView = true;
    const updateVisibility = () => setVisible(inView && !document.hidden);
    const preference = () => { setReduced(reduce.matches); cancelAnimationFrame(frame); frame = 0; };
    const move = (event: PointerEvent) => {
      if (paused || reduce.matches || !pointer.matches || !inView || document.hidden) return;
      const bounds = hero.getBoundingClientRect();
      x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
      y = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
      if (!frame) frame = requestAnimationFrame(() => {
        frame = 0;
        element.style.setProperty('--light-x', `${(x * 100).toFixed(2)}%`);
        element.style.setProperty('--light-y', `${(y * 100).toFixed(2)}%`);
        element.style.setProperty('--drift-x', `${((x - .5) * 72).toFixed(2)}px`);
        element.style.setProperty('--drift-y', `${((y - .5) * 44).toFixed(2)}px`);
      });
    };
    const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting; updateVisibility();
    });
    observer?.observe(hero);
    preference(); updateVisibility();
    hero.addEventListener('pointermove', move, { passive: true });
    reduce.addEventListener('change', preference);
    pointer.addEventListener('change', preference);
    document.addEventListener('visibilitychange', updateVisibility);
    return () => {
      cancelAnimationFrame(frame); observer?.disconnect();
      hero.removeEventListener('pointermove', move);
      reduce.removeEventListener('change', preference);
      pointer.removeEventListener('change', preference);
      document.removeEventListener('visibilitychange', updateVisibility);
    };
  }, [paused]);
  const still = paused || reduced || !visible;
  return <>
    <div ref={backdrop} className={`interactive-backdrop${still ? ' is-still' : ''}`} data-motion={still ? 'paused' : 'running'} aria-hidden="true">
      <div className="ambient-shift"><i className="ambient-glow ambient-glow-one" /><i className="ambient-glow ambient-glow-two" /></div>
      <div className="ambient-grid" />
      <div className="ambient-spotlight" />
    </div>
    <button className="hero-background-toggle" type="button" aria-pressed={paused} onClick={() => setPaused(value => !value)}>
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" focusable="false"><path d={paused ? 'm7 4 9 6-9 6z' : 'M7 4v12M13 4v12'} /></svg>
      {paused ? 'Animar fondo' : 'Pausar fondo'}
    </button>
  </>;
}
