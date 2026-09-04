import type { Account, StoredItem, ElectronAPI, GlobalSearchResult, BackupData } from '../types/index.js';

const LOCAL_STORAGE_KEY_ACCOUNTS = 'vault_accounts_v1';
const LOCAL_STORAGE_KEY_ITEMS = 'vault_items_v1';

const INITIAL_DEMO_ACCOUNTS: Account[] = [
  {
    id: 'acc-1',
    username: 'alexander.dev@megamail.com',
    password: 'P@ssw0rd!2026',
    lastLogin: '2026-09-04T12:30:00.000Z',
    maxStorageGB: 6.0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'acc-2',
    username: 'media.vault.backup@proton.me',
    password: 'Secur3#Tr4nsfer',
    lastLogin: '2026-09-01T09:15:00.000Z',
    maxStorageGB: 6.0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'acc-3',
    username: 'storage.archive@fastmail.com',
    password: 'Arch1v3!9942',
    lastLogin: '2026-08-20T17:45:00.000Z',
    maxStorageGB: 6.0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const INITIAL_DEMO_ITEMS: StoredItem[] = [
  {
    id: 'item-101',
    accountId: 'acc-1',
    fileName: 'linux-kernel-guide-v2.mp4',
    imageUrl: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=300&q=80',
    fileSizeMB: 1250.5,
    fileType: 'mp4',
    externalLinks: ['https://mega.nz/file/sample1'],
    updatedDate: '2026-09-02',
    note: 'Comprehensive masterclass video on Linux system programming',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'item-102',
    accountId: 'acc-1',
    fileName: 'docker-containers-deepdive.mp4',
    imageUrl: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=300&q=80',
    fileSizeMB: 2100.0,
    fileType: 'mp4',
    externalLinks: ['https://mega.nz/file/docker-v4'],
    updatedDate: '2026-09-03',
    note: 'Docker container architecture and networking tutorials',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'item-201',
    accountId: 'acc-2',
    fileName: 'blender-3d-render-showcase.mp4',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&q=80',
    fileSizeMB: 1800.0,
    fileType: 'mp4',
    externalLinks: ['https://drive.google.com/open?id=blender99'],
    updatedDate: '2026-08-28',
    note: 'High polygon render animation tests',
    createdAt: new Date().toISOString(),
  },
];

function getStoredAccounts(): Account[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_ACCOUNTS);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY_ACCOUNTS, JSON.stringify(INITIAL_DEMO_ACCOUNTS));
      return INITIAL_DEMO_ACCOUNTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_DEMO_ACCOUNTS;
  }
}

function saveStoredAccounts(accounts: Account[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_ACCOUNTS, JSON.stringify(accounts));
  } catch (err) {
    console.error('Failed to persist accounts in localStorage:', err);
  }
}

function getStoredItems(): StoredItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_ITEMS);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY_ITEMS, JSON.stringify(INITIAL_DEMO_ITEMS));
      return INITIAL_DEMO_ITEMS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_DEMO_ITEMS;
  }
}

function saveStoredItems(items: StoredItem[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_ITEMS, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to persist items in localStorage:', err);
  }
}

/**
 * Universal browser fallback adapter for ElectronAPI
 * Ensures the app works 100% seamlessly in browser dev mode or when Electron bridge is detached.
 */
