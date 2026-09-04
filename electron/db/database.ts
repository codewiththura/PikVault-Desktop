import fs from 'node:fs';
import path from 'node:path';
import initSqlJs, { Database, SqlJsStatic } from 'sql.js';

let dbInstance: Database | null = null;
let dbFilePath: string = '';
let SQL: SqlJsStatic | null = null;

/**
 * Resolves the isolated data directory path.
 * Kept strictly isolated within the app's standalone directory
 * or user isolated directory.
 */
export function getIsolatedDataDir(): string {
  if (process.env.APP_DATA_DIR) {
    return process.env.APP_DATA_DIR;
  }
  // Standard standalone isolated directory inside workspace/app
  const isolatedDir = path.resolve(process.cwd(), 'app-data');
  if (!fs.existsSync(isolatedDir)) {
    fs.mkdirSync(isolatedDir, { recursive: true });
  }
  return isolatedDir;
}

/**
 * Initializes the isolated SQLite database
 */
export async function initDatabase(): Promise<Database> {
  if (dbInstance) {
    return dbInstance;
  }

  SQL = await initSqlJs();
  const dataDir = getIsolatedDataDir();
  dbFilePath = path.join(dataDir, 'records.sqlite');

  let fileBuffer: Buffer | null = null;
  if (fs.existsSync(dbFilePath)) {
    try {
      fileBuffer = fs.readFileSync(dbFilePath);
    } catch (err) {
      console.error('Error reading existing sqlite file:', err);
    }
  }

  if (fileBuffer && fileBuffer.length > 0) {
    dbInstance = new SQL.Database(fileBuffer);
  } else {
    dbInstance = new SQL.Database();
  }

  // Initialize SQLite schema
  createSchema(dbInstance);

  // Seed sample initial records if empty
  seedInitialDataIfEmpty(dbInstance);

  // Persist to disk
  persistDatabase();

  return dbInstance;
}

/**
 * Creates accounts and stored_items tables
 */
function createSchema(db: Database): void {
  db.run(`
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
      external_links TEXT,
      updated_date TEXT,
      note TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_items_account_id ON stored_items(account_id);
    CREATE INDEX IF NOT EXISTS idx_items_file_name ON stored_items(file_name);
    CREATE INDEX IF NOT EXISTS idx_accounts_username ON accounts(username);

    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
}

/**
 * Persists in-memory SQLite database to physical sqlite file
 */
export function persistDatabase(): void {
  if (!dbInstance || !dbFilePath) return;
  try {
    const data = dbInstance.export();
    const buffer = Buffer.from(data);
    const tempPath = `${dbFilePath}.tmp`;
    fs.writeFileSync(tempPath, buffer);
    fs.renameSync(tempPath, dbFilePath);
  } catch (err) {
    console.error('Failed to persist SQLite database:', err);
  }
}

/**
 * Seed initial sample accounts if the database is newly initialized
 */
function seedInitialDataIfEmpty(db: Database): void {
  const now = new Date().toISOString();

  // Seed default settings if not exists
  const settingsCountRes = db.exec('SELECT COUNT(*) as cnt FROM app_settings');
  const settingsCount = settingsCountRes[0]?.values[0]?.[0] as number;
  if (!settingsCount || settingsCount === 0) {
    db.run(
      `INSERT OR IGNORE INTO app_settings (key, value, updated_at) VALUES (?, ?, ?), (?, ?, ?)`,
      ['vault_fontsize_pref', 'medium', now, 'vault_theme_pref', 'dark', now]
    );
  }

  const result = db.exec('SELECT COUNT(*) as cnt FROM accounts');
  const count = result[0]?.values[0]?.[0] as number;
  if (count && count > 0) return;

  const acc1Id = 'acc-1';
  const acc2Id = 'acc-2';
  const acc3Id = 'acc-3';


  // Account 1: Mega cloud storage
  db.run(
    `INSERT INTO accounts (id, username, password, last_login, max_storage_gb, created_at, updated_at)
     VALUES (?, ?, ?, ?, 6.0, ?, ?)`,
    [acc1Id, 'alexander.dev@megamail.com', 'P@ssw0rd!2026', '2026-09-04T12:30:00.000Z', now, now]
  );

  // Stored items for Account 1
  db.run(
    `INSERT INTO stored_items (id, account_id, file_name, image_url, file_size_mb, file_type, external_links, updated_date, note, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'item-101',
      acc1Id,
      'linux-kernel-guide-v2.mp4',
      'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=300&q=80',
      1250.5,
      'mp4',
      JSON.stringify(['https://mega.nz/file/sample1']),
      '2026-09-02',
      'Comprehensive masterclass video on Linux system programming',
      now
    ]
  );

  db.run(
    `INSERT INTO stored_items (id, account_id, file_name, image_url, file_size_mb, file_type, external_links, updated_date, note, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'item-102',
      acc1Id,
      'docker-containers-deepdive.mp4',
      'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=300&q=80',
      2100.0,
      'mp4',
      JSON.stringify(['https://mega.nz/file/docker-v4']),
      '2026-09-03',
      'Docker container architecture and networking tutorials',
      now
    ]
  );

  // Account 2: Media Vault
  db.run(
    `INSERT INTO accounts (id, username, password, last_login, max_storage_gb, created_at, updated_at)
     VALUES (?, ?, ?, ?, 6.0, ?, ?)`,
    [acc2Id, 'media.vault.backup@proton.me', 'Secur3#Tr4nsfer', '2026-09-01T09:15:00.000Z', now, now]
  );

  db.run(
    `INSERT INTO stored_items (id, account_id, file_name, image_url, file_size_mb, file_type, external_links, updated_date, note, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'item-201',
      acc2Id,
      'blender-3d-render-showcase.mp4',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&q=80',
      1800.0,
      'mp4',
      JSON.stringify(['https://drive.google.com/open?id=blender99']),
      '2026-08-28',
      'High polygon render animation tests',
      now
    ]
  );

  // Account 3: Raw archive
  db.run(
    `INSERT INTO accounts (id, username, password, last_login, max_storage_gb, created_at, updated_at)
     VALUES (?, ?, ?, ?, 6.0, ?, ?)`,
    [acc3Id, 'storage.archive@fastmail.com', 'Arch1v3!9942', '2026-08-20T17:45:00.000Z', now, now]
  );
}

export function getDb(): Database {
  if (!dbInstance) {
    throw new Error('Database is not initialized. Call initDatabase() first.');
  }
  return dbInstance;
}

export function getDbPath(): string {
  return dbFilePath;
}
