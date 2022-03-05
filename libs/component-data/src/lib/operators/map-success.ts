import { filter, map, Observable, UnaryFunction } from 'rxjs';
import { RequestStateData } from 'request-state-contracts';

export function mapSuccess<RequestData>(): UnaryFunction<
  Observable<RequestStateData<RequestData>>,
  Observable<RequestData>
> {
  return (source) =>
    source.pipe(
      filter((r) => r.state === 'success'),
      map((r) => r.data as RequestData)
    );
}
