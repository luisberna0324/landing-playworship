import { useEffect, useState } from 'react';
import { useScrolled } from '../hooks/useScrolled';

const NAV_LINKS = [
  { href: '#features-tabs', label: 'Producto' },
  { href: '#best-practices', label: 'Funciones' },
  { href: '#access', label: 'Plataformas' },
  { href: '#precios', label: 'Precios' },
  { href: '#faq', label: 'FAQ' },
  { href: 'https://t.me/+T9yAuOWOJiMwMGMx', label: 'Comunidad', external: true }
];

const TELEGRAM_URL = 'https://t.me/+T9yAuOWOJiMwMGMx';

export function Header() {
  const scrolled = useScrolled(8);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('nav-open', menuOpen);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.classList.remove('nav-open');
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  // Cerrar el menú si pasa a desktop
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 960px)');
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setMenuOpen(false);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return (
    <header className={`site-header${scrolled ? ' is-scrolled' : ''}`} id="site-header">
      <div className="header-row">
        <a className="header-brand" href="#top" aria-label="Play Worship, ir al inicio">
          <span className="header-logo">
            <img src="/assets/img/icono-pw.png" alt="" />
          </span>
        </a>
        <nav className="header-nav" aria-label="Navegación principal">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              {...(link.external ? { target: '_blank', rel: 'noopener' } : {})}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <a className="header-cta" href={TELEGRAM_URL} target="_blank" rel="noopener">
          Unirme al grupo
        </a>
        <button
          className="header-menu-toggle"
          type="button"
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-controls="mobile-menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path
              d={menuOpen ? 'M5 5l14 14M19 5 5 19' : 'M3 6h18M3 12h18M3 18h18'}
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </button>
      </div>
      <div
        className={`mobile-menu${menuOpen ? ' is-open' : ''}`}
        id="mobile-menu"
        {...(menuOpen ? {} : { hidden: true })}
      >
        {NAV_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            {...(link.external ? { target: '_blank', rel: 'noopener' } : {})}
            onClick={() => setMenuOpen(false)}
          >
            {link.label}
          </a>
        ))}
        <a
          className="mobile-cta"
          href={TELEGRAM_URL}
          target="_blank"
          rel="noopener"
          onClick={() => setMenuOpen(false)}
        >
          Unirme al grupo
        </a>
      </div>
    </header>
  );
}
