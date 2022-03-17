export type QueryState =
  | 'idle'
  | 'loading'
  | 'success'
  | 'error'
  | 'revalidate';

export interface QueryStateData<Data> {
  state: QueryState;
  data?: Data;
  error?: unknown;
  retries?: number;
}
