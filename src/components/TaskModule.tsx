import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';

interface Tab {
  id: string;
  index: string;
  title: string;
  desc: string;
  image: string;
  alt: string;
  video?: string;
  poster?: string;
  aspectRatio?: string;
}

const TABS: Tab[] = [
  {
    id: 'biblioteca',
    index: '01',
    title: 'Biblioteca local',
    desc: 'Crea canciones e importa tus multitracks desde disco. Tu set queda disponible sin depender de internet.',
    image: '/assets/gif/creacionDeCancion.gif',
    alt: 'Creación de una canción desde la biblioteca local de Play Worship',
    video: '/assets/video/creacionDeCancion-web.mp4',
    poster: '/assets/video/creacionDeCancion-poster.jpg'
  },
  {
    id: 'secciones',
    index: '02',
    title: 'Secciones en waveform',
    desc: 'Marca intro, verso, coro, puente y final sobre el waveform y salta entre secciones al instante.',
    image: '/assets/gif/secciones.gif',
    alt: 'Marcado de secciones en el waveform de Play Worship',
    video: '/assets/video/secciones-web.mp4',
    poster: '/assets/video/secciones-web-poster.jpg'
  },
  {
    id: 'interfaz',
    index: '03',
    title: 'Interfaz que se limpia sola',
    desc: 'Activa o oculta paneles con un toggle. En el ensayo mostrás todo; en vivo, solo lo esencial.',
    image: '/assets/gif/interfaceLimpia.gif',
    alt: 'Paneles de biblioteca, mezclador y pads activados u ocultos en Play Worship',
    video: '/assets/video/espaciotrabajo-web.mp4',
    poster: '/assets/video/espaciotrabajo-web-poster.jpg',
    aspectRatio: '1280 / 804'
  },
  {
    id: 'pads',
    index: '04',
    title: 'Pads para sostener la atmósfera',
    desc: 'Capas de pads listas para transiciones, oración y tiempos de adoración sin cortar el flujo.',
    image: '/assets/gif/panelPads.gif',
    alt: 'Panel de pads en Play Worship'
  }
];

export function TaskModule() {
  const [activeId, setActiveId] = useState<string>(TABS[0].id);
  const [compact, setCompact] = useState(() => window.matchMedia('(max-width: 1024px)').matches);
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const baseId = useId();
  const panelId = `${baseId}-panel`;

  const activeIndex = TABS.findIndex((t) => t.id === activeId);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 1024px)');
    const update = () => setCompact(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  const panel = (
    <div
      id={panelId}
      role="tabpanel"
      aria-labelledby={`task-tab-${activeId}`}
      className={`task-panel${TABS[activeIndex].video ? ' task-panel-video' : ''}`}
      style={TABS[activeIndex].aspectRatio ? { aspectRatio: TABS[activeIndex].aspectRatio } : undefined}
    >
      <TaskMedia key={activeId} tab={TABS[activeIndex]} />
    </div>
  );

  const focusTab = (index: number) => {
    const next = TABS[index];
    setActiveId(next.id);
    buttonsRef.current[index]?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    const last = TABS.length - 1;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      focusTab((activeIndex + 1) % TABS.length);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      focusTab((activeIndex - 1 + TABS.length) % TABS.length);
    } else if (e.key === 'Home') {
      e.preventDefault();
      focusTab(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      focusTab(last);
    }
  };

  return (
    <section className="task-module" id="features-tabs" aria-labelledby="task-module-title">
      <div className="container">
        <h2 id="task-module-title" className="section-heading">
          Cada momento del servicio, con la herramienta correcta
        </h2>
        <div className="task-module-shell">
          <div
            className="task-tabs"
            role={compact ? undefined : 'tablist'}
            aria-label={compact ? undefined : 'Casos de uso de Play Worship'}
            onKeyDown={onKeyDown}
          >
            <span className="task-progress" aria-hidden="true" />
            {TABS.map((tab, idx) => {
              const isActive = tab.id === activeId;
              return <div className="task-tab-group" key={tab.id}>
                <button
                  ref={(el) => {
                    buttonsRef.current[idx] = el;
                  }}
                  id={`task-tab-${tab.id}`}
                  type="button"
                  role={compact ? undefined : 'tab'}
                  aria-selected={compact ? undefined : isActive}
                  aria-expanded={compact ? isActive : undefined}
                  aria-controls={panelId}
                  tabIndex={isActive ? 0 : -1}
                  className={`task-tab${isActive ? ' is-active' : ''}`}
                  onClick={() => setActiveId(tab.id)}
                >
                  <span className="task-tab-index">{tab.index}</span>
                  <span className="task-tab-title">{tab.title}</span>
                  <span className="task-tab-desc-wrap" aria-hidden={!isActive}>
                    <span className="task-tab-desc-inner">
                      <span className="task-tab-desc">{tab.desc}</span>
                    </span>
                  </span>
                </button>
                {compact && isActive && panel}
              </div>;
            })}
          </div>
          {!compact && panel}
        </div>
      </div>
    </section>
  );
}

function TaskMedia({ tab }: { tab: Tab }) {
  const [hasFrame, setHasFrame] = useState(false);

  if (!tab.video) {
    return <img className="task-panel-image is-active" src={tab.image} alt={tab.alt} decoding="async" />;
  }

  return (
    <>
      <img className="task-panel-image is-active" src={tab.poster} alt={tab.alt} decoding="async" />
      <video
        className={`task-panel-image task-panel-playback${hasFrame ? ' is-active' : ''}`}
        src={tab.video}
        poster={tab.poster}
        aria-label={tab.alt}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        onLoadedData={() => setHasFrame(true)}
        onError={() => setHasFrame(false)}
      />
    </>
  );
}
