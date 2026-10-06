interface FaqItem {
  question: string;
  answer: React.ReactNode;
}

const ITEMS: FaqItem[] = [
  {
    question: '¿En qué sistemas operativos funciona Play Worship?',
    answer: (
      <p>
        Puedes descargarla para <strong>Windows 10 y 11</strong> y <strong>macOS</strong>.
        También hay una versión para Android e iOS está en beta mediante TestFlight. Consulta la sección de
        descargas para ver la disponibilidad de cada plataforma.
      </p>
    )
  },
  {
    question: '¿Necesito internet para usarlo?',
    answer: (
      <p>
        No para usar PlayWorship Local. La biblioteca se carga desde disco y el audio corre en tu
        dispositivo. Para crear una copia de seguridad y sincronizar con PlayWorship Cloud sí
        necesitas conexión.
      </p>
    )
  },
  {
    question: '¿Funciona con mi interfaz de audio?',
    answer: (
      <p>
        Sí. Es compatible con interfaces ASIO en Windows y con WASAPI. Puedes enviar el click
        al IEM del músico y la mezcla al FOH por separado.
      </p>
    )
  },
  {
    question: '¿Venden o distribuyen los archivos que guardo en Cloud?',
    answer: (
      <p>
        No. El contenido sigue siendo tuyo: LUJUMA SYSTEM SAS no vende ni distribuye los archivos
        guardados en Cloud ni los pone a disposición de otros usuarios. Se procesan únicamente
        para ofrecer el almacenamiento, respaldo y sincronización que solicitas. Consulta la{' '}
        <a href="/legal/privacidad.html">Política de privacidad</a> para más información.
      </p>
    )
  },
  {
    question: '¿PlayWorship tiene costo?',
    answer: (
      <p>
        PlayWorship Local es gratis, incluso para proyectos sin conexión. Solo pagas si eliges
        PlayWorship Cloud para guardar tu biblioteca en la nube y sincronizarla entre dispositivos.
        Hay planes de 300 GB y 500 GB con pago mensual o anual.
      </p>
    )
  },
  {
    question: '¿Cómo instalo Play Worship?',
    answer: (
      <p>
        Visita la sección de descargas y elige tu plataforma. En Windows, descarga el instalador{' '}
        <code>.exe</code> y sigue las instrucciones.
      </p>
    )
  },
  {
    question: '¿Puedo controlar la aplicación desde el teléfono?',
    answer: (
      <p>
        Todavía estamos definiendo la experiencia de control remoto desde el teléfono. Compartiremos
        los detalles de funcionamiento y compatibilidad cuando estén listos.
      </p>
    )
  },
  {
    question: '¿Cómo reporto un error o sugiero una función?',
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
