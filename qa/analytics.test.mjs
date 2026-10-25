import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
const source = readFileSync(new URL('../public/analytics.js', import.meta.url), 'utf8');
function run({ saved, blocked = false, hostname = 'playworship.app', storageFails = false } = {}) {
  const elements = [];
  class Element {
    constructor(tag) { this.tag = tag; this.children = []; this.handlers = {}; elements.push(this); }
    appendChild(el) { this.children.push(el); return el; }
    setAttribute(name, value) { this[name] = value; }
    addEventListener(name, callback) { this.handlers[name] = callback; }
    focus() {}
    click() { if (!this.disabled) this.handlers.click?.(); }
  }
  const values = new Map(saved ? [['playworship.analytics-consent.v1', saved]] : []);
  const cookieWrites = [];
  const document = { head: new Element('head'), body: new Element('body'), readyState: 'complete', referrer: 'https://source.example/path?email=secret@example.net#secret', createElement: tag => new Element(tag) };
  Object.defineProperty(document, 'cookie', { get: () => '_ga=123; _ga_T5ZSHD3VT0=456; session=keep', set: value => cookieWrites.push(value) });
  const window = {};
  runInNewContext(source, { window, document, navigator: { globalPrivacyControl: blocked }, location: { hostname, href: 'https://' + hostname + '/?token=secret#private' }, localStorage: { getItem: key => { if (storageFails) throw Error(); return values.get(key); }, setItem: (key, value) => values.set(key, value) }, URL, Date });
  return { window, elements, values, cookieWrites, button: text => elements.find(e => e.tag === 'button' && e.textContent === text), scripts: () => elements.filter(e => e.tag === 'script'), panel: () => elements.find(e => e.id === 'pw-consent') };
}
test('no Google script or page view before opt-in', () => {
  const ui = run(); assert.equal(ui.scripts().length, 0); assert.equal(ui.panel().hidden, false); assert.equal(ui.window.dataLayer.some(args => args[0] === 'event'), false);
});
test('rejection persists and never loads Google', () => {
  const ui = run(); ui.button('Rechazar opcionales').click(); assert.equal(ui.scripts().length, 0); assert.equal(ui.panel().hidden, true); assert.equal(ui.values.get('playworship.analytics-consent.v1'), 'denied'); assert.equal(run({ saved: 'denied' }).scripts().length, 0);
});
test('consent loads correct property exactly once and strips sensitive URLs', () => {
  const ui = run(); ui.button('Aceptar cookies').click(); assert.equal(ui.scripts().length, 1); assert.match(ui.scripts()[0].src, /G-T5ZSHD3VT0$/);
  ui.button('Configurar cookies').click(); ui.button('Aceptar cookies').click(); assert.equal(ui.scripts().length, 1);
  const payloads = ui.window.dataLayer.filter(args => args[0] === 'config' || args[0] === 'event'); assert.equal(payloads.length, 2); assert.equal(JSON.stringify(payloads).includes('secret'), false);
  assert.equal(ui.window['ga-disable-G-T5ZSHD3VT0'], false);
});
test('withdrawal disables collection and removes analytics cookies only', () => {
  const ui = run({ saved: 'granted' }); ui.button('Configurar cookies').click(); ui.button('Rechazar opcionales').click(); assert.equal(ui.window['ga-disable-G-T5ZSHD3VT0'], true); assert.equal(ui.cookieWrites.length, 8); assert.equal(ui.cookieWrites.some(cookie => cookie.startsWith('session=')), false);
});
test('GPC overrides stored consent and disables acceptance', () => {
  const ui = run({ saved: 'granted', blocked: true }); assert.equal(ui.scripts().length, 0); assert.equal(ui.button('Aceptar cookies').disabled, true);
});
test('local development never loads analytics', () => { const ui = run({ hostname: 'localhost', saved: 'granted' }); assert.equal(ui.scripts().length, 0); });
test('storage failure is safe and unknown values do not imply consent', () => { assert.equal(run({ storageFails: true }).scripts().length, 0); assert.equal(run({ saved: 'true' }).scripts().length, 0); });
test('ads consent remains denied when analytics is accepted', () => {
  const ui = run({ saved: 'granted' }); const updates = ui.window.dataLayer.filter(args => args[0] === 'consent'); for (const args of updates) { assert.equal(args[2].ad_storage, 'denied'); assert.equal(args[2].ad_user_data, 'denied'); assert.equal(args[2].ad_personalization, 'denied'); }
});
