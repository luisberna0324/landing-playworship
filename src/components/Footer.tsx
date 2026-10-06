import { BrandLogo } from './BrandLogo';
export function Footer() {
  return <footer className="site-footer"><div className="container">
    <div className="footer-top"><div className="footer-brand-col"><a href="#top" aria-label="Play Worship, volver al inicio"><BrandLogo /></a><p>Multitracks para tu equipo de alabanza.<br />Construido en comunidad.</p></div>
      <div className="footer-col"><h3>Producto</h3><a href="#producto">Funciones</a><a href="#descargas">Descargas</a><a href="/precios.html">Precios</a></div>
      <div className="footer-col"><h3>Estamos cerca</h3><a href="https://help.playworship.app">Centro de ayuda</a><a href="https://t.me/+T9yAuOWOJiMwMGMx" target="_blank" rel="noopener noreferrer">Telegram</a><a href="mailto:hola@playworship.app">Contacto</a><a href="https://api.playworship.app/account">Cuenta y facturación</a></div>
      <div className="footer-col"><h3>Legal</h3><a href="/legal/terminos.html">Términos</a><a href="/legal/privacidad.html">Privacidad</a><a href="/legal/reembolsos.html">Reembolsos</a><a href="/legal/copyright.html">Copyright</a></div>
    </div>
    <div className="footer-bottom"><span>© 2026 PlayWorship</span><span>Windows · macOS · Android · iOS beta en TestFlight</span><span>Hecho para la iglesia latinoamericana</span></div>
  </div></footer>;
}
