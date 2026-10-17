export type DesktopPlatform = 'windows' | 'macos';

export function installationGuideId(platform: DesktopPlatform) {
  return `installation-guide-${platform}`;
}

export function InstallationGuide({ platform, open, onClose }: {
  platform: DesktopPlatform;
  open: boolean;
  onClose: () => void;
}) {
  const mac = platform === 'macos';
  const id = installationGuideId(platform);

  return <section
    id={id}
    className="installation-guide"
    aria-labelledby={`${id}-title`}
    hidden={!open}
    onKeyDown={event => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      }
    }}
  >
    <div className="installation-guide-heading">
      <h3 id={`${id}-title`}>Guía rápida · {mac ? 'macOS' : 'Windows'}</h3>
      <button type="button" className="installation-guide-close" onClick={onClose}>Cerrar guía</button>
    </div>
    <p className="installation-guide-intro">Continúa solo si descargaste el archivo desde <strong>playworship.app</strong> y confías en su procedencia.</p>
    <div className="installation-guide-body">
      {mac ? <ol>
        <li>Abre el archivo <strong>.pkg</strong> descargado. Si se abre, sigue el instalador y luego abre PlayWorship en Aplicaciones.</li>
        <li>Si aparece «desarrollador no identificado» o Apple no puede verificar la app, ve a <strong>Ajustes del Sistema → Privacidad y seguridad → Abrir igualmente</strong>.</li>
        <li>Confirma con <strong>Abrir</strong> y autentícate si se solicita. Después, vuelve al instalador o abre PlayWorship.</li>
      </ol> : <ol>
        <li>Abre el instalador <strong>.exe</strong> descargado y sigue el asistente.</li>
        <li>Si SmartScreen avisa de una app no reconocida con «Windows protegió su PC», selecciona <strong>Más información</strong>.</li>
        <li>Elige <strong>Ejecutar de todas formas</strong> solo si está disponible y confías en el archivo. Continúa con el instalador.</li>
      </ol>}
      <div className="installation-guide-caution">
        <p><strong>Cuándo detenerse.</strong> Si ves una alerta de malware, archivo dañado o de que dañará el equipo, detente y <a href="https://help.playworship.app">solicita soporte</a>.</p>
        <p>{mac
          ? <>Si no aparece <strong>Abrir igualmente</strong>, solicita soporte o una versión firmada.</>
          : <>Si <strong>Smart App Control</strong> bloquea la instalación o no aparece la opción de excepción, solicita soporte o una versión firmada.</>}{' '}Mantén activadas las protecciones del sistema.</p>
      </div>
    </div>
    <div className="installation-guide-sources">
      <span>Fuentes oficiales:</span>{' '}
      {mac ? <a href="https://support.apple.com/es-es/102445">Apple · Abrir apps en el Mac</a> : <>
        <a href="https://learn.microsoft.com/en-us/windows/apps/package-and-deploy/publish-first-app#step-6-handle-smartscreen-for-new-apps">Microsoft · SmartScreen</a>
        <a href="https://support.microsoft.com/en-us/windows/security/threat-malware-protection/smart-app-control-frequently-asked-questions">Microsoft · Smart App Control</a>
      </>}
    </div>
  </section>;
}
