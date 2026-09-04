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

  // 2. Create new account
  const newAcc = await browserApiFallback.createAccount({
    username: 'new.user@testvault.org',
    password: 'TestPassword#2026',
    lastLogin: new Date().toISOString(),
    maxStorageGB: 6.0,
  });
  assert.ok(newAcc.id.startsWith('acc-'));
  assert.equal(newAcc.username, 'new.user@testvault.org');

  // 3. Verify it is shown in getAccounts()
  const updatedAccounts = await browserApiFallback.getAccounts();
  const found = updatedAccounts.find((a) => a.id === newAcc.id);
  assert.ok(found, 'Newly created account must be found in accounts list');
  assert.equal(found.username, 'new.user@testvault.org');
  assert.equal(found.remainingGB, 6.0);

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

  // 6. Test global search
  const searchResults = await browserApiFallback.searchGlobalItems('sample-video');
  assert.ok(searchResults.length >= 1);
  assert.equal(searchResults[0].account.username, 'new.user@testvault.org');
});
