export type FileType = 'mp4' | 'mkv' | 'zip' | 'pdf' | 'png' | 'jpg' | 'txt' | string;

export interface StoredItem {
  id: string;
  accountId: string;
  fileName: string;
  imageUrl?: string;
  fileSizeMB?: number;
  fileType: FileType;
  externalLinks?: string[];
  updatedDate?: string;
  note?: string;
  createdAt: string;
}

export interface Account {
  id: string;
  username: string;
  password: string;
  lastLogin: string;
  maxStorageGB: number;
  createdAt: string;
  updatedAt: string;
  items?: StoredItem[];
  totalUsedMB?: number;
  remainingGB?: number;
  itemCount?: number;
}

export type AccountSortField = 'name' | 'lastLogin' | 'storageRemain' | 'createdAt';
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
  getAccounts: () => Promise<Account[]>;
  createAccount: (account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Account>;
  updateAccount: (account: Partial<Account> & { id: string }) => Promise<Account>;
  deleteAccount: (id: string) => Promise<boolean>;

  getItemsByAccountId: (accountId: string) => Promise<StoredItem[]>;
  createItem: (item: Omit<StoredItem, 'id' | 'createdAt'>) => Promise<StoredItem>;
  updateItem: (item: Partial<StoredItem> & { id: string }) => Promise<StoredItem>;
  deleteItem: (id: string) => Promise<boolean>;

  searchGlobalItems: (query: string) => Promise<GlobalSearchResult[]>;

  exportBackupJson: () => Promise<{ success: boolean; filePath?: string; error?: string }>;
  importBackupJson: () => Promise<{ success: boolean; importedCount?: number; error?: string }>;

  getDbPath: () => Promise<string>;
  getSetting: (key: string) => Promise<string | null>;
  getAllSettings: () => Promise<Record<string, string>>;
  setSetting: (key: string, value: string) => Promise<boolean>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

