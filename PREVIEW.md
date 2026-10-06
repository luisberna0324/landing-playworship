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

La revisión previa se publicó sólo en el canal temporal `landing-review-20261006`, que vence el 13 de octubre de 2026 a las 22:55 UTC. Esta segunda revisión de movimiento y Paddle se prepara localmente y necesita confirmación de publicación antes de sustituir la versión anterior.

Repositorio: `luisberna0324/landing-playworship`. Base original: `a31750867309c10a0a68c1c6e6f78c1dd4bfad2f`. Rama de revisión: `preview/vmpal-review-20261006`. No fusionar ni ejecutar `npm run deploy` para esta revisión.
