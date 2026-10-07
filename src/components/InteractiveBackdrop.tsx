import { useEffect, useRef } from 'react';
import './InteractiveBackdrop.css';

const VERTEX = 'attribute vec2 position; void main(){gl_Position=vec4(position,0.,1.);}';
// An original flowing field, inspired by the reference's broad folded forms.
const FRAGMENT = `precision mediump float;
uniform vec2 resolution; uniform float time; uniform float light;
void main(){
 vec2 uv=gl_FragCoord.xy/resolution;uv.y=1.-uv.y;
 vec2 p=vec2((uv.x-.5)*min(resolution.x/resolution.y,1.8)*2.3,(uv.y-.48)*2.7);
 float t=time*.16;
 vec2 q=p;
 q.x+=.42*sin(p.y*2.1+t)+.22*cos(p.x*1.1-t*.7);
 q.y+=.32*sin(p.x*1.8-t*.8);
 float wave=sin(q.x*3.1+q.y*.8+sin(q.y*2.7-t*.55)*1.2);
 float fold=smoothstep(-.5,.65,wave);
 float edge=exp(-11.*abs(wave+.12));
 vec3 base=mix(vec3(.035,.079,.061),vec3(.86,.966,.912),light);
 vec3 shade=mix(vec3(.018,.17,.119),vec3(.30,.70,.52),light);
 vec3 crest=mix(vec3(.10,.36,.247),vec3(.66,.91,.775),light);
 vec3 shine=mix(vec3(.24,.57,.38),vec3(.92,1.,.954),light);
 vec3 field=mix(shade,crest,fold);field=mix(field,shine,edge*.62);
 float cover=smoothstep(.26,.65,uv.y)*(1.-smoothstep(.78,1.,uv.y));
 float wings=.65+.35*smoothstep(.05,.5,abs(uv.x-.5));
 vec3 color=mix(base,field,cover*wings);
 gl_FragColor=vec4(color,1.);
}`;

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
    let gl: WebGLRenderingContext | null = null;
    let program: WebGLProgram | null = null, buffer: WebGLBuffer | null = null;
    let vertex: WebGLShader | null = null, fragment: WebGLShader | null = null;
    let resolution: WebGLUniformLocation | null = null, clock: WebGLUniformLocation | null = null, palette: WebGLUniformLocation | null = null;
    try {
      gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, powerPreference: 'low-power' });
      if (gl) {
        const compile = (type: number, source: string) => {
          const shader = gl!.createShader(type);if (!shader) throw new Error('Shader unavailable');
          gl!.shaderSource(shader, source);gl!.compileShader(shader);
          if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) { gl!.deleteShader(shader);throw new Error('Shader compile failed'); }
          return shader;
        };
        vertex = compile(gl.VERTEX_SHADER, VERTEX);fragment = compile(gl.FRAGMENT_SHADER, FRAGMENT);
        program = gl.createProgram();if (!program) throw new Error('Program unavailable');
        gl.attachShader(program, vertex);gl.attachShader(program, fragment);gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Program link failed');
        gl.useProgram(program);buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
        const position=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
        resolution=gl.getUniformLocation(program,'resolution');clock=gl.getUniformLocation(program,'time');palette=gl.getUniformLocation(program,'light');
        root.dataset.renderer='webgl';
      }
    } catch { gl=null; }
    if (!gl) root.dataset.renderer='css';
    let frame=0,lastPaint=-100,lastSpawn=-100,width=1,height=1,visible=true,counter=0;
    let glyphs: Glyph[]=[];
    const start=performance.now();
    const isLight=()=>document.documentElement.dataset.theme==='light';
    const paint=(now=performance.now())=>{
      const light=isLight();
      if(gl&&program){gl.useProgram(program);gl.uniform2f(resolution,canvas.width,canvas.height);gl.uniform1f(clock,reduced.matches?0:(now-start)/1000);gl.uniform1f(palette,light?1:0);gl.drawArrays(gl.TRIANGLES,0,6);}
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
      canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);gl?.viewport(0,0,canvas.width,canvas.height);
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
    return()=>{cancelAnimationFrame(frame);sizeObserver?.disconnect();if(!sizeObserver)window.removeEventListener('resize',resize);visibility?.disconnect();themeObserver.disconnect();hero.removeEventListener('pointermove',move);reduced.removeEventListener('change',restart);pointer.removeEventListener('change',restart);document.removeEventListener('visibilitychange',restart);if(gl){if(buffer)gl.deleteBuffer(buffer);if(program)gl.deleteProgram(program);if(vertex)gl.deleteShader(vertex);if(fragment)gl.deleteShader(fragment);}};
  }, []);
  return <div ref={rootRef} className="interactive-backdrop" aria-hidden="true">
    <div className="fluid-fallback" />
    <canvas ref={fieldRef} className="fluid-field" />
    <canvas ref={trailRef} className="ascii-trail" />
  </div>;
}
