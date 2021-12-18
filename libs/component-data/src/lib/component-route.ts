import { Injectable } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable()
export class ComponentRoute<
  DataParams extends Record<string, unknown> = Record<string, unknown>,
  DataQueryParams extends Record<string, unknown> = Record<string, unknown>
> {
  params = this.activatedRoute.snapshot?.params ?? {};
  queryParams = this.activatedRoute.snapshot?.queryParams ?? {};

  params$ = this.activatedRoute.params as Subject<DataParams>;
  queryParams$ = this.activatedRoute.queryParams as Subject<DataQueryParams>;

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router
  ) {}

  navigate(queryParams: Params) {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParamsHandling: 'merge',
      queryParams,
    });
  }
}

export class MockComponentRoute<
  DataParams extends Record<string, unknown> = Record<string, unknown>,
  DataQueryParams extends Record<string, unknown> = Record<string, unknown>
> {
  params: Params = {};
  queryParams: Params = {};

  params$ = new BehaviorSubject<DataParams>({} as DataParams);
  queryParams$ = new BehaviorSubject<DataQueryParams>({} as DataQueryParams);

  constructor({
    params,
    queryParams,
  }: {
    params?: DataParams;
    queryParams?: DataQueryParams;
  } = {}) {
    this.params$.next(params ?? ({} as DataParams));
    this.queryParams$.next(queryParams ?? ({} as DataQueryParams));
  }

  navigate(queryParams: DataQueryParams): void {
    this.queryParams$.next(queryParams);
  }
}
