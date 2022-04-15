import { ActivatedRoute, Router } from '@angular/router';
import { of, Subject, tap, throwError } from 'rxjs';
import {
  QueryState,
  QueryStateCache,
  QueryStateConfig,
  UrlState,
  DataParams,
} from '..';

const NOW = 0;

function setup(config: Partial<QueryStateConfig<unknown>> = { name: 'test' }) {
  jest.useFakeTimers().setSystemTime(NOW);
  const router = { navigate: jest.fn() } as unknown as Router;
  const route = {
    params: new Subject<DataParams>(),
    queryParams: new Subject<DataParams>(),
    snapshot: {},
  };
  const dataService = {
    query: jest.fn(() => of({ data: 'response' })),
    queryAlternative: jest.fn(() => of({ data: 'alternative-response' })),
  };
  const cache = new QueryStateCache();

  const componentData = new QueryState(
    new UrlState(route as unknown as ActivatedRoute, router),
    cache,
    dataService,
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
    service: dataService,
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
    { state: 'idle', meta: {} },
    { state: 'loading', meta: {} },
    {
      state: 'success',
      data: { data: 'response' },
      meta: { timestamp: NOW + 1 },
    },
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
    { state: 'idle', meta: {} },
    { state: 'loading', meta: {} },
    {
      state: 'success',
      data: {
        data: 'alternative-response',
      },
      meta: { timestamp: NOW + 1 },
    },
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
    { state: 'idle', meta: {} },
    { state: 'loading', meta: {} },
    {
      state: 'success',
      data: { data: 'response' },
      meta: { timestamp: NOW + 1 },
    },
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
    { state: 'idle', meta: {} },
    { state: 'loading', meta: {} },
    { state: 'loading', error: 'Something went wrong', meta: {} },
    {
      state: 'loading',
      error: 'Something went wrong',
      retries: 1,
      meta: {},
    },
    {
      state: 'loading',
      error: 'Something went wrong',
      retries: 2,
      meta: {},
    },
    { state: 'error', error: 'Something went wrong', retries: 3, meta: {} },
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
    { state: 'idle', meta: {} },
    { state: 'loading', meta: {} },
    { state: 'loading', error: 'Something went wrong', meta: {} },
  ]);

  jest.advanceTimersByTime(1000);
  expect(service.query).toHaveBeenCalledTimes(2);
  expect(emits).toEqual([
    { state: 'idle', meta: {} },
    { state: 'loading', meta: {} },
    { state: 'loading', error: 'Something went wrong', meta: {} },
    {
      state: 'loading',
      error: 'Something went wrong',
      retries: 1,
      meta: {},
    },
  ]);

  jest.advanceTimersByTime(2000);
  expect(service.query).toHaveBeenCalledTimes(3);
  expect(emits).toEqual([
    { state: 'idle', meta: {} },
    { state: 'loading', meta: {} },
    { state: 'loading', error: 'Something went wrong', meta: {} },
    {
      state: 'loading',
      error: 'Something went wrong',
      retries: 1,
      meta: {},
    },
    {
      state: 'loading',
      error: 'Something went wrong',
      retries: 2,
      meta: {},
    },
  ]);

  jest.advanceTimersByTime(3000);
  expect(service.query).toHaveBeenCalledTimes(4);
  expect(emits).toEqual([
    { state: 'idle', meta: {} },
    { state: 'loading', meta: {} },
    { state: 'loading', error: 'Something went wrong', meta: {} },
    {
      state: 'loading',
      error: 'Something went wrong',
      retries: 1,
      meta: {},
    },
    {
      state: 'loading',
      error: 'Something went wrong',
      retries: 2,
      meta: {},
    },
    { state: 'error', error: 'Something went wrong', retries: 3, meta: {} },
  ]);

  jest.advanceTimersByTime(10_000);
  expect(service.query).toHaveBeenCalledTimes(4);
  expect(emits).toEqual([
    { state: 'idle', meta: {} },
    { state: 'loading', meta: {} },
    { state: 'loading', error: 'Something went wrong', meta: {} },
    {
      state: 'loading',
      error: 'Something went wrong',
      retries: 1,
      meta: {},
    },
    {
      state: 'loading',
      error: 'Something went wrong',
      retries: 2,
      meta: {},
    },
    { state: 'error', error: 'Something went wrong', retries: 3, meta: {} },
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
    { state: 'idle', meta: {} },
    { state: 'loading', meta: {} },
    { state: 'loading', error: 'Something went wrong', meta: {} },
  ]);

  jest.advanceTimersByTime(1000);
  expect(service.query).toHaveBeenCalledTimes(2);
  expect(emits).toEqual([
    { state: 'idle', meta: {} },
    { state: 'loading', meta: {} },
    { state: 'loading', error: 'Something went wrong', meta: {} },
    {
      state: 'loading',
      error: 'Something went wrong',
      retries: 1,
      meta: {},
    },
  ]);

  jest.advanceTimersByTime(2000);
  expect(service.query).toHaveBeenCalledTimes(3);
  expect(emits).toEqual([
    { state: 'idle', meta: {} },
    { state: 'loading', meta: {} },
    { state: 'loading', error: 'Something went wrong', meta: {} },
    {
      state: 'loading',
      error: 'Something went wrong',
      retries: 1,
      meta: {},
    },
    { state: 'error', error: 'Something went wrong', retries: 2, meta: {} },
  ]);

  jest.advanceTimersByTime(10_000);
  expect(service.query).toHaveBeenCalledTimes(3);
  expect(emits).toEqual([
    { state: 'idle', meta: {} },
    { state: 'loading', meta: {} },
    { state: 'loading', error: 'Something went wrong', meta: {} },
    {
      state: 'loading',
      error: 'Something went wrong',
      retries: 1,
      meta: {},
    },
    { state: 'error', error: 'Something went wrong', retries: 2, meta: {} },
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
    { state: 'idle', meta: {} },
    { state: 'loading', meta: {} },
    { state: 'error', error: 'Something went wrong', meta: {} },
  ]);

  jest.advanceTimersByTime(10_000);
  expect(service.query).toHaveBeenCalledTimes(1);
  expect(emits).toEqual([
    { state: 'idle', meta: {} },
    { state: 'loading', meta: {} },
    { state: 'error', error: 'Something went wrong', meta: {} },
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
    { state: 'idle', meta: {} },
    { state: 'loading', meta: {} },
    { state: 'loading', error: 'Something went wrong', meta: {} },
  ]);

  jest.advanceTimersByTime(1000);
  expect(service.query).toHaveBeenCalledTimes(2);
  expect(emits).toEqual([
    { state: 'idle', meta: {} },
    { state: 'loading', meta: {} },
    { state: 'loading', error: 'Something went wrong', meta: {} },
    {
      state: 'loading',
      error: 'Something went wrong',
      retries: 1,
      meta: {},
    },
  ]);

  jest.advanceTimersByTime(2000);
  expect(service.query).toHaveBeenCalledTimes(3);
  expect(emits).toEqual([
    { state: 'idle', meta: {} },
    { state: 'loading', meta: {} },
    { state: 'loading', error: 'Something went wrong', meta: {} },
    {
      state: 'loading',
      error: 'Something went wrong',
      retries: 1,
      meta: {},
    },
    { state: 'error', error: 'Something went wrong', retries: 2, meta: {} },
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
    { state: 'idle', meta: {} },
    { state: 'loading', meta: {} },
    { state: 'loading', error: 'Something went wrong', meta: {} },
  ]);

  jest.advanceTimersByTime(100);
  expect(service.query).toHaveBeenCalledTimes(2);
  expect(emits).toEqual([
    { state: 'idle', meta: {} },
    { state: 'loading', meta: {} },
    { state: 'loading', error: 'Something went wrong', meta: {} },
    {
      state: 'loading',
      error: 'Something went wrong',
      retries: 1,
      meta: {},
    },
  ]);

  jest.advanceTimersByTime(200);
  expect(service.query).toHaveBeenCalledTimes(3);
  expect(emits).toEqual([
    { state: 'idle', meta: {} },
    { state: 'loading', meta: {} },
    { state: 'loading', error: 'Something went wrong', meta: {} },
    {
      state: 'loading',
      error: 'Something went wrong',
      retries: 1,
      meta: {},
    },
    {
      state: 'loading',
      error: 'Something went wrong',
      retries: 2,
      meta: {},
    },
  ]);

  jest.advanceTimersByTime(300);
  expect(service.query).toHaveBeenCalledTimes(4);
  expect(emits).toEqual([
    { state: 'idle', meta: {} },
    { state: 'loading', meta: {} },
    { state: 'loading', error: 'Something went wrong', meta: {} },
    {
      state: 'loading',
      error: 'Something went wrong',
      retries: 1,
      meta: {},
    },
    {
      state: 'loading',
      error: 'Something went wrong',
      retries: 2,
      meta: {},
    },
    { state: 'error', error: 'Something went wrong', retries: 3, meta: {} },
  ]);

  jest.advanceTimersByTime(1000);
  expect(service.query).toHaveBeenCalledTimes(4);
  expect(emits).toEqual([
    { state: 'idle', meta: {} },
    { state: 'loading', meta: {} },
    { state: 'loading', error: 'Something went wrong', meta: {} },
    {
      state: 'loading',
      error: 'Something went wrong',
      retries: 1,
      meta: {},
    },
    {
      state: 'loading',
      error: 'Something went wrong',
      retries: 2,
      meta: {},
    },
    { state: 'error', error: 'Something went wrong', retries: 3, meta: {} },
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
    { state: 'idle', meta: {} },
    // param 1
    { state: 'loading', meta: {} },
    {
      state: 'success',
      data: { data: 'response' },
      meta: { timestamp: NOW + 1 },
    },
    // param 2
    { state: 'loading', meta: {} },
    {
      state: 'success',
      data: { data: 'response' },
      meta: { timestamp: NOW + 1 + 1 },
    },
    // param 1 again
    {
      state: 'revalidate',
      data: { data: 'response' },
      meta: { timestamp: NOW + 1 },
    },
    {
      state: 'success',
      data: { data: 'response' },
      meta: { timestamp: NOW + +1 + 1 + 1 },
    },
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
    { state: 'idle', meta: {} },
    { state: 'loading', meta: {} },
    {
      state: 'success',
      data: { data: 'response' },
      meta: { timestamp: NOW + 1 },
    },
  ]);
});

