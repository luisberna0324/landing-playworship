function makeWave(id){
  const el=document.getElementById(id);
  if(!el)return;
  for(let i=0;i<26;i++){
    const h=Math.max(3,Math.random()*16);
    const s=document.createElement('span');
    s.style.height=h+'px';
    el.appendChild(s);
  }
}
['wf1','wf2','wf3','wf4','wf5','wf6'].forEach(makeWave);

const chColors=['#22C55E','#8B5CF6','#3B82F6','#10B981','#A78BFA','#EC4899'];
for(let c=0;c<6;c++){
  const el=document.getElementById('chw'+c);
  if(!el)continue;
  for(let i=0;i<55;i++){
    const h=Math.max(2,Math.random()*20);
    const s=document.createElement('span');
    s.style.cssText='display:block;width:2px;border-radius:1px;height:'+h+'px;background:'+chColors[c]+'66;flex-shrink:0;transition:height .15s';
    el.appendChild(s);
  }
}

let progress=28,seconds=83;
setInterval(()=>{
  progress=Math.min(100,progress+.15);
  seconds=Math.min(292,seconds+1);
  const bar=document.getElementById('progress-bar');
  const cur=document.getElementById('cur-time');
  if(bar)bar.style.width=progress+'%';
  if(cur){const m=Math.floor(seconds/60);const s=seconds%60;cur.textContent=m+':'+String(s).padStart(2,'0')}
},1000);

setInterval(()=>{
  for(let c=0;c<6;c++){
    const el=document.getElementById('chw'+c);
    if(!el)continue;
    el.querySelectorAll('span').forEach(b=>{if(Math.random()>.65)b.style.height=Math.max(2,Math.random()*20)+'px'});
  }
},130);

document.querySelectorAll('.key-pill').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.key-pill').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
  });
});

const obs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target)}});
},{threshold:.1});
document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));
