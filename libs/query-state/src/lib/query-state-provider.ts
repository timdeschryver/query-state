import { Type, Provider, Injector } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QueryState } from './query-state';
import { UrlState, MockUrlState } from './url-state';
import { HttpClient, HttpHandler, HttpXhrBackend } from '@angular/common/http';
import {
  QueryStateConfig,
  QUERY_STATE_CONFIG,
  QueryService,
  QUERY_SERVICE,
} from './contracts';
import { QueryStateCache, QUERY_STATE_CACHE } from './query-state-cache';

export function urlState(route: ActivatedRoute, router: Router): UrlState {
  return new UrlState(route, router);
}
export const provideQueryState = <Service = QueryService>(
  service: Type<Service>,
  config: QueryStateConfig<Service>
): Provider[] => {
  const providers: any[] = [
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

  if (config.prefetch) {
    // httpinjector
    const injector = Injector.create({
      providers: [
        { provide: HttpClient, deps: [HttpHandler] },
        {
          provide: HttpHandler,
          useValue: new HttpXhrBackend({
            build: (): XMLHttpRequest => new XMLHttpRequest(),
          }),
        },
      ],
    });
    const httpClient: HttpClient = injector.get(HttpClient);

    // Can be cleaned up
    const Q = new QueryState<any, Type<Service>>(
      new MockUrlState({ params: {}, queryParams: {} }) as any,
      new QueryStateCache(),
      new service(httpClient) as any,
      config as any
    );

    // subscribe to get data
    // console.log(Q.getCache().getCacheEntry(config.name, '[{},{}]')); //check current cache
    Q.data$.subscribe();

    // Push existing cache
    const provider = {
      provide: QUERY_STATE_CACHE,
      useValue: Q.getCache(),
    };

    providers.push(provider);
  } else {
    providers.push({
      provide: QUERY_STATE_CACHE,
      useClass: QueryStateCache,
    });
  }

  return providers;
};
