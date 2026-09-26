import { useEffect } from 'react';

const PADDLE_SCRIPT_SRC = 'https://cdn.paddle.com/paddle/v2/paddle.js';
const PADDLE_CLIENT_TOKEN = 'test_1ae27f8e8b6fa89c8fea71fa8a4';

interface PaddleSDK {
  Environment: { set(env: 'sandbox'): void };
  Initialize(opts: { token: string }): void;
  Checkout: {
    open(opts: {
      items: { priceId: string; quantity: number }[];
      settings: { displayMode: string; variant: string; theme: string };
    }): void;
  };
}

let initialized = false;

export function usePaddle(rootRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!import.meta.env.DEV) return;

    const root = rootRef.current;
    if (!root) return;

    const init = () => {
      const paddle = (window as typeof window & { Paddle?: PaddleSDK }).Paddle;
      if (!paddle || initialized) return;
      paddle.Environment.set('sandbox');
      paddle.Initialize({ token: PADDLE_CLIENT_TOKEN });
      initialized = true;
    };

    let script = document.querySelector<HTMLScriptElement>(`script[src="${PADDLE_SCRIPT_SRC}"]`);
    if (!script) {
      script = document.createElement('script');
      script.src = PADDLE_SCRIPT_SRC;
      script.async = true;
      document.head.appendChild(script);
    }
    script.addEventListener('load', init);
    init();

    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const button = target.closest<HTMLButtonElement>('.paddle-checkout');
      if (!button || !root.contains(button)) return;
      init();
      const priceId = button.getAttribute(
        root.dataset.billing === 'annual' ? 'data-annual-price-id' : 'data-monthly-price-id'
      );
      const paddle = (window as typeof window & { Paddle?: PaddleSDK }).Paddle;
      if (!priceId || !paddle) return;
      paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        settings: { displayMode: 'overlay', variant: 'one-page', theme: 'dark' }
      });
    };

    root.addEventListener('click', onClick);
    return () => {
      script.removeEventListener('load', init);
      root.removeEventListener('click', onClick);
    };
  }, [rootRef]);
}
