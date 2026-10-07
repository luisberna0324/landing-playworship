export type ThemePreference = 'light' | 'dark' | 'system';

export const THEME_STORAGE_KEY = 'playworship-theme';
const SYSTEM_THEME_QUERY = '(prefers-color-scheme: dark)';

export function isThemePreference(value: unknown): value is ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system';
}

export function getThemePreference(): ThemePreference {
  const initialized = document.documentElement.dataset.themePreference;
  if (isThemePreference(initialized)) return initialized;
  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (isThemePreference(saved)) return saved;
  } catch { /* The appearance still works when storage is unavailable. */ }
  return 'system';
}

export function applyThemePreference(preference: ThemePreference, systemDark?: boolean) {
  let dark = systemDark ?? false;
  if (systemDark === undefined && preference === 'system') {
    try { dark = window.matchMedia(SYSTEM_THEME_QUERY).matches; } catch { /* Use light as a safe fallback. */ }
  }
  const theme = preference === 'system' ? (dark ? 'dark' : 'light') : preference;
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.dataset.themePreference = preference;
  root.style.colorScheme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#111413' : '#f7faf7');
}

export function saveThemePreference(preference: ThemePreference) {
  try { window.localStorage.setItem(THEME_STORAGE_KEY, preference); } catch { /* Keep this session usable. */ }
  applyThemePreference(preference);
}

/** Keep system mode and other open tabs in sync, with a complete React effect cleanup. */
export function watchThemePreference(onChange: (preference: ThemePreference) => void) {
  let media: MediaQueryList | undefined;
  try { media = window.matchMedia(SYSTEM_THEME_QUERY); } catch { /* Older/limited browsers can still use explicit themes. */ }
  const onSystemChange = () => {
    if (getThemePreference() === 'system') applyThemePreference('system', media?.matches);
  };
  const onStorage = (event: StorageEvent) => {
    if (event.key !== THEME_STORAGE_KEY && event.key !== null) return;
    try {
      if (event.storageArea && event.storageArea !== window.localStorage) return;
    } catch { return; }
    const preference = isThemePreference(event.newValue) ? event.newValue : 'system';
    applyThemePreference(preference);
    onChange(preference);
  };
  if (media?.addEventListener) media.addEventListener('change', onSystemChange);
  else media?.addListener(onSystemChange);
  window.addEventListener('storage', onStorage);
  return () => {
    if (media?.removeEventListener) media.removeEventListener('change', onSystemChange);
    else media?.removeListener(onSystemChange);
    window.removeEventListener('storage', onStorage);
  };
}
