export interface ComponentDataState<Data> {
  state: 'idle' | 'loading' | 'success' | 'error' | 'revalidate';
  data?: Data;
  error?: unknown;
}
