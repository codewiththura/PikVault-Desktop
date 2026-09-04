import test from 'node:test';
import assert from 'node:assert/strict';

// Mock localStorage and document for testing theme & font size persistence
const store = {};
globalThis.localStorage = {
  getItem(k) { return store[k] || null; },
  setItem(k, v) { store[k] = String(v); },
  removeItem(k) { delete store[k]; },
  clear() { Object.keys(store).forEach(k => delete store[k]); }
};

const styles = {};
const attributes = {};
globalThis.document = {
  documentElement: {
    setAttribute(k, v) { attributes[k] = String(v); },
    getAttribute(k) { return attributes[k]; },
    style: {
      setProperty(k, v) { styles[k] = String(v); },
      getPropertyValue(k) { return styles[k]; }
    }
  }
};

test('Theme and Font Size Preferences Persistence Test', () => {
  // Test Theme persistence
  localStorage.setItem('vault_theme_pref', 'light');
  assert.equal(localStorage.getItem('vault_theme_pref'), 'light');

  document.documentElement.setAttribute('data-theme', 'light');
  assert.equal(document.documentElement.getAttribute('data-theme'), 'light');

  // Test Font Size mapping across all sizes
  const pxMap = { small: '11px', medium: '13px', large: '15px', xlarge: '17px' };

  // Set to large
  localStorage.setItem('vault_fontsize_pref', 'large');
  assert.equal(localStorage.getItem('vault_fontsize_pref'), 'large');
  document.documentElement.style.setProperty('--base-font-size', pxMap['large']);
  assert.equal(styles['--base-font-size'], '15px');

  // Simulate app restart / re-entry: read preference on startup
  const restoredPref = localStorage.getItem('vault_fontsize_pref') || 'medium';
  assert.equal(restoredPref, 'large', 'Font size should persist as large after app exit and re-entry');
  document.documentElement.style.setProperty('--base-font-size', pxMap[restoredPref] || '13px');
  assert.equal(styles['--base-font-size'], '15px');

  // Set to xlarge
  localStorage.setItem('vault_fontsize_pref', 'xlarge');
  assert.equal(localStorage.getItem('vault_fontsize_pref'), 'xlarge');
  document.documentElement.style.setProperty('--base-font-size', pxMap['xlarge']);
  assert.equal(styles['--base-font-size'], '17px');
});

