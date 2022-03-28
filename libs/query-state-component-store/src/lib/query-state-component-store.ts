import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { QueryStateData } from 'query-state-contracts';

@Injectable()
export class QueryStateComponentStore<
  Data extends object
> extends ComponentStore<QueryStateData<Data>> {
  init(initialData: Data): void {
    this.setState({
      state: 'idle',
      data: initialData,
    });
  }

  loading(): void {
    this.patchState({
      state: 'loading',
      data: undefined,
      error: undefined,
    });
  }

  error(error: unknown): void {
    this.patchState({
      state: 'error',
      error,
      data: undefined,
    });
  }

  success(data: Data): void {
    this.patchState({
      state: 'success',
      data,
      error: undefined,
    });
  }

  revalidate(): void {
    this.patchState({
      state: 'revalidate',
    });
  }
}
