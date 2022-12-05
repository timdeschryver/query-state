import {
  ENVIRONMENT_INITIALIZER,
  inject,
  Injectable,
  InjectionToken,
  Provider,
} from '@angular/core';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot, NavigationEnd,
  Params,
  Router,
} from '@angular/router';
import {
  BehaviorSubject,
  catchError, combineLatest,
  concatMap, distinctUntilChanged,
  EMPTY,
  expand,
  fromEvent,
  isObservable,
  map, merge,
  Observable,
  Observer,
  of,
  repeat, share,
  startWith,
  Subject,
  Subscription,
  switchMap, takeUntil,
  takeWhile,
  tap,
  timer,
} from 'rxjs';
import {
  QueryStateConfig,
  QueryStateParams,
  QueryStateData,
} from './contracts';

export const QUERY_STATE_CONFIG = new InjectionToken<QueryStateConfig>(
  'QUERY_STATE_CONFIG'
);

@Injectable({providedIn: 'root'})
export class QueryStateCache {
  private cache = new Map<string, QueryStateData>();

  get<Result = unknown>(key: string): QueryStateData<Result> {
    return this.cache.get(key) as QueryStateData<Result>;
  }

  set(key: string, value: QueryStateData): void {
    this.cache.set(key, value);
  }
}

@Injectable()
export class QueryState<Result = unknown> {
  private cache = inject(QueryStateCache);
  private config: QueryStateConfig<Result> = inject(
    QUERY_STATE_CONFIG
  ) as QueryStateConfig<Result>;
  private router = inject(Router);
  private rootRoute = inject(ActivatedRoute);

  private myActivatedRoute: ActivatedRoute | undefined;
  private queryInvoker = this.config.query();

  private revalideSubject = new Subject<void>();
  private removedSubject = new Subject<void>();
  private subscriptions = new Subscription();

  private paramsSubject = new BehaviorSubject<{ params: Params, queryParams: Params }>({queryParams: {}, params: {}});
  private params$ = this.paramsSubject.asObservable().pipe(
    distinctUntilChanged(
      (previous, current) =>
        previous === current ||
        JSON.stringify(previous) === JSON.stringify(current)
    ),
  )

  data: QueryStateData<Result> | undefined;
  queryParams: Params = {};
  params: Params = {};

  data$ = this.params$.pipe(
    switchMap((params) => {
      return of(params).pipe(
        repeat({
          delay: () => {
            const triggers: Observable<unknown>[] = [this.revalideSubject];
            if (this.config.triggers !== false) {
              if (this.config.triggers?.customTriggers) {
                triggers.push(...this.config.triggers.customTriggers);
              }

              if (this.config.triggers?.focusTrigger ?? true) {
                triggers.push(fromEvent(window, 'focus'));
              }

              if (this.config.triggers?.onlineTrigger ?? true) {
                triggers.push(fromEvent(window, 'online'));
              }

              if (this.config.triggers?.timerTrigger === true) {
                triggers.push(timer(60_000));
              } else if (this.config.triggers?.timerTrigger) {
                triggers.push(timer(this.config.triggers.timerTrigger));
              }
            }

            return merge(...triggers).pipe(takeUntil(this.removedSubject));
          },
        })
      )
    }),
    switchMap(
      ({params, queryParams}): Observable<QueryStateData<Result>> => {
        const cacheKey = this.config.cacheKey(params, queryParams);
        const cacheItem = this.cache.get<Result>(cacheKey);

        const retryCondition =
          this.config.retryCondition ?? ((retries): boolean => retries < 3);
        const retryDelay =
          this.config.retryDelay ??
          ((retries): number => Math.pow(2, retries - 1) * 1000);

        return this.invokeQuery({params, queryParams}).pipe(
          expand((result) => {
            if (
              result.state === 'error' &&
              retryCondition(result.meta.retries ?? 0, result.error)
            ) {
              return timer(
                retryDelay(result.meta.retries ?? 0, result.error)
              ).pipe(
                concatMap(() => {
                  return this.invokeQuery(
                    {params, queryParams},
                    (result.meta.retries || 0) + 1
                  );
                })
              );
            }
            return EMPTY;
          }),
          tap((result) => {
            if (result.state === 'success') {
              this.cache.set(cacheKey, result);
            }
          }),
          startWith<QueryStateData<Result>>({
            state: cacheItem ? 'revalidate' : 'loading',
            result: cacheItem?.result,
            meta: {timestamp: Date.now()},
          }),
        );
      }
    ),
    tap(data => {
      this.data = data
    }),
    share()
  )

