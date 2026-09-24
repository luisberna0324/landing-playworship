import { useEffect, useRef, useState } from 'react';

/** Estado abierto/cerrado + handler para click fuera y Escape. */
export function useDisclosure(initial = false) {
  const [open, setOpen] = useState(initial);
  const ref = useRef<HTMLElement | null>(null);

  const close = () => setOpen(false);
  const toggle = () => setOpen((v) => !v);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (ref.current && target && !ref.current.contains(target)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return { open, setOpen, toggle, close, ref };
}
