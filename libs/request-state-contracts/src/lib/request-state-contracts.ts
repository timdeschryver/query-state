export type RequestState =
  | 'idle'
  | 'loading'
  | 'success'
  | 'error'
  | 'revalidate';

export interface RequestStateData<Data> {
  state: RequestState;
  data?: Data;
  error?: unknown;
  retries?: number;
}
