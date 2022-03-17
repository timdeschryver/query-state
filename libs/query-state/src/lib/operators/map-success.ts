import { filter, map, Observable, UnaryFunction } from 'rxjs';
import { QueryStateData } from 'query-state-contracts';

export function mapSuccess<QueryData>(): UnaryFunction<
  Observable<QueryStateData<QueryData>>,
  Observable<QueryData>
> {
  return (source) =>
    source.pipe(
      filter((r) => r.state === 'success'),
      map((r) => r.data as QueryData)
    );
}
