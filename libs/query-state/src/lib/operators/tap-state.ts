import { MonoTypeOperatorFunction, tap } from 'rxjs';
import { QueryStateData } from '../contracts';

export function tapState<QueryData>(callbacks: {
  onError?: (error: unknown) => void;
  onIdle?: () => void;
  onLoading?: () => void;
  onRevalidate?: () => void;
  onSuccess?: (data: QueryData) => void;
}): MonoTypeOperatorFunction<QueryStateData<QueryData>> {
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
        callbacks.onSuccess?.(data.data as QueryData);
        break;
    }
  });
}
