import { Database } from 'sql.js';
import { getDb, persistDatabase } from './database.js';
import { StoredItem, GlobalSearchResult } from '../types.js';
import crypto from 'node:crypto';

export class ItemRepo {
  /**
   * Retrieves all items belonging to an account
   */
  static getByAccountId(accountId: string): StoredItem[] {
    const db = getDb();
    const stmt = db.prepare(`
      SELECT * FROM stored_items 
      WHERE account_id = ?
      ORDER BY created_at DESC
    `);
    stmt.bind([accountId]);

    const items: StoredItem[] = [];
    while (stmt.step()) {
      const row = stmt.getAsObject() as Record<string, any>;
      let externalLinks: string[] = [];
      if (row.external_links) {
        try {
          externalLinks = JSON.parse(String(row.external_links));
        } catch {
          externalLinks = [String(row.external_links)];
        }
      }

      items.push({
        id: String(row.id),
        accountId: String(row.account_id),
        fileName: String(row.file_name),
        imageUrl: row.image_url ? String(row.image_url) : undefined,
        fileSizeMB: Number(row.file_size_mb) || 0,
        fileType: String(row.file_type || 'mp4'),
        externalLinks,
        updatedDate: row.updated_date ? String(row.updated_date) : undefined,
        note: row.note ? String(row.note) : undefined,
        createdAt: String(row.created_at),
      });
    }
    stmt.free();
    return items;
  }

  /**
   * Creates a new stored item record
   */
  static create(data: Omit<StoredItem, 'id' | 'createdAt'>): StoredItem {
    const db = getDb();
    const id = `item-${crypto.randomUUID()}`;
    const now = new Date().toISOString();
    const linksJson = data.externalLinks ? JSON.stringify(data.externalLinks) : '[]';

    db.run(
      `INSERT INTO stored_items (
        id, account_id, file_name, image_url, file_size_mb, file_type, 
        external_links, updated_date, note, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.accountId,
        data.fileName,
        data.imageUrl || null,
        Number(data.fileSizeMB) || 0,
        data.fileType || 'mp4',
        linksJson,
        data.updatedDate || null,
        data.note || null,
        now,
      ]
    );

    persistDatabase();

    return {
      id,
      accountId: data.accountId,
      fileName: data.fileName,
      imageUrl: data.imageUrl,
      fileSizeMB: Number(data.fileSizeMB) || 0,
      fileType: data.fileType || 'mp4',
      externalLinks: data.externalLinks || [],
      updatedDate: data.updatedDate,
      note: data.note,
      createdAt: now,
    };
  }

  /**
   * Updates an existing stored item record
   */
  static update(data: Partial<StoredItem> & { id: string }): StoredItem {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM stored_items WHERE id = ?');
    stmt.bind([data.id]);

    if (!stmt.step()) {
      stmt.free();
      throw new Error(`Item with id ${data.id} not found.`);
    }

    const row = stmt.getAsObject() as Record<string, any>;
    stmt.free();

    const fileName = data.fileName !== undefined ? data.fileName : String(row.file_name);
    const imageUrl = data.imageUrl !== undefined ? data.imageUrl : (row.image_url ? String(row.image_url) : null);
    const fileSizeMB = data.fileSizeMB !== undefined ? Number(data.fileSizeMB) : (Number(row.file_size_mb) || 0);
    const fileType = data.fileType !== undefined ? data.fileType : (String(row.file_type) || 'mp4');
    const externalLinks = data.externalLinks !== undefined 
      ? JSON.stringify(data.externalLinks) 
      : String(row.external_links || '[]');
    const updatedDate = data.updatedDate !== undefined ? data.updatedDate : (row.updated_date ? String(row.updated_date) : null);
    const note = data.note !== undefined ? data.note : (row.note ? String(row.note) : null);

    db.run(
      `UPDATE stored_items 
       SET file_name = ?, image_url = ?, file_size_mb = ?, file_type = ?, 
           external_links = ?, updated_date = ?, note = ?
       WHERE id = ?`,
      [fileName, imageUrl, fileSizeMB, fileType, externalLinks, updatedDate, note, data.id]
    );

    persistDatabase();

    let parsedLinks: string[] = [];
    try {
      parsedLinks = JSON.parse(externalLinks);
    } catch {
      parsedLinks = [];
    }

    return {
      id: data.id,
      accountId: String(row.account_id),
      fileName,
      imageUrl: imageUrl || undefined,
      fileSizeMB,
      fileType,
      externalLinks: parsedLinks,
      updatedDate: updatedDate || undefined,
      note: note || undefined,
      createdAt: String(row.created_at),
    };
  }

  /**
   * Deletes a stored item
   */
  static delete(id: string): boolean {
    const db = getDb();
    db.run('DELETE FROM stored_items WHERE id = ?', [id]);
    persistDatabase();
    return true;
  }

  /**
   * Global Search: Searches file names across ALL accounts
   * Returns matching items along with their owning account info
   */
  static searchGlobal(query: string): GlobalSearchResult[] {
    const db = getDb();
    const searchTerm = `%${(query || '').trim()}%`;

    const stmt = db.prepare(`
      SELECT 
        i.id as item_id,
        i.account_id,
        i.file_name,
        i.image_url,
        i.file_size_mb,
        i.file_type,
        i.external_links,
        i.updated_date,
        i.note,
        i.created_at as item_created_at,
        a.id as acc_id,
        a.username as acc_username
      FROM stored_items i
      INNER JOIN accounts a ON i.account_id = a.id
      WHERE i.file_name LIKE ? OR i.note LIKE ?
      ORDER BY i.created_at DESC
      LIMIT 100
    `);
    stmt.bind([searchTerm, searchTerm]);

    const results: GlobalSearchResult[] = [];
    while (stmt.step()) {
      const row = stmt.getAsObject() as Record<string, any>;
      let externalLinks: string[] = [];
      if (row.external_links) {
        try {
          externalLinks = JSON.parse(String(row.external_links));
        } catch {
          externalLinks = [String(row.external_links)];
        }
      }

      results.push({
        item: {
          id: String(row.item_id),
          accountId: String(row.account_id),
          fileName: String(row.file_name),
          imageUrl: row.image_url ? String(row.image_url) : undefined,
          fileSizeMB: Number(row.file_size_mb) || 0,
          fileType: String(row.file_type || 'mp4'),
          externalLinks,
          updatedDate: row.updated_date ? String(row.updated_date) : undefined,
          note: row.note ? String(row.note) : undefined,
          createdAt: String(row.item_created_at),
        },
        account: {
          id: String(row.acc_id),
          username: String(row.acc_username),
        },
      });
    }
    stmt.free();
    return results;
  }
}
