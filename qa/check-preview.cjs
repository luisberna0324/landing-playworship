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
const dom=new JSDOM('<!doctype html><html lang="es"><head></head><body><div id="root"></div></body></html>',{url:'https://preview.invalid',runScripts:'outside-only',pretendToBeVisual:true});
const w=dom.window;
w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
w.fetch=async()=>({ok:false,status:503,json:async()=>({})});
w.eval(js);
const delay=()=>new Promise(r=>setTimeout(r,30));
(async()=>{
 await delay(); const d=w.document;
 test('One descriptive H1 and main landmark',()=>{assert.equal(d.querySelectorAll('h1').length,1);assert.match(d.querySelector('h1').textContent,/Tus multitracks/);assert.equal(d.querySelectorAll('main').length,1);});
 test('Every internal anchor has a target',()=>{for(const a of d.querySelectorAll('a[href^="#"]')) assert.ok(d.getElementById(a.getAttribute('href').slice(1)),a.outerHTML);});
 test('All displayed images have alt text and existing local assets',()=>{for(const im of d.querySelectorAll('img')){assert.ok(im.hasAttribute('alt'));assert.ok(fs.existsSync(path.join(root,'public',im.getAttribute('src'))),im.src);}});
 test('Demo uses honest static capture while continuous recording is pending',()=>{assert.equal(d.querySelectorAll('video').length,0);assert.ok(d.querySelector('.demo-figure img'));assert.match(d.querySelector('.demo-figure figcaption').textContent,/Captura real/);});
 test('Production Cloud CTAs retain consult behavior',()=>{assert.equal(d.querySelectorAll('.plan-card').length,3);assert.equal([...d.querySelectorAll('.plan-btn')].filter(a=>a.textContent.includes('Consultar por Cloud')).length,2);});
 test('Fallback status labels version uncertainty',()=>{assert.match(d.querySelector('.download-note[role="status"]').textContent,/No pudimos verificar/);assert.match(d.querySelector('.ios-card').textContent,/TestFlight/);assert.equal(d.querySelectorAll('a[href*="testflight.apple.com"]').length,0);});
 const menu=d.querySelector('.header-menu-toggle');
 test('Mobile menu starts hidden',()=>{assert.equal(menu.getAttribute('aria-expanded'),'false');assert.ok(d.getElementById('mobile-menu').hidden);});
 menu.click();await delay();test('Mobile menu opens with synchronized ARIA',()=>{assert.equal(menu.getAttribute('aria-expanded'),'true');assert.equal(d.getElementById('mobile-menu').hidden,false);});
 d.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));await delay();test('Escape closes menu and restores focus',()=>{assert.equal(menu.getAttribute('aria-expanded'),'false');assert.equal(d.activeElement,menu);});
 menu.click();await delay();d.querySelector('#mobile-menu a').click();await delay();test('Menu navigation dismisses menu',()=>assert.equal(menu.getAttribute('aria-expanded'),'false'));
 const annual=[...d.querySelectorAll('.billing-option')].find(b=>b.textContent.includes('Anual'));annual.click();await delay();test('Annual prices and pressed states update',()=>{assert.equal(annual.getAttribute('aria-pressed'),'true');assert.match(d.querySelectorAll('.plan-price')[1].textContent,/59,99/);assert.match(d.querySelectorAll('.plan-price')[2].textContent,/89,99/);});
 const monthly=[...d.querySelectorAll('.billing-option')].find(b=>b.textContent==='Mensual');monthly.click();await delay();test('Monthly toggle restores original prices',()=>{assert.equal(monthly.getAttribute('aria-pressed'),'true');assert.match(d.querySelectorAll('.plan-price')[1].textContent,/5,99/);});
 test('Footer has all four platform labels',()=>{const t=d.querySelector('.footer-bottom').textContent;for(const x of ['Windows','macOS','Android','iOS beta en TestFlight'])assert.ok(t.includes(x));});
 test('FAQ uses native keyboard-accessible details',()=>{assert.equal(d.querySelectorAll('.faq-item').length,8);for(const f of d.querySelectorAll('.faq-item'))assert.equal(f.firstElementChild.tagName,'SUMMARY');});
 test('Local price and legal pages are included',()=>{for(const a of d.querySelectorAll('a[href^="/legal"],a[href="/precios.html"]'))assert.ok(fs.existsSync(path.join(root,'public',a.getAttribute('href'))));});
 test('External new-tab links include opener protection',()=>{for(const a of d.querySelectorAll('a[target="_blank"]'))assert.ok(a.rel.includes('noopener'));});
 const out={type:'DOM and file checks; not rendered browser QA',source:'a31750867309c10a0a68c1c6e6f78c1dd4bfad2f',checks,notRun:['Desktop and mobile rendered layout','Browser keyboard and touch interactions','Real download transfers','Checkout/backend purchase flow'],knownLimits:['Cloud browser returned net::ERR_BLOCKED_BY_CLIENT for local preview','Fallback Android APK omitted from portable preview; remains in original repository']};
 fs.writeFileSync(path.join(root,'qa/results.json'),JSON.stringify(out,null,2));console.log(JSON.stringify(out,null,2));dom.window.close();
})().catch(e=>{console.error(e);process.exit(1)});
