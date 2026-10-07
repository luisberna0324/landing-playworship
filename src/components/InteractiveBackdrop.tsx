import { useEffect, useRef } from 'react';
import './InteractiveBackdrop.css';

type Glyph = { x: number; y: number; born: number; char: string };

/** Flowing field plus a short ASCII pointer trail; no decorative controls. */
export function InteractiveBackdrop() {
  const rootRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLCanvasElement>(null);
  const trailRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const root = rootRef.current, canvas = fieldRef.current, trail = trailRef.current;
    const hero = root?.parentElement;
    if (!root || !canvas || !trail || !hero) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const ctx = trail.getContext('2d');
    const field = canvas.getContext('2d');
    const sample = document.createElement('canvas');
    const sampleContext = sample.getContext('2d');
    root.dataset.renderer=field&&sampleContext?'canvas2d':'css';
    const smooth=(a:number,b:number,x:number)=>{const n=Math.max(0,Math.min(1,(x-a)/(b-a)));return n*n*(3-2*n);};
    const mix=(a:number,b:number,x:number)=>a+(b-a)*x;
    let sampleWidth=140,sampleHeight=100;
    let pixels:ImageData|null=null;
    const drawField=(seconds:number,light:boolean)=>{
      if(!field||!sampleContext||!pixels)return;
      const t=seconds*.22,aspect=Math.min(width/height,1.8),l=light?1:0;
      const base=[mix(.035,.86,l),mix(.079,.966,l),mix(.061,.912,l)];
      const shade=[mix(.018,.30,l),mix(.17,.70,l),mix(.119,.52,l)];
      const crest=[mix(.10,.66,l),mix(.36,.91,l),mix(.247,.775,l)];
      const shine=[mix(.24,.92,l),mix(.57,1,l),mix(.38,.954,l)];
      for(let y=0;y<sampleHeight;y++){
        const v=y/(sampleHeight-1),py=(v-.48)*2.7;
        const cover=smooth(.26,.65,v)*(1-smooth(.78,1,v));
        for(let x=0;x<sampleWidth;x++){
          const u=x/(sampleWidth-1),px=(u-.5)*aspect*2.3;
          const qx=px+.42*Math.sin(py*2.1+t)+.22*Math.cos(px*1.1-t*.7);
          const qy=py+.32*Math.sin(px*1.8-t*.8);
          const wave=Math.sin(qx*3.1+qy*.8+Math.sin(qy*2.7-t*.55)*1.2);
          const fold=smooth(-.5,.65,wave),edge=Math.exp(-11*Math.abs(wave+.12))*.62;
          const amount=cover*(.65+.35*smooth(.05,.5,Math.abs(u-.5)));
          const index=(y*sampleWidth+x)*4;
          for(let c=0;c<3;c++)pixels.data[index+c]=255*mix(base[c],mix(mix(shade[c],crest[c],fold),shine[c],edge),amount);
          pixels.data[index+3]=255;
        }
      }
      sampleContext.putImageData(pixels,0,0);field.imageSmoothingEnabled=true;field.imageSmoothingQuality='high';field.drawImage(sample,0,0,canvas.width,canvas.height);
    };
    let frame=0,lastPaint=-100,lastSpawn=-100,width=1,height=1,visible=true,counter=0;
    let glyphs: Glyph[]=[];
    const start=performance.now();
    const isLight=()=>document.documentElement.dataset.theme==='light';
    const paint=(now=performance.now())=>{
      const light=isLight();
      drawField(reduced.matches?0:(now-start)/1000,light);
      glyphs=glyphs.filter(g=>now-g.born<850);
      if(ctx){
        ctx.clearRect(0,0,width,height);
        ctx.font='8px ui-monospace, monospace';ctx.textAlign='center';
        for(const g of glyphs){const a=.38*Math.pow(1-(now-g.born)/850,1.6);ctx.fillStyle=`rgba(${light?'30,98,60':'214,255,229'},${a})`;ctx.fillText(g.char,g.x,g.y-(now-g.born)*.006);}
      }
      root.dataset.trailParticles=String(glyphs.length);
    };
    const tick=(now:number)=>{frame=0;if(now-lastPaint>=32){paint(now);lastPaint=now;}if(visible&&!document.hidden&&!reduced.matches)frame=requestAnimationFrame(tick);};
    const restart=()=>{
      cancelAnimationFrame(frame);frame=0;
      if(reduced.matches||!pointer.matches)glyphs=[];
      root.dataset.motion=reduced.matches?'reduced':visible&&!document.hidden?'running':'idle';
      root.dataset.pointer=pointer.matches&&!reduced.matches?'enabled':'disabled';
      paint();if(visible&&!document.hidden&&!reduced.matches)frame=requestAnimationFrame(tick);
    };
    const resize=()=>{
      const rect=root.getBoundingClientRect();width=Math.max(1,rect.width);height=Math.max(1,rect.height);
      const ratio=Math.min(devicePixelRatio||1,1.25,1600/width);
      canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);
      sampleWidth=140;sampleHeight=Math.min(180,Math.max(60,Math.round(140*height/width)));sample.width=sampleWidth;sample.height=sampleHeight;pixels=sampleContext?.createImageData(sampleWidth,sampleHeight)??null;
      trail.width=Math.round(width*ratio);trail.height=Math.round(height*ratio);ctx?.setTransform(ratio,0,0,ratio,0,0);restart();
    };
    const move=(event:PointerEvent)=>{
      if(!pointer.matches||reduced.matches||!visible||document.hidden)return;
      const rect=root.getBoundingClientRect(),x=event.clientX-rect.left,y=event.clientY-rect.top;
      if(x<0||y<0||x>width||y>height)return;
      root.dataset.pointerX=x.toFixed(1);root.dataset.pointerY=y.toFixed(1);
      const now=performance.now();if(now-lastSpawn<24)return;lastSpawn=now;
      for(let i=0;i<4;i++){counter++;const dx=((counter*37)%7-3)*12,dy=((counter*23)%5-2)*12;glyphs.push({x:Math.round((x+dx)/12)*12,y:Math.round((y+dy)/12)*12,born:now,char:'PW01+AXC'[counter%8]});}
      if(glyphs.length>96)glyphs=glyphs.slice(-96);
    };
    const sizeObserver=typeof ResizeObserver==='undefined'?null:new ResizeObserver(resize);sizeObserver?.observe(root);if(!sizeObserver)window.addEventListener('resize',resize);
    const visibility=typeof IntersectionObserver==='undefined'?null:new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;restart();});visibility?.observe(hero);
    const themeObserver=new MutationObserver(restart);themeObserver.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
    hero.addEventListener('pointermove',move,{passive:true});reduced.addEventListener('change',restart);pointer.addEventListener('change',restart);document.addEventListener('visibilitychange',restart);resize();
    return()=>{cancelAnimationFrame(frame);sizeObserver?.disconnect();if(!sizeObserver)window.removeEventListener('resize',resize);visibility?.disconnect();themeObserver.disconnect();hero.removeEventListener('pointermove',move);reduced.removeEventListener('change',restart);pointer.removeEventListener('change',restart);document.removeEventListener('visibilitychange',restart);};
  }, []);
  return <div ref={rootRef} className="interactive-backdrop" aria-hidden="true">
    <div className="fluid-fallback" />
    <canvas ref={fieldRef} className="fluid-field" />
    <canvas ref={trailRef} className="ascii-trail" />
  </div>;
}
