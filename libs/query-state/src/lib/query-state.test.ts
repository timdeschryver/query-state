import { ActivatedRoute, Router } from '@angular/router';
import { of, Subject, tap, throwError } from 'rxjs';
import {
  QueryState,
  QueryStateCache,
  QueryStateConfig,
  UrlState,
  DataParams,
} from '..';

function setup(config: Partial<QueryStateConfig<unknown>> = { name: 'test' }) {
  jest.useFakeTimers();
  const router = { navigate: jest.fn() } as unknown as Router;
  const route = {
    params: new Subject<DataParams>(),
    queryParams: new Subject<DataParams>(),
    snapshot: {},
  };
  const service = {
    query: jest.fn(() => of({ data: 'response' })),
    queryAlternative: jest.fn(() => of({ data: 'alternative-response' })),
  };
  const cache = new QueryStateCache();

  const componentData = new QueryState(
    new UrlState(route as unknown as ActivatedRoute, router),
    cache,
    service,
    config as QueryStateConfig<unknown>
  );

  const emits: unknown[] = [];
  componentData.data$.subscribe((value) => emits.push(value));

  route.params.next({ id: 'a' });
  route.queryParams.next({ id: 'a' });

  return {
    componentData,
    emits,
    router,
    route,
    service,
    cache,
    config,
  };
}

afterEach(() => {
  jest.useRealTimers();
});

it('executes the query on param navigation', () => {
  const { service, route, emits } = setup();
  route.params.next({ id: 'b' });
  jest.advanceTimersByTime(1);

  expect(service.query).toHaveBeenCalledWith({
    params: { id: 'b' },
    queryParams: { id: 'a' },
  });
  expect(emits).toEqual([
    { state: 'idle' },
    { state: 'loading' },
    { state: 'success', data: { data: 'response' } },
  ]);
});

it('executes configured query', () => {
  const { service, route, emits } = setup({
    query: 'queryAlternative',
  } as any);
  route.params.next({ id: 'b' });
  jest.advanceTimersByTime(1);

  expect(service.queryAlternative).toHaveBeenCalledWith({
    params: { id: 'b' },
    queryParams: { id: 'a' },
  });
  expect(emits).toEqual([
    { state: 'idle' },
    { state: 'loading' },
    { state: 'success', data: { data: 'alternative-response' } },
  ]);
});

it('executes the query on query param navigation', () => {
  const { service, route, emits } = setup();
  route.queryParams.next({ id: 'b' });
  jest.advanceTimersByTime(1);

  expect(service.query).toHaveBeenCalledWith({
    params: { id: 'a' },
    queryParams: { id: 'b' },
  });
  expect(emits).toEqual([
    { state: 'idle' },
    { state: 'loading' },
    { state: 'success', data: { data: 'response' } },
  ]);
});

it('ends up in the error state on failure after retrying', () => {
  const { service, emits } = setup();
  service.query = jest.fn(() => {
    return throwError(() => 'Something went wrong');
  });
  jest.advanceTimersByTime(10_000);

  expect(service.query).toHaveBeenCalledWith({
    params: { id: 'a' },
    queryParams: { id: 'a' },
  });
  expect(emits).toEqual([
    { state: 'idle' },
    { state: 'loading' },
    { state: 'loading', error: 'Something went wrong' },
    { state: 'loading', error: 'Something went wrong', retries: 1 },
    { state: 'loading', error: 'Something went wrong', retries: 2 },
    { state: 'error', error: 'Something went wrong', retries: 3 },
  ]);
});

