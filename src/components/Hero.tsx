import { InteractiveBackdrop } from './InteractiveBackdrop';
export function Hero() {
  return <section className="hero hero-with-background" id="top" aria-labelledby="hero-title">
    <InteractiveBackdrop />
    <div className="container">
      <div className="hero-copy">
        <p className="eyebrow reveal">PLAYWORSHIP · REPRODUCTOR MULTITRACK</p>
        <h1 className="reveal" id="hero-title">Tus multitracks.<br /><span>Tu alabanza, bajo control.</span></h1>
        <p className="hero-subtitle reveal">Prepara tu setlist, encuentra cada sección y ajusta tu mezcla.<br className="desktop-break" /> Todo en un solo lugar, del ensayo al servicio.</p>
        <div className="hero-actions reveal">
          <a className="btn-primary" href="#descargas"> Descargar gratis</a>
          <a className="btn-secondary" href="#demo">Explorar la interfaz</a>
        </div>
        <p className="hero-note">Local y sin conexión <span>·</span> Windows, macOS y Android <span>·</span> iOS en beta</p>
      </div>
      <figure className="hero-visual reveal">
        <div className="product-window"><img src="/assets/captures/hero-demo-waveform-mixer.png" width="1354" height="635" alt="Interfaz real de PlayWorship con waveform, secciones y mezclador de pistas de la demo Luz de esperanza" fetchPriority="high" /></div>
        <figcaption>Tu música, tus secciones, tu mezcla. Todo a la vista.</figcaption>
      </figure>
    </div>
  </section>;
}
