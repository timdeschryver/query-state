import { Type, Provider } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QueryState } from './query-state';
import { UrlState } from './url-state';
import {
  QueryStateConfig,
  QUERY_STATE_CONFIG,
  QueryService,
  QUERY_SERVICE,
} from './contracts';

export function urlState(route: ActivatedRoute, router: Router): UrlState {
  return new UrlState(route, router);
}

export const provideQueryState = <Service = QueryService>(
  service: Type<Service>,
  config: QueryStateConfig<Service>
): Provider[] => [
  QueryState,
  {
    provide: UrlState,
    useFactory: urlState,
    deps: [ActivatedRoute, Router],
  },
  {
    provide: QUERY_SERVICE,
    useExisting: service,
  },
  {
    provide: QUERY_STATE_CONFIG,
    useValue: config,
  },
];
