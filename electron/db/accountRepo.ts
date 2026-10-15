import { Database } from 'sql.js';
import { getDb, persistDatabase } from './database.js';
import { Account, StoredItem } from '../types.js';
import crypto from 'node:crypto';

export class AccountRepo {
  /**
   * Retrieves all accounts with computed storage and item counts
   */
  static getAll(): Account[] {
    const db = getDb();
    const accountsResult = db.exec(`
      SELECT 
        a.id, 
        a.username, 
        a.password, 
        a.last_login, 
        a.max_storage_gb, 
        a.description,
        a.is_pinned,
        a.created_at, 
        a.updated_at,
        COALESCE(SUM(i.file_size_mb), 0) as total_used_mb,
        COUNT(i.id) as item_count
      FROM accounts a
      LEFT JOIN stored_items i ON a.id = i.account_id
      GROUP BY a.id
      ORDER BY a.username ASC
    `);

    if (!accountsResult.length || !accountsResult[0].values.length) {
      return [];
    }

    const { columns, values } = accountsResult[0];
    return values.map((row) => {
      const obj: Record<string, any> = {};
      columns.forEach((col, idx) => {
        obj[col] = row[idx];
      });

      const maxGB = Number(obj.max_storage_gb) || 6.0;
      const totalUsedMB = Number(Number(obj.total_used_mb).toFixed(2));
      const maxMB = maxGB * 1024;
      const remainingMB = Math.max(0, maxMB - totalUsedMB);
      const remainingGB = Number((remainingMB / 1024).toFixed(2));

      return {
        id: String(obj.id),
        username: String(obj.username),
        password: String(obj.password),
        lastLogin: String(obj.last_login),
        maxStorageGB: maxGB,
        description: obj.description ? String(obj.description) : undefined,
        isPinned: Boolean(obj.is_pinned),
        createdAt: String(obj.created_at),
        updatedAt: String(obj.updated_at),
        totalUsedMB,
        remainingGB,
        itemCount: Number(obj.item_count) || 0,
      };
    });
  }

  /**
   * Finds an account by ID
   */
  static getById(id: string): Account | null {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM accounts WHERE id = ?');
    stmt.bind([id]);

    if (!stmt.step()) {
      stmt.free();
      return null;
    }

    const row = stmt.getAsObject() as Record<string, any>;
    stmt.free();

    return {
      id: String(row.id),
      username: String(row.username),
      password: String(row.password),
      lastLogin: String(row.last_login),
      maxStorageGB: Number(row.max_storage_gb) || 6.0,
      description: row.description ? String(row.description) : undefined,
      isPinned: Boolean(row.is_pinned),
      createdAt: String(row.created_at),
      updatedAt: String(row.updated_at),
    };
  }

  /**
   * Creates a new account
   */
  static create(data: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>): Account {
    const db = getDb();
    const id = `acc-${crypto.randomUUID()}`;
    const now = new Date().toISOString();
    const maxStorageGB = data.maxStorageGB || 6.0;
    const description = data.description ? data.description.trim() : null;
    const isPinned = data.isPinned ? 1 : 0;

    db.run(
      `INSERT INTO accounts (id, username, password, last_login, max_storage_gb, description, is_pinned, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, data.username, data.password, data.lastLogin || now, maxStorageGB, description, isPinned, now, now]
    );

    persistDatabase();

    return {
      id,
      username: data.username,
      password: data.password,
      lastLogin: data.lastLogin || now,
      maxStorageGB,
      description: data.description ? data.description.trim() : undefined,
      isPinned: Boolean(data.isPinned),
      createdAt: now,
      updatedAt: now,
      totalUsedMB: 0,
      remainingGB: maxStorageGB,
      itemCount: 0,
    };
  }

  /**
   * Updates an existing account
   */
  static update(data: Partial<Account> & { id: string }): Account {
    const db = getDb();
    const existing = this.getById(data.id);
    if (!existing) {
      throw new Error(`Account with id ${data.id} not found.`);
    }

    const now = new Date().toISOString();
    const username = data.username !== undefined ? data.username : existing.username;
    const password = data.password !== undefined ? data.password : existing.password;
    const lastLogin = data.lastLogin !== undefined ? data.lastLogin : existing.lastLogin;
    const maxStorageGB = data.maxStorageGB !== undefined ? data.maxStorageGB : existing.maxStorageGB;
    const description = data.description !== undefined
      ? (data.description ? data.description.trim() : null)
      : (existing.description || null);
    const isPinned = data.isPinned !== undefined
      ? (data.isPinned ? 1 : 0)
      : (existing.isPinned ? 1 : 0);

    db.run(
      `UPDATE accounts 
       SET username = ?, password = ?, last_login = ?, max_storage_gb = ?, description = ?, is_pinned = ?, updated_at = ?
       WHERE id = ?`,
      [username, password, lastLogin, maxStorageGB, description, isPinned, now, data.id]
    );

    persistDatabase();

    return {
      ...existing,
      username,
      password,
      lastLogin,
      maxStorageGB,
      description: description || undefined,
      isPinned: Boolean(isPinned),
      updatedAt: now,
    };
  }

  /**
   * Deletes an account (cascades associated stored_items)
   */
  static delete(id: string): boolean {
    const db = getDb();
    db.run('DELETE FROM stored_items WHERE account_id = ?', [id]);
    db.run('DELETE FROM accounts WHERE id = ?', [id]);
    persistDatabase();
    return true;
  }

  /**
   * Toggles the pinned status of an account
   */
  static togglePin(id: string): Account {
    const existing = this.getById(id);
    if (!existing) {
      throw new Error(`Account with id ${id} not found.`);
    }
    return this.update({
      id,
      isPinned: !existing.isPinned,
    });
  }
}
