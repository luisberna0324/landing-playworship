import { useDownloads } from '../hooks/useDownloads';
import { PlatformIcon } from './PlatformIcon';
const TESTFLIGHT_URL = 'https://testflight.apple.com/join/TsUWWH1r';
const SYSTEMS = [
  { key: 'windows', name: 'Windows', detail: 'Windows 10 / 11 · .exe de 64 bits' },
  { key: 'macos', name: 'macOS', detail: 'Mac · Instalador estable .pkg' },
  { key: 'android', name: 'Android', detail: 'Teléfono y tableta · .apk' },
] as const;
function LinkArrow({ external = false }: { external?: boolean }) {
  return <svg className="link-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d={external ? 'M6 18 18 6M6 6h12v12' : 'M12 4v15m-6-6 6 6 6-6'} /></svg>;
}
export function Downloads() {
  const { downloads, usingFallback } = useDownloads();
  return <section className="downloads-section" id="descargas" aria-labelledby="downloads-title">
    <div className="container">
      <div className="section-intro"><p className="eyebrow">ELIGE TU PLATAFORMA</p><h2 id="downloads-title">Tu próximo servicio<br /><span>empieza aquí.</span></h2><p>Descarga PlayWorship Local y trabaja con tu música.</p></div>
      <div className="download-grid">
        {SYSTEMS.map(system => <article className="download-card" key={system.key}>
          <span className="platform-symbol"><PlatformIcon platform={system.key} /></span><h3>{system.name}</h3><p>{system.detail}</p>
          <small>{usingFallback ? system.key === 'android' ? 'APK beta · versión sin verificar' : 'Enlace alternativo · v2.0.2' : `Versión ${downloads.version}`}</small>
          <div className="download-actions">
            <a className="platform-download" href={downloads.platforms[system.key].url}>{system.key === 'macos' ? 'Descargar estable .pkg' : 'Descargar'}<span className="sr-only"> para {system.name}</span><LinkArrow /></a>
            {system.key === 'macos' && <a className="platform-beta" href={TESTFLIGHT_URL} target="_blank" rel="noopener noreferrer">Probar beta · TestFlight<span className="sr-only"> para Mac (abre otra pestaña)</span><LinkArrow external /></a>}
          </div>
        </article>)}
        <article className="download-card ios-card"><span className="platform-symbol"><PlatformIcon platform="ios" /></span><h3>iOS <span className="pill">BETA</span></h3><p>iPhone y iPad · TestFlight</p><small>Abre la invitación desde tu dispositivo</small><div className="download-actions"><a className="platform-download" href={TESTFLIGHT_URL} target="_blank" rel="noopener noreferrer">Abrir TestFlight<span className="sr-only"> para iOS (abre otra pestaña)</span><LinkArrow external /></a></div></article>
      </div>
      {usingFallback && <p className="download-note" role="status">No pudimos verificar la versión más reciente. Estos son los enlaces alternativos disponibles.</p>}
      <p className="download-note">Beta para iOS y Mac: TestFlight muestra las versiones compatibles y la disponibilidad al abrir la invitación.</p>
      <p className="download-note">¿Necesitas una mano? <a href="https://help.playworship.app">Visita el centro de ayuda</a></p>
    </div>
  </section>;
}
