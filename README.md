# Account & Storage Vault (Linux Native Desktop)

An industrial-grade, standalone Linux desktop application built with **Electron**, **React 19**, **TypeScript**, **Vite**, and an **isolated SQLite database**. 

The application serves as a high-density, high-contrast account ledger and storage catalog manager designed for power users to catalog multiple remote accounts and track stored file metadata against a strict **6 GB storage quota** per account.

---

## 📸 Design System & Palette: Modern Desktop Theme

The application features a sleek design system supporting Dark and Light appearance modes:
- **Scalable Radius System**: Modern border-radius tokens (`--radius-xs: 3px`, `--radius-sm: 4px`, `--radius-md: 6px`, `--radius-lg: 8px`, `--radius-full: 9999px`) applied cleanly to buttons, inputs, cards, badges, modal dialogs, and gauges.
- **Rich Color Palette**:
  - **Primary & Accent**: Warm Terracotta / Rust (`#c23c10`, `#cb5332`, `#d3684b`, `#da7c61`, `#e18f78`, `#e8a28e`).
  - **Dark Surfaces**: Rich deep darks (`#121212`, `#252525`, `#393939`, `#4f4f4f`) with warm tonal surfaces (`#221715`, `#352a28`).
  - **Light Surfaces**: Clean warm tones (`#ffffff`, `#f8f6f4`, `#f3ede7`, `#e8ded5`).
  - **Semantic Accents**: Success (`#52ff52`), Warning (`#ffde38`), Danger (`#ff3030`), Info (`#3db5ff`).
- **Unified Clean Typography**: Modern single font family (**Space Grotesk** and system sans fallback) used consistently across the entire application with scalable font sizing presets.
- **Natural Text Styling**: Title and sentence casing across buttons, dialogs, headers, and badges.

---

## 🚀 Key Features

### 1. Account Records Ledger
- **Credentials & Metadata**: Tracks Username (email), Password (with 1-click clipboard copy and masked/unmasked toggle), and Last Login timestamp.
- **Relative Last Login & Overdue Alerts**: Displays Last Login in human-friendly relative format (e.g. `Just now`, `20 days ago`, `1 month ago`, `2 years ago`). If an account has not been logged into for more than 1 month (>= 30 days), the label turns red (`var(--accent-danger)`) with a high-contrast `Relogin` badge alerting the user to re-authenticate.
- **1-Click "Update to Now" Timestamp Refresh**: Beside the active account's Last Login indicator in the detail pane, an inline **"Update to Now"** action button allows users to immediately stamp the account's `lastLogin` timestamp to the latest current date & time. This immediately clears overdue relogin alerts, recalculates relative timestamps, updates SQLite persistence, and updates account sort ordering.
- **Auto Password Generator**: Integrated cryptographic random password generator.
- **Sorting & Filtering**:
  - Instant search by account name or email.
  - Multi-directional sorting by **Name** (`asc`/`desc`), **Last login**, and **Storage Remaining**.

### 2. Plain Text Storage Catalog (6 GB Quota Engine)
- **Metadata-Only Architecture**: The application does **not** store heavy multi-gigabyte media on the local physical disk. It stores structured plain-text catalog records.
- **Dynamic 6 GB Limit Tracking**:
  - Each account has a max storage amount of **6 GB** (`6,144 MB`).
  - Total file size of each item inside the account is aggregated in real time.
  - Computes exact remaining storage (e.g., `4.25 GB remain of 6 GB`).
  - Highlights high-contrast alert badges if recorded files exceed the 6 GB threshold.

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
  - **List View**: Dense tabular rows with sortable columns, inline badge tags, note previews, and quick actions with independent vertical and horizontal scrolling.
  - **Grid View & Uniform Card Engine**:
    - **Independent Scroll Container**: Uses `overflow-y: auto`, `min-height: 0`, and `align-content: start` so the item grid scrolls smoothly while keeping the toolbar and header pinned.
    - **Fixed Card Dimensions (`350px`)**: Standardized card height ensuring uniform multi-column alignment across varying screen widths.
    - **Proportional Media Headers**: 140px fixed thumbnail header (with image object-cover or uniform fallback file type badge).
    - **Truncation & Overflow Protection**: Two-line clamped file names and notes with text-overflow ellipsis to prevent cards from overflowing or stretching unevenly.
    - **Responsive Link Trays & Action Bars**: Compact external link pills and pinned action buttons (Edit, Delete) in the card footer.
- **In-Account Search**: Instant local filter by file name or notes within the active account.

### 4. 🔍 Special Feature: Cross-Account Global Search (`Ctrl+K`)
- Allows users to search for stored data file names across **all accounts simultaneously**.
- Immediately reveals **which account owns each data item** (`Stored in account: user@example.com`).
- Provides a **1-click "Jump" action** that navigates directly into the target account and highlights the matching item.
- Accessible from anywhere in the app via the top header or the `Ctrl+K` hotkey.

### 5. Standalone Isolated SQLite Database & JSON Backup
- **Isolated Engine**: Powered by WebAssembly SQLite (`sql.js`), saving directly to `app-data/records.sqlite`.
- **Zero Native Build Hassles**: Does not require native node-gyp C++ compilation, avoiding Linux ABI and glibc compatibility issues.
- **Container-Like Isolation**: Kept self-contained within the application folder.
- **JSON Backup / Restore**:
  - **Export**: Generates a portable, versioned JSON snapshot containing all accounts and items.
  - **Import**: Allows restoring or migrating data into SQLite with transactional consistency.

### 6. ⚙️ Theme Toggle & Dynamic Font Size Customization
- **Dark & Light Mode**: Switch between High-Contrast Dark Monochrome and Clean High-Contrast Light Monochrome themes.
- **Adjustable Font Size**: Choose between `Small (11px)`, `Medium (13px - Default)`, `Large (15px)`, and `X-Large (17px)` with real-time live preview.
- **Persistent Preferences**: Preferences are saved and automatically restored across app restarts via SQLite `app_settings` storage.


---

## 🏛 Architecture & Codebase Structure

Built following **SOLID**, **DRY**, and **KISS** software engineering principles. Components are small, modular, and focused on single responsibilities.

```
├── electron/
│   ├── main.ts             # Electron main process (window lifecycle, Linux config)
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

## 🗄 Database Schema

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


## 🛠 Getting Started (Step-by-Step)

### 1. Prerequisites
- **Linux** (Debian, Ubuntu, Arch, Fedora, openSUSE, etc.)
- **Node.js**: >= 20.0.0 (Node 24 recommended)
- **npm**: >= 10.0.0

### 2. Installation
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
*(Or run `npm run dev` to preview the React frontend in the browser at `http://localhost:5173`)*.

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
> - SQLite Database: `release/PikVault-linux-x64/data/app-data/records.sqlite`
> - Cache & Web State: `release/PikVault-linux-x64/data/user-data/`
>
> You can copy or move the entire `PikVault-linux-x64` folder to a USB drive or any Linux workstation (Ubuntu, Debian, Fedora, Arch, openSUSE) — **no Node.js, npm, or system dependencies required**.
>
> To switch to standard system storage (`~/.config/account-vault-desktop`), delete `.portable` or execute:
> ```bash
> ./PikVault --no-portable
> ```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Ctrl + K` / `Cmd + K` | Open Global Cross-Account Data Search |
| `Escape` | Close any active modal dialog |
| `Enter` | Submit current form (Account / Stored Item) |

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
