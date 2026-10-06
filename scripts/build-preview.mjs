// Produces only a static review build. Does not deploy or change production settings.
import { spawnSync } from 'node:child_process';
import { writeFile, readFile } from 'node:fs/promises';
const built = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'build'], {
  stdio: 'inherit', env: { ...process.env, VITE_REVIEW_PREVIEW: 'true' },
});
if (built.status !== 0) process.exit(built.status || 1);
const source = 'https://storage.googleapis.com/adoracion-studio-installers-20260516-28602/installers/latest.json';
const response = await fetch(source, { signal: AbortSignal.timeout(20000) });
if (!response.ok) throw new Error(`Download manifest: ${response.status}`);
const manifest = await response.json();
if (!/^\d+\.\d+\.\d+$/.test(manifest.version) || !manifest.platforms) throw new Error('Invalid download manifest');
for (const platform of ['macos', 'windows', 'android']) {
  const item = manifest.platforms[platform];
  const url = new URL(item?.url);
  if (!item.available || url.protocol !== 'https:' || url.hostname !== 'storage.googleapis.com' || !url.pathname.startsWith('/adoracion-studio-installers-20260516-28602/installers/')) throw new Error(`Invalid ${platform} download`);
}
if (manifest.platforms.ios?.available !== false) throw new Error('iOS availability needs review');
await writeFile('dist/review-downloads.json', JSON.stringify(manifest, null, 2) + '\n');
console.log(`Review download snapshot: v${manifest.version}. Production still reads the live manifest.`);

const index = await readFile('dist/index.html', 'utf8');
const build = index.match(/src="[^" ]*\/index-([^" ]+)\.js"/)?.[1];
if (!build) throw new Error('Missing preview build fingerprint');
const frame = await readFile('qa/review-frame.html', 'utf8');
await writeFile('dist/review-qa.html', frame.replaceAll('__PREVIEW_BUILD__', build));
const pricing = await readFile('dist/precios.html', 'utf8');
const original = 'Los importes Cloud son precios base en USD. Paddle calcula los impuestos aplicables y muestra el total antes de confirmar el pago.';
if (!pricing.includes(original)) throw new Error('Review pricing copy needs inspection');
await writeFile('dist/precios.html', pricing.replace(original, 'Los importes Cloud se muestran en USD. Revisa el total y los impuestos aplicables en Paddle antes de confirmar.'));
console.log(`Review QA build: ${build}. Review pricing wording updated; production source unchanged.`);
