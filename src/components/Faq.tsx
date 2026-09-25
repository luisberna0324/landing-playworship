interface FaqItem {
  question: string;
  answer: React.ReactNode;
}

const ITEMS: FaqItem[] = [
  {
    question: '¿En qué sistemas operativos funciona Play Worship?',
    answer: (
      <p>
        Hoy se descarga para <strong>Windows 10 y 11</strong> con instalador firmado.{' '}
        <strong>macOS</strong> está en preparación y los miembros del grupo de Telegram tienen
        acceso anticipado.
      </p>
    )
  },
  {
    question: '¿Necesito internet para usarlo?',
    answer: (
      <p>
        No. La biblioteca se carga desde disco y todo el audio corre en local. Solo necesitás
        conexión para descargar la app y recibir actualizaciones.
      </p>
    )
  },
  {
    question: '¿Funciona con mi interfaz de audio?',
    answer: (
      <p>
        Sí. Es compatible con cualquier interfaz ASIO en Windows y con WASAPI. Podés enrutar click
        al IEM del músico y la mezcla al FOH por separado.
      </p>
    )
  },
  {
    question: '¿Qué pasa con la licencia? ¿Tiene costo?',
    answer: (
      <p>
        Durante esta etapa el acceso es gratuito. Cuando publiquemos los planes pagos, tendrán un
        precio pensado para iglesias y ministerios chicos. Los miembros activos de la comunidad van
        a tener beneficios al lanzamiento.
      </p>
    )
  },
  {
    question: '¿Cómo instalo Play Worship?',
    answer: (
      <p>
        Entrá al grupo de Telegram y pedí el enlace al instalador. Es un <code>.exe</code>{' '}
        firmado en menos de 2 minutos, sin dependencias raras.
      </p>
    )
  },
  {
    question: '¿Puedo controlar la app desde el celular?',
    answer: (
      <p>
        Todavía estamos definiendo la experiencia de control remoto desde el celular. Compartiremos
        los detalles de funcionamiento y compatibilidad cuando estén listos.
      </p>
    )
  },
  {
    question: '¿Cómo reporto un bug o pido una función?',
    answer: (
      <p>
        El grupo de Telegram es el canal principal. Ahí conversamos con músicos, líderes y
        técnicos que están usando Play Worship en sus iglesias cada semana.
      </p>
    )
  }
];

export function Faq() {
  return (
    <section className="faq" id="faq" aria-labelledby="faq-title">
      <div className="container">
        <h2 id="faq-title" className="section-heading">
          Preguntas frecuentes
        </h2>
        <div className="faq-list">
          {ITEMS.map((item) => (
            <details key={item.question} className="faq-item">
              <summary>
                <span>{item.question}</span>
                <span className="faq-icon" aria-hidden="true" />
              </summary>
              <div className="faq-body">{item.answer}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
