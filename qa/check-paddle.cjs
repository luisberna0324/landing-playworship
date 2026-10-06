// Local integration tests with a stubbed Paddle SDK. These never contact Paddle or submit payments.
const {JSDOM}=require(process.env.PLAYWORSHIP_QA_JSDOM || 'jsdom');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const index=fs.readFileSync(path.join(root,'dist/index.html'),'utf8');
const js=fs.readFileSync(path.join(root,'dist',index.match(/src="([^"]+\.js)"/)[1]),'utf8');
const wait=()=>new Promise(r=>setTimeout(r,30));
async function settle(predicate){for(let n=0;n<100;n++){if(predicate())return;await wait();}throw new Error('Timed out waiting for DOM');}
async function create({unsafe=false,hold=false}={}){
 let releaseConfig; const gate=new Promise(r=>{releaseConfig=r;}); if(!hold)releaseConfig();
 const dom=new JSDOM('<html><body><div id="root"></div></body></html>',{url:'https://preview.invalid',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window,calls={env:[],init:0,open:[],config:0};
 w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});w.HTMLCanvasElement.prototype.getContext=()=>null;
 w.Paddle={Environment:{set:x=>calls.env.push(x)},Initialize:()=>calls.init++,Checkout:{open:x=>calls.open.push(x)}};
 w.fetch=async url=>{
  if(String(url).includes('/api/paddle/config')) {
   calls.config++;assert.equal(url,'/api/paddle/config?mode=sandbox');await gate;await wait();
   return {ok:true,json:async()=>({token:unsafe?'live_fixture_not_a_real_token':'test_fixture_not_a_real_token',environment:unsafe?'production':'sandbox',checkoutReady:true,provisioningReady:true,priceIds:{cloud300:{monthly:'pri_fixture_300_month',annual:'pri_fixture_300_year'},cloud500:{monthly:'pri_fixture_500_month',annual:'pri_fixture_500_year'}}})};
  }
  return {ok:false,status:503,json:async()=>({})};
 };
 w.eval(js);await settle(()=>w.document.querySelectorAll('button.plan-btn').length===2);
 return {dom,w,d:w.document,calls,releaseConfig};
}
(async()=>{
 const tests=[];let x=await create({hold:true});let buttons=x.d.querySelectorAll('button.plan-btn');
 buttons[0].click();buttons[0].click();await settle(()=>x.d.querySelector('.billing-option').disabled);assert.equal([...x.d.querySelectorAll('.billing-option')].every(b=>b.disabled),true);tests.push('Billing selection stays locked while checkout is pending');x.releaseConfig();await settle(()=>x.calls.open.length===1);
 assert.equal(x.calls.config,1);tests.push('Repeated clicks produce one configuration request and one overlay');
 assert.deepEqual(x.calls.env,['sandbox']);assert.equal(x.calls.init,1);tests.push('Existing SDK initializes in Sandbox');
 assert.equal(x.calls.open[0].items[0].priceId,'pri_fixture_300_month');assert.equal(x.calls.open[0].customData.integration,'playworship_cloud_v1');tests.push('Cloud300 monthly and existing integration metadata preserved');
 [...x.d.querySelectorAll('.billing-option')].find(b=>b.textContent.includes('Anual')).click();await wait();x.d.querySelectorAll('button.plan-btn')[1].click();await settle(()=>x.calls.open.length===2);
 assert.equal(x.calls.open[1].items[0].priceId,'pri_fixture_500_year');tests.push('Cloud500 annual selection reaches the original overlay flow');
 assert.equal(x.calls.init,1);tests.push('Repeated opening reuses the initialized SDK');x.dom.window.close();
 x=await create({unsafe:true});x.d.querySelector('button.plan-btn').click();await settle(()=>!!x.d.querySelector('[role="alert"]'));
 assert.equal(x.calls.open.length,0);assert.equal(x.calls.init,0);assert.match(x.d.querySelector('[role="alert"]').textContent,/sólo acepta Paddle Sandbox/);tests.push('Live config fails closed in the review build');x.dom.window.close();
 const result={type:'Local stubbed integration tests, not a real payment or webhook test',tests:tests.map(name=>({name,result:'pass'}))};
 fs.writeFileSync(path.join(root,'qa/paddle-results.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
})().catch(e=>{console.error(e.message);process.exit(1)});
