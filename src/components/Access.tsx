const TELEGRAM_URL = 'https://t.me/+T9yAuOWOJiMwMGMx';

export function Access() {
  return (
    <section className="access-module" id="access" aria-labelledby="access-module-title">
      <div className="container">
        <h2 id="access-module-title" className="section-heading">
          Usá Play Worship donde lo necesites
        </h2>
        <div className="access-grid">
          <article className="access-card">
            <div className="access-media" aria-hidden="true">
              <div className="access-tile">
                <div className="access-tile-bar">
                  <span className="dot d-r" />
                  <span className="dot d-y" />
                  <span className="dot d-g" />
                </div>
                <div className="access-tile-body">
                  <span className="access-tile-title">Setlist en vivo</span>
                  <span className="access-tile-meta">12 canciones · 4 stems activos</span>
                  <div className="access-tile-wave">
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            </div>
            <h3 className="access-card-title">Escritorio</h3>
            <p className="access-desc">
              Conectá tus archivos locales, tu interfaz de audio y dirigí el servicio desde la
              computadora del escenario.
            </p>
            <div className="access-actions">
              <a
                className="btn-primary btn-compact"
                href={TELEGRAM_URL}
                target="_blank"
                rel="noopener"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                  <path
                    d="M3 5.5 11 4v9H3V5.5Zm10 7V4l11-1.5v9.6H13Zm-10 2H11v8.2L3 21.5v-7Z"
                    fill="currentColor"
                  />
                </svg>
                <span>Windows</span>
              </a>
              <button type="button" className="btn-secondary btn-compact" disabled aria-disabled="true">
                <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                  <path
                    d="M16.4 12.6c0-2-1.7-3-1.8-3.1-1-1.4-2.4-1.6-2.9-1.6-1.3-.1-2.5.7-3.1.7-.6 0-1.6-.7-2.7-.7-1.4 0-2.7.8-3.4 2-1.5 2.5-.4 6.4 1 8.4.7 1 1.5 2.1 2.6 2 1.1 0 1.4-.6 2.7-.6 1.3 0 1.6.6 2.7.6 1.1 0 1.8-1 2.5-2 .8-1.2 1.1-2.3 1.1-2.3 0 0-1.7-.8-1.7-3.4Z"
                    fill="currentColor"
                  />
                </svg>
                <span>macOS · Próximamente</span>
              </button>
            </div>
          </article>

          <article className="access-card">
            <div className="access-media" aria-hidden="true">
              <div className="access-tile access-tile-mobile">
                <div className="access-tile-status">
                  <span className="access-tile-dot" /> Online
                </div>
                <div className="access-tile-body">
                  <span className="access-tile-title">Tuya (más)</span>
                  <span className="access-tile-meta">Verso 2 · F# · 92 BPM</span>
                  <div className="access-tile-controls">
                    <span>⏮</span>
                    <span className="access-tile-play">▶</span>
                    <span>⏭</span>
                  </div>
                </div>
              </div>
            </div>
            <h3 className="access-card-title">Control remoto</h3>
            <p className="access-desc">
              Manejá Play Worship desde el celular mientras estás al piano, en la consola o
              moviéndote por el escenario. <span className="bp-badge">Próximamente</span>
            </p>
            <div className="access-actions">
              <button type="button" className="btn-secondary btn-compact" disabled aria-disabled="true">
                <span>iOS · Próximamente</span>
              </button>
              <button type="button" className="btn-secondary btn-compact" disabled aria-disabled="true">
                <span>Android · Próximamente</span>
              </button>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