export const browserApiFallback: ElectronAPI = {
  async getAccounts(): Promise<Account[]> {
    const accounts = getStoredAccounts();
    const items = getStoredItems();

    return accounts.map((acc) => {
      const accItems = items.filter((i) => i.accountId === acc.id);
      const totalUsedMB = accItems.reduce((sum, i) => sum + (Number(i.fileSizeMB) || 0), 0);
      const maxStorageGB = acc.maxStorageGB || 6.0;
      const maxMB = maxStorageGB * 1024;
      const remainingMB = Math.max(0, maxMB - totalUsedMB);
      const remainingGB = Number((remainingMB / 1024).toFixed(2));

      return {
        ...acc,
        maxStorageGB,
        totalUsedMB: Number(totalUsedMB.toFixed(2)),
        remainingGB,
        itemCount: accItems.length,
      };
    });
  },

  async createAccount(data: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>): Promise<Account> {
    const accounts = getStoredAccounts();
    const now = new Date().toISOString();
    const newAcc: Account = {
      id: `acc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      username: data.username,
      password: data.password,
      lastLogin: data.lastLogin || now,
      maxStorageGB: data.maxStorageGB || 6.0,
      createdAt: now,
      updatedAt: now,
      totalUsedMB: 0,
      remainingGB: data.maxStorageGB || 6.0,
      itemCount: 0,
    };

    const updated = [newAcc, ...accounts];
    saveStoredAccounts(updated);
    return newAcc;
  },

  async updateAccount(data: Partial<Account> & { id: string }): Promise<Account> {
    const accounts = getStoredAccounts();
    const idx = accounts.findIndex((a) => a.id === data.id);
    if (idx === -1) {
      throw new Error(`Account ${data.id} not found`);
    }

    const updatedAcc: Account = {
      ...accounts[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    accounts[idx] = updatedAcc;
    saveStoredAccounts(accounts);
    return updatedAcc;
  },

  async deleteAccount(id: string): Promise<boolean> {
    let accounts = getStoredAccounts();
    accounts = accounts.filter((a) => a.id !== id);
    saveStoredAccounts(accounts);

    // Cascade delete items
    let items = getStoredItems();
    items = items.filter((i) => i.accountId !== id);
    saveStoredItems(items);

    return true;
  },

  async getItemsByAccountId(accountId: string): Promise<StoredItem[]> {
    const items = getStoredItems();
    return items.filter((i) => i.accountId === accountId);
  },

  async createItem(data: Omit<StoredItem, 'id' | 'createdAt'>): Promise<StoredItem> {
    const items = getStoredItems();
    const now = new Date().toISOString();
    const newItem: StoredItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
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

    const updated = [newItem, ...items];
    saveStoredItems(updated);
    return newItem;
  },

  async updateItem(data: Partial<StoredItem> & { id: string }): Promise<StoredItem> {
    const items = getStoredItems();
    const idx = items.findIndex((i) => i.id === data.id);
    if (idx === -1) {
      throw new Error(`Item ${data.id} not found`);
    }

    const updatedItem: StoredItem = {
      ...items[idx],
      ...data,
    };
    items[idx] = updatedItem;
    saveStoredItems(items);
    return updatedItem;
  },

  async deleteItem(id: string): Promise<boolean> {
    let items = getStoredItems();
    items = items.filter((i) => i.id !== id);
    saveStoredItems(items);
    return true;
  },

  async searchGlobalItems(query: string): Promise<GlobalSearchResult[]> {
    const q = (query || '').toLowerCase().trim();
    if (!q) return [];

    const items = getStoredItems();
    const accounts = getStoredAccounts();
    const accountMap = new Map<string, Account>();
    accounts.forEach((a) => accountMap.set(a.id, a));

    const matched = items.filter((i) => 
      i.fileName.toLowerCase().includes(q) || 
      (i.note && i.note.toLowerCase().includes(q))
    );

    return matched.map((item) => {
      const acc = accountMap.get(item.accountId);
      return {
        item,
        account: {
          id: item.accountId,
          username: acc ? acc.username : 'Unknown Account',
        },
      };
    });
  },

  async exportBackupJson(): Promise<{ success: boolean; filePath?: string; error?: string }> {
    try {
      const accounts = getStoredAccounts();
      const items = getStoredItems();
      const backup: BackupData = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        accounts,
        items,
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `vault-backup-${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      return { success: true, filePath: 'Browser Downloads folder' };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Export error' };
    }
  },

  async importBackupJson(): Promise<{ success: boolean; importedCount?: number; error?: string }> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = async (e: any) => {
        const file = e.target?.files?.[0];
        if (!file) {
          resolve({ success: false, error: 'No file selected' });
          return;
        }

        try {
          const text = await file.text();
          const backup = JSON.parse(text) as BackupData;
          if (!backup.accounts || !Array.isArray(backup.accounts)) {
            resolve({ success: false, error: 'Invalid backup file structure.' });
            return;
          }

          saveStoredAccounts(backup.accounts);
          if (backup.items && Array.isArray(backup.items)) {
            saveStoredItems(backup.items);
          }

          resolve({
            success: true,
            importedCount: (backup.accounts.length || 0) + (backup.items?.length || 0),
          });
        } catch (err: any) {
          resolve({ success: false, error: err?.message || 'Failed to parse JSON' });
        }
      };
      input.click();
    });
  },

  async getDbPath(): Promise<string> {
    return 'Browser LocalStorage (Standalone Isolated)';
  },

  async getSetting(key: string): Promise<string | null> {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  async getAllSettings(): Promise<Record<string, string>> {
    const settings: Record<string, string> = {};
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('vault_')) {
          const v = localStorage.getItem(k);
          if (v !== null) settings[k] = v;
        }
      }
    } catch {}
    return settings;
  },

  async setSetting(key: string, value: string): Promise<boolean> {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  },
};


/**
 * Returns either native Electron API (window.electronAPI) or browser fallback
 */
export function getApi(): ElectronAPI {
  if (typeof window !== 'undefined' && window.electronAPI) {
    return window.electronAPI;
  }
  return browserApiFallback;
}
