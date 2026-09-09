# Account & Storage Vault (PikVault Desktop)

**PikVault** is a privacy-first, local-first desktop app for managing accounts and cataloging stored files. It allows you to organize account credentials, record metadata for uploaded files (file names, sizes, download links, and notes), and track remaining storage quotas across all your accounts in a single offline workspace.

**PikVault** ဟာ privacy ကို အဓိကထားပြီး မိမိ Local စက်ထဲမှာတင် offline တိုက်ရိုက် အလုပ်လုပ်နိုင်တဲ့ (local-first) account ledger နဲ့ digital storage catalog management tool တစ်ခု ဖြစ်ပါတယ်။ မတူညီတဲ့ Cloud platform တွေမှာ တင်ထားတဲ့ ဖိုင် record ဒေတာတွေကို သက်ဆိုင်ရာ အကောင့် credential တွေနဲ့အတူ၊ လက်ကျန် storage quota တွေကိုပါ တစ်နေရာတည်းမှာ စနစ်တကျ မှတ်တမ်းတင် track လုပ်နိုင်ဖို့ ဖန်တီးထားတာ ဖြစ်ပါတယ်။

<p align="center">
  <img src="https://github.com/user-attachments/assets/1b0f02a6-e1cf-4feb-bccc-8a2082a0a220" alt="PikVault Desktop Main Account Ledger View" width="100%" />
</p>

<p align="center">
  <img src="https://github.com/user-attachments/assets/c224f56e-0abc-407e-9dd3-14df2c001aa9" alt="PikVault Desktop Storage Catalog Grid View" width="100%" />
</p>

---

## Overview & Architecture Concepts

Managing multiple cloud accounts, segmented backup drives, and remote assets often leads to scattered spreadsheets and forgotten credentials. PikVault solves this with two foundational concepts:

1. **Metadata-Only Indexing**: PikVault does not download or store heavy media files locally. It indexes filenames, sizes, thumbnail links, external mirrors, and notes as lightweight structured records.
2. **Deterministic Partition Tracking**: Configured with a custom storage quota tracking engine per account, making it simple to monitor distributed cloud allocations without manual math.
3. **Zero-Dependency Local Persistence**: Built strictly for offline, local-first environments. All records, credentials, and catalog indexes stay isolated on your local disk with zero external API calls, zero native daemon dependencies, and zero setup friction.

---

## User Features

### Account Ledger & Health

- **Credential Management**: Securely track usernames, masked passwords with one-click clipboard copying, and authentication metadata.
- **Relogin Status & Stale Account Alerts**: Converts timestamps to relative indicators (`Just now`, `20 days ago`, `1 month ago`). Accounts inactive for 30 days or longer trigger a prominent red warning and a `Relogin` badge.
- **One-Click Activity Refresh**: Quickly refresh an account's last login to the current date and time directly from the detail pane with safety confirmation prompts.
- **Integrated Password Generator**: Generate cryptographically strong random passwords inside the editor modal.
- **Fast Sorting & Filtering**: Filter accounts instantly by name, email, last login date, remaining storage capacity, or created date.

### Storage Cataloging

- **Allocation Gauges**: Displays remaining space against account storage limits (for example, `4.25 GB remain of 6 GB`).
- **Threshold Warnings**: Highlights visual warning badges when an account reaches or exceeds its allocation ceiling.
- **Rich Asset Records**: Catalog assets with properties including filename, format extension, size in megabytes, external mirror links, notes, and preview images.

### Dual Catalog Views

- **Compact List View**: Dense table layout with sortable columns, responsive text truncation with full hover tooltips, and horizontal/vertical scroll boundaries.
- **Uniform Card Grid View**: Fixed 350px card heights with 140px media preview headers, two-line text clamping, and footer action bars to eliminate layout shifts.
- **In-Account Search**: Quickly locate records inside the currently active account by filename or notes.

### Global Cross-Account Search (`Ctrl+K`)

