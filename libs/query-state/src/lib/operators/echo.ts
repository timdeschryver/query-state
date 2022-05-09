import {
  filter,
  fromEvent,
  materialize,
  merge,
  MonoTypeOperatorFunction,
  Observable,
  of,
  repeat,
  switchMap,
  takeUntil,
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
}: TriggerConfig = {}): MonoTypeOperatorFunction<Data> {
  return (source): Observable<Data> => {
    return source.pipe(
      distinctByJson(),
      switchMap((value) => {
        return of(value).pipe(
          repeat({
            delay: () => {
              const triggers$ = triggers(value);
              if (focusTrigger) {
                triggers$.push(fromEvent(window, 'focus'));
              }
              if (onlineTrigger) {
                triggers$.push(fromEvent(window, 'online'));
              }
              if (timerTrigger) {
                triggers$.push(timer(timerTrigger));
              }
              return merge(...triggers$);
            },
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
