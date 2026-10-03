import { BrandLogo } from './BrandLogo';

const TELEGRAM_URL = 'https://t.me/+T9yAuOWOJiMwMGMx';
const EMAIL = 'mailto:hola@playworship.app';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand-col">
          <a className="footer-brand" href="#top" aria-label="Play Worship, volver al inicio">
            <BrandLogo />
          </a>
          <p className="footer-tag">
            Reproductor multitrack profesional para equipos de alabanza. Construido en comunidad.
          </p>
          <a className="btn-primary footer-cta" href={TELEGRAM_URL} target="_blank" rel="noopener">
            Unirme al grupo
          </a>
          <div className="footer-social" aria-label="Comunidad y soporte">
            <a href={TELEGRAM_URL} target="_blank" rel="noopener" aria-label="Telegram">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path
                  d="M21 4 2 11.5l5 1.5 2 6 3.5-4 5 4L21 4Zm-4 5-7 6.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
            <a href={EMAIL} aria-label="Email">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path
                  d="M4 6h16v12H4z M4 6l8 6 8-6"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </div>
        </div>

        <div className="footer-cols">
          <div className="footer-col">
            <h4>Producto</h4>
            <a href="#features-tabs">Casos de uso</a>
            <a href="#best-practices">Funciones</a>
            <a href="#mobile-app">App móvil</a>
            <a href="/precios.html">Precios</a>
          </div>
          <div className="footer-col">
            <h4>Comunidad</h4>
            <a href={TELEGRAM_URL} target="_blank" rel="noopener">
              Grupo de Telegram
            </a>
            <a href="#faq">Preguntas frecuentes</a>
            <a href={EMAIL}>Soporte directo</a>
          </div>
          <div className="footer-col">
            <h4>Recursos</h4>
            <a href="https://help.playworship.app">Centro de ayuda</a>
            <a href="https://api.playworship.app/account">Cuenta y facturación</a>
            <a href={EMAIL}>Reportar un error</a>
            <a href={EMAIL}>Pedir función</a>
          </div>
          <div className="footer-col">
            <h4>Legal</h4>
            <a href="/legal/terminos.html">Términos</a>
            <a href="/legal/privacidad.html">Privacidad</a>
            <a href="/legal/reembolsos.html">Reembolsos</a>
            <a href="/legal/copyright.html">Copyright</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 Play Worship · Hecho con ❤ para la iglesia latinoamericana</span>
        <span>Disponible para Windows 10 / 11, macOS y Android · iOS en preparación</span>
      </div>
    </footer>
  );
}
