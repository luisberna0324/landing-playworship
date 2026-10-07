import { useRef, useState } from 'react';
import { ProductionVideo } from './ProductionVideo';
import './VideoShowcases.css';

const DEMOS = [
  { id: 'setlists', tab: 'Setlists', title: 'Prepara las canciones de tu servicio.', description: 'Abre un setlist y añade canciones desde tu biblioteca. Todo tu repertorio, organizado antes de empezar.', source: 'setslistosservicio-web.mp4', poster: 'setslistosservicio-web-poster.jpg', height: 862 },
  { id: 'secciones', tab: 'Secciones', title: 'Dale una estructura visible a tu canción.', description: 'Marca regiones sobre el waveform y asígnales nombres como verso y coro para reconocer cada parte.', source: 'secciones-web.mp4', poster: 'secciones-web-poster.jpg', height: 870 },
  { id: 'ruteo', tab: 'Ruteo', title: 'Configura el destino de cada tipo de pista.', description: 'La demo recorre la asignación de canales mono y estéreo para Click, Cues y Bass desde Configuración.', source: 'salidasseparadas-web.mp4', poster: 'salidasseparadas-web-poster.jpg', height: 828 },
] as const;

export function ProductOverview() {
  const [selected, setSelected] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const demo = DEMOS[selected];
  return <section className="demo-section feature-demos" id="demo" aria-labelledby="demo-title">
    <div className="container">
      <div className="section-intro reveal"><p className="eyebrow">MÍRALO EN PLAYWORSHIP</p><h2 id="demo-title">Del primer setlist<br /><span>al último detalle.</span></h2><p>Elige una demo y recorre el flujo dentro de la aplicación.</p></div>
      <div className="demo-tabs" role="tablist" aria-label="Demos de funciones" onKeyDown={event => {
        const next = event.key === 'ArrowRight' ? (selected + 1) % DEMOS.length : event.key === 'ArrowLeft' ? (selected + DEMOS.length - 1) % DEMOS.length : event.key === 'Home' ? 0 : event.key === 'End' ? DEMOS.length - 1 : null;
        if (next !== null) { event.preventDefault();setSelected(next);tabs.current[next]?.focus(); }
      }}>
        {DEMOS.map((item, index) => <button key={item.id} ref={element => { tabs.current[index] = element; }} id={`demo-tab-${item.id}`} type="button" role="tab" aria-selected={selected === index} aria-controls="feature-demo-panel" tabIndex={selected === index ? 0 : -1} onClick={() => setSelected(index)}>{item.tab}</button>)}
      </div>
      <div id="feature-demo-panel" role="tabpanel" aria-labelledby={`demo-tab-${demo.id}`} tabIndex={0}>
        <div className="feature-demo-heading"><h3>{demo.title}</h3><p>{demo.description}</p></div>
        <figure className="feature-demo-figure">
          <div className="demo-video-window"><ProductionVideo key={demo.id} source={`/assets/video/${demo.source}`} poster={`/assets/video/${demo.poster}`} id={`feature-video-${demo.id}`} className="feature-demo-video" width={1280} height={demo.height} label={`Demo de ${demo.tab} en PlayWorship, sin audio`} describedBy="feature-demo-caption" /></div>
          <figcaption id="feature-demo-caption">{demo.tab} · Grabación original de la aplicación · Sin audio</figcaption>
        </figure>
      </div>
      <a className="text-link" href="https://help.playworship.app">Aprende a usar PlayWorship</a>
    </div>
  </section>;
}
