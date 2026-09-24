const TELEGRAM_URL = 'https://t.me/+T9yAuOWOJiMwMGMx';
const EMAIL = 'mailto:hola@playworship.app';

export function CtaFinal() {
  return (
    <section className="cta-final">
      <div className="container">
        <div className="section-label">¿Listo para empezar?</div>
        <h2 className="cta-title">
          Llevá tu alabanza al <em>siguiente nivel</em>
        </h2>
        <p className="cta-sub">
          Descarga gratis, sin tarjeta de crédito. Unite al grupo y empezá a probar Play Worship en
          tu equipo esta semana.
        </p>
        <div className="cta-actions">
          <a className="btn-primary" href={TELEGRAM_URL} target="_blank" rel="noopener">
            Unirme al grupo de Telegram
          </a>
          <a className="btn-secondary" href={EMAIL}>
            Contactar al equipo
          </a>
        </div>
        <p className="cta-note">
          Compatible con Windows 10 / 11 · Interfaces ASIO &amp; WASAPI · Loop Community
        </p>
      </div>
    </section>
  );
}
