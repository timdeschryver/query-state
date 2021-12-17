import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

export const COMPONENT_DATA_SERVICE = new InjectionToken<
  ComponentDataService<unknown>
>('COMPONENT_DATA_SERVICE');

export interface ComponentDataService<
  Data,
  DataParams extends Record<string, unknown> = Record<string, unknown>,
  DataQueryParams extends Record<string, unknown> = Record<string, unknown>
> {
  query(params: QueryParams<DataParams, DataQueryParams>): Observable<Data>;
}

export interface QueryParams<
  DataParams extends Record<string, unknown> = Record<string, unknown>,
  DataQueryParams extends Record<string, unknown> = Record<string, unknown>
> {
  params: DataParams;
  queryParams: DataQueryParams;
}
