import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

test('Electron Desktop App Launch Test', async () => {
  await new Promise((resolve, reject) => {
    const child = spawn('npx', ['electron', '--no-sandbox', '.'], {
      stdio: 'ignore',
      env: {
        ...process.env,
        HEADLESS_TEST: 'true',
      },
    });

    child.on('exit', (code) => {
      assert.ok(code === 0 || code === null, `Expected exit code 0, got ${code}`);
      resolve(true);
    });

    child.on('error', (err) => {
      reject(err);
    });

    setTimeout(() => {
      try {
        child.kill();
      } catch {}
      resolve(true);
    }, 4000);
  });
});
