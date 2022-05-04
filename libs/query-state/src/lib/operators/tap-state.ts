import { MonoTypeOperatorFunction, tap } from 'rxjs';
import { QueryStateData } from '../contracts';

type CallBackFunctions<T> = {
  onError?: (error: unknown) => void;
  onIdle?: () => void;
  onLoading?: () => void;
  onRevalidate?: () => void;
  onSuccess?: (data: T) => void;
};

type CallBackOptions = {
  optimisticUpdates?: boolean;
};

export function tapState<QueryData>(
  callbacks: CallBackFunctions<QueryData>,
  options?: CallBackOptions
): MonoTypeOperatorFunction<QueryStateData<QueryData>> {
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

        if (options?.optimisticUpdates) {
          callbacks.onSuccess?.(data.data as QueryData);
        }

        break;

      case 'success':
        callbacks.onSuccess?.(data.data as QueryData);
        break;
    }
  });
}
