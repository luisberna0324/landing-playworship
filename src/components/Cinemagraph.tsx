import { LazyVideo } from './LazyVideo';

const TELEGRAM_URL = 'https://t.me/+T9yAuOWOJiMwMGMx';

export function Cinemagraph() {
  return (
    <section className="cinemagraph" aria-labelledby="cinemagraph-title">
      <LazyVideo
        className="cinemagraph-video"
        src="/assets/video/cinemagraph.mp4"
        poster="/assets/video/cinemagraph-poster.jpg"
        aria-hidden="true"
      />
      <div className="cinemagraph-tint" aria-hidden="true" />
      <div className="cinemagraph-noise" aria-hidden="true" />
      <div className="cinemagraph-vignette" aria-hidden="true" />
      <div className="cinemagraph-inner">
        <div className="cinemagraph-eyebrow">
          <span className="cinemagraph-eyebrow-dot" aria-hidden="true" />
          Construido en comunidad
        </div>
        <h2 id="cinemagraph-title" className="cinemagraph-title">
          Que nada se corte.
          <br />
          Que nada se <em>pierda</em>.
        </h2>
        <p className="cinemagraph-sub">
          Probado por músicos y técnicos que ensayan, dirigen y vuelven cada domingo. Cada detalle
          de Play Worship se pule en escenario real, no en una presentación.
        </p>
        <div className="cinemagraph-actions">
          <a className="btn-primary" href={TELEGRAM_URL} target="_blank" rel="noopener">
            Unirme al grupo
          </a>
        </div>
      </div>
    </section>
  );
}
