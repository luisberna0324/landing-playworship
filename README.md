# Play Worship — Landing (React + Vite + TypeScript)

Landing estática de Play Worship portada a React. Mantiene el mismo HTML, CSS y assets
que la versión vanilla; cada sección es ahora un componente React.

## Stack

El selector de descargas consulta el manifiesto público
`https://storage.googleapis.com/adoracion-studio-installers-20260516-28602/installers/latest.json`
al cargar la página. El CI de la app lo actualiza tras publicar los instaladores
firmados. Si el manifiesto no responde, la landing conserva los enlaces actuales
y muestra la APK Android local como beta. En desarrollo, Vite sirve el manifiesto
por `/api/downloads/latest.json` para que funcione desde la LAN.

- **Vite 5** — bundler / dev server
- **React 18** + **TypeScript 5** (strict)
- **ogl** — WebGL para el fondo Aurora del hero
- **Firebase Hosting** — deploy estático (`dist/`)

Los estilos siguen en un único CSS global (`src/styles/styles.css`) con las
variables y la cascada originales; no hace falta Tailwind ni CSS Modules para
mantener el look and feel.

## Estructura

```
landing-playworship/
├── index.html                 # shell mínimo de Vite
├── package.json
├── tsconfig*.json
├── vite.config.ts
├── firebase.json              # apunta public → dist/ con rewrite a index.html
├── public/                    # se sirve tal cual en /
│   └── assets/                # gifs, videos, imágenes
└── src/
    ├── main.tsx               # entry point (createRoot + App)
    ├── App.tsx                # composición de secciones + BillingProvider
    ├── styles/
    │   └── styles.css         # CSS global (variables, layout, componentes)
    ├── components/
    │   ├── Header.tsx         # sticky header + menú móvil
    │   ├── Hero.tsx           # hero con CTA + dropdown + mockup
    │   ├── Aurora.tsx         # wrapper React del shader WebGL
    │   ├── Cinemagraph.tsx
    │   ├── MobileApp.tsx      # video de la app móvil nativa
    │   ├── TaskModule.tsx     # tabs verticales (biblioteca, secciones, etc.)
    │   ├── BestPractices.tsx  # filas alternadas con mockups
    │   ├── Pricing.tsx        # planes + toggle mensual/anual + Paddle
    │   ├── Faq.tsx            # accordion nativo <details>
    │   ├── CtaFinal.tsx
    │   └── Footer.tsx
    ├── context/
    │   └── BillingContext.tsx # estado compartido mensual/anual
    ├── hooks/
    │   ├── useScrolled.ts     # sticky shadow al hacer scroll
    │   ├── useReveal.ts       # IntersectionObserver para .reveal
    │   ├── useOutsideClick.ts # genérico para dropdowns/menus
    │   └── usePaddle.ts       # carga Paddle.js + binding de checkout
    └── lib/
        └── auroraShader.ts    # GLSL + setup de ogl (pausa por viewport,
                               # respeta prefers-reduced-motion)
```

## Comandos

```bash
npm install        # instalar dependencias
npm run dev        # dev server en http://localhost:5173
npm run build      # compila TS + bundle producción a dist/
npm run preview    # sirve dist/ en http://localhost:4173
npm run deploy     # build + firebase deploy --only hosting
```

## Videos para la landing

Para las demostraciones de la app usamos MP4 en lugar de GIF: mantiene el texto
nítido y descarga mucho menos. El preset está en `scripts/encode-demo-video.sh`:
H.264, 24 fps, ancho máximo de 1280 px sin ampliar el original, CRF 20,
`preset slow`, `yuv420p`, `faststart` y sin audio. También genera un JPG de
poster, tomado a los 3 segundos (o a mitad de los videos más cortos).

Los videos de la página usan `LazyVideo`: primero muestran el póster, cargan el
MP4 al acercarse al viewport y se pausan al salir. El hero usa `hero-web.mp4`
en lugar del original de 85 MB. Firebase Hosting ya sirve estos recursos mediante
su CDN; `firebase.json` excluye los MP4 originales que la página no utiliza.

```bash
bash scripts/encode-demo-video.sh public/assets/video/mi-demo.mp4
# Genera mi-demo-web.mp4 y mi-demo-web-poster.jpg junto al original.
```

Se puede indicar una ruta de salida como segundo argumento. El script requiere
`ffmpeg` y `ffprobe` y no sobrescribe archivos existentes. Al añadir un video a
una sección, usar el MP4 optimizado en un `<video muted loop playsInline>` y el
JPG como `poster`.

## Notas de la migración

- **Assets**: lo que era `assets/...` ahora vive en `public/assets/...` y se
  referencia con paths absolutos (`/assets/...`). Vite los copia a `dist/assets`
  en el build tal cual, sin hashing.
- **CSS**: el archivo original (`css/styles.css`) se movió a
  `src/styles/styles.css` y se importa desde `src/main.tsx`. No hubo cambios
  funcionales — sólo se preserva el `url()` inline de la textura de ruido.
- **Aurora**: el viejo `js/aurora.js` (módulo ESM con `ogl` desde `esm.sh`) se
  reemplazó por un módulo TypeScript bajo `src/lib/auroraShader.ts` que importa
  `ogl` desde `node_modules`. Misma lógica de pausa por viewport y
  `prefers-reduced-motion`.
- **Interacciones**: el vanilla `main.js` se partió en hooks reutilizables
  (`useScrolled`, `useReveal`, `useOutsideClick`, `usePaddle`) y estado local
  por componente. El toggle de pricing se maneja vía `BillingContext` para que
  el checkout de Paddle reciba el `price-id` correcto en cada cambio.
- **Firebase**: `firebase.json` ahora apunta `public` a `dist/` y agrega un
  rewrite global a `/index.html` (SPA fallback por si en el futuro se agregan
  rutas).

## Pendiente / nice-to-have

- ESLint + Prettier (no incluidos para mantener el PR chico).
- Tests (Vitest + React Testing Library) si el proyecto crece más allá de
  una landing.
- Hidratar `Paddle.Initialize` sólo en cliente (`useEffect` ya lo hace, pero
  el cast a `window.Paddle` puede endurecerse con `@types/paddle-js`).
