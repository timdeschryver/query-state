import {Params} from "@angular/router";
import {Observable} from "rxjs";

export interface QueryStateConfig<Result = unknown> {
  query: () => (params: Params, queryParams: Params) => Observable<Result>
  cacheKey: (params: Params, queryParams: Params) => string
  cacheExpiration?: number
  retryCondition?: (retries: number, error: unknown) => boolean;
  retryDelay?: (retries: number, error: unknown) => number | Date;
  triggers?: false | {
    focusTrigger?: boolean;
    onlineTrigger?: boolean;
    timerTrigger?: boolean | number;
    customTriggers?: Observable<unknown>[];
  }
}

export interface QueryStateParams {
  params: Params,
  queryParams: Params
}

export interface QueryStateData<Result = unknown> {
  state: 'idle' | 'loading' | 'error' | 'success' | 'revalidate';
  result?: Result;
  error?: unknown;
  meta: {
    retries?: number;
    timestamp: number;
    cacheExpiration?: number;
  }
}

