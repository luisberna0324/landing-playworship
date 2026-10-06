# PlayWorship — propuesta de landing

Propuesta de rediseño inspirada en la claridad y el espacio de VMPal. La versión de revisión se prepara en un canal temporal de Firebase Hosting, separado del canal live. La web de producción permanece sin cambios.

## Qué incluye
- Hero con el logo original, mensaje breve y captura real de la demo «Luz de esperanza»
- Tres beneficios: setlists, secciones y mezclador
- Vista estática real del waveform y minimapa; video continuo pendiente
- Descargas por plataforma; iOS aparece como beta en TestFlight, sin inventar un enlace de invitación
- Planes Local/Cloud, precios y comportamiento de consulta existentes conservados
- Menú móvil con Escape y devolución de foco, imágenes con texto alternativo y preferencia de movimiento reducido

## Abrir
La entrega `PlayWorship-vista-previa.html` es un archivo autónomo: descarga y abre ese archivo en un navegador. Imágenes y estilos están incluidos. Los enlaces externos necesitan internet. No es una URL pública.

Para trabajar sobre el código:

    npm ci
    npm run dev -- --host 127.0.0.1
    npm run build:preview

Para repetir los controles DOM (no necesitan un navegador):

    npm install --no-save --package-lock=false jsdom
    node qa/check-preview.cjs
    python3 qa/package-preview.py
    node qa/check-standalone.cjs

La carpeta `dist` contiene el build estático de producción. El parche `PlayWorship-redesign.patch` se puede revisar y aplicar sobre el repo original en el commit de referencia.

## Verificación
- Compilación TypeScript y build de Vite: correctos
- 16 controles DOM/archivos: correctos (ver `qa/results.json`)
- Capturas reales: waveform, zoom, minimapa y mezclador
- Se retiró la secuencia de pantallazos de la propuesta. No se presenta como video final; falta integrar una grabación continua verificada
- Las capturas no acreditan reproducción de audio: en el entorno cloud el contador permaneció en 00:00 durante esa prueba

El build de revisión usa un snapshot validado del manifiesto oficial de descargas en su propio dominio para evitar cambiar CORS del bucket. No incluye checkout ni conexión con Cloud Run.

Pendiente: inspección visual en escritorio y móvil, navegación real con teclado/touch y verificación de transferencias de descarga. El navegador disponible rechazó la dirección local con `net::ERR_BLOCKED_BY_CLIENT`; no se eludió la restricción. Los controles DOM no sustituyen esas pruebas de navegador.

## Origen y límites de esta copia
Snapshot de `luisberna0324/landing-playworship`, main `a31750867309c10a0a68c1c6e6f78c1dd4bfad2f`, 6 de octubre de 2026. Rama local: `preview/vmpal-inspired-20261006`. Es una copia preparada desde el contenido del repositorio, sin su historial Git remoto.

Se incluyeron los assets utilizados por este diseño. Los videos/GIF antiguos no utilizados y la APK Android de 38 MB no se copiaron al paquete. El repo original conserva esos archivos. El manifiesto de descargas sigue siendo la fuente de disponibilidad; el HTML autónomo enlaza los recursos legales y la APK alternativa al dominio existente.

Antes de publicar: revisar el diseño renderizado, comprobar disponibilidad y enlaces actuales, confirmar el acceso público a TestFlight si se desea un botón directo y ejecutar las pruebas visuales pendientes. No ejecutar `npm run deploy` sin autorización.
