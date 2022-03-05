import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { DataParams } from './data-models';

export const COMPONENT_DATA_SERVICE = new InjectionToken<
  ComponentDataService<unknown>
>('COMPONENT_DATA_SERVICE');

export interface ComponentDataService<Data> {
  query(params: QueryParams): Observable<Data>;
}

export interface QueryParams {
  params: DataParams;
  queryParams: DataParams;
}
