import { useEffect, useRef, useState } from 'react';
import { useBilling, type Billing } from '../context/BillingContext';

const TELEGRAM_URL = 'https://t.me/+T9yAuOWOJiMwMGMx';
const REVIEW_PREVIEW = import.meta.env.VITE_REVIEW_PREVIEW === 'true';
const LIVE_CHECKOUT_ENABLED = !REVIEW_PREVIEW && import.meta.env.VITE_CLOUD_CHECKOUT_ENABLED === 'true';
const SANDBOX_PREVIEW = REVIEW_PREVIEW || (!LIVE_CHECKOUT_ENABLED &&
  new URLSearchParams(window.location.search).get('sandbox') === '1');
const CHECKOUT_ENABLED = import.meta.env.DEV || SANDBOX_PREVIEW || LIVE_CHECKOUT_ENABLED;
const PAYMENT_LINK_REQUESTED = new URLSearchParams(window.location.search).has('_ptxn');

interface PaddleCheckout {
  Checkout: {
    open: (options: {
      items: Array<{ priceId: string; quantity: number }>;
      customData: { integration: string };
      settings: { displayMode: 'overlay'; theme: 'dark' };
    }) => void;
  };
  Environment: { set: (environment: 'sandbox') => void };
  Initialize: (options: { token: string }) => void;
}

declare global {
  interface Window { Paddle?: PaddleCheckout }
}

let paddleScript: Promise<PaddleCheckout> | null = null;
let initializedToken: string | null = null;

function loadPaddle(): Promise<PaddleCheckout> {
  if (window.Paddle) return Promise.resolve(window.Paddle);
  if (!paddleScript) {
    paddleScript = new Promise<PaddleCheckout>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
      script.async = true;
      script.onload = () => window.Paddle ? resolve(window.Paddle) : reject(new Error('Paddle no está disponible.'));
      script.onerror = () => reject(new Error('No se pudo cargar Paddle. Revisá tu conexión.'));
      document.head.appendChild(script);
    }).catch((error: unknown) => { paddleScript = null; throw error; });
  }
  return paddleScript;
}

async function initializePaddle(token: string, environment: 'sandbox' | 'production'): Promise<PaddleCheckout> {
  const paddle = await loadPaddle();
  if (initializedToken !== token) {
    if (environment === 'sandbox') paddle.Environment.set('sandbox');
    paddle.Initialize({ token });
    initializedToken = token;
  }
  return paddle;
}

interface Plan {
  name: string;
  monthly: string;
  annual: string;
  desc: string;
  featured?: boolean;
  badge?: string;
  features: string[];
  cloudPlan?: 'cloud300' | 'cloud500';
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
      'Uso sin conexión, sin suscripción'
    ]
  },
  {
    name: 'PlayWorship Cloud 300',
    monthly: '5,99',
    annual: '59,99',
    desc: 'Lleva tu biblioteca a la nube y mantenla disponible entre dispositivos.',
    featured: true,
    badge: '300 GB',
    features: [
      '300 GB de almacenamiento en la nube',
      'Copia de seguridad de tu biblioteca',
      'Sincronización entre dispositivos',
      'Todas las funciones de PlayWorship Local'
    ],
    cloudPlan: 'cloud300'
  },
  {
    name: 'PlayWorship Cloud 500',
    monthly: '8,99',
    annual: '89,99',
    desc: 'Más espacio para los equipos que necesitan crecer sin dejar su música atrás.',
    badge: '500 GB',
    features: [
      '500 GB de almacenamiento en la nube',
      'Copia de seguridad de tu biblioteca',
      'Sincronización entre dispositivos',
      'Todas las funciones de PlayWorship Local'
    ],
    cloudPlan: 'cloud500'
  }
];

function PlanPrice({ plan, billing }: { plan: Plan; billing: Billing }) {
  const value = billing === 'annual' ? plan.annual : plan.monthly;
  const suffix = billing === 'annual' ? '/año' : '/mes';
  return (
    <div className="plan-price">
      <span className="plan-currency">US$</span>
      {value}
      <sub>{plan.cloudPlan ? suffix : ''}</sub>
    </div>
  );
}

function PlanCta({ plan, busy, onCheckout }: { plan: Plan; busy: boolean; onCheckout: (plan: Plan) => void }) {
  if (!plan.cloudPlan) {
    return <a className="plan-btn plan-btn-main" href="#descargas">Descargar gratis</a>;
  }

  if (!CHECKOUT_ENABLED) {
    return (
      <a className="plan-btn plan-btn-main" href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer">
        Consultar por Cloud
      </a>
    );
  }

  return <button className="plan-btn plan-btn-main" type="button" disabled={busy} onClick={() => onCheckout(plan)}>
    {busy ? 'Abriendo checkout…' : SANDBOX_PREVIEW ? 'Probar Cloud (Sandbox)' : 'Contratar Cloud'}
  </button>;
}

