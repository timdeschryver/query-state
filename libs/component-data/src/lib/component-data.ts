import { Inject, Injectable, OnDestroy } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  debounceTime,
  distinctUntilKeyChanged,
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
  private refreshTrigger = new Subject<void>();
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
        triggers: (_data) => [this.refreshTrigger],
      };
    }

    const triggers = this.config.revalidateTriggers;
    return {
      ...(triggers || {}),
      triggers: (data) =>
        triggers?.triggers
          ? triggers.triggers(data).concat(this.refreshTrigger)
          : [this.refreshTrigger],
    };
  }

  constructor(
    private readonly componentRoute: ComponentRoute,
    private readonly cache: ComponentDataCache,
    @Inject(COMPONENT_DATA_SERVICE)
    private readonly dataService: Service & ComponentDataService<Data>,

    @Inject(COMPONENT_DATA_CONFIG)
    private readonly config: ComponentDataConfig
  ) {
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

              return this.dataService.query({ params, queryParams }).pipe(
                tap((data) => {
                  if (!this.config.disableCache) {
                    this.cache.setCacheEntry(this.config.name, paramsKey, data);
                  }
                }),
                map(
                  (data): RequestStateData<Data> => ({
                    state: 'success',
                    data,
                  })
                ),
                startWith({
                  state: cachedEntry ? 'revalidate' : 'loading',
                  data: cachedEntry,
                } as RequestStateData<Data>),
                catchError(
                  (error: unknown): Observable<RequestStateData<Data>> =>
                    of({
                      state: 'error',
                      error,
                    })
                )
              );
            }
          ),
          startWith({ state: 'idle' } as RequestStateData<Data>),
          distinctUntilKeyChanged('state')
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

  refresh(trigger$?: Observable<unknown>): void {
    if (isObservable(trigger$)) {
      this.subscriptions.add(
        trigger$.subscribe(() => {
          this.refreshTrigger.next();
        })
      );
    } else {
      this.refreshTrigger.next();
    }
  }

  ngOnDestroy(): void {
    this.dataSubject.complete();
    this.subscriptions.unsubscribe();
    this.refreshTrigger.complete();
  }
}
