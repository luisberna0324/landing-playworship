// Behavior checks in a DOM model; rendered contrast and layout require browser QA.
const {JSDOM}=require(process.env.PLAYWORSHIP_QA_JSDOM||'jsdom');
const fs=require('node:fs');const path=require('node:path');const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');const html=fs.readFileSync(path.join(root,'dist/index.html'),'utf8');const script=html.match(/src="([^"]+\.js)"/)[1];const js=fs.readFileSync(path.join(root,'dist',script),'utf8');
const dom=new JSDOM('<html><head><meta name="theme-color"></head><body><div id="root"></div></body></html>',{url:'https://preview.invalid',runScripts:'outside-only',pretendToBeVisual:true});const w=dom.window,d=w.document;
w.HTMLCanvasElement.prototype.getContext=()=>null;
let reduced=false,fine=true;const listeners=new Map();
w.matchMedia=q=>({get matches(){return q.includes('reduced-motion')?reduced:q.includes('pointer: fine')?fine:false},addEventListener(t,fn){if(!listeners.has(q))listeners.set(q,new Set());listeners.get(q).add(fn)},removeEventListener(t,fn){listeners.get(q)?.delete(fn)}});
w.fetch=async()=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(path.join(root,'dist/review-downloads.json'),'utf8'))});
w.eval(html.match(/<script id="theme-init">([\s\S]*?)<\/script>/)[1]);w.eval(js);
const checks=[];const wait=()=>new Promise(r=>setTimeout(r,35));const test=(name,fn)=>{fn();checks.push({name,result:'pass'})};
(async()=>{for(let i=0;i<60&&!d.querySelector('.interactive-backdrop');i++)await wait();
 const trigger=d.querySelector('.theme-toggle');trigger.click();await wait();
 test('Theme menu offers explicit light, dark and system choices',()=>{assert.equal(trigger.getAttribute('aria-expanded'),'true');assert.deepEqual([...d.querySelectorAll('[role="menuitemradio"]')].map(e=>e.textContent.trim()),['Claro','Oscuro','Sistema']);});
 [...d.querySelectorAll('[role="menuitemradio"]')].find(e=>e.textContent.includes('Oscuro')).click();await wait();
 test('Selecting dark updates document, storage and returns focus',()=>{assert.equal(d.documentElement.dataset.theme,'dark');assert.equal(w.localStorage.getItem('playworship-theme'),'dark');assert.equal(d.activeElement===trigger,true);assert.equal(trigger.getAttribute('aria-expanded'),'false');});
 trigger.click();await wait();const menu=d.querySelector('.theme-menu');menu.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Home',bubbles:true}));await wait();
 test('Keyboard Home targets the first appearance choice',()=>assert.equal(d.activeElement.textContent.trim(),'Claro'));
 d.activeElement.click();await wait();test('Light choice updates document without changing product links',()=>{assert.equal(d.documentElement.dataset.theme,'light');assert.equal(d.querySelectorAll('a[href="https://testflight.apple.com/join/TsUWWH1r"]').length,3);});
 test('Six recognizable devices retain the existing platform family',()=>{assert.equal(d.querySelectorAll('.device-icon').length,6);assert.equal(d.querySelectorAll('.device-icon-phone').length,2);assert.equal(d.querySelectorAll('.device-icon-tablet').length,2);assert.equal(d.querySelectorAll('.device-icon-laptop').length,1);assert.equal(d.querySelectorAll('.device-icon-desktop').length,1);for(const x of d.querySelectorAll('.device-icon'))assert.equal(x.getAttribute('aria-hidden'),'true');});
 const hero=d.querySelector('.hero'),backdrop=d.querySelector('.interactive-backdrop');backdrop.getBoundingClientRect=()=>({left:0,top:0,width:1000,height:800});w.dispatchEvent(new w.Event('resize'));await wait();
 function pointer(x,y){const e=new w.Event('pointermove',{bubbles:true});Object.defineProperties(e,{clientX:{value:x},clientY:{value:y}});hero.dispatchEvent(e)}
 pointer(850,200);await wait();test('Fine pointer creates a local ASCII trail',()=>{assert.equal(backdrop.dataset.pointerX,'850.0');assert.equal(backdrop.dataset.pointerY,'200.0');assert.ok(Number(backdrop.dataset.trailParticles)>0);});
 test('No decorative pause controls remain; native media controls remain',()=>{assert.equal(d.querySelectorAll('.hero-background-toggle,.motion-toggle').length,0);for(const v of d.querySelectorAll('video'))assert.ok(v.controls);});
 fine=false;for(const [q,set]of listeners)if(q.includes('pointer: fine'))for(const fn of [...set])fn();pointer(700,300);await wait();test('Touch/coarse pointer disables the ASCII trail',()=>{assert.equal(backdrop.dataset.pointer,'disabled');assert.equal(backdrop.dataset.pointerX,'850.0');assert.equal(backdrop.dataset.trailParticles,'0');});
 reduced=true;for(const [q,set]of listeners)if(q.includes('reduced-motion'))for(const fn of [...set])fn();await wait();test('Reduced motion stops the field and opens the static fan',()=>{assert.equal(backdrop.dataset.motion,'reduced');assert.equal(d.querySelector('.workflow-section').dataset.progress,'1.000');});
 const result={type:'DOM behavior checks, not rendered browser evidence',checks};fs.writeFileSync(path.join(root,'qa/appearance-results.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));dom.window.close();
})().catch(e=>{console.error(e);dom.window.close();process.exitCode=1});
