import { MonoTypeOperatorFunction, tap } from 'rxjs';
import { RequestStateData } from 'request-state-contracts';

export function tapState<RequestData>(callbacks: {
  onError?: (error: unknown) => void;
  onIdle?: () => void;
  onLoading?: () => void;
  onRevalidate?: () => void;
  onSuccess?: (data: RequestData) => void;
}): MonoTypeOperatorFunction<RequestStateData<RequestData>> {
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
        callbacks.onSuccess?.(data.data as RequestData);
        break;
    }
  });
}
