import { useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { applyThemePreference, getThemePreference, saveThemePreference, watchThemePreference } from '../theme';
import type { ThemePreference } from '../theme';
import './ThemeControls.css';

const OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Oscuro' },
  { value: 'system', label: 'Sistema' },
];

function ThemeIcon({ theme }: { theme: ThemePreference }) {
  return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {theme === 'light' ? <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>
      : theme === 'dark' ? <path d="M20.8 13a9 9 0 0 1-9.8-9.8A9 9 0 1 0 20.8 13Z" />
        : <><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M8 21h8m-4-4v4" /></>}
  </svg>;
}

export function ThemeControls({ onOpen }: { onOpen?: () => void }) {
  const [preference, setPreference] = useState<ThemePreference>(getThemePreference);
  const [open, setOpen] = useState(false);
  const [focusIndex, setFocusIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const menuId = useId();
  const label = OPTIONS.find(option => option.value === preference)!.label;

  useEffect(() => {
    applyThemePreference(getThemePreference());
    return watchThemePreference(setPreference);
  }, []);

  useEffect(() => {
    if (open) optionRefs.current[focusIndex]?.focus();
  }, [open, focusIndex]);

  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', dismiss);
    return () => document.removeEventListener('pointerdown', dismiss);
  }, [open]);

  const openMenu = (index = OPTIONS.findIndex(option => option.value === preference)) => {
    setFocusIndex(index);
    setOpen(true);
    onOpen?.();
  };

  const onMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      toggleRef.current?.focus();
      return;
    }
    const next = event.key === 'ArrowDown' ? (focusIndex + 1) % OPTIONS.length
      : event.key === 'ArrowUp' ? (focusIndex + OPTIONS.length - 1) % OPTIONS.length
        : event.key === 'Home' ? 0 : event.key === 'End' ? OPTIONS.length - 1 : undefined;
    if (next !== undefined) {
      event.preventDefault();
      setFocusIndex(next);
    }
  };

  return <div className="theme-controls" ref={rootRef} onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  }}>
    <button
      ref={toggleRef}
      type="button"
      className="theme-toggle"
      aria-label={`Cambiar tema: ${label}`}
      title={`Tema: ${label}`}
      aria-haspopup="menu"
      aria-expanded={open}
      aria-controls={menuId}
      onClick={() => open ? setOpen(false) : openMenu()}
      onKeyDown={event => {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault();
          openMenu(event.key === 'ArrowDown' ? 0 : OPTIONS.length - 1);
        }
      }}
    ><ThemeIcon theme={preference} /></button>
    {open && <div id={menuId} className="theme-menu" role="menu" aria-label="Tema de color" onKeyDown={onMenuKeyDown}>
      <span className="theme-menu-heading" aria-hidden="true">Apariencia</span>
      {OPTIONS.map((option, index) => <button
        key={option.value}
        type="button"
        ref={element => { optionRefs.current[index] = element; }}
        role="menuitemradio"
        aria-checked={preference === option.value}
        tabIndex={focusIndex === index ? 0 : -1}
        className="theme-option"
        onFocus={() => setFocusIndex(index)}
        onClick={() => {
          saveThemePreference(option.value);
          setPreference(option.value);
          setOpen(false);
          toggleRef.current?.focus();
        }}
      >
        <ThemeIcon theme={option.value} />
        <span>{option.label}</span>
        {preference === option.value && <svg className="theme-check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m5 12 4 4L19 6" /></svg>}
      </button>)}
    </div>}
  </div>;
}
