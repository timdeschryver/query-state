import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { QueryStateData } from 'query-state-contracts';

@Injectable()
export class QueryStateComponentStore<
  Data extends object
> extends ComponentStore<QueryStateData<Data>> {
  init(initialData: Data) {
    this.setState({
      state: 'idle',
      data: initialData,
    });
  }

  loading() {
    this.patchState({
      state: 'loading',
      data: undefined,
      error: undefined,
    });
  }

  error(error: unknown) {
    this.patchState({
      state: 'error',
      error,
      data: undefined,
    });
  }

  success(data: Data) {
    this.patchState({
      state: 'success',
      data,
      error: undefined,
    });
  }

  revalidate() {
    this.patchState({
      state: 'revalidate',
    });
  }
}
