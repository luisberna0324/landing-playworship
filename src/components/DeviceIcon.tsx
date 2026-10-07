import { PlatformIcon, type PlatformDevice } from './PlatformIcon';

type DevicePlatform = 'apple' | 'windows' | 'android';

/** Platform tile with a small hardware badge, matching the download icons. */
export function DeviceIcon({ device, platform }: { device: PlatformDevice; platform: DevicePlatform }) {
  return <span className={`device-icon device-icon-${device}`} aria-hidden="true">
    <PlatformIcon platform={platform} device={device} />
  </span>;
}
