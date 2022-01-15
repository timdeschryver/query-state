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
  share,
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
import { ComponentDataState } from './data-state';
import { echo } from './operators';

@Injectable()
export class ComponentData<
  Data,
  DataParams extends Record<string, unknown> = Record<string, unknown>,
  DataQueryParams extends Record<string, unknown> = Record<string, unknown>
> implements OnDestroy
{
  private subscriptions = new Subscription();
  private refreshTrigger = new Subject<void>();
  private dataSubject = new BehaviorSubject<ComponentDataState<Data>>(
    undefined as unknown as ComponentDataState<Data>
  );

  params = this.componentRoute.params as DataParams;
  queryParams = this.componentRoute.queryParams as DataQueryParams;

  private get triggerConfig(): TriggerConfig {
    return {
      ...(this.config.triggerConfig || {}),
      triggers: (data) =>
        this.config.triggerConfig?.triggers
          ? this.config.triggerConfig.triggers(data).concat(this.refreshTrigger)
          : [this.refreshTrigger],
    };
  }

  data?: ComponentDataState<Data>;
  data$ = this.dataSubject.asObservable();

  constructor(
    private readonly componentRoute: ComponentRoute<
      DataParams,
      DataQueryParams
    >,
    private readonly cache: ComponentDataCache,
    @Inject(COMPONENT_DATA_SERVICE)
    private readonly service: ComponentDataService<
      Data,
      DataParams,
      DataQueryParams
    >,

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
            ([params, queryParams]): Observable<ComponentDataState<Data>> => {
              // not a RxJS filter because we want to emit a value when query params reset
              if (this.config.ignore?.({ params, queryParams })) {
                return of({ state: 'idle' } as ComponentDataState<Data>);
              }

              const paramsKey = JSON.stringify([params, queryParams]);
              const cachedEntry = this.cache.getCacheEntry(
                this.config.name,
                paramsKey
              );
              return this.service.query({ params, queryParams }).pipe(
                tap((data) => {
                  this.cache.setCacheEntry(this.config.name, paramsKey, data);
                }),
                map(
                  (data): ComponentDataState<Data> => ({
                    state: 'success',
                    data,
                  })
                ),
                startWith({
                  state: cachedEntry ? 'revalidate' : 'loading',
                  data: cachedEntry,
                } as ComponentDataState<Data>),
                catchError(
                  (error: unknown): Observable<ComponentDataState<Data>> =>
                    of({
                      state: 'error',
                      error,
                    })
                )
              );
            }
          ),
          startWith({ state: 'idle' } as ComponentDataState<Data>),
          distinctUntilKeyChanged('state')
        )
        .subscribe((data) => {
          this.data = data;
          this.dataSubject.next(data);
        })
    );
  }

  update(
    queryParamsOrObservable: DataQueryParams | Observable<DataQueryParams>
  ): void {
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
