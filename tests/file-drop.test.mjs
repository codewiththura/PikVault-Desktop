import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractFileMetadata,
  formatDroppedFileSize,
  isFilesDragEvent,
} from '../src/utils/fileDrop.ts';

test('File Drop - extractFileMetadata for various file formats and sizes', () => {
  // 1. Standard large video file
  const videoFile = {
    name: 'ubuntu-noble-desktop-amd64.iso',
    size: 2684354560, // 2.5 GB in bytes (2560 MB)
  };
  const videoMeta = extractFileMetadata(videoFile);
  assert.equal(videoMeta.fileName, 'ubuntu-noble-desktop-amd64.iso');
  assert.equal(videoMeta.fileType, 'iso');
  assert.equal(videoMeta.fileSizeMB, 2560);
  assert.equal(videoMeta.originalSize, 2684354560);

  // 2. File with multiple dots in filename
  const multiDotFile = {
    name: 'financial.report.q3.2026.pdf',
    size: 5242880, // 5 MB
  };
  const pdfMeta = extractFileMetadata(multiDotFile);
  assert.equal(pdfMeta.fileName, 'financial.report.q3.2026.pdf');
  assert.equal(pdfMeta.fileType, 'pdf');
  assert.equal(pdfMeta.fileSizeMB, 5);

  // 3. Uppercase extension should be lowercased and sanitized
  const upperFile = {
    name: 'HOLIDAY_PHOTOS.ZIP',
    size: 157286400, // 150 MB
  };
  const zipMeta = extractFileMetadata(upperFile);
  assert.equal(zipMeta.fileType, 'zip');
  assert.equal(zipMeta.fileSizeMB, 150);

  // 4. Very small / sub-megabyte file (e.g. 5 KB) gets minimum precision 0.01 MB
  const smallFile = {
    name: 'config.json',
    size: 5120, // 5 KB
  };
  const smallMeta = extractFileMetadata(smallFile);
  assert.equal(smallMeta.fileName, 'config.json');
  assert.equal(smallMeta.fileType, 'json');
  assert.equal(smallMeta.fileSizeMB, 0.01);

  // 5. File without extension defaults to 'other'
  const noExtFile = {
    name: 'LICENSE',
    size: 32000,
  };
  const noExtMeta = extractFileMetadata(noExtFile);
  assert.equal(noExtMeta.fileType, 'other');

  // 6. Zero-byte empty file
  const emptyFile = {
    name: 'empty.dat',
    size: 0,
  };
  const emptyMeta = extractFileMetadata(emptyFile);
  assert.equal(emptyMeta.fileSizeMB, 0);
});

test('File Drop - formatDroppedFileSize human readable formatting', () => {
  assert.equal(formatDroppedFileSize(0), '0 B');
  assert.equal(formatDroppedFileSize(500), '500 B');
  assert.equal(formatDroppedFileSize(2048), '2.00 KB');
  assert.equal(formatDroppedFileSize(1048576), '1.00 MB');
  assert.equal(formatDroppedFileSize(157286400), '150.00 MB');
  assert.equal(formatDroppedFileSize(1073741824), '1.00 GB');
  assert.equal(formatDroppedFileSize(3221225472), '3.00 GB');
});

test('File Drop - isFilesDragEvent correctly detects external files', () => {
  // Positive case: contains 'Files'
  const validEvent = {
    dataTransfer: {
      types: ['Files'],
    },
  };
  assert.equal(isFilesDragEvent(validEvent), true);

  // Multiple types including Files
  const mixedEvent = {
    dataTransfer: {
      types: ['text/plain', 'Files', 'text/uri-list'],
    },
  };
  assert.equal(isFilesDragEvent(mixedEvent), true);

  // Negative case: only internal text drag
  const textEvent = {
    dataTransfer: {
      types: ['text/plain'],
    },
  };
  assert.equal(isFilesDragEvent(textEvent), false);

  // Empty or null dataTransfer
  assert.equal(isFilesDragEvent({}), false);
  assert.equal(isFilesDragEvent({ dataTransfer: null }), false);
});

test('File Drop - Quota Excess Calculation Logic', () => {
  const MB_PER_GB = 1024;
  const maxStorageGB = 6;
  const maxStorageMB = maxStorageGB * MB_PER_GB; // 6144 MB
  const currentUsedMB = 4500; // Account already has 4500 MB used

  function checkDropQuota(currentUsed, dropFilesMB, maxGB) {
    const maxMB = maxGB * MB_PER_GB;
    const projectedMB = currentUsed + dropFilesMB;
    const isExceeded = projectedMB > maxMB;
    const overageMB = isExceeded ? projectedMB - maxMB : 0;
    const remainingMB = Math.max(0, maxMB - projectedMB);
    return {
      projectedMB,
      isExceeded,
      overageMB,
      remainingMB,
    };
  }

  // Case 1: Within limit (dropping 1000 MB => 5500 MB total)
  const okResult = checkDropQuota(currentUsedMB, 1000, maxStorageGB);
  assert.equal(okResult.projectedMB, 5500);
  assert.equal(okResult.isExceeded, false);
  assert.equal(okResult.overageMB, 0);
  assert.equal(okResult.remainingMB, 644);

  // Case 2: Exceeding limit (dropping 2000 MB => 6500 MB total)
  const excessResult = checkDropQuota(currentUsedMB, 2000, maxStorageGB);
  assert.equal(excessResult.projectedMB, 6500);
  assert.equal(excessResult.isExceeded, true);
  assert.equal(excessResult.overageMB, 356); // 6500 - 6144
  assert.equal(excessResult.remainingMB, 0);
});

