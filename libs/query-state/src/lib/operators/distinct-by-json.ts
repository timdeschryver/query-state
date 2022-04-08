import { distinctUntilChanged, MonoTypeOperatorFunction } from 'rxjs';

export function distinctByJson<Data>(): MonoTypeOperatorFunction<Data> {
  return distinctUntilChanged(
    (previous, current) =>
      previous === current ||
      JSON.stringify(previous) === JSON.stringify(current)
  );
}
