import { Fragment, useRef, useState } from 'react';
import { useDownloads } from '../hooks/useDownloads';
import { PlatformIcon } from './PlatformIcon';
import { ReleaseNotesLink } from './ReleaseNotesLink';
import { InstallationGuide, installationGuideId } from './InstallationGuide';
import type { DesktopPlatform } from './InstallationGuide';
import { APP_STORE_URL, MICROSOFT_STORE_DEEP_LINK, MICROSOFT_STORE_URL } from '../appLinks';
const TESTFLIGHT_URL = 'https://testflight.apple.com/join/TsUWWH1r';
const SYSTEMS = [
  {
    key: 'windows', name: 'Windows', detail: 'Microsoft Store e instalador .exe',
    store: { url: MICROSOFT_STORE_URL, name: 'Microsoft Store', detail: 'Windows 10 / 11', format: '.exe' },
  },
  {
    key: 'macos', name: 'macOS', detail: 'Mac App Store e instalador .pkg',
    store: { url: APP_STORE_URL, name: 'Mac App Store', detail: 'App Store · macOS 12.0 o posterior', format: '.pkg' },
  },
  { key: 'android', name: 'Android', detail: 'Teléfono y tableta · .apk', store: null },
] as const;
function LinkArrow({ external = false }: { external?: boolean }) {
  return <svg className="link-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d={external ? 'M6 18 18 6M6 6h12v12' : 'M12 4v15m-6-6 6 6 6-6'} /></svg>;
}
export function Downloads() {
  const { downloads, usingFallback } = useDownloads();
  const isWindows = typeof navigator !== 'undefined' && /\bWindows NT\b/i.test(navigator.userAgent);
  const directVersion = usingFallback ? 'Enlace alternativo · v2.0.2' : `Descarga directa · v${downloads.version}`;
  const [guide, setGuide] = useState<DesktopPlatform | null>(null);
  const guideTrigger = useRef<HTMLButtonElement | null>(null);
  const closeGuide = () => {
    setGuide(null);
    guideTrigger.current?.focus();
  };
  return <section className="downloads-section" id="descargas" aria-labelledby="downloads-title">
    <div className="container">
      <div className="section-intro"><p className="eyebrow">ELIGE TU PLATAFORMA</p><h2 id="downloads-title">Tu próximo servicio<br /><span>empieza aquí.</span></h2><p>Descarga PlayWorship Local y trabaja con tu música.</p></div>
      <div className="download-grid">
        {SYSTEMS.map(system => <Fragment key={system.key}><article className="download-card" data-platform={system.key}>
          <span className="platform-symbol"><PlatformIcon platform={system.key} /></span><h3>{system.name}</h3><p>{system.detail}</p>
          <small>{system.store?.detail ?? (usingFallback ? 'APK beta · versión sin verificar' : `Versión ${downloads.version}`)}</small>
          <div className="download-actions">
            {system.store ? <a className="platform-download" href={system.store.url} target="_blank" rel="noopener noreferrer">Descargar en {system.store.name}<span className="sr-only"> (abre otra pestaña)</span><LinkArrow external /></a> : <a className="platform-download" href={downloads.platforms[system.key].url}>Descargar<span className="sr-only"> para {system.name}</span><LinkArrow /></a>}
            <ReleaseNotesLink platform={system.name} />
            {system.key === 'windows' && isWindows && <a className="platform-beta" href={MICROSOFT_STORE_DEEP_LINK}>Abrir en la app de Microsoft Store<LinkArrow external /></a>}
            {system.store && <a className="platform-beta" href={downloads.platforms[system.key].url}><span>Descargar instalador {system.store.format}<br /><span className="direct-download-version">{directVersion}</span></span><LinkArrow /></a>}
            {system.key !== 'android' && <button
              type="button"
              className="installation-guide-toggle"
              aria-expanded={guide === system.key}
              aria-controls={installationGuideId(system.key)}
              onClick={event => {
                guideTrigger.current = event.currentTarget;
                setGuide(guide === system.key ? null : system.key);
              }}
            >¿Problemas con el {system.store?.format}? <span>Ver guía rápida</span><span className="sr-only"> para {system.name}</span></button>}
            {system.key === 'macos' && <a className="platform-beta" href={TESTFLIGHT_URL} target="_blank" rel="noopener noreferrer">Probar beta · TestFlight<span className="sr-only"> para Mac (abre otra pestaña)</span><LinkArrow external /></a>}
          </div>
        </article>
          {system.key !== 'android' && <InstallationGuide platform={system.key} open={guide === system.key} onClose={closeGuide} />}
        </Fragment>)}
        <article className="download-card ios-card"><span className="platform-symbol"><PlatformIcon platform="ios" /></span><h3>iOS</h3><p>iPhone y iPad · App Store</p><small>Descarga oficial para iPhone y iPad</small><div className="download-actions"><a className="platform-download" href={APP_STORE_URL} target="_blank" rel="noopener noreferrer">Descargar en App Store<span className="sr-only"> para iPhone y iPad (abre otra pestaña)</span><LinkArrow external /></a><ReleaseNotesLink platform="iPhone y iPad" /></div></article>
      </div>
      {usingFallback && <p className="download-note" role="status">No pudimos verificar la versión más reciente. Estos son los enlaces alternativos disponibles.</p>}
      <p className="download-note">PlayWorship está disponible en App Store para Mac, iPhone y iPad. La beta para Mac continúa en TestFlight.</p>
      <p className="download-note">¿Necesitas una mano? <a href="https://help.playworship.app">Visita el centro de ayuda</a></p>
    </div>
  </section>;
}
