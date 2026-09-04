import { contextBridge, ipcRenderer } from 'electron';
import { Account, StoredItem, ElectronAPI } from './types.js';

const api: ElectronAPI = {
  // Accounts
  getAccounts: () => ipcRenderer.invoke('accounts:getAll'),
  createAccount: (data) => ipcRenderer.invoke('accounts:create', data),
  updateAccount: (data) => ipcRenderer.invoke('accounts:update', data),
  deleteAccount: (id) => ipcRenderer.invoke('accounts:delete', id),

  // Items
  getItemsByAccountId: (accountId) => ipcRenderer.invoke('items:getByAccountId', accountId),
  createItem: (data) => ipcRenderer.invoke('items:create', data),
  updateItem: (data) => ipcRenderer.invoke('items:update', data),
  deleteItem: (id) => ipcRenderer.invoke('items:delete', id),

  // Global Search
  searchGlobalItems: (query) => ipcRenderer.invoke('items:searchGlobal', query),

  // Backup & Restore
  exportBackupJson: () => ipcRenderer.invoke('backup:exportJson'),
  importBackupJson: () => ipcRenderer.invoke('backup:importJson'),

  // DB Path
  getDbPath: () => ipcRenderer.invoke('app:getDbPath'),

  // Settings & Preferences
  getSetting: (key: string) => ipcRenderer.invoke('settings:get', key),
  getAllSettings: () => ipcRenderer.invoke('settings:getAll'),
  setSetting: (key: string, value: string) => ipcRenderer.invoke('settings:set', key, value),
};


contextBridge.exposeInMainWorld('electronAPI', api);
