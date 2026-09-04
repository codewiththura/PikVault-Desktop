export type FileType = 'mp4' | 'mkv' | 'zip' | 'pdf' | 'png' | 'jpg' | 'txt' | string;

export interface StoredItem {
  id: string;
  accountId: string;
  fileName: string;
  imageUrl?: string;
  fileSizeMB?: number; // Size in MB
  fileType: FileType;  // Default: 'mp4'
  externalLinks?: string[];
  updatedDate?: string; // ISO date string (YYYY-MM-DD)
  note?: string;
  createdAt: string;
}

export interface Account {
  id: string;
  username: string; // Email / Username
  password: string;
  lastLogin: string; // ISO datetime string
  maxStorageGB: number; // Constant 6 GB
  createdAt: string;
  updatedAt: string;
  items?: StoredItem[];
  // Computed fields:
  totalUsedMB?: number;
  remainingGB?: number;
  itemCount?: number;
}

export type AccountSortField = 'name' | 'lastLogin' | 'storageRemain';
export type SortDirection = 'asc' | 'desc';

export interface AccountSortConfig {
  field: AccountSortField;
  direction: SortDirection;
}

export type ViewMode = 'list' | 'grid';

export interface GlobalSearchResult {
  item: StoredItem;
  account: {
    id: string;
    username: string;
  };
}

export interface BackupData {
  version: string;
  exportedAt: string;
  accounts: Account[];
  items: StoredItem[];
}

export interface ElectronAPI {
  // Accounts
  getAccounts: () => Promise<Account[]>;
  createAccount: (account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Account>;
  updateAccount: (account: Partial<Account> & { id: string }) => Promise<Account>;
  deleteAccount: (id: string) => Promise<boolean>;

  // Items
  getItemsByAccountId: (accountId: string) => Promise<StoredItem[]>;
  createItem: (item: Omit<StoredItem, 'id' | 'createdAt'>) => Promise<StoredItem>;
  updateItem: (item: Partial<StoredItem> & { id: string }) => Promise<StoredItem>;
  deleteItem: (id: string) => Promise<boolean>;

  // Global Search
  searchGlobalItems: (query: string) => Promise<GlobalSearchResult[]>;

  // Backup & Restore
  exportBackupJson: () => Promise<{ success: boolean; filePath?: string; error?: string }>;
  importBackupJson: () => Promise<{ success: boolean; importedCount?: number; error?: string }>;

  // App info / Window
  getDbPath: () => Promise<string>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
