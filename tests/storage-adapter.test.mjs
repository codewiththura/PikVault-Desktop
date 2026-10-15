import test from 'node:test';
import assert from 'node:assert/strict';

// Polyfill localStorage in node environment for testing adapter
globalThis.localStorage = {
  store: {},
  getItem(key) {
    return this.store[key] || null;
  },
  setItem(key, value) {
    this.store[key] = String(value);
  },
  removeItem(key) {
    delete this.store[key];
  },
  clear() {
    this.store = {};
  },
};

const { browserApiFallback } = await import('../src/services/storageAdapter.ts');

test('Storage Adapter (Fallback & Web Engine) CRUD Test', async () => {
  // 1. Fetch initial accounts
  const initialAccounts = await browserApiFallback.getAccounts();
  assert.ok(initialAccounts.length >= 3, 'Initial accounts should be seeded');

  // 2. Create new account with description
  const newAcc = await browserApiFallback.createAccount({
    username: 'new.user@testvault.org',
    password: 'TestPassword#2026',
    lastLogin: new Date().toISOString(),
    maxStorageGB: 6.0,
    description: 'Browser fallback account with custom description',
  });
  assert.ok(newAcc.id.startsWith('acc-'));
  assert.equal(newAcc.username, 'new.user@testvault.org');
  assert.equal(newAcc.description, 'Browser fallback account with custom description');

  // 3. Verify it is shown in getAccounts()
  const updatedAccounts = await browserApiFallback.getAccounts();
  const found = updatedAccounts.find((a) => a.id === newAcc.id);
  assert.ok(found, 'Newly created account must be found in accounts list');
  assert.equal(found.username, 'new.user@testvault.org');
  assert.equal(found.description, 'Browser fallback account with custom description');
  assert.equal(found.remainingGB, 6.0);

  // 3b. Update account description
  const updated = await browserApiFallback.updateAccount({
    id: newAcc.id,
    description: 'Updated description in browser adapter',
  });
  assert.equal(updated.description, 'Updated description in browser adapter');

  // 4. Add stored data item to the new account
  const newItem = await browserApiFallback.createItem({
    accountId: newAcc.id,
    fileName: 'sample-video-guide.mp4',
    fileSizeMB: 1500,
    fileType: 'mp4',
    externalLinks: ['https://example.com/download'],
    note: 'Test file note',
  });
  assert.ok(newItem.id.startsWith('item-'));
  assert.equal(newItem.fileName, 'sample-video-guide.mp4');

  // 5. Check item count and storage calculation for account
  const recheckAccounts = await browserApiFallback.getAccounts();
  const accWithItem = recheckAccounts.find((a) => a.id === newAcc.id);
  assert.equal(accWithItem.itemCount, 1);
  assert.equal(accWithItem.totalUsedMB, 1500);
  assert.ok(accWithItem.remainingGB < 6.0);

  // 5b. Test copying item to another account
  const targetAcc = initialAccounts[0];
  const copied = await browserApiFallback.copyItemToAccount(newItem.id, targetAcc.id);
  assert.ok(copied.id.startsWith('item-'));
  assert.notEqual(copied.id, newItem.id);
  assert.equal(copied.accountId, targetAcc.id);
  assert.equal(copied.fileName, newItem.fileName);
  assert.equal(copied.fileSizeMB, 1500);

  const targetItems = await browserApiFallback.getItemsByAccountId(targetAcc.id);
  const foundCopiedItem = targetItems.find((i) => i.id === copied.id);
  assert.ok(foundCopiedItem, 'Copied item should exist in target account');

  // 6. Test global search
  const searchResults = await browserApiFallback.searchGlobalItems('sample-video');
  assert.ok(searchResults.length >= 2, 'Global search should now find both original and copied items');
  assert.ok(searchResults.some((r) => r.account.username === 'new.user@testvault.org'));
  assert.ok(searchResults.some((r) => r.account.username === targetAcc.username));

  // Test clearing search returns empty list
  const emptyResults = await browserApiFallback.searchGlobalItems('');
  assert.equal(emptyResults.length, 0, 'Clearing search query to empty string should return 0 results');
  const whitespaceResults = await browserApiFallback.searchGlobalItems('   ');
  assert.equal(whitespaceResults.length, 0, 'Whitespace search query should return 0 results');
});
