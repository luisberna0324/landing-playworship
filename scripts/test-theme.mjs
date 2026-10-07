import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const firstPaintScript = html.match(/<script id="theme-init">([\s\S]*?)<\/script>/)?.[1];
const themeSource = readFileSync(new URL('../src/theme.ts', import.meta.url), 'utf8');
const themeJavaScript = ts.transpileModule(themeSource, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;

function browser({ saved = null, dark = false, blockedStorage = false, noMatchMedia = false, legacyMedia = false } = {}) {
  const mediaListeners = new Set();
  const storageListeners = new Set();
  const root = { dataset: {}, style: {} };
  const meta = { content: '', setAttribute(_name, value) { this.content = value; } };
  let stored = saved;
  const storage = {
    getItem() { if (blockedStorage) throw new Error('Storage disabled'); return stored; },
    setItem(_key, value) { if (blockedStorage) throw new Error('Storage disabled'); stored = value; },
  };
  const media = { matches: dark };
  if (legacyMedia) {
    media.addListener = callback => mediaListeners.add(callback);
    media.removeListener = callback => mediaListeners.delete(callback);
  } else {
    media.addEventListener = (_type, callback) => mediaListeners.add(callback);
    media.removeEventListener = (_type, callback) => mediaListeners.delete(callback);
  }
  const window = {
    localStorage: storage,
    matchMedia: noMatchMedia ? undefined : () => media,
    addEventListener: (_type, callback) => storageListeners.add(callback),
    removeEventListener: (_type, callback) => storageListeners.delete(callback),
  };
  const context = vm.createContext({
    window,
    document: { documentElement: root, querySelector: () => meta },
    exports: {},
  });
  vm.runInContext(firstPaintScript, context);
  vm.runInContext(themeJavaScript, context);
  return {
    root, meta, api: context.exports, mediaListeners, storageListeners,
    saved: () => stored,
    systemTheme(isDark) {
      media.matches = isDark;
      for (const callback of mediaListeners) callback({ matches: isDark });
    },
    storageChange(newValue, key = 'playworship-theme') {
      if (key === 'playworship-theme' || key === null) stored = newValue;
      for (const callback of storageListeners) callback({ key, newValue, storageArea: storage });
    },
  };
}

test('initial appearance runs synchronously in the head before the app entry point', () => {
  assert.ok(firstPaintScript);
  assert.ok(html.indexOf('<script id="theme-init">') < html.indexOf('</head>'));
  assert.ok(html.indexOf('<script id="theme-init">') < html.indexOf('type="module"'));
});

for (const [saved, dark, preference, expected] of [
  ['light', true, 'light', 'light'],
  ['dark', false, 'dark', 'dark'],
  ['system', true, 'system', 'dark'],
  ['system', false, 'system', 'light'],
  [null, true, 'system', 'dark'],
  ['corrupt', false, 'system', 'light'],
]) {
  test(`first paint: saved ${saved}, OS ${dark ? 'dark' : 'light'} resolves to ${expected}`, () => {
    const { root, meta, api } = browser({ saved, dark });
    assert.equal(root.dataset.theme, expected);
    assert.equal(root.dataset.themePreference, preference);
    assert.equal(root.style.colorScheme, expected);
    assert.equal(meta.content, expected === 'dark' ? '#111413' : '#f7faf7');
    api.applyThemePreference(api.getThemePreference());
    assert.equal(root.dataset.theme, expected, 'React initialization must preserve the first-paint choice');
  });
}

test('blocked storage falls back to the OS and explicit selection stays usable', () => {
  const page = browser({ saved: 'light', dark: true, blockedStorage: true });
  assert.equal(page.root.dataset.theme, 'dark');
  assert.equal(page.root.dataset.themePreference, 'system');
  assert.doesNotThrow(() => page.api.saveThemePreference('light'));
  assert.equal(page.root.dataset.theme, 'light');
  assert.equal(page.api.getThemePreference(), 'light');
});

test('missing matchMedia keeps first paint and explicit themes usable', () => {
  const page = browser({ noMatchMedia: true });
  assert.equal(page.root.dataset.theme, 'light');
  const cleanup = page.api.watchThemePreference(() => {});
  page.api.saveThemePreference('dark');
  assert.equal(page.root.dataset.theme, 'dark');
  cleanup();
  assert.equal(page.storageListeners.size, 0);
});

test('each selection persists across reloads, including system preference', () => {
  const page = browser();
  for (const preference of ['light', 'dark', 'system']) {
    page.api.saveThemePreference(preference);
    assert.equal(page.saved(), preference);
    const reloaded = browser({ saved: page.saved(), dark: true });
    assert.equal(reloaded.api.getThemePreference(), preference);
    assert.equal(reloaded.root.dataset.theme, preference === 'system' ? 'dark' : preference);
  }
});

for (const legacyMedia of [false, true]) {
  test(`OS changes update only system mode and listeners clean up (${legacyMedia ? 'legacy' : 'modern'})`, () => {
    const page = browser({ legacyMedia });
    const cleanup = page.api.watchThemePreference(() => {});
    page.systemTheme(true);
    assert.equal(page.root.dataset.theme, 'dark');
    page.api.saveThemePreference('light');
    page.systemTheme(false);
    page.systemTheme(true);
    assert.equal(page.root.dataset.theme, 'light');
    page.api.saveThemePreference('system');
    assert.equal(page.root.dataset.theme, 'dark');
    page.systemTheme(false);
    assert.equal(page.root.dataset.theme, 'light');
    cleanup();
    assert.equal(page.mediaListeners.size, 0);
    assert.equal(page.storageListeners.size, 0);
  });
}

test('other tabs update the selection, reset to system on clear, and ignore unrelated storage', () => {
  const page = browser({ dark: true });
  const changes = [];
  const cleanup = page.api.watchThemePreference(preference => changes.push(preference));
  page.storageChange('light');
  assert.equal(page.root.dataset.theme, 'light');
  page.storageChange('dark', 'unrelated-key');
  assert.equal(page.root.dataset.theme, 'light');
  page.storageChange('invalid');
  assert.equal(page.root.dataset.themePreference, 'system');
  assert.equal(page.root.dataset.theme, 'dark');
  page.storageChange('light');
  page.storageChange(null, null);
  assert.equal(page.root.dataset.themePreference, 'system');
  assert.equal(page.root.dataset.theme, 'dark');
  assert.deepEqual(changes, ['light', 'system', 'light', 'system']);
  cleanup();
});
