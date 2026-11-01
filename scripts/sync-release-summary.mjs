import {readFile, writeFile, mkdir, rename} from 'node:fs/promises';
import {parseReleaseSummary, RELEASE_SUMMARY_URL} from '../.test-build/releases/releaseSummary.mjs';
let input;
if (process.argv[2]) input = await readFile(process.argv[2], 'utf8');
else {
  const response = await fetch(RELEASE_SUMMARY_URL, {signal: AbortSignal.timeout(8000)});
  if (!response.ok) throw new Error(`Release summary returned ${response.status}; snapshot preserved`);
  input = await response.text();
}
if (input.length > 16 * 1024) throw new Error('Oversized release summary');
const release = parseReleaseSummary(JSON.parse(input));
await mkdir('src/generated', {recursive: true});
await writeFile('src/generated/release-summary.json.tmp', JSON.stringify({schemaVersion: 2, release}, null, 2) + '\n');
await rename('src/generated/release-summary.json.tmp', 'src/generated/release-summary.json');
console.log(`Synchronized summary ${release.version}; no detailed notes or availability bundled`);
