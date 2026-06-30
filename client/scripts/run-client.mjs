import { existsSync } from 'fs';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientRoot = path.resolve(__dirname, '..');
const command = process.argv[2] || 'start';

const isRenderRuntime = Boolean(process.env.RENDER || process.env.RENDER_EXTERNAL_URL);
const isProductionRuntime = process.env.NODE_ENV === 'production';
const shouldUseDevServer = (command === 'start' || command === 'dev') && !isRenderRuntime && !isProductionRuntime;
const shouldServeBuiltAssets = command === 'preview' || isRenderRuntime || isProductionRuntime;

const run = (bin, args) => {
  return new Promise((resolve, reject) => {
    const child = spawn(bin, args, {
      cwd: clientRoot,
      stdio: 'inherit',
      shell: true,
      env: process.env,
    });

    child.on('exit', (code, signal) => {
      if (signal) {
        process.kill(process.pid, signal);
        return;
      }

      if (code && code !== 0) {
        reject(new Error(`${bin} ${args.join(' ')} exited with code ${code}`));
        return;
      }

      resolve();
    });
  });
};

const main = async () => {
  if (shouldUseDevServer) {
    await run('webpack', ['serve', '--mode', 'development']);
    return;
  }

  if (!shouldServeBuiltAssets) {
    await run('webpack', ['serve', '--mode', 'development']);
    return;
  }

  const shouldForceBuild = command === 'preview' && !isRenderRuntime;

  if (shouldForceBuild || !existsSync(path.resolve(clientRoot, 'dist', 'index.html'))) {
    await run('npm', ['run', 'build']);
  }

  const port = command === 'preview' && !isRenderRuntime && !isProductionRuntime
    ? '4173'
    : (process.env.PORT || '10000');
  await run('serve', ['-s', 'dist', '-l', `tcp://0.0.0.0:${port}`]);
};

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});