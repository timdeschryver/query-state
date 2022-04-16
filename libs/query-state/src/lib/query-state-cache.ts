import { Injectable } from '@angular/core';
import { QueryStateData } from './contracts';

@Injectable({
  providedIn: 'root',
})
export class QueryStateCache {
  private cache = new Map<
    string,
    Map<string, { data: unknown; meta: QueryStateData<unknown>['meta'] }>
  >();

  getCacheEntry(
    name: string,
    key: string
  ): { data: unknown; meta: QueryStateData<unknown>['meta'] } | undefined {
    return this.readCache(name).get(key);
  }

  setCacheEntry(
    name: string,
    key: string,
    value: { data: unknown; meta: QueryStateData<unknown>['meta'] }
  ): void {
    const cache = this.readCache(name);
    cache.set(key, value);
  }

  clean(): void {
    const now = Date.now();
    this.cache.forEach((cache, cacheKey) => {
      cache.forEach((entry, entryKey) => {
        if (!entry.meta.cacheExpiration || now > entry.meta.cacheExpiration) {
          cache.delete(entryKey);
        }
      });

      if (cache.size === 0) {
        this.cache.delete(cacheKey);
      }
    });
  }

  private readCache(
    name: string
  ): Map<string, { data: unknown; meta: QueryStateData<unknown>['meta'] }> {
    if (!this.cache.has(name)) {
      this.cache.set(name, new Map());
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.cache.get(name)!;
  }
}