- Search filenames across every account simultaneously from a single modal.
- Shows ownership details immediately (`Stored in account: user@example.com`).
- Includes a direct "Jump" button to open the target account and highlight the matched record.
- Responsive top-bar search triggers automatically collapse into a compact 32x32px icon button on smaller viewports (960px to 1100px) to prevent UI overflow.

### Customization & Interface Controls

- **Adaptive Themes**: High-contrast Dark and Light modes using a warm terracotta color system.
- **Dynamic Text Sizing**: Interactive interface font scaling (`Small`, `Medium`, `Large`, `X-Large`).
- **Flexible Workspace**: Drag-and-drop resizable sidebar with keyboard accessibility and persistent state storage.

---

## Developer Guide & Technical Details

### 1. Account Records Ledger

- **Credentials & Metadata**: Tracks Username (email), Password (with 1-click clipboard copy and masked/unmasked toggle), and Last Login timestamp.
- **Relative Last Login & Overdue Alerts**: Displays Last Login in human-friendly relative format (e.g. `Just now`, `20 days ago`, `1 month ago`, `2 years ago`). If an account has not been logged into for more than 1 month (>= 30 days), the label turns red (`var(--accent-danger)`) with a high-contrast `Relogin` badge alerting the user to re-authenticate.
- **1-Click "Update to Now" Timestamp Refresh**: Beside the active account's Last Login indicator in the detail pane, an inline **"Update to Now"** action button allows users to immediately stamp the account's `lastLogin` timestamp to the latest current date & time. This immediately clears overdue relogin alerts, recalculates relative timestamps, updates SQLite persistence, and updates account sort ordering.
- **Accidental Modification Safeguards**: Explicit user confirmation prompts (`confirm`) are displayed before committing changes when updating an existing account record or triggering the **"Update to Now"** timestamp refresh, preventing accidental database alterations.
- **Auto Password Generator**: Integrated cryptographic random password generator.
- **Sorting & Filtering**:
  - Instant search by account name or email.
  - Multi-directional sorting by **Name** (`asc`/`desc`), **Last login**, **Storage Remaining**, and **Created Date**.
