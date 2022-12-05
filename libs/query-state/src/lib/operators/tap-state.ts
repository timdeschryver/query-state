import { MonoTypeOperatorFunction, tap } from 'rxjs';
import { QueryStateData } from '../contracts';

export function tapState<Result>(callbacks: {
  onError?: (error: unknown) => void;
  onIdle?: () => void;
  onLoading?: () => void;
  onRevalidate?: () => void;
  onSuccess?: (data: Result) => void;
}): MonoTypeOperatorFunction<QueryStateData<Result>> {
  return tap((data) => {
    switch (data.state) {
      case 'error':
        callbacks.onError?.(data.error);
        break;

      case 'idle':
        callbacks.onIdle?.();
        break;

      case 'loading':
        callbacks.onLoading?.();
        break;

      case 'revalidate':
        callbacks.onRevalidate?.();
        break;

      case 'success':
        callbacks.onSuccess?.(data.result as Result);
        break;
    }
  });
}
