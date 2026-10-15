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

  // 3. Create a new account with description
  const newAcc = AccountRepo.create({
    username: 'test.linux@proton.me',
    password: 'LinuxPassword123!',
    lastLogin: new Date().toISOString(),
    maxStorageGB: 6.0,
    description: 'Automated test account with description field',
  });
  assert.ok(newAcc.id.startsWith('acc-'), 'Created account ID should have prefix');
  assert.equal(newAcc.username, 'test.linux@proton.me');
  assert.equal(newAcc.description, 'Automated test account with description field');

  // 3b. Test getById and update account with description
  const fetched = AccountRepo.getById(newAcc.id);
  assert.ok(fetched, 'Account should be retrievable by ID');
  assert.equal(fetched.description, 'Automated test account with description field');

  const updatedAcc = AccountRepo.update({
    id: newAcc.id,
    description: 'Updated description for account ledger',
  });
  assert.equal(updatedAcc.description, 'Updated description for account ledger');
  const refetched = AccountRepo.getById(newAcc.id);
  assert.equal(refetched.description, 'Updated description for account ledger');

  // 3c. Test togglePin on AccountRepo
  assert.equal(refetched.isPinned, false, 'New account should default to unpinned');
  const pinnedAcc = AccountRepo.togglePin(newAcc.id);
  assert.equal(pinnedAcc.isPinned, true, 'Account should be pinned after toggle');
  const refetchedPinned = AccountRepo.getById(newAcc.id);
  assert.equal(refetchedPinned.isPinned, true, 'Account should remain pinned when fetched');
  const unpinnedAcc = AccountRepo.togglePin(newAcc.id);
  assert.equal(unpinnedAcc.isPinned, false, 'Account should be unpinned after second toggle');

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

  // 5b. Test copying item to another account
  const copiedItem = ItemRepo.copyToAccount(newItem.id, acc1.id);
  assert.ok(copiedItem.id.startsWith('item-'));
  assert.notEqual(copiedItem.id, newItem.id, 'Copied item must have a new distinct ID');
  assert.equal(copiedItem.accountId, acc1.id, 'Copied item must belong to target account');
  assert.equal(copiedItem.fileName, newItem.fileName);
  assert.equal(copiedItem.fileSizeMB, newItem.fileSizeMB);
  assert.equal(copiedItem.fileType, newItem.fileType);

  const acc1Items = ItemRepo.getByAccountId(acc1.id);
  const foundCopied = acc1Items.find((i) => i.id === copiedItem.id);
  assert.ok(foundCopied, 'Copied item should exist in target account');
  ItemRepo.delete(copiedItem.id);

  // 6. Test Global Search across accounts
  const searchResults = ItemRepo.searchGlobal('ubuntu');
  assert.ok(searchResults.length >= 1, 'Global search should find ubuntu item');
  assert.equal(searchResults[0].account.username, 'test.linux@proton.me', 'Global search should show owning account');

  // Test delimiter-agnostic matching on "ubuntu-server-24.04.iso"
  const searchSpace = ItemRepo.searchGlobal('ubuntu server');
  assert.ok(searchSpace.length >= 1, 'Search "ubuntu server" should find "ubuntu-server-24.04.iso"');
  const searchNoDelimiter = ItemRepo.searchGlobal('ubuntuserver');
  assert.ok(searchNoDelimiter.length >= 1, 'Search "ubuntuserver" should find "ubuntu-server-24.04.iso"');

  // Test user requirement: "abc-58" matched by "abc 58" and "abc58"
  const abcItem = ItemRepo.create({
    accountId: newAcc.id,
    fileName: 'abc-58.mp4',
    fileSizeMB: 10,
    fileType: 'mp4',
  });
  const searchAbcSpace = ItemRepo.searchGlobal('abc 58');
  assert.ok(searchAbcSpace.some((r) => r.item.id === abcItem.id), 'Searching "abc 58" must find "abc-58.mp4"');
  const searchAbcMerged = ItemRepo.searchGlobal('abc58');
  assert.ok(searchAbcMerged.some((r) => r.item.id === abcItem.id), 'Searching "abc58" must find "abc-58.mp4"');

  // Vice-versa: "xyz 99.mkv" matched by "xyz-99" and "xyz99"
  const xyzItem = ItemRepo.create({
    accountId: newAcc.id,
    fileName: 'xyz 99.mkv',
    fileSizeMB: 20,
    fileType: 'mkv',
  });
  const searchXyzHyphen = ItemRepo.searchGlobal('xyz-99');
  assert.ok(searchXyzHyphen.some((r) => r.item.id === xyzItem.id), 'Searching "xyz-99" must find "xyz 99.mkv"');
  const searchXyzMerged = ItemRepo.searchGlobal('xyz99');
  assert.ok(searchXyzMerged.some((r) => r.item.id === xyzItem.id), 'Searching "xyz99" must find "xyz 99.mkv"');

  ItemRepo.delete(abcItem.id);
  ItemRepo.delete(xyzItem.id);

  // 7. Cleanup test data
  AccountRepo.delete(newAcc.id);
  const itemsAfterDelete = ItemRepo.getByAccountId(newAcc.id);
  assert.equal(itemsAfterDelete.length, 0, 'Items should be deleted with cascade');

  // Clean test dir
  try {
    fs.rmSync(testDataDir, { recursive: true, force: true });
  } catch {}
});
