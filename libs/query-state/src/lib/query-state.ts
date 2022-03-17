import { Inject, Injectable, OnDestroy } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  concatMap,
  debounceTime,
  distinctUntilChanged,
  EMPTY,
  expand,
  isObservable,
  map,
  Observable,
  of,
  skip,
  startWith,
  Subject,
  Subscription,
  switchMap,
  tap,
  timer,
} from 'rxjs';
import { UrlState } from './url-state';
import { QueryStateCache } from './query-state-cache';
import {
  QUERY_STATE_CONFIG,
  QueryStateConfig,
  TriggerConfig,
} from './query-state-config';
import { QUERY_SERVICE, QueryService } from './query-service';
import { echo } from './operators/echo.operator';
import { QueryStateData } from 'query-state-contracts';
import { DataParams } from './models';

@Injectable()
export class QueryState<Data, Service = unknown> implements OnDestroy {
  private subscriptions = new Subscription();
  private revalidateTrigger = new Subject<void>();
  private dataSubject = new BehaviorSubject<QueryStateData<Data>>(
    undefined as unknown as QueryStateData<Data>
  );

  params = this.urlState.params as DataParams;
  queryParams = this.urlState.queryParams as DataParams;

  data?: QueryStateData<Data>;
  data$ = this.dataSubject.asObservable();

  get service(): Service {
    return this.dataService as Service;
  }

  private get triggerConfig(): TriggerConfig {
    if (this.config.revalidateTriggers === false) {
      return {
        focusTrigger: false,
        onlineTrigger: false,
        timerTrigger: false,
        triggers: (_data) => [this.revalidateTrigger],
      };
    }

    const triggers = this.config.revalidateTriggers;
    return {
      ...(triggers || {}),
      triggers: (data) =>
        triggers?.triggers
          ? triggers.triggers(data).concat(this.revalidateTrigger)
          : [this.revalidateTrigger],
    };
  }

  constructor(
    private readonly urlState: UrlState,
    private readonly cache: QueryStateCache,
    @Inject(QUERY_SERVICE)
    private readonly dataService: Service & QueryService,

    @Inject(QUERY_STATE_CONFIG)
    private readonly config: QueryStateConfig<QueryService>
  ) {
    const query = config.query || 'query';

    const retryCondition =
      typeof config.retryCondition === 'number'
        ? (retries: number) => retries < (config.retryCondition as number)
        : config.retryCondition ??
          function retry(retries) {
            return retries < 3;
          };

    const retryDelay =
      config.retryDelay ?? ((retries) => Math.pow(2, retries - 1) * 1000);

    this.subscriptions.add(
      combineLatest([this.urlState.params$, this.urlState.queryParams$])
        .pipe(
          debounceTime(0),
          echo(this.triggerConfig),
          skip(this.config.disableInitialLoad ? 1 : 0),
          switchMap(
            ([params, queryParams]): Observable<QueryStateData<Data>> => {
              // not a RxJS filter because we want to emit a value when query params reset
              if (this.config.ignore?.({ params, queryParams })) {
                return of({ state: 'idle' } as QueryStateData<Data>);
              }

              const paramsKey =
                this.config.cacheKey?.({ params, queryParams }) ??
                JSON.stringify([params, queryParams]);
              const cachedEntry = this.config.disableCache
                ? undefined
                : this.cache.getCacheEntry(this.config.name, paramsKey);

              const invokeQuery = (
                retries: number
              ): Observable<QueryStateData<Data>> => {
                return this.dataService[query]({
                  params,
                  queryParams,
                }).pipe(
                  map(
                    (data): QueryStateData<Data> => ({
                      state: 'success',
                      data: data as Data,
                    })
                  ),
                  catchError(
                    (error: unknown): Observable<QueryStateData<Data>> => {
                      return of({
                        state: 'error',
                        error,
                        retries: retries === 0 ? undefined : retries,
                      });
                    }
                  )
                );
              };

              return invokeQuery(0).pipe(
                expand((result) => {
                  if (
                    result.state === 'error' &&
                    retryCondition(result.retries || 1)
                  ) {
                    return timer(retryDelay(result.retries || 1)).pipe(
                      concatMap(() => {
                        return invokeQuery((result.retries || 0) + 1);
                      })
                    );
                  }

                  return EMPTY;
                }),
                tap((result) => {
                  if (!this.config.disableCache) {
                    if (result.state === 'success') {
                      this.cache.setCacheEntry(
                        this.config.name,
                        paramsKey,
                        result.data
                      );
                    }
                  }
                }),
                map((result) => {
                  if (
                    result.state === 'error' &&
                    retryCondition(result.retries || 1)
                  ) {
                    return {
                      ...result,
                      state: cachedEntry ? 'revalidate' : 'loading',
                    } as QueryStateData<Data>;
                  }

                  return result;
                }),
                startWith({
                  state: cachedEntry ? 'revalidate' : 'loading',
                  data: cachedEntry,
                } as QueryStateData<Data>)
              );
            }
          ),
          startWith({ state: 'idle' } as QueryStateData<Data>),
          distinctUntilChanged(
            (a, b) => a.state === b.state && a.retries === b.retries
          )
        )
        .subscribe((data) => {
          this.data = data;
          this.dataSubject.next(data);
        })
    );
  }

  update(queryParamsOrObservable: DataParams | Observable<DataParams>): void {
    if (isObservable(queryParamsOrObservable)) {
      this.subscriptions.add(
        queryParamsOrObservable.subscribe((queryParams) => {
          this.urlState.navigate(queryParams);
        })
      );
    } else {
      this.urlState.navigate(queryParamsOrObservable);
    }
  }

  revalidate(trigger$?: Observable<unknown>): void {
    if (isObservable(trigger$)) {
      this.subscriptions.add(
        trigger$.subscribe(() => {
          this.revalidateTrigger.next();
        })
      );
    } else {
      this.revalidateTrigger.next();
    }
  }

  effect(
    sourceOrSourceFactory:
      | Observable<unknown>
      | ((data: Observable<QueryStateData<Data>>) => Observable<unknown>)
  ): void {
    if (typeof sourceOrSourceFactory === 'function') {
      this.subscriptions.add(sourceOrSourceFactory(this.data$).subscribe());
    } else {
      this.subscriptions.add(sourceOrSourceFactory.subscribe());
    }
  }

  ngOnDestroy(): void {
    this.dataSubject.complete();
    this.subscriptions.unsubscribe();
    this.revalidateTrigger.complete();
  }
}
