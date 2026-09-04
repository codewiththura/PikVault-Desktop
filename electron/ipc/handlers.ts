import { ipcMain, dialog, BrowserWindow } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import { AccountRepo } from '../db/accountRepo.js';
import { ItemRepo } from '../db/itemRepo.js';
import { getDbPath, persistDatabase, getDb } from '../db/database.js';
import { Account, StoredItem, BackupData } from '../types.js';

export function registerIpcHandlers(): void {
  // Accounts
  ipcMain.handle('accounts:getAll', async () => {
    return AccountRepo.getAll();
  });

  ipcMain.handle('accounts:create', async (_, data: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>) => {
    return AccountRepo.create(data);
  });

  ipcMain.handle('accounts:update', async (_, data: Partial<Account> & { id: string }) => {
    return AccountRepo.update(data);
  });

  ipcMain.handle('accounts:delete', async (_, id: string) => {
    return AccountRepo.delete(id);
  });

  // Stored Items
  ipcMain.handle('items:getByAccountId', async (_, accountId: string) => {
    return ItemRepo.getByAccountId(accountId);
  });

  ipcMain.handle('items:create', async (_, data: Omit<StoredItem, 'id' | 'createdAt'>) => {
    return ItemRepo.create(data);
  });

  ipcMain.handle('items:update', async (_, data: Partial<StoredItem> & { id: string }) => {
    return ItemRepo.update(data);
  });

  ipcMain.handle('items:delete', async (_, id: string) => {
    return ItemRepo.delete(id);
  });

  // Global Search
  ipcMain.handle('items:searchGlobal', async (_, query: string) => {
    return ItemRepo.searchGlobal(query);
  });

  // Database Path
  ipcMain.handle('app:getDbPath', async () => {
    return getDbPath();
  });

  // JSON Export Backup
  ipcMain.handle('backup:exportJson', async () => {
    try {
      const accounts = AccountRepo.getAll();
      const allItems: StoredItem[] = [];

      for (const acc of accounts) {
        const items = ItemRepo.getByAccountId(acc.id);
        allItems.push(...items);
      }

      const backup: BackupData = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        accounts,
        items: allItems,
      };

      const jsonString = JSON.stringify(backup, null, 2);

      const win = BrowserWindow.getFocusedWindow();
      const defaultFileName = `vault-backup-${new Date().toISOString().slice(0, 10)}.json`;
      
      const { canceled, filePath } = await dialog.showSaveDialog(win || undefined as any, {
        title: 'Export Accounts & Data Backup (JSON)',
        defaultPath: defaultFileName,
        filters: [{ name: 'JSON Files', extensions: ['json'] }],
      });

      if (canceled || !filePath) {
        return { success: false, error: 'Cancelled' };
      }

      fs.writeFileSync(filePath, jsonString, 'utf-8');
      return { success: true, filePath };
    } catch (err: any) {
      console.error('Backup export failed:', err);
      return { success: false, error: err?.message || 'Export error' };
    }
  });

  // JSON Import Backup
  ipcMain.handle('backup:importJson', async () => {
    try {
      const win = BrowserWindow.getFocusedWindow();
      const { canceled, filePaths } = await dialog.showOpenDialog(win || undefined as any, {
        title: 'Import Accounts & Data Backup (JSON)',
        properties: ['openFile'],
        filters: [{ name: 'JSON Files', extensions: ['json'] }],
      });

      if (canceled || !filePaths || !filePaths[0]) {
        return { success: false, error: 'Cancelled' };
      }

      const fileContent = fs.readFileSync(filePaths[0], 'utf-8');
      const backup = JSON.parse(fileContent) as BackupData;

      if (!backup.accounts || !Array.isArray(backup.accounts)) {
        return { success: false, error: 'Invalid backup file structure: missing accounts array.' };
      }

      const db = getDb();
      // Import accounts and items inside a transaction
      db.run('BEGIN TRANSACTION;');
      try {
        for (const acc of backup.accounts) {
          // Check if exists
          const existing = AccountRepo.getById(acc.id);
          if (!existing) {
            db.run(
              `INSERT INTO accounts (id, username, password, last_login, max_storage_gb, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [
                acc.id,
                acc.username,
                acc.password,
                acc.lastLogin || new Date().toISOString(),
                acc.maxStorageGB || 6.0,
                acc.createdAt || new Date().toISOString(),
                acc.updatedAt || new Date().toISOString(),
              ]
            );
          }
        }

        if (backup.items && Array.isArray(backup.items)) {
          for (const item of backup.items) {
            const links = item.externalLinks ? JSON.stringify(item.externalLinks) : '[]';
            db.run(
              `INSERT OR REPLACE INTO stored_items (
                id, account_id, file_name, image_url, file_size_mb, file_type, 
                external_links, updated_date, note, created_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                item.id,
                item.accountId,
                item.fileName,
                item.imageUrl || null,
                Number(item.fileSizeMB) || 0,
                item.fileType || 'mp4',
                links,
                item.updatedDate || null,
                item.note || null,
                item.createdAt || new Date().toISOString(),
              ]
            );
          }
        }
        db.run('COMMIT;');
        persistDatabase();

        return {
          success: true,
          importedCount: (backup.accounts.length || 0) + (backup.items?.length || 0),
        };
      } catch (err) {
        db.run('ROLLBACK;');
        throw err;
      }
    } catch (err: any) {
      console.error('Backup import failed:', err);
      return { success: false, error: err?.message || 'Import error' };
    }
  });
}