it('does not revalidate but revalidate when params are equal for cacheKey', () => {
  const { route, emits } = setup({
    cacheKey: (params) => params.params.id.toLowerCase(),
  });
  jest.advanceTimersByTime(1);

  jest.advanceTimersByTime(5);
  route.params.next({ id: 'a' });

  jest.advanceTimersByTime(8);
  route.params.next({ id: 'A' });
  jest.advanceTimersByTime(1);

  expect(emits).toEqual([
    { state: 'idle', meta: {} },
    { state: 'loading', meta: {} },
    {
      state: 'success',
      data: { data: 'response' },
      meta: { timestamp: NOW + 1 },
    },
    {
      state: 'revalidate',
      data: { data: 'response' },
      meta: { timestamp: NOW + 1 },
    },
    {
      state: 'success',
      data: { data: 'response' },
      meta: { timestamp: NOW + 1 + 5 + 8 + 1 },
    },
  ]);
});

it('revalidate revalidates the response', () => {
  const { componentData, emits } = setup();
  jest.advanceTimersByTime(1);

  componentData.revalidate();
  jest.advanceTimersByTime(1);

  expect(emits).toEqual([
    { state: 'idle', meta: {} },
    { state: 'loading', meta: {} },
    {
      state: 'success',
      data: { data: 'response' },
      meta: { timestamp: NOW + 1 },
    },
    {
      state: 'revalidate',
      data: { data: 'response' },
      meta: { timestamp: NOW + 1 },
    },
    {
      state: 'success',
      data: { data: 'response' },
      meta: { timestamp: NOW + 1 },
    },
  ]);
});

