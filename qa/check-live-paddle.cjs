// Production-build regression checks with a fake SDK. No payments or network calls.
const { JSDOM, VirtualConsole } = require(process.env.PLAYWORSHIP_QA_JSDOM || 'jsdom');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'dist/index.html'), 'utf8');
const js = fs.readFileSync(path.join(root, 'dist', html.match(/src="([^"]+\.js)"/)[1]), 'utf8');
const delay = () => new Promise(resolve => setTimeout(resolve, 20));
async function settle(predicate) {
  for (let n = 0; n < 150; n++) { if (predicate()) return; await delay(); }
  throw new Error('Timed out waiting for production checkout');
}
async function create({ paymentLink = false, unsafe = false, hold = false, failed = false } = {}) {
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  if (!hold) release();
  const dom = new JSDOM('<html><body><div id="root"></div></body></html>', {
    url: 'https://production.invalid/' + (paymentLink ? '?_ptxn=txn_fixture' : ''),
    runScripts: 'outside-only', pretendToBeVisual: true, virtualConsole: new VirtualConsole(),
  });
  const w = dom.window;
  const calls = { config: 0, init: [], env: [], open: [] };
  w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  w.HTMLCanvasElement.prototype.getContext = () => null;
  w.HTMLMediaElement.prototype.load = function () {};
  w.HTMLMediaElement.prototype.pause = function () {};
  w.Paddle = { Environment: { set: value => calls.env.push(value) },
    Initialize: value => calls.init.push(value), Checkout: { open: value => calls.open.push(value) } };
  w.fetch = async url => {
    if (!String(url).includes('/api/paddle/config')) return { ok: false, status: 503, json: async () => ({}) };
    assert.equal(url, '/api/paddle/config');
    calls.config++; await gate;
    return { ok: !failed, json: async () => ({ checkoutReady: true,
      environment: unsafe ? 'sandbox' : 'production', token: unsafe ? 'test_fixture' : 'live_fixture',
      priceIds: { cloud300: { monthly: 'pri_300_m', annual: 'pri_300_y' },
        cloud500: { monthly: 'pri_500_m', annual: 'pri_500_y' } } }) };
  };
  w.eval(js);
  await settle(() => w.document.querySelectorAll('button.plan-btn').length === 2);
  assert.equal(w.document.querySelector('.sandbox-label'), null);
  return { dom, d: w.document, calls, release };
}
(async () => {
  const passed = [];
  let x = await create({ hold: true });
  assert.equal(x.calls.config, 0);
  x.d.querySelector('button.plan-btn').click(); x.d.querySelector('button.plan-btn').click();
  await settle(() => x.d.querySelector('.billing-option').disabled);
  x.release(); await settle(() => x.calls.open.length === 1);
  assert.equal(x.calls.config, 1); assert.equal(x.calls.init.length, 1); assert.deepEqual(x.calls.env, []);
  passed.push('Live build initializes once and locks repeated clicks / billing selection');
  for (const annual of [false, true]) {
    [...x.d.querySelectorAll('.billing-option')].find(b => annual ? b.textContent.includes('Anual') : b.textContent === 'Mensual').click();
    await delay();
    for (let i = 0; i < 2; i++) {
      const count = x.calls.open.length;
      x.d.querySelectorAll('button.plan-btn')[i].click();
      await settle(() => x.calls.open.length > count);
      const checkout = x.calls.open.at(-1);
      assert.equal(checkout.items[0].priceId, `pri_${i ? 500 : 300}_${annual ? 'y' : 'm'}`);
      assert.equal(checkout.customData.integration, 'playworship_cloud_v1');
    }
  }
  assert.equal(x.calls.init.length, 1);
  passed.push('All four Live price selections preserve integration metadata and reuse SDK');
  x.dom.window.close();
  x = await create({ paymentLink: true });
  await settle(() => x.calls.init.length === 1);
  assert.equal(x.calls.init[0].token, 'live_fixture'); assert.equal(x.calls.open.length, 0);
  passed.push('_ptxn initializes Live without replacing the transaction with new items');
  x.dom.window.close();
  for (const options of [{ unsafe: true }, { failed: true }]) {
    x = await create({ paymentLink: true, ...options });
    await settle(() => x.d.querySelector('[role="alert"]'));
    assert.equal(x.calls.init.length, 0); assert.equal(x.calls.open.length, 0);
    x.dom.window.close();
  }
  passed.push('Payment links fail closed for Sandbox config or unavailable backend');
  x = await create({ unsafe: true });
  x.d.querySelector('button.plan-btn').click();
  await settle(() => x.d.querySelector('[role="alert"]'));
  assert.equal(x.calls.init.length, 0); assert.equal(x.calls.open.length, 0);
  x.dom.window.close();
  passed.push('Live plan buttons reject a Sandbox configuration');
  console.log(JSON.stringify({ type: 'Stubbed production-bundle tests; no real payment', passed }, null, 2));
})().catch(error => { console.error(error.message); process.exitCode = 1; });
