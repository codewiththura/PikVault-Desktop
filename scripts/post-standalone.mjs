import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const sourceDir = path.join(rootDir, 'release', 'linux-unpacked');
const targetDir = path.join(rootDir, 'release', 'PikVault-linux-x64');

// 1. Verify source directory exists
if (!fs.existsSync(sourceDir)) {
  console.error('[Post-Build Error] release/linux-unpacked does not exist. Run electron-builder --linux dir first.');
  process.exit(1);
}

// 2. Safely preserve existing user data across rebuilds
const targetDataDir = path.join(targetDir, 'data');
const sourceDataDir = path.join(sourceDir, 'data');
const backupDataDir = path.join(os.tmpdir(), `pikvault-data-backup-${Date.now()}`);
let hasExistingData = false;

if (fs.existsSync(targetDataDir)) {
  console.log(`[Post-Build] Preserving existing user data from ${targetDataDir}...`);
  fs.cpSync(targetDataDir, backupDataDir, { recursive: true });
  hasExistingData = true;
} else if (fs.existsSync(sourceDataDir)) {
  console.log(`[Post-Build] Preserving existing user data from ${sourceDataDir}...`);
  fs.cpSync(sourceDataDir, backupDataDir, { recursive: true });
  hasExistingData = true;
}

// 3. Sync unpacked files to distribution folder
console.log(`[Post-Build] Syncing standalone distribution to ${targetDir}...`);
if (fs.existsSync(targetDir)) {
  fs.rmSync(targetDir, { recursive: true, force: true });
}
fs.cpSync(sourceDir, targetDir, { recursive: true });

// 4. Restore preserved user data so user entries are NEVER lost
if (hasExistingData && fs.existsSync(backupDataDir)) {
  console.log(`[Post-Build] Restoring preserved user data to ${targetDataDir}...`);
  fs.cpSync(backupDataDir, targetDataDir, { recursive: true });
  try {
    fs.rmSync(backupDataDir, { recursive: true, force: true });
  } catch {}
}

// 5. Ensure .portable marker file exists
const portableFile = path.join(targetDir, '.portable');
fs.writeFileSync(portableFile, '');

// 6. Create start.sh convenience launcher script
const startSh = path.join(targetDir, 'start.sh');
fs.writeFileSync(
  startSh,
  `#!/usr/bin/env bash
# ==============================================================================
# PikVault Standalone Launcher
# Standalone Linux Desktop Account & Storage Catalog App
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "\${BASH_SOURCE[0]}")" && pwd)"

# Ensure ELF binary has execution permissions
if [ -f "$SCRIPT_DIR/PikVault" ] && [ ! -x "$SCRIPT_DIR/PikVault" ]; then
  chmod +x "$SCRIPT_DIR/PikVault"
fi

# Launch PikVault in self-contained portable mode
exec "$SCRIPT_DIR/PikVault" --portable "$@"
`,
  { mode: 0o755 }
);
try {
  fs.chmodSync(startSh, 0o755);
} catch {}

// 7. Ensure native ELF binary has execution permission
const binaryPath = path.join(targetDir, 'PikVault');
if (fs.existsSync(binaryPath)) {
  try {
    fs.chmodSync(binaryPath, 0o755);
  } catch {}
}

// 8. Copy application icon
const iconSrc = path.join(rootDir, 'public', 'android-chrome-512x512.png');
const iconDst = path.join(targetDir, 'icon.png');
if (fs.existsSync(iconSrc)) {
  fs.copyFileSync(iconSrc, iconDst);
}

// 9. Create PikVault.desktop entry
const desktopFile = path.join(targetDir, 'PikVault.desktop');
fs.writeFileSync(
  desktopFile,
  `[Desktop Entry]
Name=PikVault
Comment=Standalone Linux Desktop Account & Storage Catalog App
Exec=bash -c '"$(dirname "%k")/start.sh"'
Icon=account-vault-desktop
Terminal=false
Type=Application
Categories=Utility;Database;
StartupWMClass=PikVault
`
);

// 10. Write user guide README.txt
const readmeFile = path.join(targetDir, 'README.txt');
fs.writeFileSync(
  readmeFile,
  `================================================================================
PikVault - Standalone (Self-Contained) Linux x86_64 Desktop Application
================================================================================

This directory contains a 100% self-contained, standalone distribution of PikVault.
It bundles the Electron runtime, Chromium engine, WebAssembly SQLite database,
and all required dynamic libraries (.so).

No installation of Node.js, npm, or Electron is needed on the target computer.

DATA PERSISTENCE GUARANTEE:
---------------------------
Your database and account records are stored in:
  ./data/app-data/records.sqlite

Rebuilding or updating the project with 'npm run build:standalone' automatically
preserves this data directory so your accounts and items are NEVER lost across updates.

HOW TO RUN:
-----------
Option 1: Quick Launcher Script (Self-Contained Portable Mode)
  chmod +x start.sh
  ./start.sh

Option 2: Direct ELF Binary Execution
  chmod +x PikVault
  ./PikVault

SELF-CONTAINED / PORTABLE STORAGE:
----------------------------------
By default, this standalone folder operates in self-contained portable mode
due to the presence of the '.portable' marker:
- SQLite Database: ./data/app-data/records.sqlite
- Application Cache & State: ./data/user-data/

You can move or copy this entire folder to any Linux PC or USB thumb drive,
and all your cataloged accounts and data items remain self-contained inside!

To run in system mode instead (persisting data to ~/.config/account-vault-desktop),
simply delete the '.portable' file or execute:
  ./PikVault --no-portable
`
);

console.log('✓ [Post-Build] Standalone self-contained distribution successfully created (user data preserved) at: release/PikVault-linux-x64/');