it('retries 3 times exponentially on failure', () => {
  const { service, emits } = setup();
  service.query = jest.fn(() => {
    return throwError(() => 'Something went wrong');
  });
  jest.advanceTimersByTime(1);

  expect(service.query).toHaveBeenCalledWith({
    params: { id: 'a' },
    queryParams: { id: 'a' },
  });
  expect(emits).toEqual([
    { state: 'idle' },
    { state: 'loading' },
    { state: 'loading', error: 'Something went wrong' },
  ]);

  jest.advanceTimersByTime(1000);
  expect(service.query).toHaveBeenCalledTimes(2);
  expect(emits).toEqual([
    { state: 'idle' },
    { state: 'loading' },
    { state: 'loading', error: 'Something went wrong' },
    { state: 'loading', error: 'Something went wrong', retries: 1 },
  ]);

  jest.advanceTimersByTime(2000);
  expect(service.query).toHaveBeenCalledTimes(3);
  expect(emits).toEqual([
    { state: 'idle' },
    { state: 'loading' },
    { state: 'loading', error: 'Something went wrong' },
    { state: 'loading', error: 'Something went wrong', retries: 1 },
    { state: 'loading', error: 'Something went wrong', retries: 2 },
  ]);

  jest.advanceTimersByTime(3000);
  expect(service.query).toHaveBeenCalledTimes(4);
  expect(emits).toEqual([
    { state: 'idle' },
    { state: 'loading' },
    { state: 'loading', error: 'Something went wrong' },
    { state: 'loading', error: 'Something went wrong', retries: 1 },
    { state: 'loading', error: 'Something went wrong', retries: 2 },
    { state: 'error', error: 'Something went wrong', retries: 3 },
  ]);

  jest.advanceTimersByTime(10_000);
  expect(service.query).toHaveBeenCalledTimes(4);
  expect(emits).toEqual([
    { state: 'idle' },
    { state: 'loading' },
    { state: 'loading', error: 'Something went wrong' },
    { state: 'loading', error: 'Something went wrong', retries: 1 },
    { state: 'loading', error: 'Something went wrong', retries: 2 },
    { state: 'error', error: 'Something went wrong', retries: 3 },
  ]);
});

it('sets the retry config with a retry number', () => {
  const { service, emits } = setup({
    retryCondition: 2,
  });
  service.query = jest.fn(() => {
    return throwError(() => 'Something went wrong');
  });
  jest.advanceTimersByTime(1);

  expect(service.query).toHaveBeenCalledWith({
    params: { id: 'a' },
    queryParams: { id: 'a' },
  });
  expect(emits).toEqual([
    { state: 'idle' },
    { state: 'loading' },
    { state: 'loading', error: 'Something went wrong' },
  ]);

  jest.advanceTimersByTime(1000);
  expect(service.query).toHaveBeenCalledTimes(2);
  expect(emits).toEqual([
    { state: 'idle' },
    { state: 'loading' },
    { state: 'loading', error: 'Something went wrong' },
    { state: 'loading', error: 'Something went wrong', retries: 1 },
  ]);

  jest.advanceTimersByTime(2000);
  expect(service.query).toHaveBeenCalledTimes(3);
  expect(emits).toEqual([
    { state: 'idle' },
    { state: 'loading' },
    { state: 'loading', error: 'Something went wrong' },
    { state: 'loading', error: 'Something went wrong', retries: 1 },
    { state: 'error', error: 'Something went wrong', retries: 2 },
  ]);

  jest.advanceTimersByTime(10_000);
  expect(service.query).toHaveBeenCalledTimes(3);
  expect(emits).toEqual([
    { state: 'idle' },
    { state: 'loading' },
    { state: 'loading', error: 'Something went wrong' },
    { state: 'loading', error: 'Something went wrong', retries: 1 },
    { state: 'error', error: 'Something went wrong', retries: 2 },
  ]);
});

it('disables retry behavior by setting retryCondition to 0', () => {
  const { service, emits } = setup({
    retryCondition: 0,
  });
  service.query = jest.fn(() => {
    return throwError(() => 'Something went wrong');
  });
  jest.advanceTimersByTime(1);

  expect(service.query).toHaveBeenCalledWith({
    params: { id: 'a' },
    queryParams: { id: 'a' },
  });
  expect(emits).toEqual([
    { state: 'idle' },
    { state: 'loading' },
    { state: 'error', error: 'Something went wrong' },
  ]);

  jest.advanceTimersByTime(10_000);
  expect(service.query).toHaveBeenCalledTimes(1);
  expect(emits).toEqual([
    { state: 'idle' },
    { state: 'loading' },
    { state: 'error', error: 'Something went wrong' },
  ]);
});

