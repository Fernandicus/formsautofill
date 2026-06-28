import { describe, it, expect } from 'vitest';

class CacheManager {
  // Internal implementation detail (private field)
  private _cache = new Map<string, any>();

  set(key: string, value: any): void {
    this._cache.set(key, value);
  }

  get(key: string): any {
    return this._cache.get(key);
  }
}

describe('CacheManager', () => {
  // ❌ BAD: Testing internal implementation details.
  // Renaming or refactoring the private `_cache` field will break this test even if behavior stays correct.
  it('should store items in the internal cache map', () => {
    const cacheManager = new CacheManager();
    cacheManager.set('key', 'value');
    
    // Accessing internal private properties makes tests brittle
    expect((cacheManager as any)._cache.has('key')).toBe(true); 
  });

  // ✅ GOOD: Testing public behavior contract.
  // The test only interacts with the public API. We can change the storage to Redis or local storage,
  // and the test remains green.
  it('should retrieve a previously stored value', () => {
    const cacheManager = new CacheManager();
    
    cacheManager.set('key', 'value');
    const result = cacheManager.get('key');
    
    expect(result).toBe('value');
  });
});
