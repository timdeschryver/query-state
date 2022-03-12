import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { DataParams } from './data-models';

export const COMPONENT_DATA_SERVICE = new InjectionToken<ComponentDataService>(
  'COMPONENT_DATA_SERVICE'
);

export interface ComponentDataService {
  query(params: QueryParams): Observable<unknown>;
}

export interface QueryParams {
  params: DataParams;
  queryParams: DataParams;
}