it('sets the retry config with a retry condition', () => {
  const { service, emits } = setup({
    retryCondition: (retries) => retries <= 1,
  });
  service.query = jest.fn(() => {
    return throwError(() => 'Something went wrong');
  });
  jest.advanceTimersByTime(1);

  expect(service.query).toHaveBeenCalledWith({
    params: { id: 'a' },
    queryParams: { id: 'a' },
  });
  expect(emits).toEqual([
    { state: 'idle' },
    { state: 'loading' },
    { state: 'loading', error: 'Something went wrong' },
  ]);

  jest.advanceTimersByTime(1000);
  expect(service.query).toHaveBeenCalledTimes(2);
  expect(emits).toEqual([
    { state: 'idle' },
    { state: 'loading' },
    { state: 'loading', error: 'Something went wrong' },
    { state: 'loading', error: 'Something went wrong', retries: 1 },
  ]);

  jest.advanceTimersByTime(2000);
  expect(service.query).toHaveBeenCalledTimes(3);
  expect(emits).toEqual([
    { state: 'idle' },
    { state: 'loading' },
    { state: 'loading', error: 'Something went wrong' },
    { state: 'loading', error: 'Something went wrong', retries: 1 },
    { state: 'error', error: 'Something went wrong', retries: 2 },
  ]);
});

it('sets the retry delay', () => {
  const { service, emits } = setup({
    retryDelay: (retries) => retries * 100,
  });
  service.query = jest.fn(() => {
    return throwError(() => 'Something went wrong');
  });
  jest.advanceTimersByTime(1);

  expect(service.query).toHaveBeenCalledWith({
    params: { id: 'a' },
    queryParams: { id: 'a' },
  });
  expect(emits).toEqual([
    { state: 'idle' },
    { state: 'loading' },
    { state: 'loading', error: 'Something went wrong' },
  ]);

  jest.advanceTimersByTime(100);
  expect(service.query).toHaveBeenCalledTimes(2);
  expect(emits).toEqual([
    { state: 'idle' },
    { state: 'loading' },
    { state: 'loading', error: 'Something went wrong' },
    { state: 'loading', error: 'Something went wrong', retries: 1 },
  ]);

  jest.advanceTimersByTime(200);
  expect(service.query).toHaveBeenCalledTimes(3);
  expect(emits).toEqual([
    { state: 'idle' },
    { state: 'loading' },
    { state: 'loading', error: 'Something went wrong' },
    { state: 'loading', error: 'Something went wrong', retries: 1 },
    { state: 'loading', error: 'Something went wrong', retries: 2 },
  ]);

  jest.advanceTimersByTime(300);
  expect(service.query).toHaveBeenCalledTimes(4);
  expect(emits).toEqual([
    { state: 'idle' },
    { state: 'loading' },
    { state: 'loading', error: 'Something went wrong' },
    { state: 'loading', error: 'Something went wrong', retries: 1 },
    { state: 'loading', error: 'Something went wrong', retries: 2 },
    { state: 'error', error: 'Something went wrong', retries: 3 },
  ]);

  jest.advanceTimersByTime(1000);
  expect(service.query).toHaveBeenCalledTimes(4);
  expect(emits).toEqual([
    { state: 'idle' },
    { state: 'loading' },
    { state: 'loading', error: 'Something went wrong' },
    { state: 'loading', error: 'Something went wrong', retries: 1 },
    { state: 'loading', error: 'Something went wrong', retries: 2 },
    { state: 'error', error: 'Something went wrong', retries: 3 },
  ]);
});

it('builds and uses the cache on route re-enter', () => {
  const { route, emits } = setup();
  jest.advanceTimersByTime(1);

  route.params.next({ id: 'b' });
  jest.advanceTimersByTime(1);

  route.params.next({ id: 'a' });
  jest.advanceTimersByTime(1);

  expect(emits).toEqual([
    { state: 'idle' },
    // param 1
    { state: 'loading' },
    { state: 'success', data: { data: 'response' } },
    // param 2
    { state: 'loading' },
    { state: 'success', data: { data: 'response' } },
    // param 1 again
    { state: 'revalidate', data: { data: 'response' } },
    { state: 'success', data: { data: 'response' } },
  ]);
});

it('does not revalidate when params dont change', () => {
  const { route, emits } = setup();
  jest.advanceTimersByTime(1);

  route.params.next({ id: 'a' });
  jest.advanceTimersByTime(1);

  route.queryParams.next({ id: 'a' });
  jest.advanceTimersByTime(1);

  expect(emits).toEqual([
    { state: 'idle' },
    { state: 'loading' },
    { state: 'success', data: { data: 'response' } },
  ]);
});

