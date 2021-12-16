import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ComponentDataCache {
  private cache = new Map<string, Map<string, unknown>>();

  private getComponentCache(name: string) {
    if (!this.cache.has(name)) {
      this.cache.set(name, new Map());
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.cache.get(name)!;
  }

  getCacheEntry(name: string, key: string): unknown | undefined {
    return this.getComponentCache(name).get(key);
  }

  setCacheEntry(name: string, key: string, value: unknown) {
    const cache = this.getComponentCache(name);
    cache.set(key, value);
  }
}
