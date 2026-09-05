import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  Account, 
  StoredItem, 
  AccountSortField, 
  SortDirection, 
  ViewMode, 
  GlobalSearchResult,
  ThemeMode,
  FontSizeSetting
} from '../types';
import { getApi } from '../services/storageAdapter';

interface AppContextType {
  // Accounts
  accounts: Account[];
  selectedAccountId: string | null;
  selectedAccount: Account | null;
  setSelectedAccountId: (id: string | null) => void;
  loadAccounts: () => Promise<void>;
  createAccount: (data: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Account | null>;
  updateAccount: (data: Partial<Account> & { id: string }) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;

  // Sorting & Filtering Accounts
  accountSearch: string;
  setAccountSearch: (query: string) => void;
  sortField: AccountSortField;
  sortDirection: SortDirection;
  setSorting: (field: AccountSortField) => void;
  filteredAndSortedAccounts: Account[];

  // Stored Items
  activeItems: StoredItem[];
  loadItems: (accountId: string) => Promise<void>;
  createItem: (data: Omit<StoredItem, 'id' | 'createdAt'>) => Promise<void>;
  updateItem: (data: Partial<StoredItem> & { id: string }) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;

  // Item View Mode & Search
  itemViewMode: ViewMode;
  setItemViewMode: (mode: ViewMode) => void;
  itemSearch: string;
  setItemSearch: (query: string) => void;
  filteredItems: StoredItem[];

  // Global Search
  isGlobalSearchOpen: boolean;
  setIsGlobalSearchOpen: (open: boolean) => void;
  globalSearchQuery: string;
  setGlobalSearchQuery: (query: string) => void;
  globalSearchResults: GlobalSearchResult[];
  performGlobalSearch: (query: string) => Promise<void>;
  jumpToItem: (accountId: string, itemId: string) => Promise<void>;
  highlightedItemId: string | null;

  // Settings & Appearance
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  fontSize: FontSizeSetting;
  setFontSize: (size: FontSizeSetting) => void;
  isSettingsModalOpen: boolean;
  setIsSettingsModalOpen: (open: boolean) => void;

  // Backup & Restore
  exportBackup: () => Promise<{ success: boolean; filePath?: string; error?: string }>;
  importBackup: () => Promise<{ success: boolean; importedCount?: number; error?: string }>;
  dbPath: string;

  // Global status
  isLoading: boolean;
  error: string | null;
  setError: (msg: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [activeItems, setActiveItems] = useState<StoredItem[]>([]);
  
  // Sorting & Filtering
  const [accountSearch, setAccountSearch] = useState<string>('');
  const [sortField, setSortField] = useState<AccountSortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Items
  const [itemViewMode, setItemViewMode] = useState<ViewMode>('list');
  const [itemSearch, setItemSearch] = useState<string>('');

  // Global Search
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState<boolean>(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');
  const [globalSearchResults, setGlobalSearchResults] = useState<GlobalSearchResult[]>([]);
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(null);

  // Settings & Theme Preferences
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      return (localStorage.getItem('vault_theme_pref') as ThemeMode) || 'dark';
    } catch {
      return 'dark';
    }
  });

