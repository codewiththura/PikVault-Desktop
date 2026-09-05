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
  - **List View**: Dense tabular rows with sortable columns, inline badge tags, note previews, and quick actions.
  - **Grid View**: Multi-column responsive cards with image preview headers, badges, and action bars.
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

To launch the built application:
```bash
npm start
```

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
