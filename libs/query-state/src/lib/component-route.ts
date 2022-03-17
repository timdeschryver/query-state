import { Injectable } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';
import { DataParams } from './models';

@Injectable()
export class ComponentRoute {
  params = this.activatedRoute.snapshot?.params ?? {};
  queryParams = this.activatedRoute.snapshot?.queryParams ?? {};

  params$ = this.activatedRoute.params as Subject<DataParams>;
  queryParams$ = this.activatedRoute.queryParams as Subject<DataParams>;

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

export class MockComponentRoute {
  params: Params = {};
  queryParams: Params = {};

  params$ = new BehaviorSubject<DataParams>({} as DataParams);
  queryParams$ = new BehaviorSubject<DataParams>({} as DataParams);

  constructor({
    params,
    queryParams,
  }: {
    params?: DataParams;
    queryParams?: DataParams;
  } = {}) {
    this.params$.next(params ?? ({} as DataParams));
    this.queryParams$.next(queryParams ?? ({} as DataParams));
  }

  navigate(queryParams: DataParams): void {
    this.queryParams$.next(queryParams);
  }
}