  const [fontSize, setFontSizeState] = useState<FontSizeSetting>(() => {
    try {
      return (localStorage.getItem('vault_fontsize_pref') as FontSizeSetting) || 'medium';
    } catch {
      return 'medium';
    }
  });

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);

  const api = getApi();

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('vault_theme_pref', newTheme);
    } catch {}
    api.setSetting('vault_theme_pref', newTheme).catch(console.error);
  };

  const setFontSize = (newSize: FontSizeSetting) => {
    setFontSizeState(newSize);
    try {
      localStorage.setItem('vault_fontsize_pref', newSize);
    } catch {}
    api.setSetting('vault_fontsize_pref', newSize).catch(console.error);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const pxMap: Record<FontSizeSetting, string> = {
      small: '11px',
      medium: '13px',
      large: '15px',
      xlarge: '17px',
    };
    const targetPx = pxMap[fontSize] || '13px';
    document.documentElement.style.setProperty('--base-font-size', targetPx);
    document.documentElement.style.fontSize = targetPx;
    document.body.style.fontSize = targetPx;
  }, [fontSize]);

  // App Meta
  const [dbPath, setDbPath] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load Accounts
  const loadAccounts = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await api.getAccounts();
      setAccounts(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load accounts');
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  // Load Items for Account
  const loadItems = useCallback(async (accountId: string) => {
    try {
      const items = await api.getItemsByAccountId(accountId);
      setActiveItems(items);
    } catch (err: any) {
      setError(err?.message || 'Failed to load items');
    }
  }, [api]);

  // Fetch db path, restore settings from SQLite & initialize
  useEffect(() => {
    api.getDbPath().then(setDbPath).catch(console.error);

    // Sync settings from persistent SQLite store
    api.getAllSettings()
      .then((settings) => {
        if (settings) {
          if (settings.vault_fontsize_pref && (settings.vault_fontsize_pref as FontSizeSetting) !== fontSize) {
            setFontSizeState(settings.vault_fontsize_pref as FontSizeSetting);
            try {
              localStorage.setItem('vault_fontsize_pref', settings.vault_fontsize_pref);
            } catch {}
          }
          if (settings.vault_theme_pref && (settings.vault_theme_pref as ThemeMode) !== theme) {
            setThemeState(settings.vault_theme_pref as ThemeMode);
            try {
              localStorage.setItem('vault_theme_pref', settings.vault_theme_pref);
            } catch {}
          }
        }
      })
      .catch(console.error);

    loadAccounts();
  }, [api, loadAccounts]);


  // When selected account changes, load items
  useEffect(() => {
    if (selectedAccountId) {
      loadItems(selectedAccountId);
      setItemSearch('');
    } else {
      setActiveItems([]);
    }
  }, [selectedAccountId, loadItems]);

  // Account CRUD
  const createAccount = async (data: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const created = await api.createAccount(data);
      await loadAccounts();
      if (created) {
        setSelectedAccountId(created.id);
      }
      return created;
    } catch (err: any) {
      setError(err?.message || 'Failed to create account');
      return null;
    }
  };

  const updateAccount = async (data: Partial<Account> & { id: string }) => {
    try {
      await api.updateAccount(data);
      await loadAccounts();
    } catch (err: any) {
      setError(err?.message || 'Failed to update account');
    }
  };

  const deleteAccount = async (id: string) => {
    try {
      await api.deleteAccount(id);
      if (selectedAccountId === id) {
        setSelectedAccountId(null);
      }
      await loadAccounts();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete account');
    }
  };

  // Stored Items CRUD
  const createItem = async (data: Omit<StoredItem, 'id' | 'createdAt'>) => {
    try {
      await api.createItem(data);
      if (selectedAccountId) {
        await loadItems(selectedAccountId);
      }
      await loadAccounts(); // Recompute account storage totals
    } catch (err: any) {
      setError(err?.message || 'Failed to create stored item');
    }
  };

  const updateItem = async (data: Partial<StoredItem> & { id: string }) => {
    try {
      await api.updateItem(data);
      if (selectedAccountId) {
        await loadItems(selectedAccountId);
      }
      await loadAccounts(); // Recompute account storage totals
    } catch (err: any) {
      setError(err?.message || 'Failed to update stored item');
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await api.deleteItem(id);
      if (selectedAccountId) {
        await loadItems(selectedAccountId);
      }
      await loadAccounts(); // Recompute account storage totals
    } catch (err: any) {
      setError(err?.message || 'Failed to delete stored item');
    }
  };

  // Sorting Accounts
  const setSorting = (field: AccountSortField) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedAccounts = React.useMemo(() => {
    let list = accounts.filter(acc => 
      acc.username.toLowerCase().includes(accountSearch.toLowerCase().trim())
    );

    list.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') {
        comparison = a.username.localeCompare(b.username);
      } else if (sortField === 'lastLogin') {
        const timeA = new Date(a.lastLogin || 0).getTime();
        const timeB = new Date(b.lastLogin || 0).getTime();
        comparison = timeA - timeB;
      } else if (sortField === 'storageRemain') {
        const remA = a.remainingGB ?? 6;
        const remB = b.remainingGB ?? 6;
        comparison = remA - remB;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return list;
  }, [accounts, accountSearch, sortField, sortDirection]);

  // Filtered Items inside active account
  const filteredItems = React.useMemo(() => {
    if (!itemSearch.trim()) return activeItems;
    const q = itemSearch.toLowerCase().trim();
    return activeItems.filter(item => 
      item.fileName.toLowerCase().includes(q) || 
      (item.note && item.note.toLowerCase().includes(q))
    );
  }, [activeItems, itemSearch]);

  // Global Search across ALL accounts
  const performGlobalSearch = async (query: string) => {
    setGlobalSearchQuery(query);
    if (!query.trim()) {
      setGlobalSearchResults([]);
      return;
    }
    try {
      const results = await api.searchGlobalItems(query);
      setGlobalSearchResults(results);
    } catch (err: any) {
      console.error('Global search error:', err);
    }
  };

  // Jump to item from Global Search
  const jumpToItem = async (accountId: string, itemId: string) => {
    setIsGlobalSearchOpen(false);
    setSelectedAccountId(accountId);
    await loadItems(accountId);
    setHighlightedItemId(itemId);
    setTimeout(() => {
      setHighlightedItemId(null);
    }, 3000);
  };

  // Backup handlers
  const exportBackup = async () => {
    return api.exportBackupJson();
  };

  const importBackup = async () => {
    const res = await api.importBackupJson();
    if (res.success) {
      await loadAccounts();
      if (selectedAccountId) {
        await loadItems(selectedAccountId);
      }
    }
    return res;
  };

  const selectedAccount = accounts.find(a => a.id === selectedAccountId) || null;

  return (
    <AppContext.Provider
      value={{
        accounts,
        selectedAccountId,
        selectedAccount,
        setSelectedAccountId,
        loadAccounts,
        createAccount,
        updateAccount,
        deleteAccount,
        accountSearch,
        setAccountSearch,
        sortField,
        sortDirection,
        setSorting,
        filteredAndSortedAccounts,
        activeItems,
        loadItems,
        createItem,
        updateItem,
        deleteItem,
        itemViewMode,
        setItemViewMode,
        itemSearch,
        setItemSearch,
        filteredItems,
        isGlobalSearchOpen,
        setIsGlobalSearchOpen,
        globalSearchQuery,
        setGlobalSearchQuery,
        globalSearchResults,
        performGlobalSearch,
        jumpToItem,
        highlightedItemId,
        theme,
        setTheme,
        fontSize,
        setFontSize,
        isSettingsModalOpen,
        setIsSettingsModalOpen,
        exportBackup,
        importBackup,
        dbPath,
        isLoading,
        error,
        setError,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
