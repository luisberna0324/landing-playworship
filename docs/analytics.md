# Analítica de la landing

La propiedad existente es `531045367`, flujo web `14296013740`, etiqueta
`G-T5ZSHD3VT0`. Las APIs Admin y Data habilitan consultas, no recopilan visitas
por sí solas. No se contrata Analytics 360 ni se añaden exportaciones a BigQuery.

`public/analytics.js` se incluye en la landing, precios y páginas legales.
Solo funciona en los dominios públicos de producción. No carga Google antes
del consentimiento. Ambas elecciones tienen igual prominencia y la página
sigue disponible al rechazar. El botón Privacidad permite cambiar la elección.
La preferencia se guarda como `playworship.analytics-consent.v1` en localStorage.
GPC y Do Not Track deshabilitan la medición, incluso con permiso guardado.

Tras aceptar se carga gtag.js una sola vez por documento y se registra una
visita. No se configuran User-ID, correo ni funciones de publicidad/Google
Signals. Las URLs de página y referencia enviadas explícitamente se limpian
de query y hash. Retirar el permiso activa ga-disable, deniega almacenamiento
de analítica y borra cookies _ga accesibles; no borra datos ya recogidos.
La medición es parcial: rechazos, bloqueadores y señales de privacidad no se
cuentan. No hay datos retroactivos de visitas anteriores a esta integración.

Verificación local: `node --test qa/analytics.test.mjs`, `npm run build` y
`git diff --check`. Comprobar además en un navegador la carga y el consentimiento
en escritorio/móvil, y los eventos en Analytics/Tag Assistant tras aceptar.
Una etiqueta publicada no demuestra por sí sola recepción de eventos.

Desplegar con `npm run deploy`: exige main sincronizado con origin/main y
fuentes guardadas, conserva checkout Live y desactiva el modo de review.
