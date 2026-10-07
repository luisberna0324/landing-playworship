// Local behavior checks only. Browser pixel/motion validation is a separate stage.
const {JSDOM}=require(process.env.PLAYWORSHIP_QA_JSDOM || 'jsdom');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');const index=fs.readFileSync(path.join(root,'dist/index.html'),'utf8');const js=fs.readFileSync(path.join(root,'dist',index.match(/src="([^"]+\.js)"/)[1]),'utf8');
const sleep=()=>new Promise(r=>setTimeout(r,30));async function ready(fn){for(let i=0;i<100;i++){if(fn())return;await sleep();}throw new Error('Timed out');}
async function instance(reduced=false){
 const dom=new JSDOM('<html><body><div id="root"></div></body></html>',{url:'https://preview.invalid',runScripts:'outside-only',pretendToBeVisual:true});const w=dom.window;
 let sectionTop=w.innerHeight*.9;
 const rect=w.HTMLElement.prototype.getBoundingClientRect;
 w.HTMLElement.prototype.getBoundingClientRect=function(){return this.classList.contains('workflow-section')?{top:sectionTop,left:0,right:1000,bottom:sectionTop+700,width:1000,height:700}:rect.call(this);};
 w.matchMedia=q=>({matches:reduced&&q.includes('prefers-reduced-motion'),addEventListener(){},removeEventListener(){}});w.HTMLCanvasElement.prototype.getContext=()=>null;w.fetch=async()=>({ok:false,status:503});w.eval(js);
 await ready(()=>w.document.querySelector('.workflow-section')?.dataset.progress);
 return {dom,w,d:w.document,setTop:y=>{sectionTop=y;w.dispatchEvent(new w.Event('scroll'));}};
}
(async()=>{const tests=[];let x=await instance();let section=x.d.querySelector('.workflow-section');
 assert.equal(section.dataset.progress,'0.000');tests.push('Scroll fan starts stacked at progress0');x.setTop(-x.w.innerHeight*.4);await ready(()=>section.dataset.progress==='1.000');tests.push('Scroll fan reaches open progress1 at the end of its range');
 assert.equal(x.d.querySelectorAll('.stack-window').length,3);assert.equal(x.d.querySelectorAll('.orbit-track').length,3);tests.push('Three real-image layers and three orbit tracks present');
 assert.equal(x.d.querySelectorAll('.motion-toggle,.hero-background-toggle').length,0);tests.push('Decorative pause controls removed as requested');x.dom.window.close();
 x=await instance(true);assert.equal(x.d.querySelector('.workflow-section').dataset.progress,'1.000');tests.push('Reduced-motion preference shows the fan fully open without scroll movement');x.dom.window.close();
 const result={type:'Local motion behavior checks, not rendered animation evidence',tests:tests.map(name=>({name,result:'pass'}))};fs.writeFileSync(path.join(root,'qa/motion-results.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
})().catch(e=>{console.error(e.message);process.exit(1)});
