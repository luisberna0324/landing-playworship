import { useEffect, useRef } from 'react';
import { useBilling } from '../context/BillingContext';

const PADDLE_SCRIPT_SRC = 'https://cdn.paddle.com/paddle/v2/paddle.js';
const PADDLE_CLIENT_TOKEN = 'test_1ae27f8e8b6fa89c8fea71fa8a4';

type PaddlePriceIdAttr = `data-${'monthly' | 'annual'}-price-id`;

/**
 * Carga Paddle.js una vez, lo inicializa en sandbox y vincula cada botón
 * con clase `.paddle-checkout` que tenga data-monthly-price-id / data-annual-price-id.
 *
 * Re-engancha los listeners cuando cambia `billing` (mensual/anual) para
 * usar el price-id correcto.
 */
export function usePaddle(rootRef: React.RefObject<HTMLElement | null>) {
  const bound = useRef<WeakSet<Element>>(new WeakSet());
  const { billing } = useBilling();

  // Carga del script una sola vez
  useEffect(() => {
    if (document.querySelector(`script[src="${PADDLE_SCRIPT_SRC}"]`)) return;

    const script = document.createElement('script');
    script.src = PADDLE_SCRIPT_SRC;
    script.async = true;
    document.head.appendChild(script);
  }, []);

  // Inicialización + binding
  useEffect(() => {
    let cancelled = false;

    interface PaddleSDK {
      Environment: { set(env: 'sandbox' | 'production'): void };
      Initialize(opts: { token: string }): void;
      Checkout: {
        open(opts: {
          items: { priceId: string; quantity: number }[];
          settings: { displayMode: string; variant: string; theme: string };
        }): void;
      };
    }

    const init = () => {
      const w = window as unknown as { Paddle?: PaddleSDK };
      if (!w.Paddle) return;
      try {
        w.Paddle.Environment.set('sandbox');
      } catch {
        /* ya inicializado */
      }
      try {
        w.Paddle.Initialize({ token: PADDLE_CLIENT_TOKEN });
      } catch {
        /* ya inicializado */
      }

      if (cancelled) return;
      const root = rootRef.current;
      if (!root) return;

      const buttons = root.querySelectorAll<HTMLElement>('.paddle-checkout');
      buttons.forEach((btn) => {
        if (bound.current.has(btn)) return;
        bound.current.add(btn);
        btn.addEventListener('click', () => {
          const attr: PaddlePriceIdAttr =
            billing === 'annual' ? 'data-annual-price-id' : 'data-monthly-price-id';
          const priceId = btn.getAttribute(attr);
          if (!priceId || !w.Paddle) return;
          w.Paddle.Checkout.open({
            items: [{ priceId, quantity: 1 }],
            settings: { displayMode: 'overlay', variant: 'one-page', theme: 'dark' }
          });
        });
      });
    };

    const w = window as unknown as { Paddle?: object };
    if (w.Paddle) {
      init();
    } else {
      window.addEventListener('load', init, { once: true });
      // Por si Paddle ya terminó de cargar entre medio
      setTimeout(init, 0);
    }

    return () => {
      cancelled = true;
    };
  }, [billing, rootRef]);
}
