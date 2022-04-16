import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { DataParams } from './data-params';

export const QUERY_STATE_CONFIG = new InjectionToken<QueryStateConfig<unknown>>(
  'QUERY_STATE_CONFIG'
);

export interface QueryStateConfig<Service> {
  /**
   * The name of the component
   * This is used to build up a cache
   */
  name: string;

  /**
   * The query method that is invoked.
   * Defaults to `query`.
   */
  query?: keyof Service;

  /**
   * Triggers to refresh the current data
   */
  revalidateTriggers?: false | TriggerConfig;

  /**
   * A decider function that decides whether to invoke the query
   * By default all changes are sent to the query
   * If the function returns `true`, the changes are ignored and the query isn't invoked
   */
  ignore?: (params: { params: DataParams; queryParams: DataParams }) => boolean;

  /**
   * Set the duration of the cache.
   * Defaults to 10 minutes.
   * Set to 0 to disable cache.
   */
  cacheTime?: number;

  /**
   * Creates a key based on params to check the cache.
   */
  cacheKey?: (params: {
    params: DataParams;
    queryParams: DataParams;
  }) => string;

  /**
   * Decide when to retry a failed query.
   * Defaults to 3 times.
   */
  retryCondition?: number | ((retries: number) => boolean);

  /**
   * Set the delay between the retries.
   * Defaults to an exponential retry with a starting delay of 1 second.
   */
  retryDelay?: (retries: number) => number | Date;
}

export type TriggerConfig = {
  focusTrigger?: boolean;
  onlineTrigger?: boolean;
  timerTrigger?: false | number;
  triggers?: <Data>(data: Data) => Observable<unknown>[];
};
