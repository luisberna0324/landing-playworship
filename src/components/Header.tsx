import { useEffect, useRef, useState } from 'react';
import { BrandLogo } from './BrandLogo';
import { useScrolled } from '../hooks/useScrolled';
import { ThemeControls } from './ThemeControls';

const NAV_LINKS = [
  { href: '#producto', label: 'Producto' },
  { href: '#movil', label: 'Móvil' },
  { href: '#precios', label: 'Local + Cloud' },
  { href: 'https://help.playworship.app', label: 'Ayuda' },
];

export function Header() {
  const scrolled = useScrolled(12);
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && menuOpen) {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    };
    const mq = window.matchMedia('(min-width: 760px)');
    const onResize = () => { if (mq.matches) setMenuOpen(false); };
    document.addEventListener('keydown', onKey);
    mq.addEventListener('change', onResize);
    return () => {
      document.removeEventListener('keydown', onKey);
      mq.removeEventListener('change', onResize);
    };
  }, [menuOpen]);
  return <header className={`site-header${scrolled ? ' is-scrolled' : ''}`}>
    <div className="header-row container">
      <a className="header-brand" href="#top" aria-label="Play Worship, inicio"><BrandLogo priority /></a>
      <nav className="header-nav" aria-label="Navegación principal">
        {NAV_LINKS.map(link => <a key={link.href} href={link.href}>{link.label}</a>)}
      </nav>
      <a className="header-cta" href="#descargas">Descargar </a>
      <ThemeControls onOpen={() => setMenuOpen(false)} />
      <button ref={toggleRef} className="header-menu-toggle" aria-controls="mobile-menu" aria-expanded={menuOpen} aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'} onClick={() => setMenuOpen(!menuOpen)}>
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d={menuOpen ? 'M5 5l14 14M19 5 5 19' : 'M4 7h16M4 12h16M4 17h16'} stroke="currentColor" strokeWidth="1.5" fill="none" /></svg>
      </button>
    </div>
    <nav id="mobile-menu" className="mobile-menu" aria-label="Navegación móvil" hidden={!menuOpen}>
      {NAV_LINKS.map(link => <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>{link.label}</a>)}
      <a href="#descargas" onClick={() => setMenuOpen(false)}>Descargar gratis</a>
    </nav>
  </header>;
}
