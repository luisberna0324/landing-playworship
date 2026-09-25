import { LazyVideo } from './LazyVideo';

export function BestPractices() {
  return (
    <section className="best-practices" id="best-practices" aria-labelledby="best-practices-title">
      <div className="container">
        <h2 id="best-practices-title" className="section-heading">
          Las mejores formas de usar Play Worship
        </h2>

        <article className="bp-row">
          <div className="bp-copy">
            <h3 className="bp-title">Sets listos para el servicio</h3>
            <p className="bp-desc">
              Importa tus canciones, ordená el setlist y dejá todo preparado. Tu equipo llega y el
              sistema ya está armado: solo tocás play y dirigís.
            </p>
          </div>
          <div className="bp-media">
            <LazyVideo
              src="/assets/video/setslistosservicio-web.mp4"
              poster="/assets/video/setslistosservicio-web-poster.jpg"
              aria-label="Preparación del setlist para un servicio en Play Worship"
              style={{ aspectRatio: '1280 / 862' }}
              fallback={<img src="/assets/gif/principal.gif" alt="Setlist en Play Worship" />}
            />
          </div>
        </article>

        <article className="bp-row bp-row-reverse">
          <div className="bp-copy">
            <h3 className="bp-title">Transposición sin pausas</h3>
            <p className="bp-desc">
              Cambiá la tonalidad en vivo con el algoritmo SoundTouch de alta fidelidad. Sin
              artefactos y sin latencia perceptible.
            </p>
          </div>
          <div className="bp-media">
            <LazyVideo
              src="/assets/video/trasposicionsinpausa-web.mp4"
              poster="/assets/video/trasposicionsinpausa-web-poster.jpg"
              aria-label="Transposición de tonalidad en vivo sin detener Play Worship"
              style={{ aspectRatio: '1280 / 478' }}
            />
          </div>
        </article>

        <article className="bp-row">
          <div className="bp-copy">
            <h3 className="bp-title">Salidas separadas para FOH e IEM</h3>
            <p className="bp-desc">
              Enrutá el click al oído del músico y la mezcla de sala al FOH con tu interfaz de audio.
              Asigná salidas por tipo de canal desde un solo lugar.
            </p>
          </div>
          <div className="bp-media">
            <LazyVideo
              src="/assets/video/salidasseparadas-web.mp4"
              poster="/assets/video/salidasseparadas-web-poster.jpg"
              aria-label="Configuración de salidas de audio por tipo de canal en Play Worship"
              style={{ aspectRatio: '1280 / 828' }}
            />
          </div>
        </article>

      </div>
    </section>
  );
}
