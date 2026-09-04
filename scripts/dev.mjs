import { spawn } from 'node:child_process';
import { createServer } from 'vite';

async function start() {
  console.log('[Dev] Starting Vite dev server...');
  const server = await createServer({
    configFile: './vite.config.ts',
  });
  await server.listen();

  const address = server.httpServer?.address();
  const port = typeof address === 'object' && address ? address.port : 5173;
  const devUrl = `http://localhost:${port}`;
  console.log(`[Vite] Dev server listening on ${devUrl}`);

  console.log('[Dev] Compiling electron main & preload with TypeScript...');
  // Build electron main/preload first
  const compile = spawn('npx', ['tsc', '-p', 'tsconfig.electron.json'], {
    stdio: 'inherit',
    shell: true,
  });

  compile.on('exit', (code) => {
    if (code !== 0) {
      console.error('[Dev] Electron TypeScript compilation failed.');
      return;
    }

    console.log('[Dev] Starting Electron native window...');
    const electron = spawn('npx', ['electron', '--no-sandbox', '.'], {
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        NODE_ENV: 'development',
        VITE_DEV_SERVER_URL: devUrl,
      },
    });

    electron.on('exit', () => {
      console.log('[Dev] Electron window closed. Cleaning up...');
      server.close();
      process.exit(0);
    });
  });
}

start().catch((err) => {
  console.error('[Dev] Failed to start development environment:', err);
  process.exit(1);
});
