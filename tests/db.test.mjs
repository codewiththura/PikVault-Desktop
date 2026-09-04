import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { initDatabase, getDbPath, persistDatabase } from '../dist-electron/db/database.js';
import { AccountRepo } from '../dist-electron/db/accountRepo.js';
import { ItemRepo } from '../dist-electron/db/itemRepo.js';
import { SettingsRepo } from '../dist-electron/db/settingsRepo.js';

test('SQLite Database Engine & Schema Test', async () => {
  // Use isolated test data directory
  const testDataDir = path.resolve(process.cwd(), 'tests-data');
  process.env.APP_DATA_DIR = testDataDir;
  if (!fs.existsSync(testDataDir)) {
    fs.mkdirSync(testDataDir, { recursive: true });
  }

  // 1. Initialize DB
  await initDatabase();
  assert.ok(fs.existsSync(getDbPath()), 'Database file should exist');

  // 1b. Test SettingsRepo in SQLite
  const initialSettings = SettingsRepo.getAll();
  assert.ok(initialSettings.vault_fontsize_pref, 'Default font size should be seeded');
  SettingsRepo.set('vault_fontsize_pref', 'large');
  assert.equal(SettingsRepo.get('vault_fontsize_pref'), 'large');
  SettingsRepo.set('vault_theme_pref', 'light');
  assert.equal(SettingsRepo.get('vault_theme_pref'), 'light');

  // 2. Query Accounts

  const accounts = AccountRepo.getAll();
  assert.ok(accounts.length >= 3, 'Should have at least 3 initial seeded accounts');
  
  const acc1 = accounts.find(a => a.username === 'alexander.dev@megamail.com');
  assert.ok(acc1, 'Account 1 should exist');
  assert.equal(acc1.maxStorageGB, 6.0, 'Max storage should be 6 GB');
  assert.ok(acc1.totalUsedMB > 0, 'Total used should be calculated from items');
  assert.ok(acc1.remainingGB <= 6.0, 'Remaining storage should be <= 6 GB');

  // 3. Create a new account
  const newAcc = AccountRepo.create({
    username: 'test.linux@proton.me',
    password: 'LinuxPassword123!',
    lastLogin: new Date().toISOString(),
    maxStorageGB: 6.0,
  });
  assert.ok(newAcc.id.startsWith('acc-'), 'Created account ID should have prefix');
  assert.equal(newAcc.username, 'test.linux@proton.me');

  // 4. Create a stored item for the new account
  const newItem = ItemRepo.create({
    accountId: newAcc.id,
    fileName: 'ubuntu-server-24.04.iso',
    imageUrl: 'https://example.com/ubuntu.png',
    fileSizeMB: 2600.0,
    fileType: 'mp4',
    externalLinks: ['https://releases.ubuntu.com/24.04/'],
    updatedDate: '2026-09-04',
    note: 'Server installation test image',
  });
  assert.ok(newItem.id.startsWith('item-'), 'Created item ID should have prefix');
  assert.equal(newItem.fileType, 'mp4');

  // 5. Query items by account ID
  const items = ItemRepo.getByAccountId(newAcc.id);
  assert.equal(items.length, 1);
  assert.equal(items[0].fileName, 'ubuntu-server-24.04.iso');

  // 6. Test Global Search across accounts
  const searchResults = ItemRepo.searchGlobal('ubuntu');
  assert.ok(searchResults.length >= 1, 'Global search should find ubuntu item');
  assert.equal(searchResults[0].account.username, 'test.linux@proton.me', 'Global search should show owning account');

  // 7. Cleanup test data
  AccountRepo.delete(newAcc.id);
  const itemsAfterDelete = ItemRepo.getByAccountId(newAcc.id);
  assert.equal(itemsAfterDelete.length, 0, 'Items should be deleted with cascade');

  // Clean test dir
  try {
    fs.rmSync(testDataDir, { recursive: true, force: true });
  } catch {}
});
