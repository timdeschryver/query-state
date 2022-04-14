import { Injectable, InjectionToken } from '@angular/core';

export const QUERY_STATE_CACHE = new InjectionToken<QueryStateCache>(
  'QUERY_STATE_CACHE'
);
@Injectable({
  providedIn: 'root',
})
export class QueryStateCache {
  private cache = new Map<string, Map<string, unknown>>();

  getCacheEntry(name: string, key: string): unknown | undefined {
    return this.readCache(name).get(key);
  }

  setCacheEntry(name: string, key: string, value: unknown): void {
    const cache = this.readCache(name);
    cache.set(key, value);
  }

  private readCache(name: string): Map<string, unknown> {
    if (!this.cache.has(name)) {
      this.cache.set(name, new Map());
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.cache.get(name)!;
  }
}
