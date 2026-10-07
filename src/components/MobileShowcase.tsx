import { useState } from 'react';
import { ProductionVideo } from './ProductionVideo';
import './VideoShowcases.css';

export function MobileShowcase() {
  const [startAt, setStartAt] = useState(49);
  const source = `/assets/video/mobileNativo-web.mp4${startAt ? '#t=49' : ''}`;
  return <section className="mobile-showcase" id="movil" aria-labelledby="mobile-showcase-title">
    <div className="container mobile-showcase-grid">
      <div className="mobile-showcase-copy reveal">
        <p className="eyebrow">PLAYWORSHIP EN MÓVIL</p>
        <h2 id="mobile-showcase-title">Tu música.<br /><span>También en tus manos.</span></h2>
        <p>Organiza el setlist en vertical. Cambia a la vista horizontal para recorrer la canción y ajustar la mezcla.</p>
        <div className="mobile-demo-chapters" role="group" aria-label="Punto de inicio de la demo móvil">
          <button type="button" aria-pressed={startAt === 49} onClick={() => setStartAt(49)}>Ver el setlist</button>
          <button type="button" aria-pressed={startAt === 0} onClick={() => setStartAt(0)}>Ver desde el inicio</button>
        </div>
        <p className="mobile-availability">Android · iPhone y iPad en beta</p>
        <div className="mobile-showcase-links"><a className="text-link" href="https://testflight.apple.com/join/TsUWWH1r" target="_blank" rel="noopener noreferrer">Abrir TestFlight</a><a className="text-link" href="#descargas">Descargar para Android</a></div>
      </div>
      <figure className="mobile-demo-figure reveal">
        <div className="demo-video-window">
          <ProductionVideo key={source} source={source} poster="/assets/video/mobileNativo-web-poster.jpg" id="mobile-production-video" className="mobile-demo-video" width={1280} height={1280} label="Demo móvil de PlayWorship: setlist vertical y mezcla horizontal, sin audio" describedBy="mobile-demo-caption" />
        </div>
        <figcaption id="mobile-demo-caption">Demo móvil · Video original completo, sin audio</figcaption>
      </figure>
    </div>
  </section>;
}
