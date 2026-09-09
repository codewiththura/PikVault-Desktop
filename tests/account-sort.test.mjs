import test from 'node:test';
import assert from 'node:assert/strict';

/**
 * Pure function replicating AppContext account sorting logic
 */
function sortAccounts(accounts, sortField, sortDirection = 'asc') {
  const list = [...accounts];
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
