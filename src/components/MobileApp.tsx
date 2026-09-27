import { LazyVideo } from './LazyVideo';

export function MobileApp() {
  return (
    <section className="mobile-app" id="mobile-app" aria-labelledby="mobile-app-title">
      <div className="container mobile-app-grid">
        <div className="mobile-app-copy">
          <div className="section-label">Play Worship Mobile</div>
          <h2 id="mobile-app-title" className="section-heading">
            Toda la potencia del escritorio, en tu teléfono
          </h2>
          <p className="mobile-app-desc">
            Prepara tu setlist, reproduce multitracks, navega por secciones y ajusta la tonalidad y la
            mezcla desde tu teléfono o tableta. Las herramientas que usas en el escritorio, ahora en
            una experiencia móvil nativa para dirigir el servicio.
          </p>
          <a className="mobile-app-link" href="#top">
            Ver opciones de descarga <span aria-hidden="true">→</span>
          </a>
        </div>
        <div className="mobile-app-media">
          <LazyVideo
            src="/assets/video/mobileNativo-web.mp4"
            poster="/assets/video/mobileNativo-web-poster.jpg"
            aria-label="Play Worship Mobile: setlist y mezclador en un dispositivo móvil"
          />
        </div>
      </div>
    </section>
  );
}
