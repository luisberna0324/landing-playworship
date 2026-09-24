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
  cta: { label: string; kind: 'telegram' | 'paddle'; priceIds?: { monthly: string; annual: string } };
}

const PLANS: Plan[] = [
  {
    name: 'Acceso Gratuito',
    monthly: '0',
    annual: '0',
    desc: 'Descargalo, probalo con tu equipo y usalo en servicios reales sin costo.',
    featured: true,
    badge: 'Actualmente',
    features: [
      'Uso completo durante esta etapa',
      'Ideal para probar en ensayos y en vivo',
      'Sin tarjeta de crédito',
      'Precio futuro pensado para ser muy accesible'
    ],
    cta: { label: 'Entrar al grupo y empezar', kind: 'telegram' }
  },
  {
    name: 'Starter',
    monthly: '10',
    annual: '100',
    desc: 'Para comenzar con lo esencial. 7 días de prueba gratis.',
    features: [
      'Biblioteca y reproducción multitrack',
      'Control de tonalidad y tempo',
      '7 días de prueba gratis'
    ],
    cta: {
      label: 'Comenzar prueba gratis',
      kind: 'paddle',
      priceIds: {
        monthly: 'pri_01m210badgsy0d6sxgf0sswfsk',
        annual: 'pri_01m210basty4f3qavtqfstzpjr'
      }
    }
  },
  {
    name: 'Pro',
    monthly: '40',
    annual: '400',
    desc: 'Para músicos y equipos en crecimiento. 7 días de prueba gratis.',
    featured: true,
    badge: 'Recomendado',
    features: [
      'Todo lo de Starter',
      'Más dispositivos y funciones de equipo',
      '7 días de prueba gratis'
    ],
    cta: {
      label: 'Comenzar prueba gratis',
      kind: 'paddle',
      priceIds: {
        monthly: 'pri_01m210bb3mmbf49f31bnfjcwc9',
        annual: 'pri_01m210bb8pxx54p29513e52s7y'
      }
    }
  },
  {
    name: 'Advanced',
    monthly: '120',
    annual: '1200',
    desc: 'Para operaciones con mayores necesidades. 7 días de prueba gratis.',
    features: [
      'Todo lo de Pro',
      'Capacidad ampliada para equipos',
      '7 días de prueba gratis'
    ],
    cta: {
      label: 'Comenzar prueba gratis',
      kind: 'paddle',
      priceIds: {
        monthly: 'pri_01m210bbj99dce8enf81f7zg95',
        annual: 'pri_01m210bbpfpdr88f5dd37ahb24'
      }
    }
  }
];

function PlanPrice({ plan, billing }: { plan: Plan; billing: Billing }) {
  if (plan.cta.kind === 'telegram') {
    return (
      <div className="plan-price">
        <sup>$</sup>0
      </div>
    );
  }
  const value = billing === 'annual' ? plan.annual : plan.monthly;
  const suffix = billing === 'annual' ? '/año' : '/mes';
  return (
    <div className="plan-price">
      <sup>$</sup>
      {value}
      <sub>{suffix}</sub>
    </div>
  );
}

function PlanCta({ plan }: { plan: Plan }) {
  if (plan.cta.kind === 'telegram') {
    return (
      <a className="plan-btn plan-btn-main" href={TELEGRAM_URL} target="_blank" rel="noopener">
        {plan.cta.label}
      </a>
    );
  }
  const { monthly, annual } = plan.cta.priceIds!;
  return (
    <button
      className="plan-btn plan-btn-main paddle-checkout"
      type="button"
      data-monthly-price-id={monthly}
      data-annual-price-id={annual}
    >
      {plan.cta.label}
    </button>
  );
}

export function Pricing() {
  const rootRef = useRef<HTMLElement | null>(null);
  const { billing, setBilling } = useBilling();
  usePaddle(rootRef);

  return (
    <section
      ref={rootRef}
      className="pricing"
      id="precios"
      aria-labelledby="pricing-title"
    >
      <div className="container">
        <div className="pricing-header">
          <h2 id="pricing-title" className="section-heading">
            Acceso abierto mientras construimos en comunidad
          </h2>
          <p className="section-sub">
            Hoy podés probar Play Worship sin costo. Más adelante tendrá un precio súper accesible
            para iglesias y ministerios.
          </p>
          <div className="billing-switch" role="group" aria-label="Frecuencia de cobro">
            <button
              className={`billing-option${billing === 'monthly' ? ' is-active' : ''}`}
              data-billing="monthly"
              type="button"
              aria-pressed={billing === 'monthly'}
              onClick={() => setBilling('monthly')}
            >
              Mensual
            </button>
            <button
              className={`billing-option${billing === 'annual' ? ' is-active' : ''}`}
              data-billing="annual"
              type="button"
              aria-pressed={billing === 'annual'}
              onClick={() => setBilling('annual')}
            >
              Anual
            </button>
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
                  <li key={feature}>
                    <span className="pf-check">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <PlanCta plan={plan} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
