const BENEFITS = [
  { n: '01', title: 'Prepara tu servicio', text: 'Organiza tus canciones en setlists y carga tus multitracks desde la biblioteca local.', image: '/assets/video/setslistosservicio-web-poster.jpg', alt: 'Vista real del repertorio y las listas de canciones en PlayWorship', className: 'setlist-image' },
  { n: '02', title: 'Encuentra cada sección', text: 'Ubica intro, verso, coro y puente sobre la forma de onda. Acércate al detalle y recorre la canción.', image: '/assets/captures/waveform-overview.png', alt: 'Demo Luz de esperanza con secciones de colores sobre el waveform', className: 'waveform-image' },
  { n: '03', title: 'Dale lugar a cada pista', text: 'Ajusta niveles y controla cada canal desde el mezclador. Tu banda y tus multitracks, juntos.', image: '/assets/captures/mixer-demo.png', alt: 'Mezclador real de la demo con faders de click, batería, bajo, piano y guitarra', className: 'mixer-image' },
];
export function ProductOverview() {
  return <>
    <section className="product-section" id="producto" aria-labelledby="product-title">
      <div className="container">
        <div className="section-intro"><p className="eyebrow">DEL ENSAYO AL SERVICIO</p><h2 id="product-title">Menos pasos.<br /><span>Más música.</span></h2><p>Las herramientas que necesitas,<br />justo donde las necesitas.</p></div>
        <div className="benefit-grid">{BENEFITS.map(item => <article className="benefit" key={item.n}>
          <div className={`benefit-image ${item.className}`}><img src={item.image} alt={item.alt} loading="lazy" decoding="async" /></div>
          <div className="benefit-copy"><span className="benefit-number">{item.n}</span><h3>{item.title}</h3><p>{item.text}</p></div>
        </article>)}</div>
      </div>
    </section>
    <section className="demo-section" id="demo" aria-labelledby="demo-title">
      <div className="container">
        <div className="demo-heading"><div><p className="eyebrow">MÍRALO EN PLAYWORSHIP</p><h2 id="demo-title">El detalle. Y el panorama.</h2></div><p>Amplía el waveform y usa el minimapa para moverte por la canción sin perder de vista sus secciones.</p></div>
        <figure className="demo-figure">
          <img src="/assets/captures/waveform-overview.png" width="1348" height="257" loading="lazy" decoding="async" alt="Captura real del waveform de Luz de esperanza con secciones y minimapa" />
          <figcaption>Demo «Luz de esperanza» · Captura real de la aplicación</figcaption>
        </figure>
        <a className="text-link" href="https://help.playworship.app">Aprende a usar PlayWorship <span aria-hidden="true">↗</span></a>
      </div>
    </section>
  </>;
}
