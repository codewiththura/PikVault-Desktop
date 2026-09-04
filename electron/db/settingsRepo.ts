import { getDb, persistDatabase } from './database.js';

export class SettingsRepo {
  /**
   * Retrieves a setting value by key from SQLite
   */
  static get(key: string): string | null {
    const db = getDb();
    const result = db.exec('SELECT value FROM app_settings WHERE key = ?', [key]);
    if (!result.length || !result[0].values.length) {
      return null;
    }
    return String(result[0].values[0][0]);
  }

  /**
   * Retrieves all key-value settings from SQLite
   */
  static getAll(): Record<string, string> {
    const db = getDb();
    const result = db.exec('SELECT key, value FROM app_settings');
    if (!result.length || !result[0].values.length) {
      return {};
    }

    const settings: Record<string, string> = {};
    for (const row of result[0].values) {
      settings[String(row[0])] = String(row[1]);
    }
    return settings;
  }

  /**
   * Sets or updates a setting key-value pair and persists immediately
   */
  static set(key: string, value: string): boolean {
    const db = getDb();
    const now = new Date().toISOString();
    db.run(
      `INSERT INTO app_settings (key, value, updated_at) 
       VALUES (?, ?, ?) 
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at;`,
      [key, value, now]
    );
    persistDatabase();
    return true;
  }
}