  private invokeQuery = (
    params: QueryStateParams,
    retries = 0
  ): Observable<QueryStateData<Result>> => {
    return this.queryInvoker(params.params, params.queryParams).pipe(
      map((result): QueryStateData<Result> => {
        return {
          state: 'success',
          result,
          meta: {
            timestamp: Date.now(),
            cacheExpiration:
              Date.now() + (this.config.cacheExpiration || 1000 * 60 * 10),
          },
        };
      }),
      catchError((error: unknown): Observable<QueryStateData<Result>> => {
        return of({
          state: 'error',
          result: undefined,
          error,
          meta: {
            retries: retries,
            timestamp: Date.now(),
          },
        });
      }),
    )
  };

  private listenToRemoval(route: ActivatedRoute): void {
    this.subscriptions.add(
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          let existsInTree = false;
          let comp = this.rootRoute.firstChild
          while (comp) {
            if (comp.component === route.component) {
              existsInTree = true
              break
            }
            comp = comp.firstChild
          }
          if (!existsInTree) {
            this.cleanUp();
          }
        }
      })
    )
  }

  private listenToParams(route: ActivatedRoute): void {
    this.subscriptions.add(
      combineLatest([
        route.params,
        route.queryParams,
      ]).subscribe(([params, queryParams]) => {
        this.paramsSubject.next({params, queryParams})
      }));
  }

  private cleanUp(): void {
    this.removedSubject.next()
    this.removedSubject.complete();
    this.subscriptions.unsubscribe();
  }

  listenToRoute(route: ActivatedRoute): void {
    this.myActivatedRoute = route;
    this.subscriptions.unsubscribe()
    this.subscriptions = new Subscription()

    this.listenToRemoval(route)
    this.listenToParams(route)
    this.subscriptions.add(this.data$.subscribe())
  }

  preload(route: ActivatedRouteSnapshot): void {
    this.paramsSubject.next({
      params: route.params,
      queryParams: route.queryParams,
    })
    this.data$.pipe(
      takeWhile(
        (result) =>
          result.state !== 'success' && (result.meta.retries || 0) < 3,
        true
      ),
    ).subscribe();

  }

  updateQueryParams(queryParamsOrObservable: Params | Observable<Params>): void {
    if (isObservable(queryParamsOrObservable)) {
      this.subscriptions.add(queryParamsOrObservable.subscribe((queryParams) => {
        this.router.navigate([], {
          relativeTo: this.myActivatedRoute,
          queryParamsHandling: 'merge',
          queryParams: queryParams as Params,
        });
      }));
    } else {
      this.router.navigate([], {
        relativeTo: this.myActivatedRoute,
        queryParamsHandling: 'merge',
        queryParams: queryParamsOrObservable,
      });
    }
  }

  revalidate(trigger$?: Observable<unknown>): void {
    if (isObservable(trigger$)) {
      this.subscriptions.add(trigger$.subscribe(() => {
        this.revalideSubject.next();
      }));
    } else {
      this.revalideSubject.next();
    }
  }

  effect(
    sourceOrSourceFactory:
      | Observable<unknown>
      | ((data: Observable<QueryStateData<Result>>) => Observable<unknown>),
    observerOrNext?: Partial<Observer<unknown>> | ((value: unknown) => void)
  ): void {
    if (typeof sourceOrSourceFactory === 'function') {
      this.subscriptions.add(
        sourceOrSourceFactory(this.data$).subscribe(
          observerOrNext as Partial<Observer<unknown>>
        )
      );
    } else {
      this.subscriptions.add(
        sourceOrSourceFactory.subscribe(
          observerOrNext as Partial<Observer<unknown>>
        )
      );
    }
  }
}

export function provideQueryState<Result = unknown>(
  config: QueryStateConfig<Result>
): Provider[] {
  return [
    {
      provide: QUERY_STATE_CONFIG,
      useValue: config,
    },
    {
      provide: QueryState,
      useClass: QueryState,
    },
    {
      provide: ENVIRONMENT_INITIALIZER,
      multi: true,
      useValue(): void {
        //
      },
    },
  ];
}

export function resolveQueryState(route: ActivatedRouteSnapshot): boolean {
  const queryState = inject(QueryState);
  queryState.preload(route);
  return true;
}

export function injectQueryState<Result = unknown>(): QueryState<Result> {
  const route = inject(ActivatedRoute);
  const queryState = inject(QueryState)
  queryState.listenToRoute(route);
  return queryState;
}
