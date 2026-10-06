import { useEffect, useRef } from 'react';

/** Scroll-linked window fan, using three real PlayWorship product captures. */
export function ScrollShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    const update = () => {
      frame = 0;
      const progress = reduced.matches ? 1 : Math.min(1, Math.max(0, (innerHeight * .9 - section.getBoundingClientRect().top) / (innerHeight * 1.3)));
      section.style.setProperty('--stack-progress', progress.toFixed(3));
      section.dataset.progress = progress.toFixed(3);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    reduced.addEventListener('change', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      reduced.removeEventListener('change', schedule);
    };
  }, []);
  return <section className="workflow-section" id="producto" ref={sectionRef} aria-labelledby="workflow-title">
    <div className="container">
      <div className="section-intro reveal"><p className="eyebrow">DEL ENSAYO AL SERVICIO</p><h2 id="workflow-title">Cada canción.<br /><span>A tu manera.</span></h2></div>
      <div className="workflow-grid">
        <div className="stack-stage" aria-label="Tres vistas reales de PlayWorship: biblioteca, setlists y mezclador">
          <figure className="stack-window stack-back"><img src="/assets/video/hero-web-poster.jpg" width="1280" height="804" alt="Biblioteca real de PlayWorship con canciones y pistas" loading="lazy" /></figure>
          <figure className="stack-window stack-middle"><img src="/assets/video/setslistosservicio-web-poster.jpg" width="1280" height="862" alt="Vista real del repertorio de setlists" loading="lazy" /></figure>
          <figure className="stack-window stack-front"><img src="/assets/captures/hero-demo-waveform-mixer.png" width="1354" height="635" alt="Waveform y mezcla de la demo Luz de esperanza" loading="lazy" /></figure>
        </div>
        <div className="workflow-copy">
          <article className="workflow-item reveal"><span className="workflow-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 5h13M7 12h13M7 19h13M3 5h.01M3 12h.01M3 19h.01" /></svg></span><div><h3>Prepara tu servicio</h3><p>Organiza tus canciones en setlists y carga tus multitracks desde la biblioteca local.</p></div></article>
          <article className="workflow-item reveal"><span className="workflow-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 10v4m4-8v12m5-15v18m5-15v12m4-8v4" /></svg></span><div><h3>Encuentra cada sección</h3><p>Ubica intro, verso, coro y puente sobre la forma de onda. Acércate al detalle y recorre la canción.</p></div></article>
          <article className="workflow-item reveal"><span className="workflow-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 3v18M12 3v18M19 3v18M2 8h6m1 7h6m1-8h6" /></svg></span><div><h3>Dale lugar a cada pista</h3><p>Ajusta niveles y controla cada canal desde el mezclador. Tu banda y tus multitracks, juntos.</p></div></article>
        </div>
      </div>
      <div className="workflow-notes reveal"><span>Biblioteca local</span><span>Secciones a la vista</span><span>Mezcla por canal</span><span>Tu setlist preparado</span></div>
    </div>
  </section>;
}
