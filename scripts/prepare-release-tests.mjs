import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {dirname} from 'node:path';
import ts from 'typescript';
for (const file of ['releases/releaseSummary.ts','hooks/useReleaseSummary.ts','hooks/useDownloads.ts','appLinks.ts','components/ReleaseNotesLink.tsx','components/Downloads.tsx','components/PlatformIcon.tsx','components/InstallationGuide.tsx']) {
  let input = await readFile('src/' + file, 'utf8');
  input = input.replace("import snapshot from '../generated/release-summary.json';", 'const snapshot = ' + await readFile('src/generated/release-summary.json', 'utf8') + ';');
  input = input.replace(/import '\.\/ReleaseNotesLink\.css';/, '');
  input = input.replaceAll('import.meta.env.VITE_REVIEW_PREVIEW', "'false'").replaceAll('import.meta.env.DEV', 'false');
  let {outputText} = ts.transpileModule(input, {compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.ESNext,jsx:ts.JsxEmit.ReactJSX}});
  outputText = outputText.replace(/from '(\.[^']+)'/g, "from '$1.mjs'");
  const output = '.test-build/' + file.replace(/\.tsx?$/, '.mjs');
  await mkdir(dirname(output), {recursive:true});await writeFile(output, outputText);
}
