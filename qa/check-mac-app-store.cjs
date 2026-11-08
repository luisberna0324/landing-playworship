// Production-bundle regression checks. No external requests or real payments.
const { JSDOM, VirtualConsole } = require(process.env.PLAYWORSHIP_QA_JSDOM || 'jsdom');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'dist/index.html'), 'utf8');
const js = fs.readFileSync(path.join(root, 'dist', html.match(/src="([^"]+\.js)"/)[1]), 'utf8');
const store = 'https://apps.apple.com/us/app/playworship/id6819361132';
const bucket = 'https://storage.googleapis.com/adoracion-studio-installers-20260516-28602/installers';
const manifest = {version:'2.4.1', platforms:{
  windows:{available:true,url:`${bucket}/windows/v2.4.1/playworship-windows-installer-2.4.1-x64.exe`},
  macos:{available:true,url:`${bucket}/macos/v2.4.1/playworship-macos-installer-2.4.1.pkg`},
  android:{available:true,url:`${bucket}/android/v2.4.1/playworship-android-2.4.1-arm64.apk`},
  ios:{available:false},
}};
const delay = () => new Promise(resolve => setTimeout(resolve, 30));
async function scenario(available) {
  const dom = new JSDOM('<html><body><div id="root"></div></body></html>', {
    url:'https://production.invalid/#descargas',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:new VirtualConsole(),
  });
  try {
    const w=dom.window,d=w.document;
    w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
    w.HTMLCanvasElement.prototype.getContext=()=>null;
    w.HTMLMediaElement.prototype.load=function(){};w.HTMLMediaElement.prototype.pause=function(){};
    w.fetch=async()=>({ok:available,status:available?200:503,json:async()=>manifest});
    w.eval(js); await delay(); await delay();
    const mac=d.querySelector('[data-platform="macos"]');
    assert.equal(mac.querySelector('.platform-download').href,store);
    assert.match(mac.querySelector('.platform-download').textContent,/Mac App Store/);
    assert.equal(mac.querySelector('.platform-download').target,'_blank');
    assert.equal(mac.querySelector('.platform-download').rel,'noopener noreferrer');
    assert.match(mac.querySelector('small').textContent,/macOS 12.0 o posterior/);
    assert.doesNotMatch(mac.querySelector('small').textContent,/2\.4\.1|2\.0\.2/);
    const direct=mac.querySelector('a[href$=".pkg"]');
    assert.equal(direct.href,available?manifest.platforms.macos.url:`${bucket}/macos/v2.0.2/playworship-macos-installer-2.0.2.pkg`);
    assert.match(direct.textContent,available?/Descarga directa · v2.4.1/:/Enlace alternativo · v2.0.2/);
    assert.equal(mac.querySelectorAll('a[href="https://testflight.apple.com/join/TsUWWH1r"]').length,1);
    assert.equal(d.querySelector('.ios-card .platform-download').href,store);
    for (const platform of ['windows','android']) {
      const href=d.querySelector(`[data-platform="${platform}"] .platform-download`).getAttribute('href');
      if(available) assert.equal(href,manifest.platforms[platform].url);
      else assert.equal(href,platform==='windows'?`${bucket}/windows/v2.0.2/playworship-windows-installer-2.0.2-x64.exe`:'/downloads/playworship-android-beta.apk');
    }
    const toggle=mac.querySelector('.installation-guide-toggle');
    const guide=d.querySelector('#installation-guide-macos');
    assert.match(toggle.textContent,/Problemas con el .pkg/);
    toggle.click();await delay();assert.equal(guide.hidden,false);
    guide.querySelector('button').click();await delay();assert.equal(guide.hidden,true);assert.equal(d.activeElement,toggle);
    toggle.click();await delay();guide.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));await delay();assert.equal(guide.hidden,true);
    toggle.click();await delay();toggle.click();await delay();assert.equal(guide.hidden,true);
    assert.match(d.querySelector('#faq').textContent,/Mac, iPhone y iPad están disponibles en App Store/);
    console.log(`PASS: ${available?'current':'unavailable'} manifest; Store, direct and beta links; version separation; unchanged Windows/Android/iOS; guide open/close/Escape/repeated toggle.`);
  } finally {dom.window.close();}
}
(async()=>{await scenario(true);await scenario(false);})().catch(e=>{console.error(e);process.exitCode=1;});
