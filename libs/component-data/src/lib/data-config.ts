import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { DataParams } from './data-models';

export const COMPONENT_DATA_CONFIG = new InjectionToken<ComponentDataConfig>(
  'COMPONENT_DATA_CONFIG'
);

export interface ComponentDataConfig {
  /**
   * The name of the component
   * This is used to build up a cache
   */
  name: string;
  /**
   * By default, we're fetching the data on the initial load
   * To prevent this, set this to `true`
   */
  disableInitialLoad?: boolean;
  /**
   * Disable that results are cached
   */
  disableCache?: boolean;
  /**
   * A decider function that decides whether to invoke the query
   * By default all changes are sent to the query
   * If the function returns `true`, the changes are ignored and the query isn't invoked
   */
  ignore?: (params: { params: DataParams; queryParams: DataParams }) => boolean;
  /**
   * Creates a key based on params to check the cache
   */
  cacheKey?: (params: {
    params: DataParams;
    queryParams: DataParams;
  }) => string;
  /**
   * Triggers to refresh the current data
   */
  revalidateTriggers?: false | TriggerConfig;
}

export type TriggerConfig = {
  focusTrigger?: boolean;
  onlineTrigger?: boolean;
  timerTrigger?: false | number;
  triggers?: <Data>(data: Data) => Observable<unknown>[];
};
