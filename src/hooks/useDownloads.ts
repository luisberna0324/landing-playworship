import { useEffect, useState } from 'react';

const MANIFEST_URL = import.meta.env.DEV
  ? '/api/downloads/latest.json'
  : 'https://storage.googleapis.com/adoracion-studio-installers-20260516-28602/installers/latest.json';

type PlatformDownload = {
  available: boolean;
  url?: string;
  format?: string;
};

type DownloadManifest = {
  version: string;
  platforms: {
    macos: PlatformDownload;
    windows: PlatformDownload;
    android: PlatformDownload;
    ios: PlatformDownload;
  };
};

const fallback: DownloadManifest = {
  version: '2.0.2',
  platforms: {
    macos: {
      available: true,
      url: 'https://storage.googleapis.com/adoracion-studio-installers-20260516-28602/installers/macos/v2.0.2/playworship-macos-installer-2.0.2.pkg',
      format: 'pkg',
    },
    windows: {
      available: true,
      url: 'https://storage.googleapis.com/adoracion-studio-installers-20260516-28602/installers/windows/v2.0.2/playworship-windows-installer-2.0.2-x64.exe',
      format: 'exe',
    },
    android: { available: true, url: '/downloads/playworship-android-beta.apk', format: 'apk' },
    ios: { available: false },
  },
};

function isValidDownload(platform: unknown): platform is PlatformDownload {
  if (!platform || typeof platform !== 'object') return false;
  const item = platform as PlatformDownload;
  if (typeof item.available !== 'boolean') return false;
  if (!item.available) return true;
  if (typeof item.url !== 'string') return false;
  try {
    const url = new URL(item.url);
    return url.protocol === 'https:' &&
      url.hostname === 'storage.googleapis.com' &&
      url.pathname.startsWith('/adoracion-studio-installers-20260516-28602/installers/');
  } catch {
    return false;
  }
}

function isValidManifest(value: unknown): value is DownloadManifest {
  if (!value || typeof value !== 'object') return false;
  const manifest = value as DownloadManifest;
  return /^\d+\.\d+\.\d+$/.test(manifest.version) &&
    !!manifest.platforms &&
    (['macos', 'windows', 'android'] as const).every((key) =>
      isValidDownload(manifest.platforms[key]) && manifest.platforms[key].available) &&
    isValidDownload(manifest.platforms.ios) && !manifest.platforms.ios.available;
}

export function useDownloads() {
  const [downloads, setDownloads] = useState(fallback);

  useEffect(() => {
    const controller = new AbortController();
    fetch(MANIFEST_URL, { cache: 'no-cache', signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Download manifest: ${response.status}`);
        return response.json();
      })
      .then((value: unknown) => {
        if (isValidManifest(value)) setDownloads(value);
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  return { downloads, usingFallback: downloads === fallback };
}
