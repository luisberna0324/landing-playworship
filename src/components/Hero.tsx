import { useRef } from 'react';
import Aurora from './Aurora';
import BorderGlow from './BorderGlow';
import { useDisclosure } from '../hooks/useOutsideClick';
import { useDownloads } from '../hooks/useDownloads';

export function Hero() {
  const { open, toggle, close, ref } = useDisclosure(false);
  const { downloads, usingFallback } = useDownloads();
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  return (
    <section className="hero" id="top">
      <Aurora
        className="aurora-bg"
        colorStops={['#7cff67', '#B497CF', '#5227FF']}
        amplitude={1.0}
        blend={0.5}
        speed={0.8}
        respectReducedMotion
      />
      <div className="hero-inner">
        <h1 className="hero-title">
          <img
            src="/assets/img/pwLogoSinFondo.png"
            alt="Play Worship"
            className="hero-logo"
            width="1920"
            height="709"
            decoding="async"
            fetchPriority="high"
          />
        </h1>
        <p className="hero-subtitle">
          <span>Reproductor multitrack profesional para tu equipo de alabanza.</span>
          <span>
            Carga tu setlist desde disco, navega secciones con precisión y dirige cada servicio con
            confianza.
          </span>
        </p>
        <div className="download-cta">
          <BorderGlow
            className="download-border-glow"
            edgeSensitivity={26}
            glowColor="142 71 48"
            backgroundColor="#303532"
            borderRadius={18}
            glowRadius={24}
            glowIntensity={0.8}
            coneSpread={23}
            animated
            colors={['#1DB954', '#1ED760', '#86EFAC']}
            fillOpacity={0.18}
          >
            <div className="download-cta-group">
              <a className="btn-primary download-button" href={downloads.platforms.windows.url}>
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                  <path d="M3 5.5 11 4v9H3V5.5Zm10 7V4l11-1.5v9.6H13Zm-10 2H11v8.2L3 21.5v-7Z" fill="currentColor" />
                </svg>
                <span className="download-label-full">Descargar para Windows</span>
                <span className="download-label-compact">Descargar app</span>
              </a>
              <button
                type="button"
                className="download-dropdown-toggle"
                aria-label={open ? 'Cerrar opciones de descarga' : 'Ver opciones de descarga'}
                aria-haspopup="menu"
                aria-expanded={open}
                aria-controls="download-menu"
                onClick={(e) => {
                  e.stopPropagation();
                  toggle();
                }}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                  <path
                    d="M6 9l6 6 6-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </BorderGlow>
          <div
            ref={(node) => {
              ref.current = node;
              dropdownRef.current = node;
            }}
            className="download-menu"
            id="download-menu"
            role="menu"
            {...(open ? {} : { hidden: true })}
          >
            <a
              className="download-menu-item"
              href={downloads.platforms.macos.url}
              role="menuitem"
              onClick={close}
            >
              <span className="download-platform-icon" aria-hidden="true">
                <img className="platform-icon" src="/assets/icons/apple.svg" alt="" />
              </span>
              <span className="download-menu-copy">
                <strong>macOS</strong>
                <span className="download-device-meta">
                  <svg className="device-icon" viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="12" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.7" />
                    <path d="M8 20h8M12 16v4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                  </svg>
                  <small>Mac .pkg · Escritorio</small>
                </span>
                {!usingFallback && <small className="download-version">v{downloads.version}</small>}
              </span>
              <em>Disponible</em>
            </a>
            <div className="download-menu-item is-disabled" role="menuitem" aria-disabled="true">
              <span className="download-platform-icon" aria-hidden="true">
                <img className="platform-icon" src="/assets/icons/apple.svg" alt="" />
              </span>
              <span className="download-menu-copy">
                <strong>iOS</strong>
                <span className="download-device-meta">
                  <svg className="device-icon device-icon-mobile" viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="3" y="6" width="7" height="12" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    <rect x="12" y="3" width="9" height="18" rx="1.6" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                  <small>iPhone y iPad</small>
                </span>
              </span>
              <em>Próximamente</em>
            </div>
            <a className="download-menu-item" href={downloads.platforms.windows.url} role="menuitem" onClick={close}>
              <span className="download-platform-icon" aria-hidden="true">
                <svg className="platform-icon" viewBox="0 0 24 24">
                  <path d="M3 5.5 11 4v9H3V5.5Zm10 7V4l11-1.5v9.6H13Zm-10 2H11v8.2L3 21.5v-7Z" fill="currentColor" />
                </svg>
              </span>
              <span className="download-menu-copy">
                <strong>Windows 10 / 11</strong>
                <span className="download-device-meta">
                  <svg className="device-icon" viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="12" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.7" />
                    <path d="M8 20h8M12 16v4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                  </svg>
                  <small>Windows .exe · Escritorio</small>
                </span>
                {!usingFallback && <small className="download-version">v{downloads.version}</small>}
              </span>
              <em>Disponible</em>
            </a>
            <a className={`download-menu-item${usingFallback ? ' is-beta' : ''}`} href={downloads.platforms.android.url} role="menuitem" onClick={close}>
              <span className="download-platform-icon" aria-hidden="true">
                <img className="platform-icon" src="/assets/icons/android.svg" alt="" />
              </span>
              <span className="download-menu-copy">
                <strong>Android</strong>
                <span className="download-device-meta">
                  <svg className="device-icon device-icon-mobile" viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="3" y="6" width="7" height="12" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    <rect x="12" y="3" width="9" height="18" rx="1.6" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                  <small>Android .apk · Celular y tablet</small>
                </span>
                {!usingFallback && <small className="download-version">v{downloads.version}</small>}
              </span>
              <em>{usingFallback ? 'APK beta' : 'Disponible'}</em>
            </a>
          </div>
        </div>
        <div className="hero-mockup">
          <div className="mockup-glow" aria-hidden="true" />
          <div className="mockup-window">
            <video
              className="hero-app-image"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster="/assets/video/hero-poster.jpg"
              aria-label="Play Worship reproduciendo un multitrack con su setlist y faders en vivo"
            >
              <source src="/assets/video/hero.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </div>
    </section>
  );
}
