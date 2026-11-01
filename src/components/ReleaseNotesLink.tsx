import './ReleaseNotesLink.css';

export function ReleaseNotesLink({platform}: {platform: string}) {
  return <a className="platform-release-notes" href="https://help.playworship.app/#novedades">
    <span>Notas de versión<span className="sr-only"> para {platform}</span></span>
    <svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M7 17 17 7M7 7h10v10" /></svg>
  </a>;
}
