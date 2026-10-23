import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  exportOutfitBackup,
  importOutfitBackup,
  getSavedOutfits,
  getCustomOutfitRules,
  saveOutfitToLocalStorage,
  saveCustomOutfitRules,
} from '../lib/local-storage-utils.ts';

// lib/local-storage-utils.ts guards on `typeof window === "undefined"`, so
// node tests stub both window and a map-backed localStorage on globalThis.
let store;
function installStorage(over = {}) {
  store = new Map();
  globalThis.window = {};
  globalThis.localStorage = {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => {
      if (over.throwOnWrite) throw new Error('QuotaExceededError');
      store.set(key, String(value));
    },
  };
}
function uninstallStorage() {
  delete globalThis.window;
  delete globalThis.localStorage;
}

const outfit = (over = {}) => ({
  id: over.id ?? 'outfit-1',
  emoji: over.emoji ?? '🧥',
  description: over.description ?? 'A cozy layered look',
  conditionSummary: over.conditionSummary ?? 'Cool',
  temperature: over.temperature ?? 8,
  location: over.location ?? 'Toronto',
  ...over,
});

const rule = (over = {}) => ({
  id: over.id ?? 'rule-1',
  name: over.name ?? 'Park day',
  emoji: over.emoji ?? '🌞',
  description: over.description ?? 'Sunscreen and sneakers',
  ...over,
});

afterEach(uninstallStorage);

describe('exportOutfitBackup', () => {
  it('returns null outside the browser (no window)', () => {
    assert.equal(exportOutfitBackup(), null);
  });

  it('round-trips favorites and custom rules into a versioned payload', () => {
    installStorage();
    saveOutfitToLocalStorage(outfit());
    saveOutfitToLocalStorage(outfit({ id: 'outfit-2', description: 'Shorts weather', temperature: 27 }));
    saveCustomOutfitRules([rule()]);

    const backup = JSON.parse(exportOutfitBackup());
    assert.equal(backup.app, 'outfitweather');
    assert.equal(backup.version, 1);
    assert.equal(backup.favorites.length, 2);
    assert.equal(backup.customRules.length, 1);
    assert.equal(backup.favorites[0].description, 'A cozy layered look');
    assert.match(backup.exportedAt, /^\d{4}-\d{2}-\d{2}T/);
  });

  it('exports an empty archive when nothing is saved yet', () => {
    installStorage();
    const backup = JSON.parse(exportOutfitBackup());
    assert.deepEqual(backup.favorites, []);
    assert.deepEqual(backup.customRules, []);
  });
});

describe('importOutfitBackup — acceptance', () => {
  it('imports a full export into a fresh browser', () => {
    installStorage();
    saveOutfitToLocalStorage(outfit());
    saveCustomOutfitRules([rule()]);
    const file = exportOutfitBackup();

    uninstallStorage();
    installStorage();
    const result = importOutfitBackup(file);

    assert.equal(result.saved, true);
    assert.equal(result.importedFavorites, 1);
    assert.equal(result.importedRules, 1);
    assert.equal(getSavedOutfits().length, 1);
    assert.equal(getCustomOutfitRules().length, 1);
  });

  it('accepts an already-parsed payload object, not just strings', () => {
    installStorage();
    const result = importOutfitBackup({ favorites: [outfit()], customRules: [rule()] });
    assert.equal(result.importedFavorites, 1);
    assert.equal(result.importedRules, 1);
  });

  it('reads a bare array as a favorites-only export', () => {
    installStorage();
    const result = importOutfitBackup(JSON.stringify([outfit(), outfit({ id: 'outfit-2', description: 'Shorts weather', temperature: 27 })]));
    assert.equal(result.importedFavorites, 2);
    assert.equal(result.importedRules, 0);
    assert.equal(getSavedOutfits().length, 2);
  });

  it('imports rules-only payloads (favorites kept untouched)', () => {
    installStorage();
    saveOutfitToLocalStorage(outfit());
    const result = importOutfitBackup({ favorites: [], customRules: [rule()] });
    assert.equal(result.importedRules, 1);
    assert.equal(getSavedOutfits().length, 1);
  });
});

describe('importOutfitBackup — merge semantics', () => {
  it('re-importing the same file imports nothing new (duplicate by description+temperature+location)', () => {
    installStorage();
    saveOutfitToLocalStorage(outfit());
    const file = exportOutfitBackup();

    assert.equal(importOutfitBackup(file).duplicateFavorites, 1);
    assert.equal(getSavedOutfits().length, 1);
  });

  it('same description at a different temperature is NOT a duplicate', () => {
    installStorage();
    saveOutfitToLocalStorage(outfit());
    const result = importOutfitBackup([outfit({ id: 'outfit-9', temperature: 9 })]);
    assert.equal(result.importedFavorites, 1);
    assert.equal(result.duplicateFavorites, 0);
  });

  it('skips rules whose id already exists', () => {
    installStorage();
    saveCustomOutfitRules([rule()]);
    const result = importOutfitBackup({
      favorites: [],
      customRules: [rule(), rule({ id: 'rule-2', name: 'Rain walk' })],
    });
    assert.equal(result.importedRules, 1);
    assert.equal(result.duplicateRules, 1);
    assert.equal(getCustomOutfitRules().length, 2);
  });

  it('never overwrites existing data with the file contents', () => {
    installStorage();
    saveOutfitToLocalStorage(outfit({ description: 'Kept' }));
    importOutfitBackup([outfit({ description: 'From file' })]);
    const descriptions = getSavedOutfits().map((favorite) => favorite.description);
    assert.ok(descriptions.includes('Kept'));
    assert.ok(descriptions.includes('From file'));
  });

  it('reports saved:false and changes nothing when storage writes fail', () => {
    installStorage({ throwOnWrite: true });
    const result = importOutfitBackup([outfit()]);
    assert.equal(result.saved, false);
    assert.equal(result.importedFavorites, 1);
    assert.deepEqual(getSavedOutfits(), []);
  });
});

describe('importOutfitBackup — hostile input', () => {
  it('returns null for corrupt JSON strings', () => {
    installStorage();
    assert.equal(importOutfitBackup('{not json'), null);
  });

  it('returns null for shapes without both arrays', () => {
    installStorage();
    assert.equal(importOutfitBackup('42'), null);
    assert.equal(importOutfitBackup('null'), null);
    assert.equal(importOutfitBackup(null), null);
    assert.equal(importOutfitBackup({ favorites: [] }), null);
    assert.equal(importOutfitBackup({}), null);
    assert.deepEqual(getSavedOutfits(), []);
  });

  it('counts invalid entries but keeps the valid ones', () => {
    installStorage();
    const result = importOutfitBackup({
      favorites: [outfit(), { nope: true }, null],
      customRules: [rule(), 'junk'],
    });
    assert.equal(result.importedFavorites, 1);
    assert.equal(result.importedRules, 1);
    assert.equal(result.invalidEntries, 3);
    assert.equal(getSavedOutfits().length, 1);
    assert.equal(getCustomOutfitRules().length, 1);
  });

  it('never throws on exotic inputs', () => {
    installStorage();
    for (const raw of [undefined, 0, true, Symbol('x'), () => {}, '{', '[]', [[]]]) {
      assert.doesNotThrow(() => importOutfitBackup(raw));
    }
  });
});
