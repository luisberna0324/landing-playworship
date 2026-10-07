import { PlatformIcon } from './PlatformIcon';

type Device = 'desktop' | 'laptop' | 'tablet' | 'phone';
type DevicePlatform = 'apple' | 'windows' | 'android';

/** Decorative hardware silhouettes; the surrounding copy names supported platforms. */
export function DeviceIcon({ device, platform }: { device: Device; platform: DevicePlatform }) {
  return <span className={`device-icon device-icon-${device}`} aria-hidden="true">
    <svg className="device-frame" viewBox="0 0 96 96" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" focusable="false">
      {device === 'desktop' && <>
        <path className="device-shell" d="M40 67v13l-9 5h34l-9-5V67" />
        <rect className="device-shell" x="5" y="11" width="86" height="59" rx="5" />
        <rect className="device-screen" x="10" y="16" width="76" height="44" rx="2" />
        <path className="device-detail" d="M44 65h8M28 86h40" />
      </>}
      {device === 'laptop' && <>
        <rect className="device-shell" x="11" y="13" width="74" height="54" rx="5" />
        <rect className="device-screen" x="16" y="18" width="64" height="43" rx="2" />
        <path className="device-shell" d="M11 67h74l8 12c1 2-1 5-4 5H7c-3 0-5-3-4-5l8-12Z" />
        <path className="device-detail" d="M6 79h84M36 68l-2 5h28l-2-5" />
      </>}
      {device === 'tablet' && <>
        <rect className="device-shell" x="16" y="3" width="64" height="90" rx="9" />
        <rect className="device-screen" x="21" y="11" width="54" height="73" rx="3" />
        <circle className="device-camera" cx="48" cy="7" r=".9" />
        <path className="device-detail" d="M42 88h12" />
      </>}
      {device === 'phone' && <>
        <rect className="device-shell" x="25" y="3" width="46" height="90" rx="10" />
        <rect className="device-screen" x="29" y="8" width="38" height="79" rx="6" />
        <path className="device-notch" d="M40 8h16v3a3 3 0 0 1-3 3H43a3 3 0 0 1-3-3V8Z" />
        <path className="device-detail" d="M42 82h12" />
        <path d="M23 22v8m50-6v12" />
      </>}
    </svg>
    <span className="device-platform"><PlatformIcon platform={platform} /></span>
  </span>;
}
