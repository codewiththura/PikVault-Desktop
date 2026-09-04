import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateStorage, formatMB, parseSizeInputToMB } from '../src/utils/storage.ts';

test('Storage Quota and Calculation Test', () => {
  // 1. Empty items
  const emptyCalc = calculateStorage([], 6);
  assert.equal(emptyCalc.totalUsedMB, 0);
  assert.equal(emptyCalc.remainingGB, 6);
  assert.equal(emptyCalc.usedPercent, 0);
  assert.equal(emptyCalc.isExceeded, false);

  // 2. Items totaling 2048 MB (2 GB) out of 6 GB
  const items = [
    { fileSizeMB: 1024 },
    { fileSizeMB: 1024 },
  ];
  const calc = calculateStorage(items, 6);
  assert.equal(calc.totalUsedMB, 2048);
  assert.equal(calc.remainingGB, 4);
  assert.equal(calc.isExceeded, false);

  // 3. Exceeded scenario (> 6 GB = 6144 MB)
  const exceededItems = [
    { fileSizeMB: 4000 },
    { fileSizeMB: 2500 },
  ];
  const exceededCalc = calculateStorage(exceededItems, 6);
  assert.equal(exceededCalc.totalUsedMB, 6500);
  assert.equal(exceededCalc.remainingGB, 0);
  assert.equal(exceededCalc.isExceeded, true);

  // 4. Formatting
  assert.equal(formatMB(0), '0 MB');
  assert.equal(formatMB(500), '500.0 MB');
  assert.equal(formatMB(2048), '2.00 GB');

  // 5. Parsing input
  assert.equal(parseSizeInputToMB('1.5 GB'), 1536);
  assert.equal(parseSizeInputToMB('500MB'), 500);
});
