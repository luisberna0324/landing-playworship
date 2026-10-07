# PlayWorship · revisión de landing

Revisión inspirada en los efectos observados directamente en VMPal. Usa el logo y las capturas de PlayWorship. El canal live y la configuración de producción se conservan.

## Revisión de movimiento
- Tres ventanas reales se abren con el scroll: capas a escala .84/.92/1 y separación progresiva 24%/12%/0
- Apariciones con 28 px de recorrido; opacidad .9 s y desplazamiento 1 s
- Tres órbitas de 46/70/96 s, con contrarrotación para mantener derechos los iconos
- Fondo de puntos sutiles, header que pasa a desenfoque al desplazarse y transiciones hover
- Control para pausar las órbitas y el fondo; preferencia de movimiento reducido respetada
- Se mantienen imágenes reales estáticas. No se presenta una secuencia de pantallazos como video continuo

## Paddle conservado
- Se mantienen el componente de precios, BillingProvider, selección mensual/anual, cargador Paddle.js, metadatos y checkout overlay originales
- En `build:preview`, las acciones están claramente marcadas como Paddle Sandbox; rechazan configuración o token live
- Se restituye únicamente la ruta original `/api/paddle/config` al servicio existente. No se despliega ni modifica el backend
- El endpoint Sandbox existente fue verificado: respuesta 200, entorno Sandbox, checkout y aprovisionamiento listos, token público de cliente de prueba y los cuatro price IDs presentes
- El endpoint de producción devuelve 503 en la comprobación actual; no se habilita checkout live en la revisión
- No se realizaron compras, se ingresaron datos de pago ni se probaron webhooks

## Ejecutar

    npm ci
    npm run build:preview

La revisión toma una copia validada del manifiesto oficial de descargas en `dist/review-downloads.json`. Evita cambiar CORS del bucket; el comportamiento de producción sigue leyendo el manifiesto en vivo.

Controles locales (no sustituyen renderizado en navegador):

    npm install --no-save --package-lock=false jsdom
    node qa/check-preview.cjs
    node qa/check-paddle.cjs
    node qa/check-motion.cjs

Los controles Paddle usan un SDK simulado local, sin contactar al proveedor ni crear pagos. La URL de revisión debe verificarse después de su actualización para confirmar el overlay real, animaciones, móvil y navegación.

## Estado y límites

La revisión previa se publicó sólo en el canal temporal `landing-review-20261006`, que vence el 13 de octubre de 2026 a las 22:55 UTC. La revisión de movimiento y Paddle se publicó con autorización en este mismo canal. Se verificaron visualmente el despliegue de ventanas, las órbitas, la pausa y el overlay real marcado Test Mode; no se completó ninguna compra. La siguiente iteración añade el enlace TestFlight proporcionado por el usuario y un tratamiento SVG coherente de plataformas.

Repositorio: `luisberna0324/landing-playworship`. Base original: `a31750867309c10a0a68c1c6e6f78c1dd4bfad2f`. Rama de revisión: `preview/vmpal-review-20261006`. No fusionar ni ejecutar `npm run deploy` para esta revisión.

## TestFlight, precios y caché de revisión
- Invitación proporcionada por el usuario: https://testflight.apple.com/join/TsUWWH1r. El título público de Apple identifica PlayWorship; no se verificaron builds compatibles ni cupos ni se aceptó la invitación
- Mac conserva un instalador estable independiente de su acceso a beta. iOS y Mac enlazan a la misma invitación; TestFlight determina compatibilidad y disponibilidad
- Solo en el build de revisión, el texto deja de calificar los importes como base: el total y los impuestos se consultan en Paddle. Las cifras y la configuración comercial no cambian; un importe de Sandbox no verifica precios live
- El canal de revisión emite no-store y sus marcos de QA incluyen el fingerprint del build. La caché de producción no se cambia

## Iteración del 7 de octubre: dispositivos y apariencia
- Seis siluetas SVG: celulares y tabletas Apple/Android, portátil Windows y escritorio Mac. Conservan las tres velocidades orbitales y las contrarrotaciones
- Selector Claro / Oscuro / Sistema con preferencia persistente, cambios del sistema, navegación por teclado y aplicación antes del primer renderizado
- Fondo del hero con luces suaves y puntos que responden al puntero fino. La entrada se limita a un frame por ráfaga; en táctiles queda el movimiento ambiental. Pausa explícita y preferencia de movimiento reducido
- Paleta clara con superficies blancas, texto oscuro y capturas reales conservadas. El logo original se muestra sobre una pequeña placa oscura para conservar su contraste
- Por petición expresa posterior, se reutiliza el video exacto del hero de producción: `/assets/video/hero-web.mp4`, 108.833 s, 1280×804, H.264 a 24 fps, sin audio. Muestra PlayWorship 1.1.4, el contador y medidores avanzando, Pads Light Ambient cargados y acercamientos posteriores. No se presenta como prueba nueva de la versión actual
- El video usa el poster original, controles nativos, playsInline y preload=none. Solo se reproduce por acción del usuario, también con movimiento reducido
- Verificación local adicional: 13 pruebas del tema y 10 de comportamiento integrado. La revisión visual en navegador y la publicación de esta iteración aún requieren completarse
