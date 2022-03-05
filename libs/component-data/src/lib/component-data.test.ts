import { ActivatedRoute, Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import {
  ComponentData,
  ComponentDataCache,
  ComponentDataConfig,
  ComponentDataService,
  ComponentRoute,
  DataParams,
} from '../';

function setup(config: Partial<ComponentDataConfig> = { name: 'test' }) {
  jest.useFakeTimers();
  const router = { navigate: jest.fn() } as unknown as Router;
  const route = {
    params: new Subject<DataParams>(),
    queryParams: new Subject<DataParams>(),
    snapshot: {},
  };
  const service = {
    query: jest.fn(() => of({ data: 'response' })),
  } as ComponentDataService<unknown>;
  const cache = new ComponentDataCache();

  const componentData = new ComponentData(
    new ComponentRoute(route as unknown as ActivatedRoute, router),
    cache,
    service,
    config as ComponentDataConfig
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

it('ends up in the error state on failure', () => {
  const { service, emits } = setup();
  service.query = jest.fn(() => throwError(() => 'Something went wrong'));
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

it('does not refresh when params dont change', () => {
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

it('does not refresh but revalidate when params are equal for cacheKey', () => {
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

it('refresh revalidates the response', () => {
  const { componentData, emits } = setup();
  jest.advanceTimersByTime(1);

  componentData.refresh();
  jest.advanceTimersByTime(1);

  expect(emits).toEqual([
    { state: 'idle' },
    { state: 'loading' },
    { state: 'success', data: { data: 'response' } },
    { state: 'revalidate', data: { data: 'response' } },
    { state: 'success', data: { data: 'response' } },
  ]);
});

it('refresh as a stream revalidates the response', () => {
  const { componentData, emits } = setup();
  jest.advanceTimersByTime(1);

  const refresh = new Subject<void>();
  componentData.refresh(refresh);

  refresh.next();
  jest.advanceTimersByTime(1);

  refresh.next();
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
