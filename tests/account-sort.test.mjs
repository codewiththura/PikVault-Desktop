import test from 'node:test';
import assert from 'node:assert/strict';

/**
 * Pure function replicating AppContext account sorting logic
 */
function sortAccounts(accounts, sortField, sortDirection = 'asc') {
  const list = [...accounts];
  list.sort((a, b) => {
    // 1. Pinned accounts ALWAYS come before unpinned accounts
    const pinA = a.isPinned ? 1 : 0;
    const pinB = b.isPinned ? 1 : 0;
    if (pinA !== pinB) {
      return pinB - pinA; // Pinned (1) comes before unpinned (0)
    }

    // 2. Secondary sorting
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
    } else if (sortField === 'createdAt') {
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      comparison = timeA - timeB;
    }
    return sortDirection === 'asc' ? comparison : -comparison;
  });
  return list;
}

test('Account Sorting by Created Date (createdAt)', () => {
  const sampleAccounts = [
    {
      id: 'acc-1',
      username: 'charlie@example.com',
      createdAt: '2026-03-01T10:00:00.000Z',
      lastLogin: '2026-09-01T00:00:00.000Z',
      remainingGB: 4.0,
    },
    {
      id: 'acc-2',
      username: 'alice@example.com',
      createdAt: '2026-01-15T08:30:00.000Z',
      lastLogin: '2026-08-15T00:00:00.000Z',
      remainingGB: 1.5,
    },
    {
      id: 'acc-3',
      username: 'bob@example.com',
      createdAt: '2026-05-20T14:45:00.000Z',
      lastLogin: '2026-07-20T00:00:00.000Z',
      remainingGB: 5.5,
    },
  ];

  // 1. Sort by createdAt ascending (oldest first)
  const sortedAsc = sortAccounts(sampleAccounts, 'createdAt', 'asc');
  assert.equal(sortedAsc[0].id, 'acc-2', 'Oldest account (Jan 2026) should be first in asc');
  assert.equal(sortedAsc[1].id, 'acc-1', 'Mid account (Mar 2026) should be second in asc');
  assert.equal(sortedAsc[2].id, 'acc-3', 'Newest account (May 2026) should be last in asc');

  // 2. Sort by createdAt descending (newest first)
  const sortedDesc = sortAccounts(sampleAccounts, 'createdAt', 'desc');
  assert.equal(sortedDesc[0].id, 'acc-3', 'Newest account (May 2026) should be first in desc');
  assert.equal(sortedDesc[1].id, 'acc-1', 'Mid account (Mar 2026) should be second in desc');
  assert.equal(sortedDesc[2].id, 'acc-2', 'Oldest account (Jan 2026) should be last in desc');
});

test('Account Sorting by Name, Last Login, and Storage Remaining', () => {
  const sampleAccounts = [
    {
      id: 'acc-1',
      username: 'charlie@example.com',
      createdAt: '2026-03-01T10:00:00.000Z',
      lastLogin: '2026-09-01T00:00:00.000Z',
      remainingGB: 4.0,
    },
    {
      id: 'acc-2',
      username: 'alice@example.com',
      createdAt: '2026-01-15T08:30:00.000Z',
      lastLogin: '2026-08-15T00:00:00.000Z',
      remainingGB: 1.5,
    },
    {
      id: 'acc-3',
      username: 'bob@example.com',
      createdAt: '2026-05-20T14:45:00.000Z',
      lastLogin: '2026-07-20T00:00:00.000Z',
      remainingGB: 5.5,
    },
  ];

  // Name asc
  const nameAsc = sortAccounts(sampleAccounts, 'name', 'asc');
  assert.equal(nameAsc[0].username, 'alice@example.com');
  assert.equal(nameAsc[1].username, 'bob@example.com');
  assert.equal(nameAsc[2].username, 'charlie@example.com');

  // Last login desc
  const loginDesc = sortAccounts(sampleAccounts, 'lastLogin', 'desc');
  assert.equal(loginDesc[0].id, 'acc-1', 'Most recent login (Sept) first');
  assert.equal(loginDesc[1].id, 'acc-2', 'Aug login second');
  assert.equal(loginDesc[2].id, 'acc-3', 'July login third');

  // Storage remain asc
  const storageAsc = sortAccounts(sampleAccounts, 'storageRemain', 'asc');
  assert.equal(storageAsc[0].id, 'acc-2', '1.5 GB remaining first');
  assert.equal(storageAsc[1].id, 'acc-1', '4.0 GB remaining second');
  assert.equal(storageAsc[2].id, 'acc-3', '5.5 GB remaining third');
});

