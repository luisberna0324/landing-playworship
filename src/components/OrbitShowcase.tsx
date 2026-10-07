import { useEffect, useRef } from 'react';
import { DeviceIcon } from './DeviceIcon';
import './OrbitDevices.css';

function Starfield() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let width = 1;
    let height = 1;
    let visible = true;
    const stars = Array.from({ length: 120 }, (_, i) => ({ x: ((i * 0.6180339887) % 1), y: ((i * 0.4142135623 + .17) % 1), r: .45 + (i % 4) * .17, phase: i * 1.71 }));
    const draw = (time = 0) => {
      ctx.clearRect(0, 0, width, height);
      const starColor = document.documentElement.dataset.theme === 'light' ? '49,105,65' : '159,209,174';
      for (const star of stars) {
        const alpha = .12 + .28 * (.5 + .5 * Math.sin(time * .00065 + star.phase));
        ctx.fillStyle = `rgba(${starColor},${alpha})`;
        ctx.beginPath();ctx.arc(star.x * width, star.y * height, star.r, 0, Math.PI * 2);ctx.fill();
      }
      if (!reduce.matches && visible && !document.hidden) frame = requestAnimationFrame(draw);
    };
    const restart = () => { cancelAnimationFrame(frame);draw(); };
    const resize = () => {
      const rect = canvas.getBoundingClientRect();width = rect.width;height = rect.height;
      const ratio = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio);canvas.height = Math.round(height * ratio);ctx.setTransform(ratio, 0, 0, ratio, 0, 0);restart();
    };
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(resize);
    observer?.observe(canvas);
    const visibility = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(([entry]) => { visible = entry.isIntersecting;restart(); });
    visibility?.observe(canvas);resize();
    const themeObserver = new MutationObserver(restart);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    reduce.addEventListener('change', restart);document.addEventListener('visibilitychange', restart);
    return () => { cancelAnimationFrame(frame);observer?.disconnect();visibility?.disconnect();themeObserver.disconnect();reduce.removeEventListener('change', restart);document.removeEventListener('visibilitychange', restart); };
  }, []);
  return <canvas ref={ref} className="orbit-stars" aria-hidden="true" />;
}

export function OrbitShowcase() {
  return <section className="orbit-section" aria-labelledby="orbit-title">
    <Starfield />
    <div className="container">
      <div className="section-intro reveal"><p className="eyebrow">PLAYWORSHIP CONTIGO</p><h2 id="orbit-title">Tu música.<br /><span>En tu equipo.</span></h2><p>Windows, macOS y Android.<br />Beta para iOS y Mac mediante TestFlight.</p></div>
      <div className="orbit-system orbit-devices" aria-hidden="true" data-motion="ambient">
        <div className="orbit-track orbit-track-one"><div className="orbit-spin">
          <span className="orbit-node"><span className="orbit-counter"><DeviceIcon device="phone" platform="apple" /></span></span>
          <span className="orbit-node orbit-node-opposite"><span className="orbit-counter"><DeviceIcon device="phone" platform="android" /></span></span>
        </div></div>
        <div className="orbit-track orbit-track-two"><div className="orbit-spin">
          <span className="orbit-node"><span className="orbit-counter"><DeviceIcon device="tablet" platform="android" /></span></span>
          <span className="orbit-node orbit-node-opposite"><span className="orbit-counter"><DeviceIcon device="tablet" platform="apple" /></span></span>
        </div></div>
        <div className="orbit-track orbit-track-three"><div className="orbit-spin">
          <span className="orbit-node"><span className="orbit-counter"><DeviceIcon device="laptop" platform="windows" /></span></span>
          <span className="orbit-node orbit-node-opposite"><span className="orbit-counter"><DeviceIcon device="desktop" platform="apple" /></span></span>
        </div></div>
        <div className="orbit-core"><img src="/assets/img/icono-pw1.png" width="128" height="128" alt="" /></div>
      </div>
      <p className="orbit-device-types">Computador · Tableta · Celular</p>
      <div className="orbit-controls"><a className="text-link" href="#descargas">Elige tu plataforma</a></div>
    </div>
  </section>;
}