- **Interactive Resizable Sidebar (`useResizableSidebar` Hook)**:
  - Managed by a clean, modular custom React hook ([`useResizableSidebar.ts`](file:///media/thura/DATA/My%20Folders/My%20Projects/account-vault-desktop/src/hooks/useResizableSidebar.ts)) isolating width clamping, drag tracking, and window event listeners.
  - Drag-and-drop splitter divider between the Account Ledger sidebar and the Detail Pane.
  - Strict min/max width constraints (`min: 260px`, `max: 600px`) preserving master and detail usability across screen sizes.
  - Keyboard accessible (`Left`/`Right` arrow keys adjust by 10px, `Home`/`End` to boundaries) with double-click reset to default width (`380px`).
  - Automatically persists the user's preferred sidebar width across application reloads and restarts (`localStorage`).

### 2. Plain Text Storage Catalog

- **Metadata-Only Architecture**: The application does **not** store heavy multi-gigabyte media on the local physical disk. It stores structured plain-text catalog records.
- **Dynamic Limit Tracking**:
  - Each account has a max storage amount (e.g., `6,144 MB`).
  - Total file size of each item inside the account is aggregated in real time.
  - Computes exact remaining storage (e.g., `4.25 GB remain of 6 GB`).
  - Highlights high-contrast alert badges if recorded files exceed the threshold.

### 3. Stored Data Cataloging & Dual Views

- **Item Fields**:
  - `fileName`: Required file identifier (e.g. `linux-kernel-guide.mp4`).
  - `fileType`: Defaults to `mp4` (supports `mkv`, `zip`, `pdf`, `png`, `jpg`, etc.).
  - `fileSizeMB`: Numeric size in MB/GB.
  - `imageUrl`: Optional thumbnail preview link with 1-click modal expansion.
  - `externalLinks`: Multiple external download/mirror URLs with clickable link badges.
  - `updatedDate`: Formatted date stamp.
  - `note`: Rich descriptive text.
- **Dual Presentation Modes**:
  - **List View**: Dense tabular rows with sortable columns, inline badge tags, note previews, and quick actions with independent vertical and horizontal scrolling. The **File Name** column dynamically shrinks on narrow viewport widths, gracefully truncating long names to a few words with an ellipsis (`...`) while preserving full name inspection via native hover tooltips (`title`).
  - **Grid View & Uniform Card Engine**:
    - **Independent Scroll Container**: Uses `overflow-y: auto`, `min-height: 0`, and `align-content: start` so the item grid scrolls smoothly while keeping the toolbar and header pinned.
    - **Fixed Card Dimensions (`350px`)**: Standardized card height ensuring uniform multi-column alignment across varying screen widths.
    - **Proportional Media Headers**: 140px fixed thumbnail header (with image object-cover or uniform fallback file type badge).
    - **Truncation & Overflow Protection**: Two-line clamped file names and notes with text-overflow ellipsis to prevent cards from overflowing or stretching unevenly.
    - **Responsive Link Trays & Action Bars**: Compact external link pills and pinned action buttons (Edit, Delete) in the card footer.
- **In-Account Search**: Instant local filter by file name or notes within the active account.

### 4. Cross-Account Global Search (`Ctrl+K`)

- Allows users to search for stored data file names across **all accounts simultaneously**.
- Immediately reveals **which account owns each data item** (`Stored in account: user@example.com`).
- Provides a **1-click "Jump" action** that navigates directly into the target account and highlights the matching item.
- Accessible from anywhere in the app via the top header or the `Ctrl+K` hotkey.
- **Responsive Adaptive Search Bar**:
  - On standard and wide window sizes (> 1100px), presents the full search bar button complete with search icon, text label (`Global Search Data...`), and hotkey pill (`Ctrl+K`).
  - When the application window width is resized towards minimum width (`<= 1100px`, down to the `960px` minimum window width), the search bar intelligently collapses into a compact, centered 32x32px icon-only button (`<SearchIcon />`).
  - Preserves accessibility with native `title` tooltip, `aria-label`, and keyboard focus ring while reclaiming ~210px of horizontal header space to ensure flexible, overflow-free layout at all window dimensions.

### 5. Standalone Isolated Database & JSON Backup

- **Isolated Engine**: Powered by WebAssembly SQLite (`sql.js`), saving directly to `app-data/records.sqlite`.
- **Zero Native Build Hassles**: Does not require native node-gyp C++ compilation, avoiding Linux ABI/glibc issues and Windows MSVC build tool dependencies.
- **Container-Like Isolation**: Kept self-contained within the application folder.
- **JSON Backup / Restore**:
  - **Export**: Generates a portable, versioned JSON snapshot containing all accounts and items.
  - **Import**: Allows restoring or migrating data into SQLite with transactional consistency.

### 6. Theme Toggle & Dynamic Font Size Customization

- **Dark & Light Mode**: Switch between High-Contrast Dark Monochrome and Clean High-Contrast Light Monochrome themes.
- **Adjustable Font Size**: Choose between `Small (11px)`, `Medium (13px - Default)`, `Large (15px)`, and `X-Large (17px)` with real-time live preview.
- **Persistent Preferences**: Preferences are saved and automatically restored across app restarts via SQLite `app_settings` storage.

### Design Tokens

- **Border Radii**:
  - Small elements / badges: `--radius-xs: 3px`, `--radius-sm: 4px`
  - Cards / inputs / buttons: `--radius-md: 6px`, `--radius-lg: 8px`
  - Pills / circular controls: `--radius-full: 9999px`
- **Color Tokens**:
  - Primary / Rust Accent: `#c23c10`, `#cb5332`, `#d3684b`
  - Dark Surfaces: `#121212`, `#221715`, `#252525`, `#352a28`
  - Light Surfaces: `#ffffff`, `#f8f6f4`, `#f3ede7`, `#e8ded5`
  - Semantic: Danger (`#ff3030`), Warning (`#ffde38`), Success (`#52ff52`),

---

## Architecture & Codebase Structure

Built following **SOLID**, **DRY**, and **KISS** software engineering principles. Components are small, modular, and focused on single responsibilities.

```
├── electron/
│   ├── main.ts             # Electron main process (window lifecycle, cross-platform config)
│   ├── preload.ts          # Secure contextBridge API exposing typed ElectronAPI
│   ├── types.ts            # Type definitions for the main process
│   ├── db/
│   │   ├── database.ts     # Standalone SQLite manager, schema init & initial seed
│   │   ├── accountRepo.ts  # Account queries (CRUD, sort, storage aggregations)
│   │   ├── itemRepo.ts     # Stored item queries & cross-account Global Search
│   │   └── settingsRepo.ts # Persistent SQLite key-value app settings repository
│   └── ipc/
│       └── handlers.ts     # IPC handlers (Accounts, Items, Settings & JSON dialogs)
├── shared/
│   └── types.ts            # Shared contract types between Electron & React
├── src/
│   ├── styles/
│   │   ├── theme.css       # Strict monochrome CSS tokens & responsive font scale system
│   │   └── global.css      # Desktop typography, buttons, tables, cards, modals
│   ├── types/
│   │   └── index.ts        # Client domain models
│   ├── utils/
│   │   ├── storage.ts      # 6 GB quota calculation & byte-formatting utilities
│   │   └── date.ts         # Date/time formatters
│   ├── services/
│   │   └── storageAdapter.ts # Universal storage adapter (native Electron SQLite + browser fallback)
│   ├── hooks/
│   │   └── useResizableSidebar.ts # Modular resizable split pane controller hook
│   ├── context/
│   │   └── AppContext.tsx  # Central state management (accounts, items, settings sync, search)
│   ├── components/
│   │   ├── common/         # Flat primitives: Button, Input, Modal, Badge, Icons, StorageGauge
│   │   ├── layout/         # AppHeader (stats & global search), StatusBar
│   │   ├── accounts/       # AccountList, AccountCard, AccountSortBar, AccountModal
│   │   ├── items/          # ItemList, ItemGrid, ItemCard, ItemFilterBar, ItemModal
│   │   ├── settings/       # SettingsModal (theme toggle & font size adjustment with live preview)
│   │   └── search/         # GlobalSearchModal (cross-account Ctrl+K search)
│   ├── App.tsx             # Master-detail split pane container
│   └── main.tsx            # React application entry
├── tests/
│   ├── db.test.mjs         # SQLite database, SettingsRepo & repository automated tests
│   ├── settings.test.mjs   # Theme and font-size persistence and restart simulation tests
│   ├── storage-utils.test.mjs # 6 GB quota & unit conversion tests
│   ├── storage-adapter.test.mjs # Storage adapter web & fallback tests
│   └── electron-launch.test.mjs # Electron process launch verification test
├── package.json
├── tsconfig.json
├── tsconfig.electron.json
└── vite.config.ts
```

---

## Database Schema

```sql
CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  last_login TEXT NOT NULL,
  max_storage_gb REAL DEFAULT 6.0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS stored_items (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  image_url TEXT,
  file_size_mb REAL DEFAULT 0,
  file_type TEXT DEFAULT 'mp4',
  external_links TEXT,     -- JSON string array
  updated_date TEXT,       -- YYYY-MM-DD
  note TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_items_account_id ON stored_items(account_id);
CREATE INDEX IF NOT EXISTS idx_items_file_name ON stored_items(file_name);
CREATE INDEX IF NOT EXISTS idx_accounts_username ON accounts(username);
```

---

## 📥 End-User Installation Guide (Linux & Windows & Mac)

Download the latest version for your Operating System from **[GitHub Releases](https://github.com/codewiththura/PikVault-Desktop/releases)**.

---

### 1. Installing & Running on Linux

PikVault supports all major Linux distributions (Ubuntu, Debian, Fedora, Arch, openSUSE, etc.).

#### Option A: AppImage (Recommended)

1. **Download**: Download `PikVault-1.0.0.AppImage` from [GitHub Releases](https://github.com/codewiththura/PikVault-Desktop/releases).
2. **Make Executable**: Open your terminal in your Download folder and grant execution permission:
   ```bash
   chmod +x PikVault-1.0.0.AppImage
   ```
3. **Launch**: Double-click the file in your file manager or launch from terminal:
   ```bash
   ./PikVault-1.0.0.AppImage
   ```
   > **Data Storage Location**: Automatically saves database records to `~/.config/account-vault-desktop/app-data/records.sqlite`.

#### Option B: Standalone Portable Folder (Zero-Install / USB Stick)

1. **Download & Extract**: Download `account-vault-desktop-1.0.0.tar.gz` and extract it:
   ```bash
   tar -xzf account-vault-desktop-1.0.0.tar.gz
   cd PikVault-linux-x64
   ```
2. **Launch**: Run the turnkey launcher script:
   ```bash
   ./start.sh
   ```
   _(Or execute `./PikVault` directly)._
   > **Data Storage Location**: Keeps all database records isolated inside `PikVault-linux-x64/data/app-data/records.sqlite`.

---

### 2. Installing & Running on Windows

PikVault supports Windows 10 and Windows 11 (64-bit).

#### Option A: Standard Setup Installer (.exe)

1. **Download**: Download `PikVault-Setup-1.0.0.exe` from [GitHub Releases](https://github.com/codewiththura/PikVault-Desktop/releases).
2. **Install**: Double-click `PikVault-Setup-1.0.0.exe` to start the setup wizard.
3. **Follow Wizard**: Select your installation directory and choose whether to create Desktop and Start Menu shortcuts.
4. **Launch**: Open **PikVault** from your Windows Start Menu or Desktop shortcut.
   > **Data Storage Location**: Saves database & user data in `%APPDATA%\account-vault-desktop\app-data\records.sqlite`.

#### Option B: Portable Executable / Zip (USB / Zero-Install)

1. **Download**: Download `PikVault-1.0.0-portable.exe` (or `PikVault-1.0.0-win.zip`).
2. **Launch**:
   - For `PikVault-1.0.0-portable.exe`: Double-click the `.exe` file directly.
   - For `PikVault-1.0.0-win.zip`: Extract the `.zip` archive and double-click `PikVault.exe`.
     > **Data Storage Location**: Automatically creates a `data\app-data\` folder next to the executable to keep all data self-contained.

---

### 3. Installing & Running on macOS

PikVault supports macOS (Intel & Apple Silicon Macs).

1. **Download**: Download `PikVault-1.0.0-mac.zip` (or `PikVault-1.0.0.dmg`) from [GitHub Releases](https://github.com/codewiththura/PikVault-Desktop/releases).
2. **Extract & Move**:
   - Unzip `PikVault-1.0.0-mac.zip` and move `PikVault.app` into your **Applications** folder.
3. **First Launch (macOS Security Gatekeeper)**:
   - On modern macOS versions, right-click `PikVault.app` in Applications and select **Open** (or execute `xattr -cr /Applications/PikVault.app` in terminal if Gatekeeper prompts an unverified developer warning).
     > **Data Storage Location**: Saves database records in `~/Library/Application Support/account-vault-desktop/app-data/records.sqlite`.

---

## 🛠 Developer Setup & Build Commands (Step-by-Step)

### 1. Prerequisites

- **Node.js**: >= 20.0.0 (Node 24 recommended)
- **npm**: >= 10.0.0
- **Git**

### 2. Local Setup

```bash
# Clone or navigate to the project directory
cd "/media/thura/DATA/My Folders/My Projects/electrons-projects"

# Install all dependencies
npm install
```

### 3. Running in Development Mode

Launch the application with live reloading for both React and Electron:

```bash
npm run dev:electron
```

_(Or run `npm run dev` to preview the React frontend in the browser at `http://localhost:5173`)_.

### 4. Running Automated Tests

Run the comprehensive test suite (SQLite engine, 6 GB storage calculations, and Electron launch verification):

```bash
npm test
```

### 5. Production Build

Build both the Electron backend and the optimized React production bundle:

```bash
npm run build
```

The output will be placed in:

- `dist-electron/` (Electron main, preload, and SQLite repositories)
- `dist/` (Optimized React frontend assets)

To launch the built application locally:

```bash
npm start
```

### 6. Packaging & Linux AppImage Generation

Generate a standalone, production-ready **Linux AppImage** with embedded WebAssembly SQLite and desktop icons:

```bash
# Build code and compile the standalone Linux AppImage
npm run build:appimage

# Alternatively using the standard package script
npm run package
```

The generated standalone AppImage is located in:

- `release/PikVault-1.0.0.AppImage` (x86_64 ELF standalone executable)

#### Running the AppImage on Linux

Ensure execution permissions are set and launch the binary:

```bash
# 1. Grant execution permission (if needed)
chmod +x release/PikVault-1.0.0.AppImage

# 2. Launch the application
./release/PikVault-1.0.0.AppImage
```

> [!TIP]
> **Data Persistence & Isolation in AppImage Mode:**
> When running the standalone AppImage, the application automatically persists the SQLite database to the user's standard XDG configuration directory:
> `~/.config/account-vault-desktop/app-data/records.sqlite`
> This ensures data survives application updates and never pollutes the working directory or fails when executed from read-only mounts.
>
> If you wish to run in **custom or portable mode**, set the `APP_DATA_DIR` environment variable before launching:
>
> ```bash
> APP_DATA_DIR=/path/to/custom-storage ./release/PikVault-1.0.0.AppImage
> ```

### 7. Standalone Folder (Self-Contained) ELF Binary Executable

Generate a **100% Self-Contained, Standalone Distribution Directory** with native ELF 64-bit binary executable, dynamic shared libraries (`.so`), bundled Chromium & Electron runtime, and portable WebAssembly SQLite engine:

```bash
# 1. Build the standalone directory
npm run build:standalone

# 2. (Optional) Build both AppImage and Standalone Directory
npm run package

# 3. (Optional) Build portable compressed tar.gz archive
npm run build:archive
```

#### Standalone Folder Layout (`release/PikVault-linux-x64/`):

```
release/PikVault-linux-x64/
├── PikVault                  # Primary 64-bit ELF binary executable
├── start.sh                  # Convenience launcher script (executes in portable mode)
├── .portable                 # Marker file instructing app to persist data inside folder
├── icon.png                  # High-resolution application icon (512x512)
├── PikVault.desktop          # Linux desktop entry shortcut
├── README.txt                # Quick-start instructions for end-users
├── resources/
│   ├── app.asar              # Optimized production bundle
│   └── app.asar.unpacked/    # Extracted WebAssembly SQLite engine (.wasm)
├── libffmpeg.so              # Embedded media codecs
├── libEGL.so / libGLESv2.so  # Hardware graphics acceleration
├── libvulkan.so.1            # Vulkan rendering pipeline
└── locales/                  # Internationalization language packs
```

#### Rebuilding After Code Updates or Bug Fixes

Whenever you fix a bug or add a new feature, run this single automated command:

```bash
# 1. (Recommended) Run automated unit and integration tests
npm test

# 2. Re-compile and generate the updated Standalone Folder in 1 step
npm run build:standalone
```

This single command automatically executes:

1. `tsc -p tsconfig.electron.json` — Compiles Electron backend TypeScript (`dist-electron/`)
2. `vite build` — Bundles React 19 frontend into optimized assets (`dist/`)
3. `electron-builder --linux dir` — Packages Linux runtime, ELF binary, and extracts WebAssembly SQLite
4. `node ./scripts/post-standalone.mjs` — Syncs into `release/PikVault-linux-x64/`, configures `.portable` storage mode, sets execution permissions, and attaches desktop entries and icon assets.

#### Running the Standalone Folder Executable

Navigate into the standalone directory and run either the launcher or the ELF executable directly:

```bash
cd release/PikVault-linux-x64

# Option A: Using the turnkey launcher script (recommended)
./start.sh

# Option B: Running the ELF binary directly
chmod +x PikVault
./PikVault
```

> [!NOTE]
> **Zero-Install Portability (Self-Contained Mode):**
> Because the folder contains the `.portable` marker file, the application operates in **fully self-contained mode**:
>
> - SQLite Database: `release/PikVault-linux-x64/data/app-data/records.sqlite`
> - Cache & Web State: `release/PikVault-linux-x64/data/user-data/`
>
> You can copy or move the entire `PikVault-linux-x64` folder to a USB drive or any Linux workstation (Ubuntu, Debian, Fedora, Arch, openSUSE) — **no Node.js, npm, or system dependencies required**.
>
> To switch to standard system storage (`~/.config/account-vault-desktop`), delete `.portable` or execute:
>
> ```bash
> ./PikVault --no-portable
> ```

### 8. Windows Releases (.exe Installer, Portable .exe, & Standalone Zip)

The project supports cross-compiling first-class **Windows releases** directly from Linux. Because the SQLite database engine utilizes WebAssembly (`sql.js`), there are no native C++ Windows compiler toolchains or `node-gyp` hurdles.

#### Available Windows Release Formats

1. **Standard NSIS Setup Installer (`PikVault-Setup-1.0.0.exe`)**:
   - Standard guided Windows setup wizard.
   - Creates Start Menu and Desktop shortcuts.
   - Allows users to select custom installation directory.
   - Automatically stores database and user state in standard Windows Roaming AppData: `%APPDATA%\account-vault-desktop\app-data\records.sqlite`.

2. **Standalone Single Portable Executable (`PikVault-1.0.0-portable.exe`)**:
   - Zero-installation self-contained single `.exe`.
   - Run directly from a USB flash drive or any folder on Windows.
   - Automatically discovers its host directory (`PORTABLE_EXECUTABLE_DIR`) and keeps `data/app-data/records.sqlite` alongside the executable without touching Windows system registry or roaming directories.

3. **Windows Standalone Zip Archive (`PikVault-1.0.0-win.zip` / `release/win-unpacked/`)**:
   - Ready-to-use directory with `PikVault.exe`, graphics acceleration DLLs (`d3dcompiler_47.dll`, `libGLESv2.dll`, `vulkan-1.dll`), and assets.
   - Built directly on Linux without external dependencies.

#### Build Commands for Windows

```bash
# 1. Build all Windows targets (NSIS Setup, Portable .exe, and Standalone Zip)
npm run build:win

# 2. Build only the Standard NSIS Setup Installer (.exe)
npm run build:win:nsis

# 3. Build only the Standalone Portable Executable (.exe)
npm run build:win:portable

# 4. Build only the Standalone Zip Archive (.zip with win-unpacked/)
npm run build:win:zip

# 5. Build full cross-platform distribution suite (Linux AppImage + dir + tar.gz AND Windows targets)
npm run build:cross-platform
```

> [!NOTE]
> **Prerequisite for Building `.exe` Installers on Linux:**
> While unpacked Windows binaries and `.zip` archives build natively on Linux, generating single-file `.exe` installers (`nsis` and `portable`) utilizes Windows PE and NSIS tools which require **Wine** on Linux:
>
> - **Ubuntu / Debian**: `sudo apt install wine wine64`
> - **Arch Linux**: `sudo pacman -S wine`
> - **Fedora**: `sudo dnf install wine`

### 9. macOS Releases (.dmg Installer & Standalone .zip)

The project supports cross-compiling **macOS distribution packages** (`.dmg` installer and `.zip` application archive) directly on Linux.

#### Available macOS Release Formats

1. **macOS Portable Zip Archive (`PikVault-1.0.0-mac.zip`)**:
   - Contains the self-contained `PikVault.app` bundle.
   - Recommended for distribution. Users extract and place `PikVault.app` into `/Applications`.

2. **macOS Apple Disk Image Installer (`PikVault-1.0.0.dmg`)**:
   - Standard macOS `.dmg` drag-to-Applications disk image installer.

#### Build Commands for macOS

```bash
# 1. Build all macOS release targets (.zip archive & .dmg disk image)
npm run build:mac

# 2. Build only the macOS Zip Archive (PikVault-1.0.0-mac.zip containing PikVault.app)
npm run build:mac:zip

# 3. Build only the macOS DMG Disk Image Installer (.dmg)
npm run build:mac:dmg

# 4. Build full cross-platform distribution suite (Linux + Windows + macOS)
npm run build:cross-platform
```

> [!NOTE]
> **macOS Security Gatekeeper Note:**
> Builds compiled on Linux are unsigned because Apple `codesign` and notarization tools require macOS host environment APIs. When users open an unsigned app on modern macOS versions, Gatekeeper prompts a security warning. Users can grant permission by right-clicking `PikVault.app` $\rightarrow$ **Open**, or executing `xattr -cr /Applications/PikVault.app` in the Mac terminal.

---

## ⌨️ Keyboard Shortcuts

| Shortcut               | Action                                      |
| :--------------------- | :------------------------------------------ |
| `Ctrl + K` / `Cmd + K` | Open Global Cross-Account Data Search       |
| `Escape`               | Close any active modal dialog               |
| `Enter`                | Submit current form (Account / Stored Item) |

---

## 📜 Git Commit History (Milestones)

The project was constructed following a structured, step-by-step milestone workflow with automated verification at every step:

1. `chore: initialize electron react typescript project scaffolding with isolated desktop setup`
2. `feat(storage): implement isolated standalone SQLite storage engine with backup export/import and secure IPC bridge`
3. `feat(ui): implement flat black-and-white native desktop design system and zero-radius components`
4. `feat(accounts): account management with sorting (name, LL, storage), search filter, and 6GB quota tracking`
5. `feat(items): stored data management with dual list/grid views, in-account search, and image preview`
6. `feat(search): implement cross-account global search, master-detail layout, and hotkey navigation`
7. `docs: add comprehensive README with architecture, schema, and setup guide`
8. `fix(app): bind highlightedItemId context state in App.tsx for cross-account jump-to-item highlighting`
9. `feat(build): add Linux AppImage build target, asar wasm unpacking, and packaged data persistence`
10. `feat(build): add self-contained standalone folder distribution with portable SQLite storage, start.sh launcher, and tar.gz target`
11. `fix(items): enable independent vertical scrolling on ItemGrid and standardize fixed-height ItemCard layout`
12. `feat(accounts): add 1-click 'Update to Now' button to refresh account last login to latest current datetime`
13. `fix(items): add responsive text truncation with ellipsis for file names in List View on narrow windows`
14. `feat(accounts): require user confirmation before committing account edits or updating last login to now`
15. `feat(layout): implement interactive resizable sidebar with min-max constraints and width persistence`
16. `refactor(layout): extract useResizableSidebar custom hook for modular split-pane resizing and maintenance`
17. `feat(layout): add responsive auto-collapsing global search bar in AppHeader for compact and minimum window widths`
18. `feat(windows): configure Windows release generation with NSIS setup, portable exe, and cross-platform builds`
19. `feat(mac): configure macOS distribution packaging (.dmg installer and zip archive)`
20. `feat(accounts): add created date sort button and sorting logic for account ledger`