test('Account Search Filter by Username and Description', () => {
  const sampleAccounts = [
    {
      id: 'acc-1',
      username: 'alexander.dev@megamail.com',
      description: 'Primary developer cloud backup storage',
    },
    {
      id: 'acc-2',
      username: 'media.vault.backup@proton.me',
      description: 'Encrypted media and video master repository',
    },
    {
      id: 'acc-3',
      username: 'cold.archive@fastmail.com',
      description: undefined,
    },
  ];

  function filterAccounts(accounts, query) {
    const q = query.toLowerCase().trim();
    return accounts.filter(
      (acc) =>
        acc.username.toLowerCase().includes(q) ||
        (acc.description && acc.description.toLowerCase().includes(q))
    );
  }

  // Search by username
  const searchByUsername = filterAccounts(sampleAccounts, 'megamail');
  assert.equal(searchByUsername.length, 1);
  assert.equal(searchByUsername[0].id, 'acc-1');

  // Search by description keyword
  const searchByDesc = filterAccounts(sampleAccounts, 'encrypted media');
  assert.equal(searchByDesc.length, 1);
  assert.equal(searchByDesc[0].id, 'acc-2');

  // Case insensitive & whitespace trimmed search
  const searchCaseInsensitive = filterAccounts(sampleAccounts, '  CLOUD BACKUP  ');
  assert.equal(searchCaseInsensitive.length, 1);
  assert.equal(searchCaseInsensitive[0].id, 'acc-1');

  // Empty query returns all
  assert.equal(filterAccounts(sampleAccounts, '').length, 3);
});

test('Pinned Accounts always float to top regardless of field or sort direction', () => {
  const sampleAccounts = [
    {
      id: 'acc-1',
      username: 'zebra@example.com',
      createdAt: '2026-01-01T00:00:00.000Z',
      remainingGB: 1.0,
      isPinned: true, // PINNED
    },
    {
      id: 'acc-2',
      username: 'alpha@example.com',
      createdAt: '2026-05-01T00:00:00.000Z',
      remainingGB: 5.0,
      isPinned: false, // UNPINNED
    },
    {
      id: 'acc-3',
      username: 'middle@example.com',
      createdAt: '2026-03-01T00:00:00.000Z',
      remainingGB: 3.0,
      isPinned: false, // UNPINNED
    },
    {
      id: 'acc-4',
      username: 'beta-pinned@example.com',
      createdAt: '2026-02-01T00:00:00.000Z',
      remainingGB: 4.0,
      isPinned: true, // PINNED
    },
  ];

  // 1. Sort by name asc:
  // Pinned accounts (zebra, beta-pinned) must come first!
  // Between pinned: beta-pinned then zebra.
  // Then unpinned: alpha then middle.
  const nameAsc = sortAccounts(sampleAccounts, 'name', 'asc');
  assert.equal(nameAsc[0].id, 'acc-4', 'Pinned beta comes first');
  assert.equal(nameAsc[1].id, 'acc-1', 'Pinned zebra comes second');
  assert.equal(nameAsc[2].id, 'acc-2', 'Unpinned alpha comes third');
  assert.equal(nameAsc[3].id, 'acc-3', 'Unpinned middle comes fourth');

  // 2. Sort by name desc:
  // Pinned accounts still come first!
  // Between pinned: zebra then beta-pinned.
  // Then unpinned: middle then alpha.
  const nameDesc = sortAccounts(sampleAccounts, 'name', 'desc');
  assert.equal(nameDesc[0].id, 'acc-1', 'Pinned zebra comes first in desc');
  assert.equal(nameDesc[1].id, 'acc-4', 'Pinned beta comes second in desc');
  assert.equal(nameDesc[2].id, 'acc-3', 'Unpinned middle comes third in desc');
  assert.equal(nameDesc[3].id, 'acc-2', 'Unpinned alpha comes fourth in desc');

  // 3. Sort by storage remaining asc:
  // acc-1 (pinned, 1GB), acc-4 (pinned, 4GB) first
  // acc-3 (unpinned, 3GB), acc-2 (unpinned, 5GB) next
  const storageAsc = sortAccounts(sampleAccounts, 'storageRemain', 'asc');
  assert.equal(storageAsc[0].id, 'acc-1', 'acc-1 is pinned with lowest storage');
  assert.equal(storageAsc[1].id, 'acc-4', 'acc-4 is pinned with higher storage');
  assert.equal(storageAsc[2].id, 'acc-3', 'acc-3 is unpinned with 3GB');
  assert.equal(storageAsc[3].id, 'acc-2', 'acc-2 is unpinned with 5GB');
});

