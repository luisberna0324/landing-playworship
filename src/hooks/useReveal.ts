import { useEffect } from 'react';

/**
 * Aplica la clase `is-visible` a los elementos con clase `reveal`
 * cuando entran en viewport. Una vez revelado, deja de observar.
 * Si el navegador no soporta IntersectionObserver, los marca visibles
 * inmediatamente (fallback gracioso).
 */
export function useReveal(selector = '.reveal', threshold = 0.12) {
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>(selector);
    if (!elements.length) return;

    if (!('IntersectionObserver' in window)) {
      elements.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold, rootMargin: '0px 0px -40px 0px' }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [selector, threshold]);
}
