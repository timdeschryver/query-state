import {
  filter,
  fromEvent,
  map,
  mapTo,
  materialize,
  merge,
  NEVER,
  Observable,
  OperatorFunction,
  startWith,
  switchMap,
  takeUntil,
  tap,
  timer,
} from 'rxjs';
import { TriggerConfig } from '../contracts';
import { distinctByJson } from './distinct-by-json';

/**
 * Re-emit the last emitted value
 */
export function echo<Data>({
  timerTrigger = 60_000,
  focusTrigger = true,
  onlineTrigger = true,
  triggers = (): never[] => [],
}: TriggerConfig = {}): OperatorFunction<
  Data,
  {
    trigger: string;
    value: Data;
  }
> {
  return (source): Observable<{ trigger: string; value: Data }> => {
    const triggers$ = [
      focusTrigger ? fromEvent(window, 'focus').pipe(mapTo('focus')) : NEVER,
      onlineTrigger ? fromEvent(window, 'online').pipe(mapTo('online')) : NEVER,
    ];
    return source.pipe(
      distinctByJson(),
      switchMap((value) => {
        return merge(...triggers$, ...triggers(value)).pipe(
          startWith('init'),
          timerTrigger === false
            ? tap()
            : switchMap((t) => {
                return timer(0, timerTrigger).pipe(
                  map((i) => (i === 0 ? t : 'timer'))
                );
              }),
          map((trigger): { trigger: string; value: Data } => {
            return {
              trigger: typeof trigger === 'string' ? trigger : 'unknown',
              value,
            };
          }),
          takeUntil(
            source.pipe(
              materialize(),
              filter(({ kind }) => kind !== 'N')
            )
          )
        );
      })
    );
  };
}
