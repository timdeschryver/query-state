import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { DataParams } from './data-params';

export const QUERY_SERVICE = new InjectionToken<QueryService>('QUERY_SERVICE');

export interface QueryService {
  query(params: QueryParams): Observable<unknown>;
}

export interface QueryParams {
  params: DataParams;
  queryParams: DataParams;
}
