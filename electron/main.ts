import { app, BrowserWindow, Menu } from "electron";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { initDatabase, getIsolatedDataDir } from "./db/database.js";
import { registerIpcHandlers } from "./ipc/handlers.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure application name and isolated persistent user data directory
app.name = "account-vault-desktop";

// Check if running in portable / self-contained folder mode
let isPortable = false;
if (app.isPackaged) {
  try {
    const isAppImage = Boolean(process.env.APPIMAGE);
    // On Windows portable mode, electron-builder provides PORTABLE_EXECUTABLE_DIR
    const isWindowsPortable = Boolean(process.env.PORTABLE_EXECUTABLE_DIR);
    const exeDir =
      process.env.PORTABLE_EXECUTABLE_DIR || path.dirname(app.getPath("exe"));
    const portableMarker = path.join(exeDir, ".portable");
    const portableDataDir = path.join(exeDir, "data");

    // AppImage mounts to temporary /tmp, so it should use permanent XDG storage.
    // Standalone folder & Windows portable use local ./data directory when .portable, data/, or PORTABLE_EXECUTABLE_DIR exists.
    if (
      !isAppImage &&
      (isWindowsPortable ||
        process.argv.includes("--portable") ||
        fs.existsSync(portableMarker) ||
        fs.existsSync(portableDataDir))
    ) {
      isPortable = true;
      const portableAppData = path.join(portableDataDir, "app-data");
      const portableUserData = path.join(portableDataDir, "user-data");
      if (!fs.existsSync(portableAppData)) {
        fs.mkdirSync(portableAppData, { recursive: true });
      }
      if (!fs.existsSync(portableUserData)) {
        fs.mkdirSync(portableUserData, { recursive: true });
      }

      // If portable sqlite database doesn't exist yet, check if existing standard user database exists to migrate
      const portableDb = path.join(portableAppData, "records.sqlite");
      if (!fs.existsSync(portableDb)) {
        try {
          const standardDb = path.join(
            app.getPath("userData"),
            "app-data",
            "records.sqlite",
          );
          if (fs.existsSync(standardDb)) {
            fs.copyFileSync(standardDb, portableDb);
            console.log(
              "[Main] Migrated existing user database to portable storage:",
              portableDb,
            );
          }
        } catch {}
      }

      process.env.APP_DATA_DIR = portableAppData;
      app.setPath("userData", portableUserData);
      console.log(
        "[Main] Running in self-contained portable mode at:",
        portableDataDir,
      );
    }
  } catch (err) {
    console.warn("[Main] Error checking portable mode:", err);
  }
}

// When running packaged standard mode, persist isolated database to standard XDG user config directory
if (app.isPackaged && !isPortable && !process.env.APP_DATA_DIR) {
  try {
    const standardUserData = app.getPath("userData");
    const isolatedDir = path.join(standardUserData, "app-data");
    if (!fs.existsSync(isolatedDir)) {
      fs.mkdirSync(isolatedDir, { recursive: true });
    }
    process.env.APP_DATA_DIR = isolatedDir;
  } catch (err) {
    console.warn(
      "[Main] Could not create standard user-data directory, using fallback:",
      err,
    );
  }
}

const dataDir = getIsolatedDataDir();
if (!app.isPackaged) {
  const userDataPath = path.join(dataDir, "user-data");
  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true });
  }
  app.setPath("userData", userDataPath);
}

let mainWindow: BrowserWindow | null = null;

const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;

async function createWindow() {
  const isWin = process.platform === "win32";
  const iconPath = isWin
    ? path.join(__dirname, "../dist/icon.ico")
    : path.join(__dirname, "../dist/android-chrome-512x512.png");

  mainWindow = new BrowserWindow({
    width: 1240,
    height: 820,
    minWidth: 960,
    minHeight: 640,
    backgroundColor: "#0a0a0a",
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    show: false,
    title: isWin
      ? "Account Vault - Storage Catalog (Windows)"
      : "Account Vault - Storage Catalog (Linux Native)",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  });

  // Remove default window menu for native flat minimalist desktop UI
  Menu.setApplicationMenu(null);

  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });

  const distPath = path.join(__dirname, "../dist/index.html");

  if (process.env.VITE_DEV_SERVER_URL) {
    try {
      await mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    } catch (err) {
      console.warn(
        "[Main] Failed to connect to dev server URL, falling back to dist/index.html:",
        err,
      );
      if (fs.existsSync(distPath)) {
        await mainWindow.loadFile(distPath);
      }
    }
  } else if (fs.existsSync(distPath)) {
    await mainWindow.loadFile(distPath);
  } else {
    try {
      await mainWindow.loadURL("http://localhost:5173");
    } catch {
      console.error(
        "[Main] Neither dist/index.html nor dev server is reachable.",
      );
    }
  }

  mainWindow.on("closed", () => {
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

    if (process.env.HEADLESS_TEST === "true") {
      console.log(
        "[TEST] Desktop window created and DB initialized successfully!",
      );
      setTimeout(() => {
        app.quit();
      }, 500);
    }
  } catch (err) {
    console.error("Fatal initialization error:", err);
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
