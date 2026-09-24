import { useId, useRef, useState, type KeyboardEvent } from 'react';

interface Tab {
  id: string;
  index: string;
  title: string;
  desc: string;
  image: string;
  alt: string;
}

const TABS: Tab[] = [
  {
    id: 'biblioteca',
    index: '01',
    title: 'Biblioteca local',
    desc: 'Importa y lee tus multitracks directamente desde disco. Tu set queda disponible sin depender de internet.',
    image: '/assets/gif/cargarVideo.gif',
    alt: 'Biblioteca local de Play Worship cargando canciones desde el disco'
  },
  {
    id: 'secciones',
    index: '02',
    title: 'Secciones en waveform',
    desc: 'Marca intro, verso, coro, puente y final sobre el waveform y salta entre secciones al instante.',
    image: '/assets/gif/secciones.gif',
    alt: 'Marcado de secciones en el waveform de Play Worship'
  },
  {
    id: 'interfaz',
    index: '03',
    title: 'Interfaz que se limpia sola',
    desc: 'Activa o oculta paneles con un toggle. En el ensayo mostrás todo; en vivo, solo lo esencial.',
    image: '/assets/gif/interfaceLimpia.gif',
    alt: 'Paneles con toggle en la interfaz de Play Worship'
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
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const baseId = useId();
  const panelId = `${baseId}-panel`;

  const activeIndex = TABS.findIndex((t) => t.id === activeId);

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
            role="tablist"
            aria-label="Casos de uso de Play Worship"
            onKeyDown={onKeyDown}
          >
            <span className="task-progress" aria-hidden="true" />
            {TABS.map((tab, idx) => {
              const isActive = tab.id === activeId;
              return (
                <button
                  key={tab.id}
                  ref={(el) => {
                    buttonsRef.current[idx] = el;
                  }}
                  id={`task-tab-${tab.id}`}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
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
              );
            })}
          </div>

          <div
            id={panelId}
            role="tabpanel"
            aria-labelledby={`task-tab-${activeId}`}
            className="task-panel"
          >
            {TABS.map((tab) => (
              <img
                key={tab.id}
                className={`task-panel-image${tab.id === activeId ? ' is-active' : ''}`}
                src={tab.image}
                alt={tab.alt}
                data-tab={tab.id}
                decoding="async"
                {...(tab.id === activeId ? {} : { hidden: true })}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
