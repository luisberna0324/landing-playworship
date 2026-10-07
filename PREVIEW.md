# PlayWorship · revisión de landing

Rama `preview/vmpal-review-20261006`. Canal temporal `landing-review-20261006`, vigente hasta el 13 de octubre de 2026 a las 22:55 UTC. No fusionar ni ejecutar `npm run deploy` para esta revisión.

## Apariencia

- Temas Claro / Oscuro / Sistema, persistencia y aplicación antes del primer renderizado
- Tres ventanas de producto que se despliegan al desplazarse, apariciones suaves y header translúcido
- Seis iconos de plataforma con una pequeña insignia de computador, tableta o teléfono, usando los glifos originales
- Órbitas de 46/70/96 segundos en escritorio; período compartido de 72 segundos en pantallas estrechas para mantener las insignias separadas
- Fondo original de formas fluidas en verde y una estela local de caracteres ASCII al mover el puntero, inspirado en la composición observada en https://agent.minimax.io/download
- Sin botones de pausa para la decoración, por petición del usuario. Se mantiene la preferencia de movimiento reducido, el tratamiento táctil y la suspensión fuera de pantalla/pestaña

## Videos reales existentes

Se reutilizan exactamente los archivos de la página de producción; no son pruebas nuevas de la versión actual.

- Hero: `hero-web.mp4`, 108.833 segundos, 1280×804, 24 fps, sin audio. Muestra PlayWorship 1.1.4, biblioteca, mezcla y Pads. Presentación sin marco añadido
- Móvil: `mobileNativo-web.mp4`, 77.292 segundos, 1280×1280, 24 fps, sin audio. Se conserva el cuadro completo y su fondo azul original. Se reproduce desde el inicio y conserva las vistas horizontal y vertical del recorrido original
- Setlists: `setslistosservicio-web.mp4`, 21.13 segundos, 1280×862
- Secciones: `secciones-web.mp4`, 39.38 segundos, 1280×870
- Ruteo: `salidasseparadas-web.mp4`, 13.58 segundos, 1280×828. Muestra asignación de canales, no verifica salidas físicas ni audio

El reproductor carga cerca de la pantalla y solicita reproducción automática silenciada cuando es visible. Conserva controles nativos, pausa fuera de vista y respeta la pausa manual. Con movimiento reducido o bloqueo de autoplay ofrece reproducción manual. La galería monta únicamente el clip seleccionado.

## Integración conservada

- Paddle mantiene BillingProvider, selección mensual/anual, metadatos y overlay originales. La revisión fuerza Sandbox y rechaza configuración live
- Únicamente la ruta pública original `/api/paddle/config` apunta al servicio existente. No se modifica backend, IAM, Auth, facturación ni producción
- Los importes y la configuración comercial no cambian. El texto de revisión pide comprobar total e impuestos en Paddle; valores Sandbox no verifican precios live
- Descargas estables desde el manifiesto oficial. TestFlight exacto proporcionado por el usuario: https://testflight.apple.com/join/TsUWWH1r; Mac estable permanece separado de la beta
- El HTML de revisión usa no-store y los marcos de QA incluyen una huella del HTML completo del build. Los videos originales conservan caché pública de una hora para admitir reproducción y búsquedas por rango

## Ejecutar y verificar

    npm ci
    npm run build:preview
    node --test scripts/test-theme.mjs scripts/test-production-video.mjs
    node qa/check-preview.cjs
    node qa/check-appearance.cjs
    node qa/check-motion.cjs
    node qa/check-paddle.cjs

Los controles de DOM requieren jsdom. Las pruebas Paddle usan un SDK simulado local y no crean pagos. El renderizado final se verifica en la URL aislada, en escritorio y marcos adaptables de 320/390/768 px. No sustituye pruebas en teléfonos físicos. El canal live debe conservar su versión anterior en cada despliegue.
