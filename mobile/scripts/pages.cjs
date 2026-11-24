const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const basePath = (process.env.BANSURI_WEB_BASE_PATH ?? '/BansuriMapper').replace(/\/$/, '');
if (basePath && (!/^\/[A-Za-z0-9._-]+(?:\/[A-Za-z0-9._-]+)*$/.test(basePath) || basePath.split('/').some(part => part === '.' || part === '..'))) {
  throw new Error('Invalid BANSURI_WEB_BASE_PATH.');
}
const env = {
  ...process.env,
  BANSURI_WEB_BASE_PATH: basePath,
  BANSURI_PREVIEW_BASE_PATH: basePath,
  BANSURI_PREVIEW_DIR: 'dist-pages',
  EXPO_NO_TELEMETRY: '1',
};
function run(args) {
  const result = spawnSync(process.execPath, args, { cwd: root, env, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

switch (process.argv[2]) {
  case 'build': {
    const expo = path.join(path.dirname(require.resolve('expo/package.json')), 'bin', 'cli');
    run([expo, 'export', '--platform', 'web', '--output-dir', 'dist-pages']);
    const output = path.join(root, 'dist-pages');
    if (!fs.existsSync(path.join(output, 'index.html'))) throw new Error('Static HTML export is missing.');
    fs.writeFileSync(path.join(output, '.nojekyll'), '');
    console.log(`GitHub Pages site: ${output} (base path: ${basePath || '/'})`);
    break;
  }
  case 'test':
    run([require.resolve('@playwright/test/cli'), 'test']);
    break;
  case 'serve':
    run([path.join(__dirname, 'serve-preview.cjs')]);
    break;
  default:
    throw new Error('Usage: node scripts/pages.cjs build|test|serve');
}
