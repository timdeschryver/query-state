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
import { ComponentRoute } from './component-route';
import { ComponentDataCache } from './data-cache';
import {
  COMPONENT_DATA_CONFIG,
  ComponentDataConfig,
  TriggerConfig,
} from './data-config';
import { COMPONENT_DATA_SERVICE, ComponentDataService } from './data-service';
import { echo } from './operators/echo.operator';
import { RequestStateData } from 'request-state-contracts';
import { DataParams } from './data-models';

@Injectable()
export class ComponentData<Data, Service = unknown> implements OnDestroy {
  private subscriptions = new Subscription();
  private revalidateTrigger = new Subject<void>();
  private dataSubject = new BehaviorSubject<RequestStateData<Data>>(
    undefined as unknown as RequestStateData<Data>
  );

  params = this.componentRoute.params as DataParams;
  queryParams = this.componentRoute.queryParams as DataParams;

  data?: RequestStateData<Data>;
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
    private readonly componentRoute: ComponentRoute,
    private readonly cache: ComponentDataCache,
    @Inject(COMPONENT_DATA_SERVICE)
    private readonly dataService: Service & ComponentDataService,

    @Inject(COMPONENT_DATA_CONFIG)
    private readonly config: ComponentDataConfig<ComponentDataService>
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
      combineLatest([
        this.componentRoute.params$,
        this.componentRoute.queryParams$,
      ])
        .pipe(
          debounceTime(0),
          echo(this.triggerConfig),
          skip(this.config.disableInitialLoad ? 1 : 0),
          switchMap(
            ([params, queryParams]): Observable<RequestStateData<Data>> => {
              // not a RxJS filter because we want to emit a value when query params reset
              if (this.config.ignore?.({ params, queryParams })) {
                return of({ state: 'idle' } as RequestStateData<Data>);
              }

              const paramsKey =
                this.config.cacheKey?.({ params, queryParams }) ??
                JSON.stringify([params, queryParams]);
              const cachedEntry = this.config.disableCache
                ? undefined
                : this.cache.getCacheEntry(this.config.name, paramsKey);

              const invokeRequest = (
                retries: number
              ): Observable<RequestStateData<Data>> => {
                return this.dataService[query]({
                  params,
                  queryParams,
                }).pipe(
                  map(
                    (data): RequestStateData<Data> => ({
                      state: 'success',
                      data: data as Data,
                    })
                  ),
                  catchError(
                    (error: unknown): Observable<RequestStateData<Data>> => {
                      return of({
                        state: 'error',
                        error,
                        retries: retries === 0 ? undefined : retries,
                      });
                    }
                  )
                );
              };

              return invokeRequest(0).pipe(
                expand((result) => {
                  if (
                    result.state === 'error' &&
                    retryCondition(result.retries || 1)
                  ) {
                    return timer(retryDelay(result.retries || 1)).pipe(
                      concatMap(() => {
                        return invokeRequest((result.retries || 0) + 1);
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
                    } as RequestStateData<Data>;
                  }

                  return result;
                }),
                startWith({
                  state: cachedEntry ? 'revalidate' : 'loading',
                  data: cachedEntry,
                } as RequestStateData<Data>)
              );
            }
          ),
          startWith({ state: 'idle' } as RequestStateData<Data>),
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
          this.componentRoute.navigate(queryParams);
        })
      );
    } else {
      this.componentRoute.navigate(queryParamsOrObservable);
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
      | ((data: Observable<RequestStateData<Data>>) => Observable<unknown>)
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