export function Pricing() {
  const { billing, setBilling } = useBilling();
  const checkoutLock = useRef(false);
  const [busyPlan, setBusyPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sandboxNotice, setSandboxNotice] = useState(false);

  useEffect(() => {
    if (!PAYMENT_LINK_REQUESTED || !LIVE_CHECKOUT_ENABLED || SANDBOX_PREVIEW) return;
    let active = true;
    void fetch('/api/paddle/config', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error('El enlace de pago no está disponible en este momento.');
        return response.json() as Promise<{
          token?: string; environment?: 'sandbox' | 'production'; checkoutReady?: boolean;
        }>;
      })
      .then(async (config) => {
        if (!config.checkoutReady || config.environment !== 'production' || !config.token?.startsWith('live_')) {
          throw new Error('El enlace de pago no está disponible en este momento.');
        }
        // Paddle.js abre la transacción de _ptxn al inicializarse; no reemplazarla por items.
        if (active) await initializePaddle(config.token, config.environment);
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : 'No se pudo abrir el enlace de pago.');
      });
    return () => { active = false; };
  }, []);

  async function startCheckout(plan: Plan) {
    if (!plan.cloudPlan || checkoutLock.current) return;
    checkoutLock.current = true;
    setBusyPlan(plan.cloudPlan);
    setError(null);
    try {
      const configResponse = await fetch(
        SANDBOX_PREVIEW ? '/api/paddle/config?mode=sandbox' : '/api/paddle/config',
        { cache: 'no-store' }
      );
      const config = await configResponse.json() as {
        token?: string; environment?: 'sandbox' | 'production';
        checkoutReady?: boolean; provisioningReady?: boolean;
        priceIds?: Record<'cloud300' | 'cloud500', Record<Billing, string>>;
      };
      const priceId = config.priceIds?.[plan.cloudPlan]?.[billing];
      if (!configResponse.ok || !config.checkoutReady || !config.token || !config.environment || !priceId) {
        throw new Error('El checkout no está disponible en este momento. Inténtalo más tarde.');
      }
      if (SANDBOX_PREVIEW && (config.environment !== 'sandbox' || !config.token.startsWith('test_'))) {
        throw new Error('La URL de prueba sólo acepta Paddle Sandbox.');
      }
      if (LIVE_CHECKOUT_ENABLED && (config.environment !== 'production' || !config.token.startsWith('live_'))) {
        throw new Error('El checkout de producción no está disponible en este momento.');
      }
      setSandboxNotice(config.environment === 'sandbox');
      const paddle = await initializePaddle(config.token, config.environment);
      paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        customData: { integration: 'playworship_cloud_v1' },
        settings: { displayMode: 'overlay', theme: 'dark' }
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo iniciar la compra.');
    } finally {
      checkoutLock.current = false;
      setBusyPlan(null);
    }
  }

  return (
    <section className="pricing" id="precios" aria-labelledby="pricing-title">
      <div className="container">
        <div className="pricing-header reveal">
          <h2 id="pricing-title" className="section-heading">PlayWorship es gratis. La nube es opcional.</h2>
          <p className="section-sub">
            Usa PlayWorship local sin costo y sin conexión. Paga solo si quieres guardar tu biblioteca
            en la nube y sincronizarla entre tus dispositivos.
          </p>
          {SANDBOX_PREVIEW && <p className="sandbox-label">Paddle Sandbox · Sin cargos reales</p>}
          <div className="billing-switch" role="group" aria-label="Frecuencia de cobro">
            <button
              className={`billing-option${billing === 'monthly' ? ' is-active' : ''}`}
              type="button"
              disabled={Boolean(busyPlan)}
              aria-pressed={billing === 'monthly'}
              onClick={() => setBilling('monthly')}
            >Mensual</button>
            <button
              className={`billing-option${billing === 'annual' ? ' is-active' : ''}`}
              type="button"
              disabled={Boolean(busyPlan)}
              aria-pressed={billing === 'annual'}
              onClick={() => setBilling('annual')}
              aria-label="Anual, ahorro aproximado del 17%"
            >Anual · -17%</button>
          </div>
        </div>
        <div className="pricing-grid" aria-busy={Boolean(busyPlan)}>
          {PLANS.map((plan) => (
            <div key={plan.name} className={`plan-card reveal${plan.featured ? ' featured' : ''}`}>
              {plan.badge ? <div className="plan-badge">{plan.badge}</div> : null}
              <div className="plan-name">{plan.name}</div>
              <PlanPrice plan={plan} billing={billing} />
              <div className="plan-desc">{plan.desc}</div>
              <ul className="plan-features">
                {plan.features.map((feature) => (
                  <li key={feature}><span className="pf-check" aria-hidden="true">✓</span><span>{feature}</span></li>
                ))}
              </ul>
              <PlanCta plan={plan} busy={Boolean(busyPlan)} onCheckout={(selected) => void startCheckout(selected)} />
            </div>
          ))}
        </div>
        <p className="pricing-note">{REVIEW_PREVIEW ? 'Los planes Cloud son opcionales. Importes en USD. Revisa el total y los impuestos aplicables en Paddle antes de confirmar.' : 'Los planes Cloud son opcionales. Precios base en USD; Paddle calcula los impuestos aplicables antes de confirmar el pago.'} <a href="/precios.html">Ver todos los precios y condiciones</a>.</p>
        {error && <p className="pricing-checkout-error" role="alert">{error}</p>}
        {(SANDBOX_PREVIEW || sandboxNotice) && (
          <p className="pricing-checkout-warning" role="status">
            Modo Sandbox: no hay cargos reales. La activación de Cloud está limitada a la cuenta de prueba autorizada.
          </p>
        )}
      </div>
    </section>
  );
}
