// DOM-level regression checks only. This is not a browser or layout test.
const {JSDOM} = require(process.env.PLAYWORSHIP_QA_JSDOM || 'jsdom');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'dist/index.html'),'utf8');
const js=fs.readFileSync(path.join(root,'dist',html.match(/src="([^"]+\.js)"/)[1]),'utf8');
const checks=[];
function test(name,fn){fn();checks.push({name,result:'pass'});}
const dom=new JSDOM('<!doctype html><html lang="es"><head></head><body><div id="root"></div></body></html>',{url:process.env.PLAYWORSHIP_QA_URL || 'https://preview.invalid',runScripts:'outside-only',pretendToBeVisual:true});
const w=dom.window;
w.HTMLCanvasElement.prototype.getContext=()=>null;
w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
w.fetch=async(url)=>{
 if (process.env.PLAYWORSHIP_QA_USE_MANIFEST) {
  assert.equal(url, '/review-downloads.json');
  return {ok:true,status:200,json:async()=>JSON.parse(fs.readFileSync(path.join(root,'dist/review-downloads.json'),'utf8'))};
 }
 return {ok:false,status:503,json:async()=>({})};
};
w.eval(js);
const delay=()=>new Promise(r=>setTimeout(r,30));
(async()=>{
 const d=w.document;
 for (let attempt=0; attempt<80; attempt++) {
  const ready=d.querySelector('h1') && (!process.env.PLAYWORSHIP_QA_USE_MANIFEST || [...d.querySelectorAll('.download-card small')].filter(x=>x.textContent.startsWith('Versión ')).length===3);
  if(ready) break;
  await delay();
 }

 test('One descriptive H1 and main landmark',()=>{assert.equal(d.querySelectorAll('h1').length,1);assert.match(d.querySelector('h1').textContent,/Tus multitracks/);assert.equal(d.querySelectorAll('main').length,1);});
 test('Every internal anchor has a target',()=>{for(const a of d.querySelectorAll('a[href^="#"]')) assert.ok(d.getElementById(a.getAttribute('href').slice(1)),a.outerHTML);});
 test('All displayed images have alt text and existing local assets',()=>{for(const im of d.querySelectorAll('img')){assert.ok(im.hasAttribute('alt'));assert.ok(fs.existsSync(path.join(root,'public',im.getAttribute('src'))),im.src);}});
 test('Exact production clip has manual controls, deferred loading and honest caption',()=>{assert.equal(d.querySelectorAll('video').length,1);const v=d.querySelector('.hero-demo-video');assert.equal(v.querySelector('source').getAttribute('src'),'/assets/video/hero-web.mp4');assert.equal(v.getAttribute('poster'),'/assets/video/hero-web-poster.jpg');assert.ok(v.hasAttribute('controls'));assert.ok(v.hasAttribute('playsinline'));assert.equal(v.getAttribute('preload'),'none');assert.ok(!v.hasAttribute('autoplay'));assert.ok(!v.hasAttribute('loop'));assert.match(d.querySelector('#hero-demo-caption').textContent,/1\.1\.4.*Sin audio/);assert.ok(d.querySelector('.demo-figure img'));});
 test('Review preserves explicit Paddle Sandbox controls',()=>{assert.equal(d.querySelectorAll('.plan-card').length,3);assert.equal([...d.querySelectorAll('button.plan-btn')].filter(a=>a.textContent.includes('Sandbox')).length,2);assert.match(d.querySelector('.sandbox-label').textContent,/Sin cargos reales/);});
 if (process.env.PLAYWORSHIP_QA_USE_MANIFEST) {
  test('Preview snapshot supplies verified version and installer links',()=>{const m=JSON.parse(fs.readFileSync(path.join(root,'dist/review-downloads.json'),'utf8'));assert.equal(d.querySelector('.download-note[role="status"]')===null,true);assert.equal([...d.querySelectorAll('.download-card small')].filter(x=>x.textContent===`Versión ${m.version}`).length,3);assert.equal(d.querySelectorAll('a[href="https://testflight.apple.com/join/TsUWWH1r"]').length,2);});
 } else {
  test('Fallback status labels version uncertainty',()=>{assert.match(d.querySelector('.download-note[role="status"]').textContent,/No pudimos verificar/);assert.match(d.querySelector('.ios-card').textContent,/TestFlight/);assert.equal(d.querySelectorAll('a[href="https://testflight.apple.com/join/TsUWWH1r"]').length,2);});
 }
 test('Stable Mac and exact supplied Apple beta links remain distinct',()=>{const mac=[...d.querySelectorAll('.download-card')].find(e=>e.querySelector('h3').textContent==='macOS');assert.match(mac.querySelector('.platform-download').textContent,/estable/);assert.match(mac.querySelector('.platform-download').href,/\.pkg/);assert.equal(mac.querySelector('.platform-beta').href,'https://testflight.apple.com/join/TsUWWH1r');assert.equal(d.querySelector('.ios-card a').href,'https://testflight.apple.com/join/TsUWWH1r');assert.equal(d.querySelectorAll('.platform-symbol .platform-logo').length,4);assert.equal(d.querySelectorAll('.platform-device').length,2);});
 test('Review tax wording agrees across landing and price page',()=>{assert.ok(!d.querySelector('.pricing-note').textContent.includes('base'));assert.ok(!fs.readFileSync(path.join(root,'dist/precios.html'),'utf8').includes('precios base'));assert.ok(fs.readFileSync(path.join(root,'public/precios.html'),'utf8').includes('precios base'));});
 test('Preview cache and QA frame fingerprints prevent stale review',()=>{const config=JSON.parse(fs.readFileSync(path.join(root,'firebase.preview.json'),'utf8'));assert.ok(config.hosting.headers[0].headers.some(h=>h.key==='Cache-Control'&&h.value==='no-store'));const frame=fs.readFileSync(path.join(root,'dist/review-qa.html'),'utf8');assert.ok(!frame.includes('__PREVIEW_BUILD__'));assert.equal((frame.match(/&amp;build=/g)||[]).length,3);});
 const menu=d.querySelector('.header-menu-toggle');
 test('Mobile menu starts hidden',()=>{assert.equal(menu.getAttribute('aria-expanded'),'false');assert.ok(d.getElementById('mobile-menu').hidden);});
 menu.click();await delay();test('Mobile menu opens with synchronized ARIA',()=>{assert.equal(menu.getAttribute('aria-expanded'),'true');assert.equal(d.getElementById('mobile-menu').hidden,false);});
 d.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));await delay();test('Escape closes menu and restores focus',()=>{assert.equal(menu.getAttribute('aria-expanded'),'false');assert.equal(d.activeElement===menu,true);});
 menu.click();await delay();d.querySelector('#mobile-menu a').click();await delay();test('Menu navigation dismisses menu',()=>assert.equal(menu.getAttribute('aria-expanded'),'false'));
 const annual=[...d.querySelectorAll('.billing-option')].find(b=>b.textContent.includes('Anual'));annual.click();await delay();test('Annual prices and pressed states update',()=>{assert.equal(annual.getAttribute('aria-pressed'),'true');assert.match(d.querySelectorAll('.plan-price')[1].textContent,/59,99/);assert.match(d.querySelectorAll('.plan-price')[2].textContent,/89,99/);});
 const monthly=[...d.querySelectorAll('.billing-option')].find(b=>b.textContent==='Mensual');monthly.click();await delay();test('Monthly toggle restores original prices',()=>{assert.equal(monthly.getAttribute('aria-pressed'),'true');assert.match(d.querySelectorAll('.plan-price')[1].textContent,/5,99/);});
 test('Footer has all four platform labels',()=>{const t=d.querySelector('.footer-bottom').textContent;for(const x of ['Windows','macOS','Android','Beta iOS y Mac en TestFlight'])assert.ok(t.includes(x));});
 test('FAQ uses native keyboard-accessible details',()=>{assert.equal(d.querySelectorAll('.faq-item').length,8);for(const f of d.querySelectorAll('.faq-item'))assert.equal(f.firstElementChild.tagName,'SUMMARY');});
 test('Local price and legal pages are included',()=>{for(const a of d.querySelectorAll('a[href^="/legal"],a[href="/precios.html"]'))assert.ok(fs.existsSync(path.join(root,'public',a.getAttribute('href'))));});
 test('External new-tab links include opener protection',()=>{for(const a of d.querySelectorAll('a[target="_blank"]'))assert.ok(a.rel.includes('noopener'));});
 const out={configuration:{url:process.env.PLAYWORSHIP_QA_URL || 'https://preview.invalid',snapshot:!!process.env.PLAYWORSHIP_QA_USE_MANIFEST},type:'DOM and file checks; not rendered browser QA',source:'a31750867309c10a0a68c1c6e6f78c1dd4bfad2f',checks,notRun:['Desktop and mobile rendered layout','Browser keyboard and touch interactions','Real download transfers','Checkout/backend purchase flow'],knownLimits:['Cloud browser returned net::ERR_BLOCKED_BY_CLIENT for local preview','Fallback Android APK omitted from portable preview; remains in original repository']};
 fs.writeFileSync(path.join(root,'qa/results.json'),JSON.stringify(out,null,2));console.log(JSON.stringify(out,null,2));dom.window.close();
})().catch(e=>{console.error(e);process.exit(1)});
