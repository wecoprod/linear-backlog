import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TTLCache } from './cache';

describe('TTLCache', () => {
  let cache: TTLCache<string>;

  beforeEach(() => {
    cache = new TTLCache<string>();
    vi.useRealTimers();
  });

  it('returns null on empty cache', () => {
    expect(cache.get('key')).toBeNull();
  });

  it('returns data after set', () => {
    cache.set('key', 'value', 60);
    const result = cache.get('key');
    expect(result).not.toBeNull();
    expect(result!.data).toBe('value');
    expect(result!.isStale).toBe(false);
  });

  it('marks entry as stale after TTL expires', () => {
    vi.useFakeTimers();
    cache.set('key', 'value', 1);
    vi.advanceTimersByTime(1001);
    const result = cache.get('key');
    expect(result).not.toBeNull();
    expect(result!.isStale).toBe(true);
  });

  it('overwrites existing entry on set', () => {
    cache.set('key', 'old', 60);
    cache.set('key', 'new', 60);
    expect(cache.get('key')!.data).toBe('new');
  });
});
