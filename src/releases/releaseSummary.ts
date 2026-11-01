export type ReleaseSummary = {
  version: string; publishedAt: string; title: string; summary: string;
  highlights: string[]; platforms: string[]; detailsFile: string; statusFile: string;
};
export const RELEASE_SUMMARY_URL = 'https://storage.googleapis.com/download/storage/v1/b/adoracion-studio-installers-20260516-28602/o/installers%2Frelease-notes%2Flatest.json?alt=media';
const text = (v: unknown, max: number): v is string => typeof v === 'string' && !!v.trim() && v.length <= max;
export function parseReleaseSummary(input: unknown): ReleaseSummary {
  if (!input || typeof input !== 'object') throw new Error('Invalid release summary');
  const value = input as {schemaVersion?: unknown; release?: unknown};
  if (value.schemaVersion !== 2 || !value.release || typeof value.release !== 'object') throw new Error('Invalid release summary');
  const r = value.release as Record<string, unknown>;
  if (typeof r.version !== 'string' || !/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(r.version) || !text(r.title, 180) || !text(r.summary, 600)) throw new Error('Invalid release text');
  if (typeof r.publishedAt !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(r.publishedAt) || !Number.isFinite(Date.parse(r.publishedAt)) || new Date(r.publishedAt).toISOString().slice(0, 10) !== r.publishedAt.slice(0, 10)) throw new Error('Invalid release date');
  if (!Array.isArray(r.highlights) || !r.highlights.length || r.highlights.length > 3 || r.highlights.some(item => !text(item, 180))) throw new Error('Invalid highlights');
  if (!Array.isArray(r.platforms) || !r.platforms.length || new Set(r.platforms).size !== r.platforms.length || r.platforms.some(p => !['windows', 'macos', 'android', 'ios'].includes(p))) throw new Error('Invalid platforms');
  if (r.detailsFile !== `versions/${r.version}.json` || r.statusFile !== `status/${r.version}.json` || 'changes' in r || 'distribution' in r) throw new Error('Summary must not contain full details or availability');
  return r as ReleaseSummary;
}
export const helpReleaseURL = (version: string) => {
  if (!/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(version)) throw new Error('Invalid release version');
  return `https://help.playworship.app/?version=${version}#novedades`;
};
export function newerOrEqual(a: string, b: string): boolean {
  const x = a.split('.').map(Number), y = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] > y[i];
  return true;
}
export async function fetchReleaseSummary(signal: AbortSignal, request: typeof fetch = fetch): Promise<ReleaseSummary> {
  const response = await request(RELEASE_SUMMARY_URL, {signal, credentials: 'omit'});
  if (!response.ok) throw new Error('Release summary unavailable');
  const body = await response.text();
  if (body.length > 16 * 1024) throw new Error('Oversized release summary');
  return parseReleaseSummary(JSON.parse(body));
}
