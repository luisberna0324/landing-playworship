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
            <img
              src="/assets/gif/principal.gif"
              alt="Setlist en reproducción dentro de Play Worship"
              loading="lazy"
              decoding="async"
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
          <div className="bp-media bp-mockup">
            <div className="bp-mockup-card">
              <span className="bp-mockup-label">Tonalidad</span>
              <div className="bp-key-row" aria-hidden="true">
                <span className="kp">E♭</span>
                <span className="kp">E</span>
                <span className="kp">F</span>
                <span className="kp kp-active">F#</span>
                <span className="kp">G</span>
                <span className="kp">G#</span>
                <span className="kp">A</span>
              </div>
              <span className="bp-mockup-meta">Cambio en vivo sin detener la reproducción</span>
            </div>
          </div>
        </article>

        <article className="bp-row">
          <div className="bp-copy">
            <h3 className="bp-title">Salidas separadas para FOH e IEM</h3>
            <p className="bp-desc">
              Enrutá el click al oído del músico y la mezcla de sala al FOH con tu interfaz ASIO o
              WASAPI. Sin mezclas intermedias ni conversiones.
            </p>
            <div className="bp-mockup">
              <div className="bp-mockup-card">
                <div className="bp-routing">
                  <div className="bp-routing-node">Play Worship</div>
                  <div className="bp-routing-line" aria-hidden="true" />
                  <div className="bp-routing-branches">
                    <span>Click → IEM músico</span>
                    <span>Mezcla → FOH sala</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bp-media" aria-hidden="true">
            <div className="bp-mockup-tile">
              <span className="bp-mockup-tile-label">Ruteo de audio</span>
              <div className="bp-mockup-tile-content">
                <div>
                  <span>Drums</span>
                  <b>FOH</b>
                </div>
                <div>
                  <span>Bass</span>
                  <b>FOH</b>
                </div>
                <div>
                  <span>Click</span>
                  <b>IEM</b>
                </div>
                <div>
                  <span>Pads</span>
                  <b>FOH + IEM</b>
                </div>
              </div>
            </div>
          </div>
        </article>

        <article className="bp-row bp-row-reverse">
          <div className="bp-copy">
            <h3 className="bp-title">Control remoto desde el celular</h3>
            <p className="bp-desc">
              Servidor web embebido: controlá tu set desde cualquier dispositivo en la misma red
              WiFi, sin instalar nada adicional.{' '}
              <span className="bp-badge">Próximamente</span>
            </p>
            <div className="bp-mockup">
              <div className="bp-mockup-card">
                <code className="bp-code">http://192.168.0.10:8080</code>
                <span className="bp-mockup-meta">Abrí esa URL desde cualquier dispositivo en la red</span>
              </div>
            </div>
          </div>
          <div className="bp-media" aria-hidden="true">
            <div className="bp-mockup-tile bp-mockup-tile-mono">
              <span className="bp-mockup-tile-label">Remote control</span>
              <div className="bp-mockup-tile-remote">
                <div className="bp-remote-screen">
                  <span className="bp-remote-title">Tuya (más)</span>
                  <span className="bp-remote-meta">Verso 2 · F# · 92 BPM</span>
                  <div className="bp-remote-controls">
                    <span>⏮</span>
                    <span className="bp-remote-play">▶</span>
                    <span>⏭</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>

        <article className="bp-row">
          <div className="bp-copy">
            <h3 className="bp-title">Compatible con Loop Community</h3>
            <p className="bp-desc">
              Descargá cualquier multitrack de Loop Community Prime y cargalo directo en Play
              Worship. Sin conversiones ni pasos extra.
            </p>
          </div>
          <div className="bp-media" aria-hidden="true">
            <div className="bp-mockup-tile">
              <span className="bp-mockup-tile-label">Loop Community</span>
              <div className="bp-mockup-tile-content">
                <div>
                  <span>Tuya</span>
                  <b>.zip</b>
                </div>
                <div>
                  <span>Way Maker</span>
                  <b>.zip</b>
                </div>
                <div>
                  <span>Goodness of God</span>
                  <b>.zip</b>
                </div>
                <div>
                  <span>Reckless Love</span>
                  <b>.zip</b>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
