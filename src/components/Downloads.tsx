import { useDownloads } from '../hooks/useDownloads';
const SYSTEMS = [
  { key: 'windows', name: 'Windows', detail: 'Windows 10 / 11 · .exe de 64 bits' },
  { key: 'macos', name: 'macOS', detail: 'Mac · Instalador .pkg' },
  { key: 'android', name: 'Android', detail: 'Teléfono y tableta · .apk' },
] as const;
export function Downloads() {
  const { downloads, usingFallback } = useDownloads();
  return <section className="downloads-section" id="descargas" aria-labelledby="downloads-title">
    <div className="container">
      <div className="section-intro"><p className="eyebrow">ELIGE TU PLATAFORMA</p><h2 id="downloads-title">Tu próximo servicio<br /><span>empieza aquí.</span></h2><p>Descarga PlayWorship Local y trabaja con tu música.</p></div>
      <div className="download-grid">
        {SYSTEMS.map(system => <article className="download-card" key={system.key}>
          <span className="platform-symbol" aria-hidden="true">{system.key === 'windows' ? <svg viewBox="0 0 24 24" fill="currentColor"><path d="M2 3h9v8H2zm11 0h9v8h-9zM2 13h9v8H2zm11 0h9v8h-9z" /></svg> : <img src={`/assets/icons/${system.key === 'android' ? 'android' : 'apple'}.svg`} alt="" />}</span><h3>{system.name}</h3><p>{system.detail}</p>
          <small>{usingFallback ? system.key === 'android' ? 'APK beta · versión sin verificar' : 'Enlace alternativo · v2.0.2' : `Versión ${downloads.version}`}</small>
          <a className="platform-download" href={downloads.platforms[system.key].url}>Descargar <span className="sr-only">para {system.name}</span></a>
        </article>)}
        <article className="download-card ios-card"><span className="platform-symbol" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="6" y="2" width="12" height="20" rx="2" /><path d="M10 18h4" /></svg></span><h3>iOS <span className="pill">BETA</span></h3><p>iPhone y iPad · TestFlight</p><small>Consulta el acceso a la beta</small><a className="platform-download" href="https://t.me/+T9yAuOWOJiMwMGMx" target="_blank" rel="noopener noreferrer">Comunidad </a></article>
      </div>
      {usingFallback && <p className="download-note" role="status">No pudimos verificar la versión más reciente. Estos son los enlaces alternativos disponibles.</p>}
      <p className="download-note">¿Necesitas una mano? <a href="https://help.playworship.app">Visita el centro de ayuda</a></p>
    </div>
  </section>;
}