it('does not revalidate but revalidate when params are equal for cacheKey', () => {
  const { route, emits } = setup({
    cacheKey: (params) => params.params.id.toLowerCase(),
  });
  jest.advanceTimersByTime(1);

  route.params.next({ id: 'a' });
  jest.advanceTimersByTime(1);

  route.params.next({ id: 'A' });
  jest.advanceTimersByTime(1);

  expect(emits).toEqual([
    { state: 'idle' },
    { state: 'loading' },
    { state: 'success', data: { data: 'response' } },
    { state: 'revalidate', data: { data: 'response' } },
    { state: 'success', data: { data: 'response' } },
  ]);
});

it('revalidate revalidates the response', () => {
  const { componentData, emits } = setup();
  jest.advanceTimersByTime(1);

  componentData.revalidate();
  jest.advanceTimersByTime(1);

  expect(emits).toEqual([
    { state: 'idle' },
    { state: 'loading' },
    { state: 'success', data: { data: 'response' } },
    { state: 'revalidate', data: { data: 'response' } },
    { state: 'success', data: { data: 'response' } },
  ]);
});

it('revalidate as a stream revalidates the response', () => {
  const { componentData, emits } = setup();
  jest.advanceTimersByTime(1);

  const revalidate = new Subject<void>();
  componentData.revalidate(revalidate);

  revalidate.next();
  jest.advanceTimersByTime(1);

  revalidate.next();
  jest.advanceTimersByTime(1);

  expect(emits).toEqual([
    { state: 'idle' },
    { state: 'loading' },
    { state: 'success', data: { data: 'response' } },
    { state: 'revalidate', data: { data: 'response' } },
    { state: 'success', data: { data: 'response' } },
    { state: 'revalidate', data: { data: 'response' } },
    { state: 'success', data: { data: 'response' } },
  ]);
});

it('update navigates with queryParams', () => {
  const { componentData, router } = setup();
  jest.advanceTimersByTime(1);

  componentData.update({ id: 'b' });
  jest.advanceTimersByTime(1);

  expect(router.navigate).toHaveBeenCalledWith(
    [],
    expect.objectContaining({
      queryParams: { id: 'b' },
    })
  );
});

it('update as stream navigates with queryParams', () => {
  const { componentData, router } = setup();
  jest.advanceTimersByTime(1);

  const subject = new Subject<DataParams>();
  componentData.update(subject);

  subject.next({ id: 'b' });
  jest.advanceTimersByTime(1);

  expect(router.navigate).toHaveBeenCalledWith(
    [],
    expect.objectContaining({
      queryParams: { id: 'b' },
    })
  );
});

it('disables initial query when set', () => {
  const { service, emits } = setup({ disableInitialLoad: true });
  jest.advanceTimersByTime(1);

  expect(service.query).not.toHaveBeenCalled();
  expect(emits).toEqual([{ state: 'idle' }]);
});

it('ignores emits when set', () => {
  const { route, service, emits } = setup({
    ignore: ({ params }) => params.id === 'a',
  });
  jest.advanceTimersByTime(1);

  expect(service.query).not.toHaveBeenCalled();
  expect(emits).toEqual([{ state: 'idle' }]);

  route.params.next({ id: 'b' });
  jest.advanceTimersByTime(1);

  expect(service.query).toHaveBeenCalledWith({
    params: { id: 'b' },
    queryParams: { id: 'a' },
  });
  expect(emits).toEqual([
    { state: 'idle' },
    { state: 'loading' },
    { state: 'success', data: { data: 'response' } },
  ]);
});

it('effect subscribes to source', () => {
  const { componentData } = setup();
  const input = 7;
  const result: unknown[] = [];
  componentData.effect(
    of(input).pipe(
      tap({
        next: (value) => result.push(value),
      })
    )
  );
  expect(result).toEqual([input]);
});

it('effect subscribes to data$', () => {
  const { componentData } = setup();
  const result: unknown[] = [];
  jest.advanceTimersToNextTimer();

  componentData.effect((data) =>
    data.pipe(
      tap({
        next: (value) => result.push(value),
      })
    )
  );
  expect(result).toEqual([{ state: 'idle' }]);
});
