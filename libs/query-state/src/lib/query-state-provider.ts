import { Type, Provider } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QueryState } from './query-state';
import { ComponentRoute } from './component-route';
import { QueryStateConfig, QUERY_STATE_CONFIG } from './query-state-config';
import { QueryService, QUERY_SERVICE } from './query-service';

export function componentRoute(route: ActivatedRoute, router: Router) {
  return new ComponentRoute(route, router);
}

export const provideQueryState = <Service = QueryService>(
  service: Type<Service>,
  config: QueryStateConfig<Service>
): Provider[] => [
  QueryState,
  {
    provide: ComponentRoute,
    useFactory: componentRoute,
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
