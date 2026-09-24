import { Renderer, Program, Mesh, Color, Triangle } from 'ogl';
import { useEffect, useRef } from 'react';

const VERT = /* glsl */ `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = /* glsl */ `#version 300 es
precision highp float;

uniform float uTime;
uniform float uAmplitude;
uniform vec3 uColorStops[3];
uniform vec2 uResolution;
uniform float uBlend;
uniform float uLightMode;

out vec4 fragColor;

vec3 permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v){
  const vec4 C = vec4(
      0.211324865405187, 0.366025403784439,
      -0.577350269189626, 0.024390243902439
  );
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);

  vec3 p = permute(
      permute(i.y + vec3(0.0, i1.y, 1.0))
    + i.x + vec3(0.0, i1.x, 1.0)
  );

  vec3 m = max(
      0.5 - vec3(
          dot(x0, x0),
          dot(x12.xy, x12.xy),
          dot(x12.zw, x12.zw)
      ),
      0.0
  );
  m = m * m;
  m = m * m;

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);

  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

struct ColorStop {
  vec3 color;
  float position;
};

#define COLOR_RAMP(colors, factor, finalColor) {              \
  int index = 0;                                            \
  for (int i = 0; i < 2; i++) {                               \
     ColorStop currentColor = colors[i];                    \
     bool isInBetween = currentColor.position <= factor;    \
     index = int(mix(float(index), float(i), float(isInBetween))); \
  }                                                         \
  ColorStop currentColor = colors[index];                   \
  ColorStop nextColor = colors[index + 1];                  \
  float range = nextColor.position - currentColor.position; \
  float lerpFactor = (factor - currentColor.position) / range; \
  finalColor = mix(currentColor.color, nextColor.color, lerpFactor); \
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;

  ColorStop colors[3];
  colors[0] = ColorStop(uColorStops[0], 0.0);
  colors[1] = ColorStop(uColorStops[1], 0.5);
  colors[2] = ColorStop(uColorStops[2], 1.0);

  vec3 rampColor;
  COLOR_RAMP(colors, uv.x, rampColor);

  float height = snoise(vec2(uv.x * 2.0 + uTime * 0.1, uTime * 0.25)) * 0.5 * uAmplitude;
  height = exp(height);
  height = (uv.y * 2.0 - height + 0.2);
  float intensity = 0.6 * height;

  float midPoint = 0.20;
  float auroraAlpha = smoothstep(midPoint - uBlend * 0.5, midPoint + uBlend * 0.5, intensity);

  vec3 auroraColor = intensity * rampColor;

  if (uLightMode > 0.5) {
    float energy = clamp(max(intensity, 0.0), 0.0, 1.0);
    float coverage = clamp(auroraAlpha * (0.55 + 0.45 * energy), 0.0, 0.86);
    vec3 chroma = pow(clamp(rampColor, 0.0, 1.0), vec3(1.2));
    float chromaPeak = max(chroma.r, max(chroma.g, chroma.b));
    chroma /= max(chromaPeak, 0.0001);
    fragColor = vec4(mix(vec3(1.0), chroma, min(coverage * 1.08, 0.94)), 1.0);
  } else {
    fragColor = vec4(auroraColor * auroraAlpha, auroraAlpha);
  }
}
`;

export interface AuroraProps {
  colorStops?: [string, string, string];
  speed?: number;
  blend?: number;
  amplitude?: number;
  lightMode?: boolean;
  className?: string;
  /**
   * Si está en `true`, respeta `prefers-reduced-motion: reduce`:
   * renderiza un frame estático y no inicia el loop.
   * Default: `false` (siempre anima, igual que el upstream de React Bits).
   */
  respectReducedMotion?: boolean;
}

/**
 * Aurora — port of the React Bits component (https://reactbits.dev).
 *
 * Mejoras sobre el upstream:
 *  - Acepta `className` y la compone con `aurora-container`.
 *  - Opt-in a `prefers-reduced-motion` via `respectReducedMotion` (default off).
 *  - Pausa cuando el contenedor sale del viewport (IntersectionObserver).
 *  - `ResizeObserver` en lugar de `window.resize` (maneja cambios del contenedor).
 *  - Tiempo acumulado por `dt` en vez del timestamp crudo de RAF
 *    (evita saltos cuando el tab vuelve de background).
 *  - Try/catch defensivo si el contexto WebGL no se puede crear.
 */
export default function Aurora(props: AuroraProps) {
  const {
    colorStops = ['#5227FF', '#7cff67', '#5227FF'],
    speed = 1.0,
    amplitude = 1.0,
    blend = 0.5,
    lightMode = false,
    className,
    respectReducedMotion = false
  } = props;
  const propsRef = useRef(props);
  propsRef.current = props;

  const ctnDom = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const ctn = ctnDom.current;
    if (!ctn) return;

    let renderer: Renderer;
    try {
      renderer = new Renderer({
        alpha: true,
        premultipliedAlpha: true,
        antialias: true
      });
    } catch (err) {
      console.warn('[Aurora] Renderer init failed; component will render nothing.', err);
      return;
    }

    const gl = renderer.gl;
    if (!gl) {
      console.warn('[Aurora] WebGL context not available; component will render nothing.');
      return;
    }
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.canvas.style.backgroundColor = 'transparent';

    let program: Program;

    function resize() {
      if (!ctn) return;
      const width = ctn.offsetWidth;
      const height = ctn.offsetHeight;
      renderer.setSize(width, height);
      if (program) {
        program.uniforms.uResolution.value = [width, height];
      }
    }

    // ResizeObserver cubre mejor que window.resize (cambios del contenedor,
    // p.ej. cuando cambia el viewport del móvil o se hace scroll con header sticky).
    const resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(resize)
      : null;
    if (resizeObserver) {
      resizeObserver.observe(ctn);
    } else {
      window.addEventListener('resize', resize);
    }

    const geometry = new Triangle(gl);
    if ((geometry as unknown as { attributes?: { uv?: unknown } }).attributes?.uv) {
      delete (geometry as unknown as { attributes: { uv?: unknown } }).attributes.uv;
    }

    const colorStopsArray = colorStops.map((hex) => {
      const c = new Color(hex);
      return [c.r, c.g, c.b];
    });

    program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uAmplitude: { value: amplitude },
        uColorStops: { value: colorStopsArray },
        uResolution: { value: [ctn.offsetWidth, ctn.offsetHeight] },
        uBlend: { value: blend },
        uLightMode: { value: lightMode ? 1 : 0 }
      }
    });

    const mesh = new Mesh(gl, { geometry, program });
    ctn.appendChild(gl.canvas);

    // Estado de pausa
    const reduceMotionActive =
      respectReducedMotion &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let inViewport = true;
    let paused = reduceMotionActive;
    let time = 0;
    let lastFrame = 0;

    let animateId = 0;
    const update = (t: number) => {
      animateId = requestAnimationFrame(update);
      if (paused || !inViewport) {
        lastFrame = 0;
        return;
      }
      if (lastFrame === 0) lastFrame = t || performance.now();
      const now = t || performance.now();
      const dt = (now - lastFrame) * 0.001;
      lastFrame = now;

      const live = propsRef.current;
      const liveSpeed = live.speed ?? speed;
      // Acumulación por dt: el tiempo virtual sólo crece mientras el loop corre.
      time += dt * liveSpeed;

      program.uniforms.uTime.value = time;
      program.uniforms.uAmplitude.value = live.amplitude ?? 1.0;
      program.uniforms.uBlend.value = live.blend ?? blend;
      program.uniforms.uLightMode.value = (live.lightMode ?? lightMode) ? 1 : 0;
      const stops = live.colorStops ?? colorStops;
      program.uniforms.uColorStops.value = stops.map((hex) => {
        const c = new Color(hex);
        return [c.r, c.g, c.b];
      });

      renderer.render({ scene: mesh });
    };

    // Si el usuario pidió reducir movimiento, renderizamos un único frame estático
    // y NO iniciamos el loop. (Sin esto, el primer update entraba al loop con
    // paused=true y volvía sin pintar nada.)
    if (paused) {
      program.uniforms.uTime.value = 0;
      renderer.render({ scene: mesh });
    } else {
      animateId = requestAnimationFrame(update);
    }

    // IntersectionObserver: pausa fuera de viewport
    let io: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            inViewport = entry.isIntersecting;
          }
        },
        { threshold: 0 }
      );
      io.observe(ctn);
    }

    // Cambio dinámico de prefers-reduced-motion
    let motionMq: MediaQueryList | null = null;
    const motionHandler = (e: MediaQueryListEvent) => {
      // Si el sitio optó por no respetar la preferencia, ignoramos el cambio.
      if (!respectReducedMotion) return;
      paused = e.matches;
      if (paused) {
        // Render un frame estático en la posición actual
        program.uniforms.uTime.value = time;
        renderer.render({ scene: mesh });
      }
    };
    if (respectReducedMotion && typeof window.matchMedia === 'function') {
      motionMq = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (motionMq.addEventListener) motionMq.addEventListener('change', motionHandler);
      else if ((motionMq as unknown as { addListener?: (h: typeof motionHandler) => void }).addListener) {
        (motionMq as unknown as { addListener: (h: typeof motionHandler) => void }).addListener(motionHandler);
      }
    }

    resize();

    return () => {
      cancelAnimationFrame(animateId);
      resizeObserver?.disconnect();
      io?.disconnect();
      if (motionMq) {
        if (motionMq.removeEventListener) motionMq.removeEventListener('change', motionHandler);
        else if ((motionMq as unknown as { removeListener?: (h: typeof motionHandler) => void }).removeListener) {
          (motionMq as unknown as { removeListener: (h: typeof motionHandler) => void }).removeListener(motionHandler);
        }
      }
      if (!resizeObserver) window.removeEventListener('resize', resize);
      if (ctn && gl.canvas.parentNode === ctn) {
        ctn.removeChild(gl.canvas);
      }
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amplitude, blend, lightMode]);

  return <div ref={ctnDom} className={['aurora-container', className].filter(Boolean).join(' ')} />;
}
