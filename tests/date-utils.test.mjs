import test from 'node:test';
import assert from 'node:assert/strict';
import { formatRelativeTime, isOlderThanDays, formatDateTime, formatDateOnly } from '../src/utils/date.ts';

test('Date Utilities - formatRelativeTime and isOlderThanDays', () => {
  const now = new Date();

  // Test 1: Empty or undefined input
  assert.equal(formatRelativeTime(undefined), 'Never');
  assert.equal(formatRelativeTime(''), 'Never');
  assert.equal(isOlderThanDays(undefined), true);
  assert.equal(isOlderThanDays(''), true);

  // Test 2: Just now (< 1 min ago)
  const justNow = new Date(now.getTime() - 10 * 1000).toISOString();
  assert.equal(formatRelativeTime(justNow), 'Just now');
  assert.equal(isOlderThanDays(justNow, 30), false);

  // Test 3: Hours ago (same day)
  const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString();
  assert.equal(formatRelativeTime(threeHoursAgo), '3 hours ago');
  assert.equal(isOlderThanDays(threeHoursAgo, 30), false);

  // Test 4: 1 day ago
  const oneDayAgo = new Date(now.getTime() - 25 * 60 * 60 * 1000).toISOString();
  assert.equal(formatRelativeTime(oneDayAgo), '1 day ago');
  assert.equal(isOlderThanDays(oneDayAgo, 30), false);

  // Test 5: 20 days ago (< 30 days)
  const twentyDaysAgo = new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString();
  assert.equal(formatRelativeTime(twentyDaysAgo), '20 days ago');
  assert.equal(isOlderThanDays(twentyDaysAgo, 30), false);

  // Test 6: 1 month ago (30-59 days)
  const thirtyTwoDaysAgo = new Date(now.getTime() - 32 * 24 * 60 * 60 * 1000).toISOString();
  assert.equal(formatRelativeTime(thirtyTwoDaysAgo), '1 month ago');
  assert.equal(isOlderThanDays(thirtyTwoDaysAgo, 30), true);

  // Test 7: 3 months ago (90 days)
  const threeMonthsAgo = new Date(now.getTime() - 95 * 24 * 60 * 60 * 1000).toISOString();
  assert.equal(formatRelativeTime(threeMonthsAgo), '3 months ago');
  assert.equal(isOlderThanDays(threeMonthsAgo, 30), true);

  // Test 8: 1 year ago (380 days)
  const oneYearAgo = new Date(now.getTime() - 380 * 24 * 60 * 60 * 1000).toISOString();
  assert.equal(formatRelativeTime(oneYearAgo), '1 year ago');
  assert.equal(isOlderThanDays(oneYearAgo, 30), true);

  // Test 9: 2 years ago (750 days)
  const twoYearsAgo = new Date(now.getTime() - 750 * 24 * 60 * 60 * 1000).toISOString();
  assert.equal(formatRelativeTime(twoYearsAgo), '2 years ago');
  assert.equal(isOlderThanDays(twoYearsAgo, 30), true);
});
