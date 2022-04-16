export type State = 'idle' | 'loading' | 'success' | 'error' | 'revalidate';

export interface QueryStateData<Data> {
  state: State;
  data?: Data;
  error?: unknown;
  retries?: number;
  meta: {
    timestamp?: number;
    cacheExpiration?: number;
  };
}
