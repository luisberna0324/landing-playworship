import { spawnSync } from 'node:child_process';

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: 'utf8', ...options });
  if (result.status !== 0) throw new Error(result.stderr?.trim() || `${command} failed`);
  return result.stdout?.trim() || '';
}

try {
  run('git', ['fetch', 'origin', 'main']);
  const branch = run('git', ['branch', '--show-current']);
  const commit = run('git', ['rev-parse', 'HEAD']);
  if (branch !== 'main' || commit !== run('git', ['rev-parse', 'origin/main'])) {
    throw new Error('Deploy stopped: main must match the latest origin/main. Integrate and push first.');
  }
  const changes = run('git', ['status', '--porcelain', '--untracked-files=no'])
    .split('\n').filter(line => line && !line.endsWith('.DS_Store'));
  const untrackedCode = run('git', ['ls-files', '--others', '--exclude-standard', '--', 'src', 'scripts', 'qa']);
  if (changes.length || untrackedCode) throw new Error('Deploy stopped: commit source changes before publishing.');
  console.log(`Publishing main ${commit} with Paddle Live; review mode disabled.`);
  if (process.argv.includes('--check')) process.exit(0);
  const env = { ...process.env, VITE_CLOUD_CHECKOUT_ENABLED: 'true', VITE_REVIEW_PREVIEW: 'false' };
  run('npm', ['run', 'build'], { env, stdio: 'inherit' });
  run('firebase', ['deploy', '--project', 'play-worship', '--only', 'hosting', '--message', `Landing main ${commit}`], { env, stdio: 'inherit' });
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
