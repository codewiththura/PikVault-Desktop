import { app, BrowserWindow, Menu } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initDatabase, getIsolatedDataDir } from './db/database.js';
import { registerIpcHandlers } from './ipc/handlers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure application name and isolated persistent user data directory
app.name = 'account-vault-desktop';
const dataDir = getIsolatedDataDir();
const userDataPath = path.join(dataDir, 'user-data');
if (!fs.existsSync(userDataPath)) {
  fs.mkdirSync(userDataPath, { recursive: true });
}
app.setPath('userData', userDataPath);

let mainWindow: BrowserWindow | null = null;


const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1240,
    height: 820,
    minWidth: 960,
    minHeight: 640,
    backgroundColor: '#0a0a0a',
    show: false,
    title: 'Account Vault - Storage Catalog (Linux Native)',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  });

  // Remove default window menu for native flat minimalist desktop UI
  Menu.setApplicationMenu(null);

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  const distPath = path.join(__dirname, '../dist/index.html');

  if (process.env.VITE_DEV_SERVER_URL) {
    try {
      await mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    } catch (err) {
      console.warn('[Main] Failed to connect to dev server URL, falling back to dist/index.html:', err);
      if (fs.existsSync(distPath)) {
        await mainWindow.loadFile(distPath);
      }
    }
  } else if (fs.existsSync(distPath)) {
    await mainWindow.loadFile(distPath);
  } else {
    try {
      await mainWindow.loadURL('http://localhost:5173');
    } catch {
      console.error('[Main] Neither dist/index.html nor dev server is reachable.');
    }
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  try {
    // Initialize isolated SQLite database
    await initDatabase();
    // Register IPC handlers
    registerIpcHandlers();
    // Create Desktop Window
    await createWindow();

    if (process.env.HEADLESS_TEST === 'true') {
      console.log('[TEST] Desktop window created and DB initialized successfully!');
      setTimeout(() => {
        app.quit();
      }, 500);
    }
  } catch (err) {
    console.error('Fatal initialization error:', err);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
