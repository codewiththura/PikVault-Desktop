import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeSearchText, matchesSearchText } from '../src/utils/search.ts';

test('normalizeSearchText strips delimiters and normalizes to lowercase', () => {
  assert.equal(normalizeSearchText('abc-58'), 'abc58');
  assert.equal(normalizeSearchText('abc 58'), 'abc58');
  assert.equal(normalizeSearchText('abc_58'), 'abc58');
  assert.equal(normalizeSearchText('ABC-58.mp4'), 'abc58mp4');
  assert.equal(normalizeSearchText(''), '');
});

test('matchesSearchText: file name "abc-58" matches "abc 58" and "abc58"', () => {
  const fileName = 'abc-58';

  assert.equal(matchesSearchText(fileName, 'abc 58'), true, 'abc-58 should match search "abc 58"');
  assert.equal(matchesSearchText(fileName, 'abc58'), true, 'abc-58 should match search "abc58"');
  assert.equal(matchesSearchText(fileName, 'abc-58'), true, 'abc-58 should match search "abc-58"');
  assert.equal(matchesSearchText(fileName, 'ABC 58'), true, 'abc-58 should match case-insensitive "ABC 58"');
});

test('matchesSearchText vice-versa: file name "abc 58" or "abc58" matches "abc-58"', () => {
  // Vice versa: target is "abc 58"
  assert.equal(matchesSearchText('abc 58', 'abc-58'), true, '"abc 58" should match search "abc-58"');
  assert.equal(matchesSearchText('abc 58', 'abc58'), true, '"abc 58" should match search "abc58"');

  // Vice versa: target is "abc58"
  assert.equal(matchesSearchText('abc58', 'abc-58'), true, '"abc58" should match search "abc-58"');
  assert.equal(matchesSearchText('abc58', 'abc 58'), true, '"abc58" should match search "abc 58"');
});

test('matchesSearchText: substring and complex file names', () => {
  const target = 'project_backup-abc-58_v2.tar.gz';

  assert.equal(matchesSearchText(target, 'abc 58'), true);
  assert.equal(matchesSearchText(target, 'abc58'), true);
  assert.equal(matchesSearchText(target, 'abc-58'), true);
  assert.equal(matchesSearchText(target, 'project backup'), true);
  assert.equal(matchesSearchText(target, 'projectbackup'), true);
  assert.equal(matchesSearchText(target, 'project-backup'), true);

  // Non-matching query
  assert.equal(matchesSearchText(target, 'xyz 99'), false);
  assert.equal(matchesSearchText(target, ''), false);
  assert.equal(matchesSearchText(target, '   '), false);
});
