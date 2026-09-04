import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  Account, 
  StoredItem, 
  AccountSortField, 
  SortDirection, 
  ViewMode, 
  GlobalSearchResult 
} from '../types';

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

  // App Meta
  const [dbPath, setDbPath] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const api = window.electronAPI;

  // Load Accounts
  const loadAccounts = useCallback(async () => {
    if (!api) return;
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
    if (!api) return;
    try {
      const items = await api.getItemsByAccountId(accountId);
      setActiveItems(items);
    } catch (err: any) {
      setError(err?.message || 'Failed to load items');
    }
  }, [api]);

  // Fetch db path & initialize
  useEffect(() => {
    if (api) {
      api.getDbPath().then(setDbPath).catch(console.error);
      loadAccounts();
    }
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
    if (!api) return null;
    try {
      const created = await api.createAccount(data);
      await loadAccounts();
      return created;
    } catch (err: any) {
      setError(err?.message || 'Failed to create account');
      return null;
    }
  };

  const updateAccount = async (data: Partial<Account> & { id: string }) => {
    if (!api) return;
    try {
      await api.updateAccount(data);
      await loadAccounts();
    } catch (err: any) {
      setError(err?.message || 'Failed to update account');
    }
  };

  const deleteAccount = async (id: string) => {
    if (!api) return;
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
    if (!api) return;
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
    if (!api) return;
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
    if (!api) return;
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
    if (!api || !query.trim()) {
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
    if (!api) return { success: false, error: 'API unavailable' };
    return api.exportBackupJson();
  };

  const importBackup = async () => {
    if (!api) return { success: false, error: 'API unavailable' };
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