it('revalidate as a stream revalidates the response', () => {
  const { componentData, emits } = setup();
  jest.advanceTimersByTime(1);

  const revalidate = new Subject<void>();
  componentData.revalidate(revalidate);
  jest.advanceTimersByTime(5);

  revalidate.next();
  jest.advanceTimersByTime(15);

  revalidate.next();
  jest.advanceTimersByTime(1);

  expect(emits).toEqual([
    { state: 'idle', meta: {} },
    { state: 'loading', meta: {} },
    {
      state: 'success',
      data: { data: 'response' },
      meta: { timestamp: NOW + 1 },
    },
    {
      state: 'revalidate',
      data: { data: 'response' },
      meta: { timestamp: NOW + 1 },
    },
    {
      state: 'success',
      data: { data: 'response' },
      meta: { timestamp: NOW + 1 + 5 },
    },
    {
      state: 'revalidate',
      data: { data: 'response' },
      meta: { timestamp: NOW + 1 + 5 },
    },
    {
      state: 'success',
      data: { data: 'response' },
      meta: { timestamp: NOW + 1 + 5 + 15 },
    },
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

it('ignores emits when set', () => {
  const { route, service, emits } = setup({
    ignore: ({ params }) => params.id === 'a',
  });
  jest.advanceTimersByTime(1);

  expect(service.query).not.toHaveBeenCalled();
  expect(emits).toEqual([{ state: 'idle', meta: {} }]);

  route.params.next({ id: 'b' });
  jest.advanceTimersByTime(1);

  expect(service.query).toHaveBeenCalledWith({
    params: { id: 'b' },
    queryParams: { id: 'a' },
  });
  expect(emits).toEqual([
    { state: 'idle', meta: {} },
    { state: 'loading', meta: {} },
    {
      state: 'success',
      data: { data: 'response' },
      meta: { timestamp: NOW + 1 + 1 },
    },
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
  expect(result.length).toBeGreaterThan(0);
});
