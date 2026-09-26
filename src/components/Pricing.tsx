import { useRef } from 'react';
import { useBilling, type Billing } from '../context/BillingContext';
import { usePaddle } from '../hooks/usePaddle';

const TELEGRAM_URL = 'https://t.me/+T9yAuOWOJiMwMGMx';

interface Plan {
  name: string;
  monthly: string;
  annual: string;
  desc: string;
  featured?: boolean;
  badge?: string;
  features: string[];
  priceIds?: { monthly: string; annual: string };
}

const PLANS: Plan[] = [
  {
    name: 'PlayWorship Local',
    monthly: '0',
    annual: '0',
    desc: 'Tu biblioteca y tu música, siempre disponibles en tu equipo.',
    badge: 'Gratis para siempre',
    features: [
      'Proyectos y biblioteca en tu dispositivo',
      'Reproducción multitrack y herramientas musicales',
      'Uso offline, sin suscripción'
    ]
  },
  {
    name: 'PlayWorship Cloud 300',
    monthly: '5,99',
    annual: '59,99',
    desc: 'Llevá tu biblioteca a la nube y mantenela disponible entre dispositivos.',
    featured: true,
    badge: '300 GB',
    features: [
      '300 GB de almacenamiento en la nube',
      'Backup de tu biblioteca',
      'Sincronización entre dispositivos',
      'Todas las funciones de PlayWorship Local'
    ],
    priceIds: {
      monthly: 'pri_01m3dv52328p83hj3e24bqvtxy',
      annual: 'pri_01m3dv534kjkgcarvzbyfanr9p'
    }
  },
  {
    name: 'PlayWorship Cloud 500',
    monthly: '8,99',
    annual: '89,99',
    desc: 'Más espacio para los equipos que necesitan crecer sin dejar su música atrás.',
    badge: '500 GB',
    features: [
      '500 GB de almacenamiento en la nube',
      'Backup de tu biblioteca',
      'Sincronización entre dispositivos',
      'Todas las funciones de PlayWorship Local'
    ],
    priceIds: {
      monthly: 'pri_01m3dv5419p1h1qvre5sg3nasb',
      annual: 'pri_01m3dv54cfcgwdpsfa6pvbbfk0'
    }
  }
];

function PlanPrice({ plan, billing }: { plan: Plan; billing: Billing }) {
  const value = billing === 'annual' ? plan.annual : plan.monthly;
  const suffix = billing === 'annual' ? '/año' : '/mes';
  return (
    <div className="plan-price">
      <span className="plan-currency">US$</span>
      {value}
      <sub>{plan.priceIds ? suffix : ''}</sub>
    </div>
  );
}

function PlanCta({ plan }: { plan: Plan }) {
  if (!plan.priceIds) {
    return <a className="plan-btn plan-btn-main" href="#top">Descargar gratis</a>;
  }

  if (!import.meta.env.DEV) {
    return (
      <a className="plan-btn plan-btn-main" href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer">
        Consultar por Cloud
      </a>
    );
  }

  return (
    <button
      className="plan-btn plan-btn-main paddle-checkout"
      type="button"
      data-monthly-price-id={plan.priceIds.monthly}
      data-annual-price-id={plan.priceIds.annual}
    >
      Probar checkout Sandbox
    </button>
  );
}

export function Pricing() {
  const rootRef = useRef<HTMLElement | null>(null);
  const { billing, setBilling } = useBilling();
  usePaddle(rootRef);

  return (
    <section ref={rootRef} className="pricing" id="precios" aria-labelledby="pricing-title" data-billing={billing}>
      <div className="container">
        <div className="pricing-header">
          <h2 id="pricing-title" className="section-heading">PlayWorship es gratis. La nube es opcional.</h2>
          <p className="section-sub">
            Usá PlayWorship local sin costo y sin conexión. Pagá sólo si querés guardar tu biblioteca
            en la nube y sincronizarla entre tus dispositivos.
          </p>
          <div className="billing-switch" role="group" aria-label="Frecuencia de cobro">
            <button
              className={`billing-option${billing === 'monthly' ? ' is-active' : ''}`}
              type="button"
              aria-pressed={billing === 'monthly'}
              onClick={() => setBilling('monthly')}
            >Mensual</button>
            <button
              className={`billing-option${billing === 'annual' ? ' is-active' : ''}`}
              type="button"
              aria-pressed={billing === 'annual'}
              onClick={() => setBilling('annual')}
              aria-label="Anual, ahorro aproximado del 17%"
            >Anual · -17%</button>
          </div>
        </div>
        <div className="pricing-grid">
          {PLANS.map((plan) => (
            <div key={plan.name} className={`plan-card${plan.featured ? ' featured' : ''}`}>
              {plan.badge ? <div className="plan-badge">{plan.badge}</div> : null}
              <div className="plan-name">{plan.name}</div>
              <PlanPrice plan={plan} billing={billing} />
              <div className="plan-desc">{plan.desc}</div>
              <ul className="plan-features">
                {plan.features.map((feature) => (
                  <li key={feature}><span className="pf-check" aria-hidden="true">✓</span><span>{feature}</span></li>
                ))}
              </ul>
              <PlanCta plan={plan} />
            </div>
          ))}
        </div>
        <p className="pricing-note">Los planes Cloud son opcionales. Los precios se muestran en USD.</p>
      </div>
    </section>
  );
}
